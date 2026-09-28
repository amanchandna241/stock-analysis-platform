from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class StockOverview(BaseModel):
    ticker: str
    bse_code: Optional[str] = None
    exchange: Optional[str] = "NSE"
    name: str
    sector: str
    industry: str
    current_price: float
    change_amount: float
    change_percent: float
    market_cap_cr: float
    pe_ratio: float
    pb_ratio: float
    ev_ebitda: float
    dividend_yield: float
    high_52w: float
    low_52w: float
    currency: str = "INR"
    last_updated: str
    business_summary: str
    key_products: List[str]

class SnapshotMetrics(BaseModel):
    revenue_growth_3y: float
    ebitda_growth_3y: float
    pat_growth_3y: float
    eps_growth_3y: float
    roe: float
    roce: float
    debt_equity: float
    free_cash_flow_cr: float
    operating_margin: float
    pe_ratio: float
    pb_ratio: float
    ev_ebitda: float
    dividend_yield: float
    formulas: Dict[str, str]
    currency: str = "INR"

class AnnualFinancialRow(BaseModel):
    year: str # e.g. FY16, FY17 ... FY25
    revenue: float
    ebitda: float
    ebit: float
    pbt: float
    pat: float
    eps: float
    gross_margin: float
    ebitda_margin: float
    ebit_margin: float
    pat_margin: float

class IncomeStatementResponse(BaseModel):
    ticker: str
    years: List[str]
    rows: List[AnnualFinancialRow]
    revenue_chart: List[Dict[str, Any]]
    ebitda_chart: List[Dict[str, Any]]
    pat_chart: List[Dict[str, Any]]
    margin_trend: List[Dict[str, Any]]
    currency: str = "INR"

class BalanceSheetRow(BaseModel):
    year: str
    cash: float
    debt: float
    net_debt: float
    receivables: float
    inventory: float
    payables: float
    total_assets: float
    equity: float
    debt_to_equity: float
    net_debt_to_ebitda: float
    current_ratio: float
    interest_coverage: float
    asset_turnover: float

class BalanceSheetResponse(BaseModel):
    ticker: str
    years: List[str]
    rows: List[BalanceSheetRow]
    currency: str = "INR"

class CashFlowRow(BaseModel):
    year: str
    cfo: float
    capex: float
    fcf: float
    cfi: float
    cff: float
    pat: float
    fcf_to_pat_ratio: float
    working_capital: float

class CashFlowWarning(BaseModel):
    year: str
    warning_type: str
    severity: str # HIGH, MEDIUM, LOW
    description: str

class CashFlowResponse(BaseModel):
    ticker: str
    years: List[str]
    rows: List[CashFlowRow]
    formula: str = "FCF = Operating Cash Flow (CFO) - Capital Expenditure (Capex)"
    warnings: List[CashFlowWarning]
    currency: str = "INR"

class ProfitabilityTrend(BaseModel):
    ticker: str
    metrics: Dict[str, List[Dict[str, Any]]] # gross_margin, ebitda_margin, net_margin, roe, roce, roic
    trends_5y: Dict[str, float]
    trends_10y: Dict[str, float]
    explanations: List[str]
    currency: str = "INR"

class GrowthCAGRRow(BaseModel):
    metric: str
    cagr_3y: float
    cagr_5y: float
    cagr_10y: float

class GrowthResponse(BaseModel):
    ticker: str
    table: List[GrowthCAGRRow]
    cagr_chart_data: List[Dict[str, Any]]
    currency: str = "INR"

class RelativeValuationRow(BaseModel):
    metric: str
    company_value: float
    sector_median: float
    peer_median: float
    historical_median_5y: float
    valuation_status: str # Premium, Discount, Fair

class HistoricalValuationData(BaseModel):
    metric_name: str
    current: float
    median_5y: float
    min_5y: float
    max_5y: float
    percentile: float
    historical_chart: List[Dict[str, Any]]

class DCFInput(BaseModel):
    revenue_growth_rate: float = 0.12 # 12%
    ebitda_margin: float = 0.22 # 22%
    tax_rate: float = 0.25 # 25%
    capex_pct_rev: float = 0.05 # 5%
    nwc_pct_rev: float = 0.04 # 4%
    wacc: float = 0.11 # 11%
    terminal_growth_rate: float = 0.045 # 4.5%
    projection_years: int = 5

class DCFSensitivityCell(BaseModel):
    wacc: float
    terminal_growth: float
    implied_share_price: float

class DCFResult(BaseModel):
    enterprise_value_cr: float
    net_debt_cr: float
    equity_value_cr: float
    shares_outstanding_cr: float
    fair_value_per_share: float
    current_price: float
    margin_of_safety_pct: float
    disclaimer: str = "DCF output is a scenario-based model estimate and NOT a guaranteed target price."
    projections: List[Dict[str, Any]]
    sensitivity_table: List[List[DCFSensitivityCell]]
    sensitivity_waccs: List[float]
    sensitivity_growths: List[float]
    currency: str = "INR"

class ValuationResponse(BaseModel):
    ticker: str
    relative_table: List[RelativeValuationRow]
    historical: HistoricalValuationData
    dcf_default: DCFResult
    currency: str = "INR"

class PeerComparisonRow(BaseModel):
    ticker: str
    name: str
    market_cap_cr: float
    revenue_growth_3y: float
    ebitda_margin: float
    pat_growth_3y: float
    roe: float
    roce: float
    debt_equity: float
    pe_ratio: float
    ev_ebitda: float
    fcf_yield: float
    dividend_yield: float
    currency: str = "INR"

class PeerComparisonResponse(BaseModel):
    target_ticker: str
    peers: List[PeerComparisonRow]

class TechnicalIndicatorSummary(BaseModel):
    sma_20: float
    sma_50: float
    sma_100: float
    sma_200: float
    ema_20: float
    ema_50: float
    rsi_14: float
    macd_val: float
    macd_signal: float
    macd_hist: float
    bollinger_upper: float
    bollinger_middle: float
    bollinger_lower: float
    atr_14: float
    volume_ma_20: float

class TechnicalPattern(BaseModel):
    name: str
    type: str # Bullish, Bearish, Neutral
    description: str

class PriceChartPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    rsi: Optional[float] = None
    nifty50_close: Optional[float] = None

class TechnicalResponse(BaseModel):
    ticker: str
    current_price: float
    indicators: TechnicalIndicatorSummary
    patterns: List[TechnicalPattern]
    chart_data: List[PriceChartPoint]
    metrics: Dict[str, float] # absolute_return_1y, relative_return_vs_nifty_1y, annualized_volatility, max_drawdown_1y, sharpe_ratio
    currency: str = "INR"

class ShareholdingTrend(BaseModel):
    quarter: str
    promoter: float
    fii: float
    dii: float
    public: float
    promoter_pledge_pct: float

class ShareholdingResponse(BaseModel):
    ticker: str
    history: List[ShareholdingTrend]
    key_insights: List[str]

class GovernanceEvent(BaseModel):
    date: str
    category: str # Pledge, Related-Party, Auditor, Regulatory, Management
    title: str
    details: str
    source_url: Optional[str] = None
    severity: str # LOW, MEDIUM, HIGH

class GovernanceResponse(BaseModel):
    ticker: str
    promoter_pledging_pct: float
    events: List[GovernanceEvent]
    auditor_name: str
    auditor_opinion: str

class QuarterlyResultRow(BaseModel):
    quarter: str # e.g. Q1FY25, Q4FY24, etc.
    revenue: float
    ebitda: float
    ebitda_margin: float
    pat: float
    eps: float
    yoy_rev_growth: float
    qoq_rev_growth: float
    yoy_pat_growth: float
    qoq_pat_growth: float

class QuarterlyAIAnalysis(BaseModel):
    what_changed: str
    why_changed: str
    positive_developments: List[str]
    negative_developments: List[str]
    management_commentary: str
    things_to_monitor: List[str]
    citations: List[str]

class EarningsResponse(BaseModel):
    ticker: str
    quarters: List[QuarterlyResultRow]
    ai_analysis: QuarterlyAIAnalysis
    currency: str = "INR"

class DocumentSource(BaseModel):
    doc_id: str
    doc_title: str
    doc_type: str # Annual Report, Investor Presentation, Earnings Transcript, Results
    year: str
    page_number: int
    content_snippet: str

class RAGQueryRequest(BaseModel):
    ticker: str
    query: str

class RAGQueryResponse(BaseModel):
    ticker: str
    query: str
    answer: str
    citations: List[DocumentSource]

class NewsArticle(BaseModel):
    id: str
    ticker: str
    headline: str
    source: str
    published_at: str
    category: str # Earnings, Regulatory, Management, M&A, Product, Industry, Litigation, Corporate Actions, Macro
    summary: str
    url: Optional[str] = None

class AIThesisResponse(BaseModel):
    ticker: str
    company_name: str
    overall_view: str # Bullish, Neutral, Bearish
    target_timeframe: str = "2-3 Years"
    facts_summary: List[str]
    bull_case: List[str]
    base_case: List[str]
    bear_case: List[str]
    invalidation_factors: List[str]
    answers_to_14_questions: Dict[str, str]
    currency: str = "INR"

class MarketIndex(BaseModel):
    name: str
    value: float
    change: float
    change_pct: float

class WatchlistItem(BaseModel):
    ticker: str
    name: str
    price: float
    change_pct: float
    pe_ratio: float
    market_cap_cr: float
    currency: str = "INR"

class DashboardResponse(BaseModel):
    indices: List[MarketIndex]
    top_gainers: List[WatchlistItem]
    top_losers: List[WatchlistItem]
    high_52w: List[WatchlistItem]
    low_52w: List[WatchlistItem]
    recent_earnings: List[Dict[str, Any]]
    corporate_actions: List[Dict[str, Any]]
    recent_news: List[NewsArticle]
    watchlist: List[WatchlistItem]
    alerts: List[Dict[str, Any]]
