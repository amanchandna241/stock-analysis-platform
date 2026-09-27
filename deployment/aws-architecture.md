# Enterprise AWS & Databricks Deployment Architecture

This document provides the production cloud infrastructure blueprint for the **Antigravity Stock Research & Analysis Platform**, optimized for Indian Equities (NSE/BSE) and extensible to US & global markets.

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER                                      |
+-----------------------------------------------------------------------------------+
                                         | HTTPS
                                         v
+-----------------------------------------------------------------------------------+
|                             AWS CloudFront (CDN)                                  |
+-----------------------------------------------------------------------------------+
                                         |
               +-------------------------+-------------------------+
               | Static Assets                                     | API Traffic (/api/v1/*)
               v                                                   v
+-----------------------------+                   +---------------------------------+
|     AWS S3 (Web Bucket)     |                   |  Application Load Balancer (ALB)|
+-----------------------------+                   +---------------------------------+
                                                                   |
                                                                   v
                                                  +---------------------------------+
                                                  |   AWS ECS / EKS Container Task  |
                                                  |  (FastAPI + Python Services)    |
                                                  +---------------------------------+
                                                                   |
     +-------------------+--------------------+--------------------+--------------------+
     |                   |                    |                    |                    |
     v                   v                    v                    v                    v
+----------+       +-----------+        +------------+       +------------+       +------------+
|  RDS     |       |ElastiCache|        |  AWS S3    |       |  AWS SQS   |       | Databricks |
|PostgreSQL|       |   Redis   |        |(Doc Filings|       | (Async Task|       | Delta Lake |
|(10Y Data |       |(Watchlists|        | & Vectors) |       |  Queue)    |       | (Analytics)|
| & Preferences)   | & Quotes) |        |            |       |            |       |            |
+----------+       +-----------+        +------------+       +------------+       +------------+
```

---

## 2. Component Blueprint Specifications

### 2.1 AWS CloudFront & S3
- **CloudFront**: Edge distribution with TLS 1.3 encryption, Geo-restriction capabilities, automatic compression, and custom edge routing.
- **S3 Bucket**: Versioned, encrypted at rest via AWS KMS (SSE-KMS), holding raw Annual Reports, PDF investor filings, and chunked text documents for RAG.

### 2.2 ECS Container Microservices (FastAPI)
- **Task Definition**: 2 vCPU, 4GB RAM minimum per container task.
- **Autoscaling Policy**: Scales dynamically from 2 to 10 instances based on CPU utilization (>70%) and ALB Request Count Per Target.
- **Dynamic Services**: Handles live `yfinance` resolution, parallel peer matrix evaluations (up to 15 concurrent tickers), and dynamic watchlist/alert persistence.

### 2.3 RDS PostgreSQL & ElastiCache Redis
- **RDS PostgreSQL**: Multi-AZ db.r6g.xlarge with automated daily snapshots, storing 10-year audited financial statements, master ticker metadata, shareholding patterns, and user preferences (watchlists & alerts).
- **ElastiCache Redis**: Cluster mode enabled (cache.r6g.large), serving sub-millisecond quote ticks, calculated DCF outputs, dynamic watchlist state, and user session tokens.

### 2.4 Asynchronous Task Queue & Scheduling
- **AWS SQS**: `equity-research-doc-indexing-queue.fifo` manages background document OCR, embedding generation, and news deduplication.
- **EventBridge**: Cron schedules for end-of-day market data sync (15:30 IST) and news ingestion.

### 2.5 Security & LLM Provider Secrets
- **AWS Secrets Manager**: Secure storage for LLM keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) with automatic key rotation and IAM role isolation.

### 2.6 Databricks Integration
- **Databricks Unity Catalog**: Connects directly to PostgreSQL RDS and S3 Delta Lake tables to run high-throughput quantitative factor models, historical 20-year backtests, and market regime analysis.
