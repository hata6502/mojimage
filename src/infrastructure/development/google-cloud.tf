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
resource "google_storage_bucket_iam_member" "image_object_viewer" {
  bucket = google_storage_bucket.image.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
