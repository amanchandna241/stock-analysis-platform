from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/compare", tags=["Compare"])


def _compute_metrics(data: dict) -> Dict[str, Any]:
    """Compute all comparison metrics from stock data."""
    rev    = data.get("revenue", [1] * 10)
    ebitda = data.get("ebitda", [1] * 10)
    pat    = data.get("pat", [1] * 10)
    eps    = data.get("eps", [1] * 10)
    cfo    = data.get("cfo", [1] * 10)
    capex  = data.get("capex", [1] * 10)
    equity = data.get("equity", [1] * 10)
    debt   = data.get("debt", [1] * 10)
    cash   = data.get("cash", [1] * 10)

    rev_3y  = FinancialEngine.calculate_cagr(rev[-4],  rev[-1],  3)
    rev_5y  = FinancialEngine.calculate_cagr(rev[-6],  rev[-1],  5)
    pat_3y  = FinancialEngine.calculate_cagr(pat[-4],  pat[-1],  3)
    pat_5y  = FinancialEngine.calculate_cagr(pat[-6],  pat[-1],  5)
    eps_3y  = FinancialEngine.calculate_cagr(eps[-4],  eps[-1],  3)
    ebitda_3y = FinancialEngine.calculate_cagr(ebitda[-4], ebitda[-1], 3)

    last_rev    = max(1.0, rev[-1])
    last_equity = max(1.0, equity[-1])
    last_cap_emp = max(1.0, equity[-1] + debt[-1])

    ebitda_margin = round((ebitda[-1] / last_rev) * 100, 2)
    pat_margin    = round((pat[-1] / last_rev) * 100, 2)
    roe           = round((pat[-1] / last_equity) * 100, 2)
    roce          = round(((ebitda[-1] * 0.82) / last_cap_emp) * 100, 2)
    debt_equity   = round(debt[-1] / last_equity, 2)
    net_debt      = round(debt[-1] - cash[-1], 2)
    net_debt_ebitda = round(net_debt / max(1.0, ebitda[-1]), 2)
    fcf           = round(cfo[-1] - capex[-1], 2)
    fcf_margin    = round((fcf / last_rev) * 100, 2)
    fcf_yield     = round((fcf / max(1.0, data.get("market_cap_cr", 1))) * 100, 2)

    return {
        # Identity
        "ticker":         data["ticker"],
        "name":           data["name"],
        "sector":         data.get("sector", ""),
        "industry":       data.get("industry", ""),
        "exchange":       data.get("exchange", "NSE"),
        "currency":       data.get("currency", "INR"),
        "market_cap_cr":  data.get("market_cap_cr", 0),
        "current_price":  data.get("current_price", 0),
        "change_percent": data.get("change_percent", 0),
        "high_52w":       data.get("high_52w", 0),
        "low_52w":        data.get("low_52w", 0),
        "last_updated":   data.get("last_updated", ""),

        # Valuation
        "pe_ratio":       data.get("pe_ratio", 0),
        "pb_ratio":       data.get("pb_ratio", 0),
        "ev_ebitda":      data.get("ev_ebitda", 0),
        "dividend_yield": data.get("dividend_yield", 0),

        # Growth
        "rev_3y_cagr":    round(rev_3y, 2),
        "rev_5y_cagr":    round(rev_5y, 2),
        "pat_3y_cagr":    round(pat_3y, 2),
        "pat_5y_cagr":    round(pat_5y, 2),
        "eps_3y_cagr":    round(eps_3y, 2),
        "ebitda_3y_cagr": round(ebitda_3y, 2),
        "revenue_latest": round(rev[-1], 2),
        "pat_latest":     round(pat[-1], 2),
        "eps_latest":     round(eps[-1], 2),

        # Profitability
        "ebitda_margin":  ebitda_margin,
        "pat_margin":     pat_margin,
        "roe":            roe,
        "roce":           roce,

        # Leverage & Cash
        "debt_equity":     debt_equity,
        "net_debt":        net_debt,
        "net_debt_ebitda": net_debt_ebitda,
        "free_cash_flow":  fcf,
        "fcf_margin":      fcf_margin,
        "fcf_yield":       fcf_yield,

        # Historical revenue for sparkline
        "revenue_history":  list(zip(data.get("financials_years", []), rev)),
        "pat_history":      list(zip(data.get("financials_years", []), pat)),
        "ebitda_history":   list(zip(data.get("financials_years", []), ebitda)),
    }


def _winner(val_a: float, val_b: float, higher_is_better: bool = True) -> str:
    """Return 'a', 'b', or 'tie'."""
    if abs(val_a - val_b) < 0.001:
        return "tie"
    if higher_is_better:
        return "a" if val_a > val_b else "b"
    return "a" if val_a < val_b else "b"


@router.get("/{ticker_a}/vs/{ticker_b}")
def compare_stocks(ticker_a: str, ticker_b: str):
    """
    Side-by-side fundamental comparison of two stocks.
    Returns detailed metrics across valuation, growth, profitability, leverage,
    and cash flow — with per-metric winner annotations.
    """
    data_a = StockDataService.get_stock_overview(ticker_a.upper())
    data_b = StockDataService.get_stock_overview(ticker_b.upper())

    if not data_a:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker_a}' not found")
    if not data_b:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker_b}' not found")

    m_a = _compute_metrics(data_a)
    m_b = _compute_metrics(data_b)

    # Build comparison table with winners
    comparison = {
        "valuation": [
            {"metric": "P/E Ratio",       "a": m_a["pe_ratio"],      "b": m_b["pe_ratio"],      "winner": _winner(m_a["pe_ratio"],      m_b["pe_ratio"],      False), "description": "Lower P/E = cheaper relative to earnings"},
            {"metric": "P/B Ratio",       "a": m_a["pb_ratio"],      "b": m_b["pb_ratio"],      "winner": _winner(m_a["pb_ratio"],      m_b["pb_ratio"],      False), "description": "Lower P/B = cheaper relative to book value"},
            {"metric": "EV/EBITDA",       "a": m_a["ev_ebitda"],     "b": m_b["ev_ebitda"],     "winner": _winner(m_a["ev_ebitda"],     m_b["ev_ebitda"],     False), "description": "Lower EV/EBITDA = more attractive enterprise valuation"},
            {"metric": "Dividend Yield %","a": m_a["dividend_yield"],"b": m_b["dividend_yield"],"winner": _winner(m_a["dividend_yield"], m_b["dividend_yield"], True),  "description": "Higher yield = more income returns to shareholders"},
        ],
        "growth": [
            {"metric": "Revenue CAGR 3Y %",  "a": m_a["rev_3y_cagr"],    "b": m_b["rev_3y_cagr"],    "winner": _winner(m_a["rev_3y_cagr"],    m_b["rev_3y_cagr"],    True), "description": "3-year revenue compound annual growth rate"},
            {"metric": "Revenue CAGR 5Y %",  "a": m_a["rev_5y_cagr"],    "b": m_b["rev_5y_cagr"],    "winner": _winner(m_a["rev_5y_cagr"],    m_b["rev_5y_cagr"],    True), "description": "5-year revenue compound annual growth rate"},
            {"metric": "PAT CAGR 3Y %",      "a": m_a["pat_3y_cagr"],    "b": m_b["pat_3y_cagr"],    "winner": _winner(m_a["pat_3y_cagr"],    m_b["pat_3y_cagr"],    True), "description": "3-year net profit growth rate"},
            {"metric": "PAT CAGR 5Y %",      "a": m_a["pat_5y_cagr"],    "b": m_b["pat_5y_cagr"],    "winner": _winner(m_a["pat_5y_cagr"],    m_b["pat_5y_cagr"],    True), "description": "5-year net profit growth rate"},
            {"metric": "EBITDA CAGR 3Y %",   "a": m_a["ebitda_3y_cagr"], "b": m_b["ebitda_3y_cagr"], "winner": _winner(m_a["ebitda_3y_cagr"], m_b["ebitda_3y_cagr"], True), "description": "3-year operating profit growth rate"},
            {"metric": "EPS CAGR 3Y %",      "a": m_a["eps_3y_cagr"],    "b": m_b["eps_3y_cagr"],    "winner": _winner(m_a["eps_3y_cagr"],    m_b["eps_3y_cagr"],    True), "description": "3-year earnings per share growth rate"},
        ],
        "profitability": [
            {"metric": "EBITDA Margin %", "a": m_a["ebitda_margin"], "b": m_b["ebitda_margin"], "winner": _winner(m_a["ebitda_margin"], m_b["ebitda_margin"], True), "description": "Operating profitability margin"},
            {"metric": "PAT Margin %",    "a": m_a["pat_margin"],    "b": m_b["pat_margin"],    "winner": _winner(m_a["pat_margin"],    m_b["pat_margin"],    True), "description": "Net profit margin after taxes"},
            {"metric": "ROE %",           "a": m_a["roe"],           "b": m_b["roe"],           "winner": _winner(m_a["roe"],           m_b["roe"],           True), "description": "Return on Equity = Net Profit / Equity"},
            {"metric": "ROCE %",          "a": m_a["roce"],          "b": m_b["roce"],          "winner": _winner(m_a["roce"],          m_b["roce"],          True), "description": "Return on Capital Employed"},
        ],
        "leverage": [
            {"metric": "Debt/Equity",        "a": m_a["debt_equity"],      "b": m_b["debt_equity"],      "winner": _winner(m_a["debt_equity"],      m_b["debt_equity"],      False), "description": "Lower = more conservative balance sheet"},
            {"metric": "Net Debt/EBITDA",    "a": m_a["net_debt_ebitda"],  "b": m_b["net_debt_ebitda"],  "winner": _winner(m_a["net_debt_ebitda"],  m_b["net_debt_ebitda"],  False), "description": "Years to repay debt from operating profit"},
        ],
        "cash_flow": [
            {"metric": "FCF Margin %",    "a": m_a["fcf_margin"],    "b": m_b["fcf_margin"],    "winner": _winner(m_a["fcf_margin"],    m_b["fcf_margin"],    True), "description": "Free Cash Flow as % of Revenue"},
            {"metric": "FCF Yield %",     "a": m_a["fcf_yield"],     "b": m_b["fcf_yield"],     "winner": _winner(m_a["fcf_yield"],     m_b["fcf_yield"],     True), "description": "Free Cash Flow / Market Cap — higher = more value returned"},
        ],
    }

    # Score card: count wins
    wins_a = sum(1 for section in comparison.values() for row in section if row["winner"] == "a")
    wins_b = sum(1 for section in comparison.values() for row in section if row["winner"] == "b")
    total  = sum(len(section) for section in comparison.values())

    overall_winner = "tie"
    if wins_a > wins_b:
        overall_winner = m_a["ticker"]
    elif wins_b > wins_a:
        overall_winner = m_b["ticker"]

    return {
        "stock_a": m_a,
        "stock_b": m_b,
        "comparison": comparison,
        "scorecard": {
            "wins_a": wins_a,
            "wins_b": wins_b,
            "ties": total - wins_a - wins_b,
            "total_metrics": total,
            "overall_winner": overall_winner,
        },
    }
