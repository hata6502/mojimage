provider "google" {
  project = var.google_cloud_project
  region  = var.google_cloud_region
}

provider "mongodbatlas" {
  client_id     = var.mongodbatlas_client_id
  client_secret = var.mongodbatlas_client_secret
}
