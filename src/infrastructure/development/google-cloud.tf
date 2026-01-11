resource "google_storage_bucket" "image" {
  name                        = "image-${var.google_cloud_project}"
  location                    = var.google_cloud_region
  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
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
