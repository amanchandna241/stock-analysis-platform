from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List
from app.services.advisor_service import advisor_service

router = APIRouter(prefix="/advisor", tags=["LLM Investment Advisor"])

class AdvisorQueryRequest(BaseModel):
    query: str = Field(..., example="need recommendation in EV space in india for long term")

@router.post("/recommend")
def get_ai_advisor_recommendation(request: AdvisorQueryRequest) -> Dict[str, Any]:
    """
    Accepts natural language research queries (e.g. 'EV space in India for long term')
    and generates grounded multi-stock thematic investment recommendations with allocation weights.
    """
    if not request.query or len(request.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query prompt must be at least 3 characters long.")
    
    try:
        return advisor_service.generate_recommendation(request.query.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate advisor recommendation: {str(e)}")

@router.get("/suggested-prompts")
def get_suggested_prompts() -> List[str]:
    """
    Returns quick-select suggested natural language investment prompts.
    """
    return advisor_service.SUGGESTED_PROMPTS
