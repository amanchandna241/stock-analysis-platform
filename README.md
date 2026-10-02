# 📈 Alphiq — AI Stock Research & Analytics Platform

A production-quality equity research and financial analysis platform focused on **Indian Equities (NSE/BSE)**, **Indian Mutual Funds (AMFI)**, and **US & International Markets**.

Functioning like a professional institutional equity research tool rather than a simple price dashboard, the application combines **live real-time market data feeds**, open-source data APIs (`mfapi.in`), 10-year financial statements, automated Cash Flow red flag detection, interactive DCF valuation modeling with 5x5 sensitivity matrices, technical indicator analysis with NIFTY 50 benchmark overlays, Annual Report RAG intelligence, AI-synthesized investment views, **dynamic user watchlists & alerts**, **Indian Mutual Fund performance & AI recommendations**, and a **customizable multi-stock peer comparison matrix**.

---

## 🌟 Key Features

### 1. 🇮🇳 Indian Mutual Funds Analytics & Open API Data Engine (`/mutual-funds`)
- **Live Open API Integration (`mfapi.in`)**: Connects to open-source AMFI APIs for real-time Scheme NAV histories, scheme details, and manager profiles across 10,000+ Indian mutual fund schemes.
- **CAGR Performance Ratios**: Automatically computes **1-Year, 3-Year, and 5-Year CAGR** returns, Sharpe Ratios, historical volatility, and Riskometer risk classifications.
- **Category Heatmaps**: Interactive performance breakdown across Small Cap, Flexi Cap, Large Cap, Mid Cap, ELSS, Debt, Hybrid, and Index Funds.
- **Top 5-Star AI Recommendations**: Quantitative scoring and natural language recommendation rationale for top-performing schemes.
- **Scheme Detail Page (`/mutual-funds/[scheme_code]`)**: Interactive NAV history charts with NIFTY 50 benchmark overlay, expense ratios, exit loads, top sector allocations, and top equity holdings.

### 2. 💵 Multi-Currency USD Support for US Equities
- **Dynamic Currency Formatting**: Seamlessly displays balance sheets, income statements, cash flow statements, and market caps in **USD ($)** for US equities (`AAPL`, `NVDA`, `MSFT`, `TSLA`, `GOOG`) and **INR (₹ / Cr)** for Indian equities.
- **Cross-Currency AI Models**: Context-aware LLM research models that parse and output currency-matched financial metrics without units confusion.

### 3. ⚡ Live Real-Time Market Data & Command Palette (`Ctrl+K`)
- **Live Price Quotes & Market Caps**: Connects to live exchange feeds (`yfinance`) for real-time stock prices, daily price changes, market caps, 52-week highs/lows, and corporate summaries.
- **Global & Indian Equities Support**: Dynamically fetches data for any Indian ticker (`RELIANCE`, `SBIN`, `TCS`, `INFY`, `HDFCBANK`, `ICICIBANK`, `BHARTIARTL`, `TATAMOTORS`, `WIPRO`) or US ticker (`AAPL`, `NVDA`, `MSFT`, `TSLA`).
- **Command Palette Global Search (`Ctrl+K`)**: Ultra-spacious, high-contrast search modal with instant autocomplete suggestions, dark-mode input overrides, and keyboard shortcuts.
- **Resilient Fallback Engine**: Seamlessly falls back to local data if exchange APIs rate-limit or go offline, guaranteeing high availability.

### 4. 👥 Shareholding Pattern & Governance Analysis
- **Institutional Shareholding Trends**: 5-quarter breakdown of FII, DII, Promoter, and Public equity holding changes.
- **Promoter Pledge Risk Monitor**: Real-time tracking of promoter pledge percentage to alert on financial leverage risks.
- **Governance Audit Timeline**: Systematized logging of auditor changes, SEBI compliance notices, board changes, and related-party transaction events.

### 5. 🎯 Dynamic Watchlist & Custom Alerts Management
- **Interactive Ticker Watchlist**: Add any stock ticker on-the-fly to your dynamic equity research dashboard with live market quotes, P/E multiples, and individual removal (`X`) actions.
- **Custom Valuation & Signal Alerts**: Set custom price, P/E ratio, breakout, or target price alerts per stock with type classifications (`Valuation Opportunity`, `Breakout`, `Target Price Hit`, `Earnings Signal`).
- **Stateful Persistence**: Synchronized via backend API (`/api/v1/dashboard/watchlist/add`, `/api/v1/dashboard/alerts/add`).

### 6. 📊 Multi-Stock Peer & Sector Comparison Matrix
- **Custom Competitor Matrix**: Add or remove arbitrary competitor tickers dynamically to generate multi-stock comparison matrices comparing 3Y Revenue Growth, EBITDA Margins, 3Y PAT Growth, ROE, ROCE, Debt/Equity, P/E, EV/EBITDA, and Free Cash Flow Yield.
- **Dynamic Metric Sorting**: Click any metric header to instantly sort peers in ascending or descending order.
- **Active Peer Filtering**: Manage up to 15 concurrent peers with dedicated ticker badges and target-stock highlights.

### 7. 📈 Investment Snapshot & 10-Year Financial Statement Analysis
- **Income Statement**: 10-year revenue, EBITDA, EBIT, PBT, PAT, EPS, and operating margin trends with interactive growth charts.
- **Balance Sheet**: 10-year Cash, Debt, Net Debt, Receivables, Inventory, Payables, Assets, Equity, and solvency ratios (Debt/Equity, Net Debt/EBITDA, Interest Coverage, Current Ratio, Asset Turnover).
- **Cash Flow Statement**: Operating Cash Flow (CFO), Capex, Free Cash Flow ($FCF = CFO - Capex$), CFI, CFF, Net Profit (PAT), and Working Capital.

### 8. 🚨 Automated Cash Flow Red Flag Engine
Identifies earnings quality risks and capital intensity warning signals:
- **Divergence**: Net Profit (PAT) rising over 3 years while Free Cash Flow (FCF) declines.
- **Cash Conversion Lag**: Operating Cash Flow consistently below Net Profit ($CFO / PAT < 0.8$).
- **Working Capital Expansion**: Receivables/Inventory expanding faster than sales growth.

### 9. 🧮 Configurable DCF Valuation Engine & Sensitivity Matrix
- **Interactive Assumptions**: Sliders for Revenue Growth Rate, EBITDA Margin, Tax Rate, WACC Discount Rate, and Terminal Growth Rate.
- **5x5 Sensitivity Matrix**: Automatically calculates a heatmap table displaying implied fair share prices across varying WACC and Terminal Growth rate combinations.
- **Relative & Historical Valuation**: P/E, P/B, EV/EBITDA, Dividend Yield compared against sector median, peers, and 5-year historical percentiles.

### 10. 📈 Technical Analysis & Benchmark Overlay
- **Indicators**: SMA 20/50/100/200, EMA 20/50, RSI 14, MACD, Bollinger Bands, ATR, Volume MA.
- **Interactive Chart**: 1D, 1W, 1M, 3M, 6M, 1Y, 3Y, 5Y, MAX timeframes with **NIFTY 50 Benchmark Overlay**.
- **Factual Pattern Identification**: Non-recommendatory pattern detection badges.
- **Risk Metrics**: 1Y Absolute Return, Relative Return vs. Nifty, Annualized Volatility, Max Drawdown, and Sharpe Ratio ($R_f=6.5\%$).

### 11. 📑 Filings & Annual Report RAG Intelligence
- Upload PDF/text Annual Reports, Investor Presentations, and Earnings Call Transcripts.
- Ask natural language questions (*"Why did margins decline?"*, *"What are the key risks?"*) and receive grounded answers with **Document Name, Year, and Page Number Citations**.

### 12. 🤖 Evidence-Based AI Investment Thesis
- Directly addresses the **14 Core Equity Research Questions** (business model, financial health, management quality, cash flow quality, capital efficiency, scenario modeling, thesis invalidation factors).

### 13. 🔮 ML Ensemble Price Target Forecasting & Volatility Regimes (`/ml/forecast/{ticker}`)
- **Multi-Horizon Price Predictions**: 30-day, 90-day, and 180-day ensemble forecasting combining Geometric Brownian Motion (GBM) Monte Carlo simulation, dampened polynomial drift regression, and exponential trend smoothing.
- **Monte Carlo Risk Bands**: 1,000 simulated price trajectories with 80% and 95% confidence interval channels and explicit Bear (10%), Base (50%), and Bull (90%) target price outcomes.
- **Volatility Regime Classification**: Automatic clustering into risk regimes (`Low Volatility / Steady Consolidation`, `Mean-Reverting Range-Bound`, `High Volatility / Breakout Risk`, `Extreme Drawdown Hazard`).
- **Parkinson Intraday Volatility Engine**: Calculates Parkinson High/Low volatility, Close-to-Close volatility, and Parkinson variance ratio.
- *See [`docs/ML_FORECASTING.md`](docs/ML_FORECASTING.md) for complete mathematical specifications, formulas, and JSON API payloads.*

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Interactive Command Palette, Recharts, Lucide React

### **Backend**
- **Framework**: Python 3.10 + FastAPI
- **Market & Mutual Fund Data Feeds**: `mfapi.in` (Open AMFI API), `yfinance`, `beautifulsoup4`, `lxml`
- **Validation**: Pydantic v2
- **Data & ML Engines**: Pandas, NumPy, SciPy, Scikit-Learn
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
| `/api/v1/mutual-funds/explore` | `GET` | Mutual funds dashboard, category heatmaps, and top 5-star recommendations |
| `/api/v1/mutual-funds/search` | `GET` | Search Indian mutual fund schemes by name or AMFI scheme code |
| `/api/v1/mutual-funds/{scheme_code}` | `GET` | Scheme details, NAV history, benchmark overlay, risk ratios, sector & stock holdings |
| `/api/v1/governance/{ticker}/shareholding` | `GET` | FII, DII, Promoter, and Public shareholding trend with pledge monitoring |
| `/api/v1/governance/{ticker}/governance-events` | `GET` | Corporate governance risk timeline and audit disclosures |
| `/api/v1/peers/{ticker}` | `GET` | Returns multi-stock comparative matrix (supports `?custom_peers=...`) |
| `/api/v1/stocks/{ticker}` | `GET` | Financial statement overview & key metrics (USD / INR context) |
| `/api/v1/valuation/{ticker}` | `GET` | Relative valuation & DCF model with sensitivity matrix |
| `/api/v1/technicals/{ticker}` | `GET` | Technical indicators & NIFTY benchmark overlay |
| `/api/v1/ml/forecast/{ticker}` | `GET` | ML ensemble price target forecasts, Monte Carlo paths, confidence channels, & volatility regimes |
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
