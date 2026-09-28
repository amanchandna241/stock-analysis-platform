from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.mutual_fund_service import MutualFundService
from app.schemas.mutual_fund import (
    MutualFundExploreResponse, MutualFundDetail, MutualFundOverview
)

router = APIRouter(prefix="/mutual-funds", tags=["Mutual Funds"])

@router.get("/explore", response_model=MutualFundExploreResponse)
def explore_mutual_funds():
    """
    Returns mutual fund universe, top 5-star recommendations, and category CAGR averages.
    """
    return MutualFundService.get_explore_data()

@router.get("/search", response_model=List[MutualFundOverview])
def search_mutual_funds(q: str = Query(..., min_length=1)):
    """
    Searches Indian mutual funds by scheme name, AMFI scheme code, sub-category, or AMC.
    """
    return MutualFundService.search_schemes(q)

@router.get("/{scheme_code}", response_model=MutualFundDetail)
def get_mutual_fund_detail(scheme_code: int):
    """
    Returns full scheme analytics, historical NAV performance chart series, holdings, and AI recommendations.
    """
    detail = MutualFundService.get_scheme_detail(scheme_code)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Mutual Fund scheme code {scheme_code} not found")
    return detail
