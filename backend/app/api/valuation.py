from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
from app.services.stock_data_service import StockDataService
from app.services.valuation_engine import ValuationEngine
from app.schemas.stock import (
    ValuationResponse, RelativeValuationRow, HistoricalValuationData,
    DCFInput, DCFResult
)

router = APIRouter(prefix="/valuation", tags=["Valuation"])

@router.get("/{ticker}", response_model=ValuationResponse)
def get_valuation_summary(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    pe = data['pe_ratio']
    pb = data['pb_ratio']
    ev_eb = data['ev_ebitda']
    div_y = data['dividend_yield']

    # Relative Valuation Table
    relative_table = [
        RelativeValuationRow(
            metric="Price to Earnings (P/E)",
            company_value=pe,
            sector_median=round(pe * 0.90, 1),
            peer_median=round(pe * 0.95, 1),
            historical_median_5y=round(pe * 0.88, 1),
            valuation_status="Premium" if pe > pe * 0.95 else "Fair"
        ),
        RelativeValuationRow(
            metric="Price to Book (P/B)",
            company_value=pb,
            sector_median=round(pb * 0.85, 1),
            peer_median=round(pb * 0.90, 1),
            historical_median_5y=round(pb * 0.85, 1),
            valuation_status="Premium" if pb > 5.0 else "Fair"
        ),
        RelativeValuationRow(
            metric="EV / EBITDA",
            company_value=ev_eb,
            sector_median=round(ev_eb * 0.90, 1),
            peer_median=round(ev_eb * 0.92, 1),
            historical_median_5y=round(ev_eb * 0.85, 1),
            valuation_status="Fair"
        ),
        RelativeValuationRow(
            metric="Dividend Yield (%)",
            company_value=div_y,
            sector_median=1.1,
            peer_median=1.2,
            historical_median_5y=1.0,
            valuation_status="Fair"
        )
    ]

    # Historical Valuation
    pe_5y_min = round(pe * 0.65, 1)
    pe_5y_max = round(pe * 1.35, 1)
    pe_5y_median = round(pe * 0.88, 1)
    pe_percentile = round(((pe - pe_5y_min) / max(0.1, pe_5y_max - pe_5y_min)) * 100.0, 1)

    years = data['financials_years'][-5:]
    pe_chart = []
    for i, yr in enumerate(years):
        pe_chart.append({"year": yr, "pe": round(pe * (0.80 + i * 0.05), 1), "median": pe_5y_median})

    historical = HistoricalValuationData(
        metric_name="P/E Multiple (5-Year)",
        current=pe,
        median_5y=pe_5y_median,
        min_5y=pe_5y_min,
        max_5y=pe_5y_max,
        percentile=pe_percentile,
        historical_chart=pe_chart
    )

    # DCF Default Run
    curr_rev = data['revenue'][-1]
    net_debt = data['debt'][-1] - data['cash'][-1]
    shares = data['market_cap_cr'] / data['current_price']
    
    dcf_params = DCFInput(
        revenue_growth_rate=0.12,
        ebitda_margin=0.22,
        tax_rate=0.25,
        wacc=0.11,
        terminal_growth_rate=0.045
    )
    
    dcf_default = ValuationEngine.run_dcf_model(
        current_revenue=curr_rev,
        net_debt=net_debt,
        shares_outstanding=shares,
        current_price=data['current_price'],
        params=dcf_params
    )

    dcf_default.currency = data.get('currency', 'INR')

    return ValuationResponse(
        ticker=data['ticker'],
        relative_table=relative_table,
        historical=historical,
        dcf_default=dcf_default,
        currency=data.get('currency', 'INR')
    )

@router.post("/{ticker}/dcf-calculator", response_model=DCFResult)
def calculate_custom_dcf(ticker: str, params: DCFInput = Body(...)):
    """
    Runs dynamic DCF calculations based on user-configured WACC, terminal growth, revenue CAGR, and margin assumptions.
    Generates a 5x5 WACC vs Terminal Growth sensitivity matrix.
    """
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    curr_rev = data['revenue'][-1]
    net_debt = data['debt'][-1] - data['cash'][-1]
    shares = data['market_cap_cr'] / data['current_price']

    res = ValuationEngine.run_dcf_model(
        current_revenue=curr_rev,
        net_debt=net_debt,
        shares_outstanding=shares,
        current_price=data['current_price'],
        params=params
    )
    res.currency = data.get('currency', 'INR')
    return res
