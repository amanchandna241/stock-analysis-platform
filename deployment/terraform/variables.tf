variable "aws_region" {
  description = "AWS Region to deploy infrastructure"
  type        = string
  default     = "ap-south-1" # Mumbai region for Indian Equities focus
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "equity-research"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_password" {
  description = "RDS PostgreSQL Master Database Password"
  type        = string
  sensitive   = true
  default     = "SuperSecurePass2026!"
}

variable "openai_api_key" {
  description = "OpenAI API Key for LLM Abstraction Layer"
  type        = string
  sensitive   = true
  default     = "sk-placeholder-openai-key"
}

variable "anthropic_api_key" {
  description = "Anthropic API Key for LLM Abstraction Layer"
  type        = string
  sensitive   = true
  default     = "sk-placeholder-anthropic-key"
}

variable "gemini_api_key" {
  description = "Google Gemini API Key for LLM Abstraction Layer"
  type        = string
  sensitive   = true
  default     = "AIzaSy-placeholder-gemini-key"
}
