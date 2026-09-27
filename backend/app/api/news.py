from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.stock import NewsArticle

router = APIRouter(prefix="/news", tags=["News Intelligence"])

NEWS_DATABASE = [
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
    ),
    NewsArticle(
        id="NEWS3",
        ticker="INFY",
        headline="Infosys Collaborates with Global Cloud Provider to Scale Enterprise AI Topaz Platform",
        source="Financial Express",
        published_at="2026-09-26 16:45 IST",
        category="Product",
        summary="Infosys expands strategic partnership to co-develop customized AI foundation models for financial services and healthcare clients.",
        url="https://financialexpress.com"
    ),
    NewsArticle(
        id="NEWS4",
        ticker="HDFCBANK",
        headline="RBI Approves HDFC Bank's Strategic Stake Acquisition in Insurance Unit",
        source="LiveMint",
        published_at="2026-09-26 14:20 IST",
        category="Regulatory",
        summary="The Reserve Bank of India grants regulatory approval for HDFC Bank to increase equity holding in its life insurance subsidiary.",
        url="https://livemint.com"
    ),
    NewsArticle(
        id="NEWS5",
        ticker="BHARTIARTL",
        headline="Bharti Airtel Prepaid ARPU Rises to Rs 211 Driven by 5G Data Upgrades",
        source="ET Telecom",
        published_at="2026-09-25 11:00 IST",
        category="Earnings",
        summary="Airtel records acceleration in high-value 5G subscriber conversions across urban telecom circles.",
        url="https://telecom.economictimes.indiatimes.com"
    )
]

@router.get("", response_model=List[NewsArticle])
def get_news_feed(ticker: Optional[str] = Query(None), category: Optional[str] = Query(None)):
    articles = NEWS_DATABASE
    if ticker:
        articles = [a for a in articles if a.ticker.upper() == ticker.upper()]
    if category:
        articles = [a for a in articles if a.category.lower() == category.lower()]
    return articles
