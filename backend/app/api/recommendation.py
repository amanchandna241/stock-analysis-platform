from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

# ─── Stock Universe with enriched metadata ──────────────────────────────────
STOCK_UNIVERSE = [
    {"ticker": "RELIANCE",   "name": "Reliance Industries",     "sector": "Energy",              "industry": "Oil & Gas / Retail / Telecom",    "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "TCS",        "name": "Tata Consultancy Services","sector": "Technology",          "industry": "IT Services & Consulting",        "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "INFY",       "name": "Infosys Limited",          "sector": "Technology",          "industry": "IT Services & Consulting",        "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "HDFCBANK",   "name": "HDFC Bank",                "sector": "Financial Services",  "industry": "Private Sector Banking",          "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "ICICIBANK",  "name": "ICICI Bank",               "sector": "Financial Services",  "industry": "Private Sector Banking",          "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "BHARTIARTL", "name": "Bharti Airtel",            "sector": "Telecom",             "industry": "Telecom Services & Tower Infra",  "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "SBIN",       "name": "State Bank of India",      "sector": "Financial Services",  "industry": "Public Sector Banking",           "cap_type": "large",  "exchange": "NSE"},
    {"ticker": "AAPL",       "name": "Apple Inc.",               "sector": "Technology",          "industry": "Consumer Electronics",            "cap_type": "large",  "exchange": "NASDAQ"},
    {"ticker": "MSFT",       "name": "Microsoft Corporation",    "sector": "Technology",          "industry": "Software - Infrastructure & Cloud","cap_type": "large",  "exchange": "NASDAQ"},
    {"ticker": "NVDA",       "name": "NVIDIA Corporation",       "sector": "Technology",          "industry": "Semiconductors & AI Hardware",    "cap_type": "large",  "exchange": "NASDAQ"},
    {"ticker": "GS",         "name": "Goldman Sachs",            "sector": "Financial Services",  "industry": "Capital Markets & Investment Bank","cap_type": "large",  "exchange": "NYSE"},
    {"ticker": "JPM",        "name": "JPMorgan Chase",           "sector": "Financial Services",  "industry": "Diversified Banking",             "cap_type": "large",  "exchange": "NYSE"},
    {"ticker": "MS",         "name": "Morgan Stanley",           "sector": "Financial Services",  "industry": "Investment Banking & Brokerage",  "cap_type": "large",  "exchange": "NYSE"},
]

CAP_THRESHOLDS = {
    "small":  (0,       50_000),       # < 50K Cr (~$6B)
    "mid":    (50_000,  300_000),      # 50K - 300K Cr
    "large":  (300_000, 99_999_999),   # > 300K Cr
}

SECTOR_ALIASES = {
    "it": "Technology",
    "tech": "Technology",
    "technology": "Technology",
    "banking": "Financial Services",
    "finance": "Financial Services",
    "financial": "Financial Services",
    "financial services": "Financial Services",
    "energy": "Energy",
    "oil": "Energy",
    "oil & gas": "Energy",
    "telecom": "Telecom",
    "telecommunications": "Telecom",
}

HORIZON_WEIGHTS = {
    "short":  {"momentum": 0.40, "growth": 0.20, "quality": 0.20, "value": 0.20},
    "medium": {"momentum": 0.20, "growth": 0.30, "quality": 0.30, "value": 0.20},
    "long":   {"momentum": 0.10, "growth": 0.30, "quality": 0.35, "value": 0.25},
}


def _score_stock(data: dict, weights: dict) -> dict:
    """Score a stock across 4 dimensions and compute composite score."""
    rev  = data.get("revenue", [1] * 10)
    pat  = data.get("pat", [1] * 10)
    ebitda = data.get("ebitda", [1] * 10)
    cfo  = data.get("cfo", [1] * 10)
    capex = data.get("capex", [1] * 10)
    equity = data.get("equity", [1] * 10)
    debt = data.get("debt", [1] * 10)

    # Growth score (0–100)
    rev_3y  = FinancialEngine.calculate_cagr(rev[-4], rev[-1], 3)
    pat_3y  = FinancialEngine.calculate_cagr(pat[-4], pat[-1], 3)
    growth_score = min(100.0, max(0.0, (rev_3y + pat_3y) * 2.5))

    # Quality score (0–100)
    roe  = (pat[-1] / max(1.0, equity[-1])) * 100
    ebitda_margin = (ebitda[-1] / max(1.0, rev[-1])) * 100
    fcf  = cfo[-1] - capex[-1]
    fcf_margin = (fcf / max(1.0, rev[-1])) * 100
    quality_score = min(100.0, max(0.0, (roe * 0.4) + (ebitda_margin * 0.4) + (fcf_margin * 1.0)))

    # Value score (0–100, lower PE/PB = higher score)
    pe = data.get("pe_ratio", 30)
    pb = data.get("pb_ratio", 3)
    ev_eb = data.get("ev_ebitda", 15)
    value_score = min(100.0, max(0.0, 100 - (pe * 0.8) - (pb * 2) - (ev_eb * 0.5)))

    # Momentum score – uses 52w hi/lo position
    curr   = data.get("current_price", 100)
    hi_52w = data.get("high_52w", curr * 1.2)
    lo_52w = data.get("low_52w", curr * 0.8)
    rng = hi_52w - lo_52w
    pct_from_low = ((curr - lo_52w) / max(1.0, rng)) * 100 if rng > 0 else 50
    momentum_score = min(100.0, max(0.0, pct_from_low))

    composite = (
        weights["growth"]   * growth_score +
        weights["quality"]  * quality_score +
        weights["value"]    * value_score +
        weights["momentum"] * momentum_score
    )

    return {
        "composite": round(composite, 2),
        "growth_score": round(growth_score, 2),
        "quality_score": round(quality_score, 2),
        "value_score": round(value_score, 2),
        "momentum_score": round(momentum_score, 2),
        "rev_3y_cagr": round(rev_3y, 2),
        "pat_3y_cagr": round(pat_3y, 2),
        "roe": round(roe, 2),
        "ebitda_margin": round(ebitda_margin, 2),
        "pe_ratio": pe,
        "pb_ratio": pb,
        "div_yield": data.get("dividend_yield", 0),
    }


@router.get("")
def get_recommendations(
    cap_type: Optional[str]   = Query(None, description="small | mid | large"),
    sector:   Optional[str]   = Query(None, description="Technology, Financial Services, Energy, Telecom"),
    horizon:  Optional[str]   = Query("medium", description="short (< 1yr) | medium (1-3yr) | long (3+ yr)"),
    exchange: Optional[str]   = Query(None, description="NSE | NASDAQ | NYSE"),
    min_roe:  Optional[float] = Query(None, description="Minimum ROE % filter"),
    max_pe:   Optional[float] = Query(None, description="Maximum P/E ratio filter"),
    top_n:    int             = Query(5, ge=1, le=10, description="Number of top recommendations"),
):
    """
    Recommend top N stocks based on investment preferences.
    Scores each stock across growth, quality, value, and momentum dimensions
    with horizon-tuned weighting.
    """
    horizon_key = (horizon or "medium").lower()
    if horizon_key not in HORIZON_WEIGHTS:
        horizon_key = "medium"
    weights = HORIZON_WEIGHTS[horizon_key]

    # Normalise sector input
    sector_filter = None
    if sector:
        sector_filter = SECTOR_ALIASES.get(sector.lower(), sector)

    cap_filter = cap_type.lower() if cap_type else None

    scored = []
    for meta in STOCK_UNIVERSE:
        # exchange filter
        if exchange and meta["exchange"].upper() != exchange.upper():
            continue

        # sector filter
        if sector_filter and sector_filter.lower() not in meta["sector"].lower():
            continue

        data = StockDataService.get_stock_overview(meta["ticker"])
        if not data:
            continue

        mkt_cap = data.get("market_cap_cr", 0)

        # cap_type filter from live/seeded data
        if cap_filter:
            lo, hi = CAP_THRESHOLDS.get(cap_filter, (0, 99_999_999))
            if not (lo <= mkt_cap < hi):
                # also check universe metadata tag as fallback
                if meta.get("cap_type") != cap_filter:
                    continue

        scores = _score_stock(data, weights)

        # Hard filters
        if min_roe is not None and scores["roe"] < min_roe:
            continue
        if max_pe is not None and scores["pe_ratio"] > max_pe:
            continue

        scored.append({
            "rank": 0,
            "ticker": data["ticker"],
            "name": data["name"],
            "sector": data["sector"],
            "industry": data.get("industry", ""),
            "exchange": data.get("exchange", "NSE"),
            "market_cap_cr": mkt_cap,
            "current_price": data.get("current_price"),
            "currency": data.get("currency", "INR"),
            "change_percent": data.get("change_percent", 0),
            "pe_ratio": data.get("pe_ratio"),
            "pb_ratio": data.get("pb_ratio"),
            "div_yield": data.get("dividend_yield"),
            "high_52w": data.get("high_52w"),
            "low_52w": data.get("low_52w"),
            "scores": scores,
            "rationale": _build_rationale(data, scores, horizon_key),
        })

    scored.sort(key=lambda x: x["scores"]["composite"], reverse=True)

    for i, s in enumerate(scored[:top_n]):
        s["rank"] = i + 1

    return {
        "filters": {
            "cap_type": cap_type,
            "sector": sector_filter,
            "horizon": horizon_key,
            "exchange": exchange,
            "min_roe": min_roe,
            "max_pe": max_pe,
        },
        "horizon_weights": weights,
        "total_screened": len(STOCK_UNIVERSE),
        "matches_found": len(scored),
        "recommendations": scored[:top_n],
    }


def _build_rationale(data: dict, scores: dict, horizon: str) -> List[str]:
    points = []
    if scores["rev_3y_cagr"] >= 15:
        points.append(f"Strong revenue CAGR of {scores['rev_3y_cagr']:.1f}% over 3 years.")
    if scores["pat_3y_cagr"] >= 15:
        points.append(f"Robust PAT growth at {scores['pat_3y_cagr']:.1f}% CAGR.")
    if scores["roe"] >= 18:
        points.append(f"High ROE of {scores['roe']:.1f}% indicates efficient capital usage.")
    if scores["ebitda_margin"] >= 20:
        points.append(f"Wide EBITDA margin of {scores['ebitda_margin']:.1f}% reflects pricing power.")
    if scores["value_score"] >= 55:
        points.append(f"Attractively priced at P/E {scores['pe_ratio']:.1f}x relative to growth.")
    if scores["momentum_score"] >= 60:
        points.append("Price momentum near 52-week highs signals market confidence.")
    if horizon == "long":
        points.append("Well-positioned for a long-horizon compounder thesis.")
    if horizon == "short":
        points.append("Near-term momentum and trading range make this suitable for short-horizon.")
    if not points:
        points.append("Balanced risk-return profile across growth, quality, and valuation metrics.")
    return points[:4]
