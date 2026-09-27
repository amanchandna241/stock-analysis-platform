# 📈 Antigravity AI Stock Research & Analysis Platform

A production-quality equity research and financial analysis platform focused on **Indian Equities (NSE/BSE)** and designed to scale globally to US and international markets.

Functioning like a professional institutional equity research tool rather than a simple price dashboard, the application combines **live real-time market data feeds**, 10-year financial statements, automated Cash Flow red flag detection, interactive DCF valuation modeling with 5x5 sensitivity matrices, technical indicator analysis with NIFTY 50 benchmark overlays, Annual Report RAG intelligence, AI-synthesized investment views, **dynamic user watchlists & alerts**, and a **customizable multi-stock peer comparison matrix**.

---

## 🌟 Key Features

### 1. ⚡ Live Real-Time Market Data & Command Palette (`Ctrl+K`)
- **Live Price Quotes & Market Caps**: Connects to live exchange feeds (`yfinance`) for real-time stock prices, daily price changes, market caps, 52-week highs/lows, and corporate summaries.
- **Global & Indian Equities Support**: Dynamically fetches data for any Indian ticker (`RELIANCE`, `SBIN`, `TCS`, `INFY`, `HDFCBANK`, `ICICIBANK`, `BHARTIARTL`, `TATAMOTORS`, `WIPRO`) or US ticker (`AAPL`, `NVDA`, `MSFT`, `TSLA`).
- **Command Palette Global Search (`Ctrl+K`)**: Ultra-spacious, high-contrast search modal with instant autocomplete suggestions, dark-mode input overrides, and keyboard shortcuts.
- **Resilient Fallback Engine**: Seamlessly falls back to local data if exchange APIs rate-limit or go offline, guaranteeing high availability.

### 2. 🎯 Dynamic Watchlist & Custom Alerts Management
- **Interactive Ticker Watchlist**: Add any stock ticker on-the-fly to your dynamic equity research dashboard with live market quotes, P/E multiples, and individual removal (`X`) actions.
- **Custom Valuation & Signal Alerts**: Set custom price, P/E ratio, breakout, or target price alerts per stock with type classifications (`Valuation Opportunity`, `Breakout`, `Target Price Hit`, `Earnings Signal`).
- **Stateful Persistence**: Synchronized via backend API (`/api/v1/dashboard/watchlist/add`, `/api/v1/dashboard/alerts/add`).

### 3. 📊 Multi-Stock Peer & Sector Comparison Matrix
- **Custom Competitor Matrix**: Add or remove arbitrary competitor tickers dynamically to generate multi-stock comparison matrices comparing 3Y Revenue Growth, EBITDA Margins, 3Y PAT Growth, ROE, ROCE, Debt/Equity, P/E, EV/EBITDA, and Free Cash Flow Yield.
- **Dynamic Metric Sorting**: Click any metric header to instantly sort peers in ascending or descending order.
- **Active Peer Filtering**: Manage up to 15 concurrent peers with dedicated ticker badges and target-stock highlights.

### 4. 📈 Investment Snapshot & 10-Year Financial Statement Analysis
- **Income Statement**: 10-year revenue, EBITDA, EBIT, PBT, PAT, EPS, and operating margin trends with interactive growth charts.
- **Balance Sheet**: 10-year Cash, Debt, Net Debt, Receivables, Inventory, Payables, Assets, Equity, and solvency ratios (Debt/Equity, Net Debt/EBITDA, Interest Coverage, Current Ratio, Asset Turnover).
- **Cash Flow Statement**: Operating Cash Flow (CFO), Capex, Free Cash Flow ($FCF = CFO - Capex$), CFI, CFF, Net Profit (PAT), and Working Capital.

### 5. 🚨 Automated Cash Flow Red Flag Engine
Identifies earnings quality risks and capital intensity warning signals:
- **Divergence**: Net Profit (PAT) rising over 3 years while Free Cash Flow (FCF) declines.
- **Cash Conversion Lag**: Operating Cash Flow consistently below Net Profit ($CFO / PAT < 0.8$).
- **Working Capital Expansion**: Receivables/Inventory expanding faster than sales growth.

### 6. 🧮 Configurable DCF Valuation Engine & Sensitivity Matrix
- **Interactive Assumptions**: Sliders for Revenue Growth Rate, EBITDA Margin, Tax Rate, WACC Discount Rate, and Terminal Growth Rate.
- **5x5 Sensitivity Matrix**: Automatically calculates a heatmap table displaying implied fair share prices across varying WACC and Terminal Growth rate combinations.
- **Relative & Historical Valuation**: P/E, P/B, EV/EBITDA, Dividend Yield compared against sector median, peers, and 5-year historical percentiles.

### 7. 📈 Technical Analysis & Benchmark Overlay
- **Indicators**: SMA 20/50/100/200, EMA 20/50, RSI 14, MACD, Bollinger Bands, ATR, Volume MA.
- **Interactive Chart**: 1D, 1W, 1M, 3M, 6M, 1Y, 3Y, 5Y, MAX timeframes with **NIFTY 50 Benchmark Overlay**.
- **Factual Pattern Identification**: Non-recommendatory pattern detection badges.
- **Risk Metrics**: 1Y Absolute Return, Relative Return vs. Nifty, Annualized Volatility, Max Drawdown, and Sharpe Ratio ($R_f=6.5\%$).

### 8. 📑 Filings & Annual Report RAG Intelligence
- Upload PDF/text Annual Reports, Investor Presentations, and Earnings Call Transcripts.
- Ask natural language questions (*"Why did margins decline?"*, *"What are the key risks?"*) and receive grounded answers with **Document Name, Year, and Page Number Citations**.

### 9. 🤖 Evidence-Based AI Investment Thesis
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
- **Components**: Interactive Command Palette, Recharts, Lucide React

### **Backend**
- **Framework**: Python 3.10 + FastAPI
- **Market Data Feeds**: `yfinance`, `beautifulsoup4`, `lxml`
- **Validation**: Pydantic v2
- **Data Engines**: Pandas & NumPy
- **Database ORM**: SQLAlchemy & SQLite/PostgreSQL

### **AI Layer**
- **Provider Abstraction**: OpenAI, Anthropic, and Google Gemini
- **Guardrails**: Strict quantitative context injection preventing hallucinated financial metrics.

---

## 🔌 API Reference Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/dashboard` | `GET` | Returns market indices, Watchlist, Gainers/Losers, 52W Highs, and Alerts |
| `/api/v1/dashboard/watchlist/add` | `POST` | Dynamically adds ticker to active user Watchlist |
| `/api/v1/dashboard/watchlist/remove` | `DELETE` | Removes ticker from active user Watchlist |
| `/api/v1/dashboard/alerts/add` | `POST` | Creates custom valuation or signal alert |
| `/api/v1/dashboard/alerts/remove` | `DELETE` | Dismisses active alert by ID |
| `/api/v1/peers/{ticker}` | `GET` | Returns multi-stock comparative matrix (supports `?custom_peers=...`) |
| `/api/v1/stocks/{ticker}` | `GET` | Financial statement overview & key metrics |
| `/api/v1/valuation/{ticker}` | `GET` | Relative valuation & DCF model with sensitivity matrix |
| `/api/v1/technicals/{ticker}` | `GET` | Technical indicators & NIFTY benchmark overlay |
| `/api/v1/rag/query` | `POST` | Queries filings vector DB for RAG answers with citations |
| `/api/v1/thesis/{ticker}` | `GET` | 14-question AI investment thesis & scenario models |

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
npm run build
npm start
```
Frontend running at: `http://localhost:3000`

---

## ☁️ Enterprise Cloud Deployment (AWS & Databricks)

The platform includes a complete **Terraform Infrastructure-as-Code (`/deployment/terraform`)** setup:
- **AWS CloudFront**: CDN distribution for static Next.js assets.
- **AWS S3**: Encrypted object store for raw PDF filings and chunked document vectors.
- **AWS ECS / EKS**: Containerized microservices running FastAPI and Celery background workers.
- **Application Load Balancer (ALB)**: Layer-7 routing.
- **RDS PostgreSQL & ElastiCache Redis**: Relational financial statements DB & sub-millisecond metric cache.
- **AWS SQS & EventBridge**: Async queues for document RAG indexing & market data sync.
- **Databricks Integration**: Unity Catalog connection for large-scale historical tick analytics and factor backtesting.

See [`deployment/aws-architecture.md`](deployment/aws-architecture.md) for full CloudFormation/Terraform blueprints and run `./deployment/deploy.sh` to provision infrastructure.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
