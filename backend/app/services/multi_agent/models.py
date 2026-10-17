"""
Pydantic Models and Schemas for Alphiq Multi-Agent Investment Committee
"""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AgentRole(str, Enum):
    CIO = "CIO"
    FUNDAMENTALIST = "FUNDAMENTALIST"
    QUANT_ML = "QUANT_ML"
    FORENSIC_AUDITOR = "FORENSIC_AUDITOR"
    DEVILS_ADVOCATE = "DEVILS_ADVOCATE"


class ToolCallRecord(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    output_summary: str
    duration_ms: int = 0


class AgentThoughtStep(BaseModel):
    step_id: int
    role: AgentRole
    agent_name: str
    avatar_color: str
    phase_title: str
    thought_process: str
    tool_calls: List[ToolCallRecord] = Field(default_factory=list)
    intermediate_conclusion: str


class AgentOpinion(BaseModel):
    role: AgentRole
    agent_name: str
    stance: str  # "Bullish", "Bearish", "Neutral", "Cautious"
    conviction_score: float = Field(ge=1.0, le=10.0)
    summary: str
    key_arguments: List[str]
    critical_risks: List[str]
    fair_value_estimate: Optional[float] = None


class AdversarialClash(BaseModel):
    bull_thesis: str
    bear_thesis: str
    conflict_resolution: str
    key_pivot_factor: str


class FinalCommitteeConsensus(BaseModel):
    recommendation: str  # "Strong Buy", "Accumulate / Buy on Dips", "Hold / Neutral", "Reduce / Sell"
    overall_conviction: float  # e.g., 8.4 / 10
    target_price: float
    current_price: float
    expected_return_pct: float
    horizon: str
    suggested_allocation_pct: str
    executive_summary: str
    key_catalysts: List[str]
    key_tail_risks: List[str]


class CommitteeDeliberationResult(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    currency: str
    query: str
    deliberation_steps: List[AgentThoughtStep]
    agent_opinions: Dict[str, AgentOpinion]
    adversarial_clash: AdversarialClash
    consensus: FinalCommitteeConsensus
    statutory_disclaimer: str
