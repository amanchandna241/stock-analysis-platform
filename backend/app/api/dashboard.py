from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.stock_data_service import StockDataService
from app.schemas.stock import DashboardResponse, MarketIndex, WatchlistItem, NewsArticle

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard():
    indices = [
        MarketIndex(name="NIFTY 50", value=25380.40, change=142.50, change_pct=0.56),
        MarketIndex(name="SENSEX", value=82950.15, change=410.20, change_pct=0.50),
        MarketIndex(name="NIFTY BANK", value=53120.80, change=320.10, change_pct=0.61),
        MarketIndex(name="NIFTY IT", value=42150.30, change=-180.40, change_pct=-0.43)
    ]

    gainers = [
        WatchlistItem(ticker="ICICIBANK", name="ICICI Bank", price=1240.20, change_pct=1.27, pe_ratio=18.2, market_cap_cr=872500.0),
        WatchlistItem(ticker="BHARTIARTL", name="Bharti Airtel", price=1565.00, change_pct=1.18, pe_ratio=45.0, market_cap_cr=925000.0),
        WatchlistItem(ticker="RELIANCE", name="Reliance Industries", price=2985.40, change_pct=0.83, pe_ratio=28.4, market_cap_cr=2019840.0)
    ]

    losers = [
        WatchlistItem(ticker="TCS", name="Tata Consultancy Services", price=4280.15, change_pct=-0.43, pe_ratio=32.1, market_cap_cr=1548200.0),
        WatchlistItem(ticker="LT", name="Larsen & Toubro", price=3620.00, change_pct=-0.35, pe_ratio=31.2, market_cap_cr=510000.0)
    ]

    high_52w = [
        WatchlistItem(ticker="ICICIBANK", name="ICICI Bank", price=1240.20, change_pct=1.27, pe_ratio=18.2, market_cap_cr=872500.0),
        WatchlistItem(ticker="BHARTIARTL", name="Bharti Airtel", price=1565.00, change_pct=1.18, pe_ratio=45.0, market_cap_cr=925000.0)
    ]

    low_52w = []

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
            published_at="2026-09-27 10:15 IST",
            category="M&A",
            summary="Reliance Retail launches immediate fulfillment centers across top 20 metro cities to expand retail digital delivery footprints.",
            url="https://economictimes.indiatimes.com"
        ),
        NewsArticle(
            id="NEWS2",
            ticker="TCS",
            headline="TCS Signs Multi-Year $800M Digital Transformation Contract with European Bank",
            source="Business Standard",
            published_at="2026-09-27 09:30 IST",
            category="Product",
            summary="Tata Consultancy Services secures a major mega-deal to modernize core banking IT infrastructure using TCS BaNCS software.",
            url="https://business-standard.com"
        )
    ]

    watchlist = [
        WatchlistItem(ticker="RELIANCE", name="Reliance Industries", price=2985.40, change_pct=0.83, pe_ratio=28.4, market_cap_cr=2019840.0),
        WatchlistItem(ticker="TCS", name="Tata Consultancy Services", price=4280.15, change_pct=-0.43, pe_ratio=32.1, market_cap_cr=1548200.0),
        WatchlistItem(ticker="INFY", name="Infosys", price=1945.80, change_pct=0.64, pe_ratio=29.8, market_cap_cr=807400.0),
        WatchlistItem(ticker="HDFCBANK", name="HDFC Bank", price=1680.50, change_pct=0.50, pe_ratio=18.9, market_cap_cr=1280000.0)
    ]

    alerts = [
        {"id": "ALT1", "ticker": "RELIANCE", "condition": "P/E crossed below 5Y Median (24.0x)", "type": "Valuation Opportunity", "status": "Active"},
        {"id": "ALT2", "ticker": "BHARTIARTL", "condition": "Stock hit 52-Week High territory (Rs 1,600)", "type": "Breakout", "status": "Active"}
    ]

    return DashboardResponse(
        indices=indices,
        top_gainers=gainers,
        top_losers=losers,
        high_52w=high_52w,
        low_52w=low_52w,
        recent_earnings=recent_earnings,
        corporate_actions=corporate_actions,
        recent_news=recent_news,
        watchlist=watchlist,
        alerts=alerts
    )
