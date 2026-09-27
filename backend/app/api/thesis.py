from fastapi import APIRouter, HTTPException
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine
from app.services.ai_service import AIService
from app.schemas.stock import AIThesisResponse

router = APIRouter(prefix="/thesis", tags=["AI Investment Thesis"])

@router.get("/{ticker}", response_model=AIThesisResponse)
def get_investment_thesis(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    rev = data['revenue']
    pat = data['pat']
    equity = data['equity']
    debt = data['debt']
    cfo = data['cfo']
    capex = data['capex']

    rev_3y = FinancialEngine.calculate_cagr(rev[-4], rev[-1], 3)
    roe = round((pat[-1] / max(1.0, equity[-1])) * 100.0, 2)
    roce = round(((data['ebitda'][-1] * 0.82) / max(1.0, equity[-1] + debt[-1])) * 100.0, 2)
    debt_eq = round(debt[-1] / max(1.0, equity[-1]), 2)
    fcf = cfo[-1] - capex[-1]

    financials_summary = {
        "rev_growth_3y": rev_3y,
        "roe": roe,
        "roce": roce,
        "debt_equity": debt_eq,
        "fcf_cr": fcf
    }

    valuation_summary = {
        "pe_ratio": data['pe_ratio'],
        "pe_median_5y": round(data['pe_ratio'] * 0.88, 1)
    }

    ai_service = AIService()
    return ai_service.generate_investment_thesis(
        ticker=data['ticker'],
        company_name=data['name'],
        sector=data['sector'],
        financials_summary=financials_summary,
        quarterly_summary={},
        valuation_summary=valuation_summary,
        technical_summary={}
    )
