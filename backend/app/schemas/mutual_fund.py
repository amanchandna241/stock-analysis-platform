from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class MutualFundOverview(BaseModel):
    scheme_code: int
    scheme_name: str
    fund_house: str
    category: str # e.g. Equity, Debt, Hybrid, Index, ELSS
    sub_category: str # e.g. Small Cap, Flexi Cap, Large Cap, Liquid, Nifty 50 Index
    nav: float
    nav_date: str
    change_amount: float = 0.0
    change_percent: float = 0.0
    aum_cr: float
    expense_ratio: float
    risk_rating: str # Low, Moderate, Moderately High, High, Very High
    star_rating: int = 5 # 1 to 5 Stars
    return_1y: float
    return_3y_cagr: float
    return_5y_cagr: float
    recommendation: str = "Strong Buy" # Strong Buy, Buy, Hold, Neutral
    min_sip_amount: int = 500

class NAVHistoryPoint(BaseModel):
    date: str
    nav: float
    benchmark_val: Optional[float] = None

class MutualFundHolding(BaseModel):
    company_name: str
    ticker: Optional[str] = None
    sector: str
    allocation_pct: float

class MutualFundDetail(BaseModel):
    overview: MutualFundOverview
    nav_history: List[NAVHistoryPoint]
    top_holdings: List[MutualFundHolding]
    sector_allocation: Dict[str, float]
    fund_manager: str
    fund_manager_experience: str
    inception_date: str
    sharpe_ratio: float
    alpha: float
    beta: float
    std_dev: float
    category_rank: str # e.g. "#1 out of 45 Funds"
    recommendation_thesis: List[str]
    who_should_invest: List[str]
    tax_implications: str

class CategorySummary(BaseModel):
    category_name: str
    fund_count: int
    avg_return_1y: float
    avg_return_3y: float
    avg_return_5y: float
    top_scheme_name: str
    top_scheme_code: int

class MutualFundExploreResponse(BaseModel):
    top_recommended: List[MutualFundOverview]
    categories: List[CategorySummary]
    all_schemes: List[MutualFundOverview]
