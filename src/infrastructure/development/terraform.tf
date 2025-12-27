terraform {
  backend "gcs" {
    bucket = "terraform-state-mojimage-development"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.14.1"
    }
  }
}
