# 📈 Antigravity AI Stock Research & Analysis Platform

A production-quality equity research and financial analysis platform focused on **Indian Equities (NSE/BSE)** and designed to scale globally to US and international markets.

Functioning like a professional institutional equity research tool rather than a simple price dashboard, the application combines 10-year audited financial statements, Cash Flow red flag detection, interactive DCF valuation modeling, technical indicator analysis with NIFTY 50 benchmark overlays, Annual Report RAG intelligence, and AI-synthesized investment views.

---

## 🌟 Key Features

### 1. 📊 Investment Snapshot & 10-Year Financial Statement Analysis
- **Income Statement**: 10-year revenue, EBITDA, EBIT, PBT, PAT, EPS, and operating margin trends with interactive growth charts.
- **Balance Sheet**: 10-year Cash, Debt, Net Debt, Receivables, Inventory, Payables, Assets, Equity, and solvency ratios (Debt/Equity, Net Debt/EBITDA, Interest Coverage, Current Ratio, Asset Turnover).
- **Cash Flow Statement**: Operating Cash Flow (CFO), Capex, Free Cash Flow ($FCF = CFO - Capex$), CFI, CFF, Net Profit (PAT), and Working Capital.

### 2. 🚨 Automated Cash Flow Red Flag Engine
Identifies earnings quality risks and capital intensity warning signals:
- **Divergence**: Net Profit (PAT) rising over 3 years while Free Cash Flow (FCF) declines.
- **Cash Conversion Lag**: Operating Cash Flow consistently below Net Profit ($CFO / PAT < 0.8$).
- **Working Capital Expansion**: Receivables/Inventory expanding faster than sales growth.

### 3. 🧮 Configurable DCF Valuation Engine & Sensitivity Matrix
- **Interactive Assumptions**: Sliders for Revenue Growth Rate, EBITDA Margin, Tax Rate, WACC Discount Rate, and Terminal Growth Rate.
- **5x5 Sensitivity Matrix**: Automatically calculates a heatmap table displaying implied fair share prices across varying WACC and Terminal Growth rate combinations.
- **Relative & Historical Valuation**: P/E, P/B, EV/EBITDA, Dividend Yield compared against sector median, peers, and 5-year historical percentiles.

### 4. 📈 Technical Analysis & Benchmark Overlay
- **Indicators**: SMA 20/50/100/200, EMA 20/50, RSI 14, MACD, Bollinger Bands, ATR, Volume MA.
- **Interactive Chart**: 1D, 1W, 1M, 3M, 6M, 1Y, 3Y, 5Y, MAX timeframes with **NIFTY 50 Benchmark Overlay**.
- **Factual Pattern Identification**: Non-recommendatory pattern detection badges.
- **Risk Metrics**: 1Y Absolute Return, Relative Return vs. Nifty, Annualized Volatility, Max Drawdown, and Sharpe Ratio ($R_f=6.5\%$).

### 5. 📑 Filings & Annual Report RAG Intelligence
- Upload PDF/text Annual Reports, Investor Presentations, and Earnings Call Transcripts.
- Ask natural language questions (*"Why did margins decline?"*, *"What are the key risks?"*) and receive grounded answers with **Document Name, Year, and Page Number Citations**.

### 6. 🤖 Evidence-Based AI Investment Thesis
- Directly addresses the **14 Core Equity Research Questions**:
  1. What does this company do?
  2. Is the business growing?
  3. Is it financially healthy?
  4. Is management/shareholding quality reasonable?
  5. Is the company generating cash?
  6. How profitable is the business?
  7. How efficiently does it use capital?
  8. How does its valuation compare with history and peers?
  9. What are the major risks?
  10. What do recent results and management commentary indicate?
  11. What is the technical trend?
  12. What are the important recent news/events?
  13. What are bull/base/bear scenarios?
  14. What factors could invalidate the investment thesis?
- Generates **Bull, Base, and Bear Case Scenarios** and explicit **Thesis Invalidation Factors**.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### **Backend**
- **Framework**: Python 3.10 + FastAPI
- **Validation**: Pydantic v2
- **Data Engines**: Pandas & NumPy
- **Database ORM**: SQLAlchemy & SQLite/PostgreSQL

### **AI Layer**
- **Provider Abstraction**: OpenAI, Anthropic, and Google Gemini
- **Guardrails**: Strict quantitative context injection preventing hallucinated financial metrics.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Clone Repository
```bash
git clone https://github.com/amanchandna241/stock-analysis-platform.git
cd stock-analysis-platform
```

### 2. Start Backend Server
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend running at: `http://127.0.0.1:8000`  
Swagger API Docs at: `http://127.0.0.1:8000/docs`

### 3. Start Frontend App
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend running at: `http://localhost:3000`

---

## ☁️ Enterprise Cloud Deployment (AWS & Databricks)

The platform is designed for enterprise AWS deployment:
- **AWS CloudFront**: CDN distribution for static Next.js assets.
- **AWS S3**: Encrypted object store for raw PDF filings and chunked document vectors.
- **AWS ECS / EKS**: Containerized microservices running FastAPI and Celery background workers.
- **Application Load Balancer (ALB)**: Layer-7 routing.
- **RDS PostgreSQL & ElastiCache Redis**: Relational financial statements DB & sub-millisecond metric cache.
- **AWS SQS & EventBridge**: Async queues for document RAG indexing & market data sync.
- **Databricks Integration**: Unity Catalog connection for large-scale historical tick analytics and factor backtesting.

See [`deployment/aws-architecture.md`](deployment/aws-architecture.md) for full CloudFormation/Terraform blueprints.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
