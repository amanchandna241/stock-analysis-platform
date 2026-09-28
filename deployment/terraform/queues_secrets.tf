# SQS Queue for Asynchronous Document Indexing
resource "aws_sqs_queue" "doc_queue" {
  name                      = "${var.app_name}-doc-indexing-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}

# SQS Queue for Mutual Fund NAV Refresh & Sector Holdings Processing
resource "aws_sqs_queue" "mf_nav_queue" {
  name                      = "${var.app_name}-mf-nav-sync-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}

# EventBridge Rule for Daily Market Close Sync (15:30 IST = 10:00 UTC)
resource "aws_cloudwatch_event_rule" "market_close_sync" {
  name                = "${var.app_name}-market-close-sync"
  description         = "Triggers daily market close data import at 15:30 IST"
  schedule_expression = "cron(0 10 ? * MON-FRI *)"
}

# EventBridge Rule for Daily Mutual Fund NAV & AMFI Data Sync (20:00 IST = 14:30 UTC)
resource "aws_cloudwatch_event_rule" "mf_nav_sync" {
  name                = "${var.app_name}-mf-nav-sync"
  description         = "Triggers daily Indian Mutual Funds NAV & AMFI sector holdings sync at 20:00 IST"
  schedule_expression = "cron(30 14 ? * MON-FRI *)"
}

# Secrets Manager for LLM Keys
resource "aws_secretsmanager_secret" "llm_keys" {
  name                    = "${var.app_name}/llm-api-keys"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "llm_keys_val" {
  secret_id = aws_secretsmanager_secret.llm_keys.id
  secret_string = jsonencode({
    OPENAI_API_KEY    = var.openai_api_key
    ANTHROPIC_API_KEY = var.anthropic_api_key
    GEMINI_API_KEY    = var.gemini_api_key
  })
}
