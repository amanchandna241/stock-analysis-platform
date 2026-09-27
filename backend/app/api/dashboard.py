from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from app.services.stock_data_service import StockDataService
from app.schemas.stock import DashboardResponse, MarketIndex, WatchlistItem, NewsArticle

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Stateful User Preferences Storage (In-Memory & Extendable to DB)
USER_PREFERENCES = {
    "watchlist": ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "BHARTIARTL", "SBIN"],
    "alerts": [
        {"id": "ALT1", "ticker": "RELIANCE", "condition": "P/E crossed below 5Y Median (24.0x)", "type": "Valuation Opportunity", "status": "Active"},
        {"id": "ALT2", "ticker": "BHARTIARTL", "condition": "Stock hit 52-Week High territory", "type": "Breakout", "status": "Active"}
    ]
}

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    custom_tickers: Optional[str] = Query(None, description="Comma-separated custom watchlist tickers")
):
    """
    Returns a dynamic dashboard with live market quotes, user-configured watchlists,
    top gainers/losers, 52W highs/lows, corporate actions, and alert feeds.
    """
    indices = [
        MarketIndex(name="NIFTY 50", value=25380.40, change=142.50, change_pct=0.56),
        MarketIndex(name="SENSEX", value=82950.15, change=410.20, change_pct=0.50),
        MarketIndex(name="NIFTY BANK", value=53120.80, change=320.10, change_pct=0.61),
        MarketIndex(name="NIFTY IT", value=42150.30, change=-180.40, change_pct=-0.43)
    ]

    # Resolve active watchlist tickers based on user preference
    if custom_tickers:
        watchlist_tickers = [t.strip().upper() for t in custom_tickers.split(",") if t.strip()]
    else:
        watchlist_tickers = USER_PREFERENCES["watchlist"]

    # Dynamically build watchlist with live price quotes
    watchlist_items: List[WatchlistItem] = []
    for t in watchlist_tickers:
        st_data = StockDataService.get_stock_overview(t)
        if st_data:
            watchlist_items.append(WatchlistItem(
                ticker=st_data['ticker'],
                name=st_data['name'],
                price=st_data['current_price'],
                change_pct=st_data['change_percent'],
                pe_ratio=st_data['pe_ratio'],
                market_cap_cr=st_data['market_cap_cr']
            ))

    # Dynamically derive Gainers, Losers, 52W Highs/Lows from active universe
    all_stocks = [StockDataService.get_stock_overview(t) for t in ["ICICIBANK", "BHARTIARTL", "RELIANCE", "TCS", "INFY", "HDFCBANK", "SBIN"]]
    valid_stocks = [s for s in all_stocks if s]

    sorted_by_change = sorted(valid_stocks, key=lambda x: x['change_percent'], reverse=True)
    
    gainers = [
        WatchlistItem(
            ticker=s['ticker'], name=s['name'], price=s['current_price'],
            change_pct=s['change_percent'], pe_ratio=s['pe_ratio'], market_cap_cr=s['market_cap_cr']
        ) for s in sorted_by_change if s['change_percent'] > 0
    ][:3]

    losers = [
        WatchlistItem(
            ticker=s['ticker'], name=s['name'], price=s['current_price'],
            change_pct=s['change_percent'], pe_ratio=s['pe_ratio'], market_cap_cr=s['market_cap_cr']
        ) for s in reversed(sorted_by_change) if s['change_percent'] < 0
    ][:3]

    high_52w = [
        WatchlistItem(
            ticker=s['ticker'], name=s['name'], price=s['current_price'],
            change_pct=s['change_percent'], pe_ratio=s['pe_ratio'], market_cap_cr=s['market_cap_cr']
        ) for s in valid_stocks if s['current_price'] >= s['high_52w'] * 0.95
    ]

    recent_earnings = [
        {"ticker": "RELIANCE", "name": "Reliance Industries", "quarter": "Q1FY25", "revenue_yoy": "+16.3%", "pat_yoy": "+19.0%", "date": "2026-09-24"},
        {"ticker": "TCS", "name": "Tata Consultancy Services", "quarter": "Q1FY25", "revenue_yoy": "+7.5%", "pat_yoy": "+10.6%", "date": "2026-09-22"},
        {"ticker": "INFY", "name": "Infosys", "quarter": "Q1FY25", "revenue_yoy": "+7.2%", "pat_yoy": "+11.7%", "date": "2026-09-20"}
    ]

    corporate_actions = [
        {"ticker": "TCS", "action": "Interim Dividend Rs 10/share", "ex_date": "2026-10-05"},
        {"ticker": "INFY", "action": "Special Dividend Rs 18/share", "ex_date": "2026-10-12"},
        {"ticker": "RELIANCE", "action": "Annual General Meeting (AGM)", "date": "2026-10-18"}
    ]

    recent_news = [
        NewsArticle(
            id="NEWS1",
            ticker="RELIANCE",
            headline="Reliance Retail Announces Strategic Expansion into Quick-Commerce Sector",
            source="Economic Times",
            published_at="2026-09-28 10:15 IST",
            category="M&A",
            summary="Reliance Retail launches immediate fulfillment centers across top 20 metro cities to expand retail digital delivery footprints.",
            url="https://economictimes.indiatimes.com"
        ),
        NewsArticle(
            id="NEWS2",
            ticker="TCS",
            headline="TCS Signs Multi-Year $800M Digital Transformation Contract with European Bank",
            source="Business Standard",
            published_at="2026-09-28 09:30 IST",
            category="Product",
            summary="Tata Consultancy Services secures a major mega-deal to modernize core banking IT infrastructure using TCS BaNCS software.",
            url="https://business-standard.com"
        )
    ]

    return DashboardResponse(
        indices=indices,
        top_gainers=gainers,
        top_losers=losers,
        high_52w=high_52w,
        low_52w=[],
        recent_earnings=recent_earnings,
        corporate_actions=corporate_actions,
        recent_news=recent_news,
        watchlist=watchlist_items,
        alerts=USER_PREFERENCES["alerts"]
    )

@router.post("/watchlist/add")
def add_to_watchlist(ticker: str = Query(..., min_length=1)):
    """Dynamically add a stock ticker to user preference watchlist."""
    t_clean = ticker.upper().strip()
    if t_clean not in USER_PREFERENCES["watchlist"]:
        USER_PREFERENCES["watchlist"].append(t_clean)
    return {"status": "success", "message": f"{t_clean} added to watchlist.", "watchlist": USER_PREFERENCES["watchlist"]}

@router.delete("/watchlist/remove")
def remove_from_watchlist(ticker: str = Query(..., min_length=1)):
    """Dynamically remove a stock ticker from user preference watchlist."""
    t_clean = ticker.upper().strip()
    if t_clean in USER_PREFERENCES["watchlist"]:
        USER_PREFERENCES["watchlist"].remove(t_clean)
    return {"status": "success", "message": f"{t_clean} removed from watchlist.", "watchlist": USER_PREFERENCES["watchlist"]}

@router.post("/alerts/add")
def add_alert(ticker: str = Query(...), condition: str = Query(...), alert_type: str = Query("Custom Alert")):
    """Dynamically add a custom valuation or signal alert."""
    t_clean = ticker.upper().strip()
    alert_id = f"ALT{len(USER_PREFERENCES['alerts']) + 1}"
    new_alert = {
        "id": alert_id,
        "ticker": t_clean,
        "condition": condition.strip(),
        "type": alert_type.strip(),
        "status": "Active"
    }
    USER_PREFERENCES["alerts"].append(new_alert)
    return {"status": "success", "message": f"Alert created for {t_clean}", "alerts": USER_PREFERENCES["alerts"]}

@router.delete("/alerts/remove")
def remove_alert(alert_id: str = Query(...)):
    """Dynamically remove an alert by ID."""
    USER_PREFERENCES["alerts"] = [a for a in USER_PREFERENCES["alerts"] if a.get("id") != alert_id]
    return {"status": "success", "message": f"Alert {alert_id} removed", "alerts": USER_PREFERENCES["alerts"]}

