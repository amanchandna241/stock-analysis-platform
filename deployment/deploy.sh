#!/bin/bash
# -----------------------------------------------------------------------------
# Production Infrastructure & Container Deployment Script for AWS
# -----------------------------------------------------------------------------

set -e

echo "=== 🚀 Step 1: Initializing Terraform Infrastructure ==="
cd terraform
terraform init
terraform plan -out=tfplan.binary
terraform apply -auto-approve tfplan.binary

ALB_DNS=$(terraform output -raw alb_dns_name)
CLOUDFRONT_URL=$(terraform output -raw cloudfront_domain_name)

echo ""
echo "=== 📦 Infrastructure Created Successfully! ==="
echo "Application Load Balancer: http://$ALB_DNS"
echo "CloudFront CDN URL: https://$CLOUDFRONT_URL"
echo ""

cd ..

echo "=== 🚀 Step 2: Deployment Complete ==="
echo "Your Stock Analysis Platform is fully provisioned on AWS."
