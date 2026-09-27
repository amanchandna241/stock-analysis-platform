output "alb_dns_name" {
  description = "Application Load Balancer Public DNS Name"
  value       = aws_lb.alb.dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront CDN Edge Distribution Domain Name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "ecr_backend_repository_url" {
  description = "ECR Repository URL for Backend Docker Image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR Repository URL for Frontend Docker Image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_postgres_endpoint" {
  description = "RDS PostgreSQL Database Connection Endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis Connection Address"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "s3_filings_bucket" {
  description = "S3 Filings Document Storage Bucket Name"
  value       = aws_s3_bucket.filings.id
}
