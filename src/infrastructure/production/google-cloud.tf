data "google_iam_policy" "noauth" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_project_iam_member" "artifactregistry_writer" {
  project = var.google_cloud_project
  role    = "roles/artifactregistry.writer"
  member  = var.google_cloud_github_federation
}
resource "google_project_iam_member" "run_developer" {
  project = var.google_cloud_project
  role    = "roles/run.developer"
  member  = var.google_cloud_github_federation
}
resource "google_project_iam_member" "service_account_user" {
  project = var.google_cloud_project
  role    = "roles/iam.serviceAccountUser"
  member  = var.google_cloud_github_federation
}
resource "google_project_iam_member" "secret_accessor" {
  project = var.google_cloud_project
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${var.google_cloud_service_account}"
}

resource "google_artifact_registry_repository" "server" {
  repository_id = "server"
  location      = var.google_cloud_region
  format        = "DOCKER"

  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "delete"
    action = "DELETE"

    condition {}
  }
  cleanup_policies {
    id     = "keep"
    action = "KEEP"

    most_recent_versions {
      keep_count = 10
    }
  }
}

resource "google_cloud_run_v2_service" "server" {
  name     = "server"
  location = var.google_cloud_region

  template {
    containers {
      image = "${var.google_cloud_region}-docker.pkg.dev/${var.google_cloud_project}/server/server:c0bffeee67604b1dd70b04d526adf9cc0693a857"

      resources {
        cpu_idle          = true
        startup_cpu_boost = true

        limits = {
          cpu    = "2000m"
          memory = "1024Mi"
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].containers[0].env,
      template[0].containers[0].image,
      template[0].labels["commit-sha"],
      template[0].labels["goog-terraform-provisioned"],
      template[0].labels["managed-by"],
      template[0].revision,
    ]
  }
}
resource "google_cloud_run_v2_service_iam_policy" "server_run_invoker" {
  name        = google_cloud_run_v2_service.server.name
  location    = var.google_cloud_region
  policy_data = data.google_iam_policy.noauth.policy_data
}
resource "google_cloud_run_domain_mapping" "server" {
  name     = "mojimage.hata6502.com"
  location = var.google_cloud_region

  metadata {
    namespace = var.google_cloud_project
  }

  spec {
    route_name = google_cloud_run_v2_service.server.name
  }
}

resource "google_cloud_run_v2_job" "job" {
  name     = "job"
  location = var.google_cloud_region

  template {
    parallelism = 0
    task_count  = 1

    template {
      max_retries = 0
      timeout     = "3600s"

      containers {
        image   = "${var.google_cloud_region}-docker.pkg.dev/${var.google_cloud_project}/server/server:e5ab2337b88d62bab2147373e7906aa50f4ce4ff"
        command = []
        args    = []

        resources {
          limits = {
            cpu    = "2000m"
            memory = "1024Mi"
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].template[0].containers[0].env,
      template[0].template[0].containers[0].image,
      template[0].labels["commit-sha"],
      template[0].labels["goog-terraform-provisioned"],
      template[0].labels["managed-by"],
    ]
  }
}

resource "google_storage_bucket" "image" {
  name                        = "image-${var.google_cloud_project}"
  location                    = var.google_cloud_region
  uniform_bucket_level_access = true

  cors {
    origin          = ["https://mojimage.hata6502.com"]
    method          = ["GET", "HEAD"]
    response_header = ["range", "etag", "if-match"]
    max_age_seconds = 300
  }
}
resource "google_project_iam_custom_role" "storage_object_getter" {
  role_id     = "storageObjectGetter"
  title       = "Storage Object Getter"
  permissions = ["storage.objects.get"]
}
resource "google_storage_bucket_iam_member" "image_object_getter" {
  bucket = google_storage_bucket.image.name
  role   = google_project_iam_custom_role.storage_object_getter.name
  member = "allUsers"
}
