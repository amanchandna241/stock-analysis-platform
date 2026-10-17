"""
FastAPI Endpoints for Multi-Agent Investment Committee
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.multi_agent.committee_engine import committee_engine
from app.services.multi_agent.models import CommitteeDeliberationResult

router = APIRouter(prefix="/agents", tags=["Multi-Agent Committee"])


class CommitteeDeliberationRequest(BaseModel):
    ticker: str
    query: Optional[str] = None


@router.post("/committee/deliberate", response_model=CommitteeDeliberationResult)
async def deliberate_ticker(payload: CommitteeDeliberationRequest):
    """
    Executes an autonomous multi-agent investment committee deliberation
    involving the CIO, Fundamental Analyst, Quant Forecaster, Forensic Auditor,
    and Devil's Advocate.
    """
    if not payload.ticker or len(payload.ticker.strip()) < 2:
        raise HTTPException(status_code=400, detail="A valid stock ticker is required.")

    try:
        result = await committee_engine.deliberate(
            target_input=payload.ticker.strip(),
            custom_query=payload.query
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Committee deliberation failed: {str(e)}")


@router.get("/personas")
def get_committee_personas():
    """
    Returns the roster of autonomous agents participating in the Investment Committee.
    """
    return {
        "committee_name": "Alphiq Institutional AI Investment Committee",
        "quorum_size": 5,
        "agents": [
            {
                "role": "CIO",
                "name": "Victoria Vance",
                "title": "Chief Investment Officer",
                "avatar_color": "#3B82F6",
                "mandate": "Orchestrates research questions, balances bull vs bear conflicts, and sets portfolio allocation weights.",
                "tools_used": ["alphiq_stock_overview"]
            },
            {
                "role": "FUNDAMENTALIST",
                "name": "Devan Nair, CFA",
                "title": "Lead Fundamental Analyst",
                "avatar_color": "#10B981",
                "mandate": "Calculates DCF intrinsic values, analyzes 10-year cash flows, balance sheets, and pricing moats.",
                "tools_used": ["alphiq_financial_statements", "alphiq_dcf_valuation"]
            },
            {
                "role": "QUANT_ML",
                "name": "Dr. Elena Rostova",
                "title": "Head of Quantitative Alpha",
                "avatar_color": "#8B5CF6",
                "mandate": "Projects 30/90/180-day ensemble ML price cones, volatility regime shifts, and 95% confidence bands.",
                "tools_used": ["alphiq_ml_forecast"]
            },
            {
                "role": "FORENSIC_AUDITOR",
                "name": "Marcus Sterling, CPA",
                "title": "Forensic & Governance Officer",
                "avatar_color": "#F59E0B",
                "mandate": "Audits promoter encumbrance, pledged shareholding, auditor qualifications, and corporate actions.",
                "tools_used": ["alphiq_governance_audit"]
            },
            {
                "role": "DEVILS_ADVOCATE",
                "name": "Kavita Sen",
                "title": "Devil's Advocate & Risk Officer",
                "avatar_color": "#EF4444",
                "mandate": "Stress-tests bull theses, challenges high valuations, and quantifies worst-case downside drawdowns.",
                "tools_used": ["alphiq_peer_comparison", "alphiq_news_sentiment"]
            }
        ]
    }


@router.get("/sample-tickers")
def get_sample_tickers():
    """
    Provides sample tickers for quick interactive committee deliberations.
    """
    return [
        {"ticker": "TATAMOTORS", "name": "Tata Motors Passenger Vehicles", "sector": "Automotive / EV / Chips"},
        {"ticker": "RELIANCE", "name": "Reliance Industries Limited", "sector": "Conglomerate / Energy / Retail"},
        {"ticker": "TCS", "name": "Tata Consultancy Services", "sector": "Information Technology / Silicon Design"},
        {"ticker": "INFY", "name": "Infosys Limited", "sector": "Information Technology / Topaz AI"},
        {"ticker": "HDFCBANK", "name": "HDFC Bank Limited", "sector": "Banking & Financial Services"},
        {"ticker": "NVDA", "name": "NVIDIA Corporation", "sector": "AI Accelerators / Semiconductors"}
    ]
