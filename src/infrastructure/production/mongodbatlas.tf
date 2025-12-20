resource "mongodbatlas_advanced_cluster" "mongodb" {
  project_id   = var.mongodbatlas_project_id
  name         = var.mongodbatlas_cluster_name
  cluster_type = "REPLICASET"

  replication_specs = [
    {
      region_configs = [
        {
          provider_name         = "FLEX"
          backing_provider_name = "GCP"
          region_name           = "NORTHEASTERN_ASIA_PACIFIC"
          priority              = 7
        }
      ]
    }
  ]
}
