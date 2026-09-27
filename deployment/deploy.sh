#!/bin/bash
# -----------------------------------------------------------------------------
# Complete AWS Infrastructure & Docker Container Build/Deployment Script
# -----------------------------------------------------------------------------

set -e

REGION="ap-south-1"

echo "=== 🚀 Step 1: Initializing Terraform Core Infrastructure ==="
cd terraform
terraform init
terraform apply -auto-approve

ALB_DNS=$(terraform output -raw alb_dns_name)
CLOUDFRONT_URL=$(terraform output -raw cloudfront_domain_name)
ECR_BACKEND=$(terraform output -raw ecr_backend_repository_url)
ECR_FRONTEND=$(terraform output -raw ecr_frontend_repository_url)

cd ..

echo "=== 🐳 Step 2: Logging into AWS ECR ==="
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_BACKEND

echo "=== 🐳 Step 3: Building & Pushing Backend Container ==="
cd ../backend
docker build -t equity-research-backend:latest .
docker tag equity-research-backend:latest $ECR_BACKEND:latest
docker push $ECR_BACKEND:latest

echo "=== 🐳 Step 4: Building & Pushing Frontend Container ==="
cd ../frontend
docker build -t equity-research-frontend:latest .
docker tag equity-research-frontend:latest $ECR_FRONTEND:latest
docker push $ECR_FRONTEND:latest

cd ../deployment/terraform
terraform apply -auto-approve

echo ""
echo "=== 🎉 Production Deployment Complete! ==="
echo "Application Load Balancer: http://$ALB_DNS"
echo "CloudFront Edge CDN:       https://$CLOUDFRONT_URL"
echo "ECR Backend Image:         $ECR_BACKEND:latest"
echo "ECR Frontend Image:        $ECR_FRONTEND:latest"
echo "=========================================="
