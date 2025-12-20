terraform {
  backend "gcs" {
    bucket = "terraform-state-mojimage-production"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.14.1"
    }

    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "2.3.0"
    }
  }
}
