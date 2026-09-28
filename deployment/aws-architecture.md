# Enterprise AWS & Databricks Deployment Architecture

This document provides the production cloud infrastructure blueprint for the **Antigravity Stock Research & Analysis Platform**, optimized for Indian Equities (NSE/BSE), Indian Mutual Funds (AMFI), and US & Global Equities.

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
                                                  |  (FastAPI + Financial Engines)  |
                                                  | (Stocks, Mutual Funds, RAG, AI) |
                                                  +---------------------------------+
                                                                   |
     +-------------------+--------------------+--------------------+--------------------+--------------------+
     |                   |                    |                    |                    |                    |
     v                   v                    v                    v                    v                    v
+----------+       +-----------+        +------------+       +------------+       +------------+       +------------+
|  RDS     |       |ElastiCache|        |  AWS S3    |       |  AWS SQS   |       | Open APIs  |       | Databricks |
|PostgreSQL|       |   Redis   |        |(Doc Filings|       |(Doc & MF   |       | (mfapi.in  |       | Delta Lake |
|(10Y Data |       |(Watchlists|        | & Vectors) |       | Sync Queue)|       | & yfinance)|       | (Analytics)|
| & Alerts)|       |, Quotes & |        |            |       |            |       |            |       |            |
|          |       |  MF NAVs) |        |            |       |            |       |            |       |            |
+----------+       +-----------+        +------------+       +------------+       +------------+       +------------+
```

---

## 2. Component Blueprint Specifications

### 2.1 AWS CloudFront & S3
- **CloudFront**: Edge distribution with TLS 1.3 encryption, Geo-restriction capabilities, automatic compression, and custom edge routing for static Next.js pages (`/`, `/mutual-funds`, `/stock/[ticker]`).
- **S3 Bucket**: Versioned, encrypted at rest via AWS KMS (SSE-KMS), holding raw Annual Reports, PDF investor filings, mutual fund scheme factsheets, and chunked text vectors for RAG.

### 2.2 ECS Container Microservices (FastAPI)
- **Task Definition**: 2 vCPU, 4GB RAM minimum per container task.
- **Autoscaling Policy**: Scales dynamically from 2 to 10 instances based on CPU utilization (>70%) and ALB Request Count Per Target.
- **Dynamic Services**:
  * **Indian Equities & US Equities Engine**: Live `yfinance` resolution, multi-currency (USD / INR) formatting, and financial statement ratio calculations.
  * **Indian Mutual Funds Engine**: Live open-source integration with `mfapi.in` for historical NAV fetch, 1Y/3Y/5Y CAGR calculation, Sharpe ratio, Riskometer classification, sector allocations, and AI-driven scheme recommendations.
  * **Shareholding & Governance Engine**: FII, DII, Promoter, and Public trends with promoter pledge tracking.

### 2.3 RDS PostgreSQL & ElastiCache Redis
- **RDS PostgreSQL**: Multi-AZ db.r6g.xlarge with automated daily snapshots, storing 10-year audited financial statements, master ticker metadata, mutual fund scheme master data, shareholding patterns, and user preferences (watchlists & alerts).
- **ElastiCache Redis**: Cluster mode enabled (cache.r6g.large), serving sub-millisecond quote ticks, cached mutual fund NAV histories, calculated DCF outputs, dynamic watchlist state, and user session tokens.

### 2.4 Asynchronous Task Queue & Scheduling
- **AWS SQS**:
  * `equity-research-doc-indexing-queue.fifo` manages background document OCR, embedding generation, and news deduplication.
  * `equity-research-mf-nav-sync-queue` manages asynchronous bulk Indian Mutual Funds NAV updates and AMFI scheme metadata sync.
- **EventBridge**: Cron schedules for end-of-day stock market data sync and daily mutual fund NAV ingestion (20:00 IST).

### 2.5 Security & LLM Provider Secrets
- **AWS Secrets Manager**: Secure storage for LLM keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`) with automatic key rotation and IAM role isolation.

### 2.6 Databricks Integration
- **Databricks Unity Catalog**: Connects directly to PostgreSQL RDS and S3 Delta Lake tables to run high-throughput quantitative factor models, historical 20-year backtests, and mutual fund factor attribution (Alpha / Beta vs Nifty 50).

