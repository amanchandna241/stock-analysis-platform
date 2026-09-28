from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine
from app.schemas.stock import StockOverview, SnapshotMetrics

router = APIRouter(prefix="/stocks", tags=["Stocks"])

@router.get("/search")
def search_stocks(q: str = Query(..., min_length=1)):
    """Search for stocks by NSE/BSE ticker or company name."""
    return StockDataService.get_search_results(q)

@router.get("/{ticker}/overview", response_model=StockOverview)
def get_stock_overview(ticker: str):
    """Retrieve full company overview, current price, sector, market cap, key products."""
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    return StockOverview(
        ticker=data['ticker'],
        bse_code=data.get('bse_code'),
        name=data['name'],
        sector=data['sector'],
        industry=data['industry'],
        current_price=data['current_price'],
        change_amount=data['change_amount'],
        change_percent=data['change_percent'],
        market_cap_cr=data['market_cap_cr'],
        pe_ratio=data['pe_ratio'],
        pb_ratio=data['pb_ratio'],
        ev_ebitda=data['ev_ebitda'],
        dividend_yield=data['dividend_yield'],
        high_52w=data['high_52w'],
        low_52w=data['low_52w'],
        currency=data.get('currency', 'INR'),
        last_updated=data['last_updated'],
        business_summary=data['business_summary'],
        key_products=data['key_products']
    )

@router.get("/{ticker}/snapshot", response_model=SnapshotMetrics)
def get_investment_snapshot(ticker: str):
    """
    Returns high-level investment snapshot metrics with clearly defined formulas.
    """
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    rev = data['revenue']
    ebitda = data['ebitda']
    pat = data['pat']
    eps = data['eps']
    cfo = data['cfo']
    capex = data['capex']

    rev_3y = FinancialEngine.calculate_cagr(rev[-4], rev[-1], 3)
    ebitda_3y = FinancialEngine.calculate_cagr(ebitda[-4], ebitda[-1], 3)
    pat_3y = FinancialEngine.calculate_cagr(pat[-4], pat[-1], 3)
    eps_3y = FinancialEngine.calculate_cagr(eps[-4], eps[-1], 3)

    last_pat = pat[-1]
    last_equity = data['equity'][-1]
    last_ebit = ebitda[-1] * 0.8
    capital_employed = data['equity'][-1] + data['debt'][-1]

    roe = round((last_pat / max(1.0, last_equity)) * 100.0, 2)
    roce = round((last_ebit / max(1.0, capital_employed)) * 100.0, 2)
    debt_eq = round(data['debt'][-1] / max(1.0, data['equity'][-1]), 2)
    fcf = round(cfo[-1] - capex[-1], 2)
    op_margin = round((ebitda[-1] / max(1.0, rev[-1])) * 100.0, 2)

    formulas = {
        "Revenue Growth (3Y)": "CAGR = ((Rev_FY25 / Rev_FY22)^(1/3) - 1) * 100",
        "ROE": "Return on Equity = (Net Profit / Total Shareholder Equity) * 100",
        "ROCE": "Return on Capital Employed = (EBIT / (Total Equity + Total Debt)) * 100",
        "Debt/Equity": "Total Debt / Total Shareholder Equity",
        "Free Cash Flow": "FCF = Cash Flow from Operations (CFO) - Capital Expenditures (Capex)",
        "EV/EBITDA": "Enterprise Value / EBITDA = (Market Cap + Debt - Cash) / EBITDA"
    }

    return SnapshotMetrics(
        revenue_growth_3y=rev_3y,
        ebitda_growth_3y=ebitda_3y,
        pat_growth_3y=pat_3y,
        eps_growth_3y=eps_3y,
        roe=roe,
        roce=roce,
        debt_equity=debt_eq,
        free_cash_flow_cr=fcf,
        operating_margin=op_margin,
        pe_ratio=data['pe_ratio'],
        pb_ratio=data['pb_ratio'],
        ev_ebitda=data['ev_ebitda'],
        dividend_yield=data['dividend_yield'],
        formulas=formulas,
        currency=data.get('currency', 'INR')
    )
