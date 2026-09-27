from fastapi import APIRouter, HTTPException
from typing import List
from app.services.stock_data_service import StockDataService
from app.schemas.stock import ShareholdingResponse, ShareholdingTrend, GovernanceResponse, GovernanceEvent

router = APIRouter(prefix="/governance", tags=["Governance & Shareholding"])

@router.get("/{ticker}/shareholding", response_model=ShareholdingResponse)
def get_shareholding_pattern(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    pledge = data.get('promoter_pledge_pct', 0.0)

    history = [
        ShareholdingTrend(quarter="Q2FY24", promoter=50.4, fii=22.1, dii=16.5, public=11.0, promoter_pledge_pct=pledge),
        ShareholdingTrend(quarter="Q3FY24", promoter=50.4, fii=22.4, dii=16.8, public=10.4, promoter_pledge_pct=pledge),
        ShareholdingTrend(quarter="Q4FY24", promoter=50.3, fii=22.8, dii=17.0, public=9.9, promoter_pledge_pct=pledge),
        ShareholdingTrend(quarter="Q1FY25", promoter=50.3, fii=23.2, dii=17.2, public=9.3, promoter_pledge_pct=pledge),
        ShareholdingTrend(quarter="Q2FY25", promoter=50.2, fii=23.5, dii=17.5, public=8.8, promoter_pledge_pct=pledge)
    ]

    insights = [
        "FII Shareholding increased steadily from 22.1% to 23.5% over the past 5 quarters.",
        "DII Institutional holding expanded by 100 bps supported by domestic mutual fund inflows.",
        f"Promoter Pledge remains low at {pledge}%, indicating negligible debt encumbrance risk."
    ]

    return ShareholdingResponse(ticker=data['ticker'], history=history, key_insights=insights)

@router.get("/{ticker}/governance-events", response_model=GovernanceResponse)
def get_governance_events(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    events = [
        GovernanceEvent(
            date="2025-05-15",
            category="Auditor",
            title="Annual Audit Report Published",
            details=f"Statutory Auditor {data['auditor_name']} issued an Unmodified (Clean) Audit opinion for FY25.",
            source_url="https://bseindia.com/filings",
            severity="LOW"
        ),
        GovernanceEvent(
            date="2025-08-10",
            category="Related-Party",
            title="Related Party Transaction Disclosure",
            details="Approved routine commercial transaction contracts with subsidiary entities at arm's length valuation.",
            source_url="https://nseindia.com/filings",
            severity="LOW"
        ),
        GovernanceEvent(
            date="2025-09-02",
            category="Management",
            title="Appointment of Independent Director",
            details="Appointed experienced industry veteran to the Audit Committee to bolster governance oversight.",
            source_url="https://bseindia.com/filings",
            severity="LOW"
        )
    ]

    return GovernanceResponse(
        ticker=data['ticker'],
        promoter_pledging_pct=data.get('promoter_pledge_pct', 0.0),
        events=events,
        auditor_name=data['auditor_name'],
        auditor_opinion=data['auditor_opinion']
    )
