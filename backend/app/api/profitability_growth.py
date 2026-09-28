from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine
from app.schemas.stock import ProfitabilityTrend, GrowthResponse, GrowthCAGRRow

router = APIRouter(prefix="/analytics", tags=["Profitability & Growth"])

@router.get("/{ticker}/profitability", response_model=ProfitabilityTrend)
def get_profitability_analysis(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    years = data['financials_years']
    rev = data['revenue']
    ebitda = data['ebitda']
    pat = data['pat']
    equity = data['equity']
    debt = data['debt']

    gross_margins = [58.5] * len(years)
    ebitda_margins = [round((ebitda[i] / max(1.0, rev[i])) * 100.0, 2) for i in range(len(years))]
    ebit_margins = [round((ebitda[i] * 0.82 / max(1.0, rev[i])) * 100.0, 2) for i in range(len(years))]
    net_margins = [round((pat[i] / max(1.0, rev[i])) * 100.0, 2) for i in range(len(years))]
    roes = [round((pat[i] / max(1.0, equity[i])) * 100.0, 2) for i in range(len(years))]
    roces = [round(((ebitda[i] * 0.82) / max(1.0, equity[i] + debt[i])) * 100.0, 2) for i in range(len(years))]
    roics = [round((ebitda[i] * 0.70 / max(1.0, equity[i] + debt[i] - data['cash'][i])) * 100.0, 2) for i in range(len(years))]

    metrics = {
        "gross_margin": [{"year": years[i], "value": gross_margins[i]} for i in range(len(years))],
        "ebitda_margin": [{"year": years[i], "value": ebitda_margins[i]} for i in range(len(years))],
        "ebit_margin": [{"year": years[i], "value": ebit_margins[i]} for i in range(len(years))],
        "net_margin": [{"year": years[i], "value": net_margins[i]} for i in range(len(years))],
        "roe": [{"year": years[i], "value": roes[i]} for i in range(len(years))],
        "roce": [{"year": years[i], "value": roces[i]} for i in range(len(years))],
        "roic": [{"year": years[i], "value": roics[i]} for i in range(len(years))]
    }

    trends_5y = {
        "ebitda_margin_change": round(ebitda_margins[-1] - ebitda_margins[-5], 2),
        "roe_change": round(roes[-1] - roes[-5], 2),
        "roce_change": round(roces[-1] - roces[-5], 2)
    }

    trends_10y = {
        "ebitda_margin_change": round(ebitda_margins[-1] - ebitda_margins[0], 2),
        "roe_change": round(roes[-1] - roes[0], 2),
        "roce_change": round(roces[-1] - roces[0], 2)
    }

    explanations = FinancialEngine.explain_profitability_changes(
        {"ebitda_margin": ebitda_margins, "net_margin": net_margins, "roe": roes},
        years
    )

    return ProfitabilityTrend(
        ticker=data['ticker'],
        metrics=metrics,
        trends_5y=trends_5y,
        trends_10y=trends_10y,
        explanations=explanations,
        currency=data.get('currency', 'INR')
    )

@router.get("/{ticker}/growth", response_model=GrowthResponse)
def get_growth_analysis(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    rev = data['revenue']
    ebitda = data['ebitda']
    pat = data['pat']
    eps = data['eps']
    fcf = [data['cfo'][i] - data['capex'][i] for i in range(len(data['financials_years']))]

    def calc_cagrs(arr):
        c3 = FinancialEngine.calculate_cagr(arr[-4], arr[-1], 3)
        c5 = FinancialEngine.calculate_cagr(arr[-6], arr[-1], 5)
        c10 = FinancialEngine.calculate_cagr(arr[0], arr[-1], 9)
        return c3, c5, c10

    rev_3, rev_5, rev_10 = calc_cagrs(rev)
    eb_3, eb_5, eb_10 = calc_cagrs(ebitda)
    p_3, p_5, p_10 = calc_cagrs(pat)
    eps_3, eps_5, eps_10 = calc_cagrs(eps)
    fcf_3, fcf_5, fcf_10 = calc_cagrs(fcf)

    table = [
        GrowthCAGRRow(metric="Revenue Growth", cagr_3y=rev_3, cagr_5y=rev_5, cagr_10y=rev_10),
        GrowthCAGRRow(metric="EBITDA Growth", cagr_3y=eb_3, cagr_5y=eb_5, cagr_10y=eb_10),
        GrowthCAGRRow(metric="PAT Growth", cagr_3y=p_3, cagr_5y=p_5, cagr_10y=p_10),
        GrowthCAGRRow(metric="EPS Growth", cagr_3y=eps_3, cagr_5y=eps_5, cagr_10y=eps_10),
        GrowthCAGRRow(metric="Free Cash Flow Growth", cagr_3y=fcf_3, cagr_5y=fcf_5, cagr_10y=fcf_10)
    ]

    chart_data = []
    years = data['financials_years']
    for i in range(len(years)):
        chart_data.append({
            "year": years[i],
            "revenue": rev[i],
            "ebitda": ebitda[i],
            "pat": pat[i],
            "fcf": fcf[i]
        })

    return GrowthResponse(ticker=data['ticker'], table=table, cagr_chart_data=chart_data, currency=data.get('currency', 'INR'))
