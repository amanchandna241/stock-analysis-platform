from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine
from app.schemas.stock import PeerComparisonResponse, PeerComparisonRow

router = APIRouter(prefix="/peers", tags=["Peers"])

PEER_MAPPINGS = {
    "RELIANCE": ["TCS", "INFY", "BHARTIARTL"],
    "TCS": ["INFY", "RELIANCE", "HDFCBANK"],
    "INFY": ["TCS", "RELIANCE", "ICICIBANK"],
    "HDFCBANK": ["ICICIBANK", "RELIANCE", "TCS"],
    "ICICIBANK": ["HDFCBANK", "RELIANCE", "INFY"],
    "BHARTIARTL": ["RELIANCE", "TCS", "INFY"]
}

@router.get("/{ticker}", response_model=PeerComparisonResponse)
def get_peer_comparison(ticker: str, custom_peers: Optional[str] = Query(None)):
    """
    Returns matrix peer comparison with key growth, profitability, valuation, leverage, and yield metrics.
    """
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    if custom_peers:
        peer_tickers = [p.strip().upper() for p in custom_peers.split(",") if p.strip()]
    else:
        peer_tickers = PEER_MAPPINGS.get(ticker.upper(), ["TCS", "INFY", "HDFCBANK"])

    all_tickers = [ticker.upper()] + [p for p in peer_tickers if p != ticker.upper()]
    rows = []

    for t in all_tickers[:5]:
        st_data = StockDataService.get_stock_overview(t)
        if not st_data:
            continue
        
        rev = st_data['revenue']
        ebitda = st_data['ebitda']
        pat = st_data['pat']
        cfo = st_data['cfo']
        capex = st_data['capex']
        equity = st_data['equity']
        debt = st_data['debt']

        rev_3y = FinancialEngine.calculate_cagr(rev[-4], rev[-1], 3)
        pat_3y = FinancialEngine.calculate_cagr(pat[-4], pat[-1], 3)
        eb_margin = round((ebitda[-1] / max(1.0, rev[-1])) * 100.0, 2)
        roe = round((pat[-1] / max(1.0, equity[-1])) * 100.0, 2)
        roce = round(((ebitda[-1] * 0.82) / max(1.0, equity[-1] + debt[-1])) * 100.0, 2)
        debt_eq = round(debt[-1] / max(1.0, equity[-1]), 2)
        fcf = cfo[-1] - capex[-1]
        fcf_yield = round((fcf / max(1.0, st_data['market_cap_cr'])) * 100.0, 2)

        rows.append(PeerComparisonRow(
            ticker=st_data['ticker'],
            name=st_data['name'],
            market_cap_cr=st_data['market_cap_cr'],
            revenue_growth_3y=rev_3y,
            ebitda_margin=eb_margin,
            pat_growth_3y=pat_3y,
            roe=roe,
            roce=roce,
            debt_equity=debt_eq,
            pe_ratio=st_data['pe_ratio'],
            ev_ebitda=st_data['ev_ebitda'],
            fcf_yield=fcf_yield,
            dividend_yield=st_data['dividend_yield']
        ))

    return PeerComparisonResponse(target_ticker=ticker.upper(), peers=rows)
