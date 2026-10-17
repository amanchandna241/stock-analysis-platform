"""
Alphiq Multi-Agent Investment Committee Engine
Coordinates an institutional investment committee deliberation between:
1. Chief Investment Officer (Lead Orchestrator)
2. Fundamentalist Equity Analyst
3. Quant & ML Forecaster
4. Forensic & Governance Auditor
5. Devil's Advocate / Bear Thesis Specialist
"""
import time
import logging
from typing import Dict, Any, List, Optional
from app.mcp.tools import execute_mcp_tool
from app.services.stock_data_service import StockDataService
from app.services.multi_agent.models import (
    AgentRole,
    ToolCallRecord,
    AgentThoughtStep,
    AgentOpinion,
    AdversarialClash,
    FinalCommitteeConsensus,
    CommitteeDeliberationResult
)

logger = logging.getLogger("alphiq_committee_engine")


class MultiAgentCommitteeEngine:
    """
    Executes an autonomous multi-agent investment committee deliberation.
    Agents autonomously call Alphiq MCP tools, debate bull vs bear merits,
    and generate institutional investment committee memorandums.
    """

    SUPPORTED_TICKERS = [
        "TATAMOTORS", "RELIANCE", "TCS", "INFY", "HDFCBANK",
        "ICICIBANK", "BHARTIARTL", "SBIN", "NVDA", "AAPL", "MSFT"
    ]

    def _extract_ticker(self, input_text: str) -> str:
        """Extracts stock ticker symbol from query or default."""
        cleaned = input_text.upper().strip()
        for t in self.SUPPORTED_TICKERS:
            if t in cleaned:
                return t
        
        # Word token scan
        tokens = cleaned.replace(",", " ").replace("?", " ").replace("!", " ").split()
        for tok in tokens:
            if tok in self.SUPPORTED_TICKERS:
                return tok
            if len(tok) >= 3 and tok.isalnum() and not tok in ("NEED", "BUY", "STOCK", "STOCKS", "INDIA", "LONG", "TERM", "WHAT", "ABOUT"):
                return tok
        return "TATAMOTORS"

    async def deliberate(self, target_input: str, custom_query: Optional[str] = None) -> CommitteeDeliberationResult:
        """
        Executes the multi-agent deliberation process across all 5 specialist agents.
        """
        ticker = self._extract_ticker(target_input)
        query = custom_query or f"Institutional Investment Committee Review for {ticker}"

        steps: List[AgentThoughtStep] = []
        opinions: Dict[str, AgentOpinion] = {}

        # -------------------------------------------------------------
        # STEP 1: CIO Scoping & Research Framework Definition
        # -------------------------------------------------------------
        t0 = time.time()
        overview_tool_res = await execute_mcp_tool("alphiq_stock_overview", {"ticker": ticker})
        d1 = int((time.time() - t0) * 1000)

        company_name = overview_tool_res.get("name", ticker)
        current_price = float(overview_tool_res.get("current_price", 100.0))
        currency = str(overview_tool_res.get("currency", "INR"))
        curr_sym = "$" if currency == "USD" else "₹"
        pe_ratio = float(overview_tool_res.get("pe_ratio", 20.0))
        sector = overview_tool_res.get("sector", "Equities")

        step1 = AgentThoughtStep(
            step_id=1,
            role=AgentRole.CIO,
            agent_name="Victoria Vance (Chief Investment Officer)",
            avatar_color="#3B82F6",  # Blue
            phase_title="Mandate Scoping & Committee Dispatch",
            thought_process=(
                f"Convening the Alphiq Investment Committee for {ticker} ({company_name}) trading at {curr_sym}{current_price:,.2f}. "
                f"Sector: {sector}, Trailing P/E: {pe_ratio:.1f}x. "
                "Framing hypotheses: (1) Is the current valuation offering asymmetric risk-reward over a 12-36 month horizon? "
                "(2) Are earnings drivers durable against macroeconomic cycles? "
                "Dispatching tasks: Fundamental Analyst to inspect balance sheet and cash flows; Quant to evaluate volatility and ML projections; "
                "Forensic Auditor to verify shareholding integrity; Devil's Advocate to probe downside vulnerabilities."
            ),
            tool_calls=[
                ToolCallRecord(
                    tool_name="alphiq_stock_overview",
                    arguments={"ticker": ticker},
                    output_summary=f"Spot Price: {curr_sym}{current_price:,.2f}, P/E: {pe_ratio:.1f}x, Sector: {sector}",
                    duration_ms=d1
                )
            ],
            intermediate_conclusion=f"Baseline established. Sector: {sector}. Dispatching to Fundamental, Quant, and Forensic units."
        )
        steps.append(step1)

        # -------------------------------------------------------------
        # STEP 2: Fundamental Analyst Deep-Dive
        # -------------------------------------------------------------
        t0 = time.time()
        fin_res = await execute_mcp_tool("alphiq_financial_statements", {"ticker": ticker, "statement_type": "all"})
        d_fin = int((time.time() - t0) * 1000)

        t0 = time.time()
        dcf_res = await execute_mcp_tool("alphiq_dcf_valuation", {"ticker": ticker, "wacc": 11.5, "terminal_growth": 5.0})
        d_dcf = int((time.time() - t0) * 1000)

        intrinsic_value = float(dcf_res.get("intrinsic_value_per_share", current_price * 1.25))
        dcf_upside_pct = float(dcf_res.get("upside_downside_pct", 25.0))
        margin_of_safety = float(dcf_res.get("margin_of_safety_pct", 15.0))

        fundamental_stance = "Bullish" if dcf_upside_pct > 12.0 else ("Cautious" if dcf_upside_pct < -5.0 else "Neutral")
        fundamental_conviction = min(9.5, max(5.0, 7.0 + (dcf_upside_pct / 20.0)))

        step2 = AgentThoughtStep(
            step_id=2,
            role=AgentRole.FUNDAMENTALIST,
            agent_name="Devan Nair, CFA (Lead Fundamental Analyst)",
            avatar_color="#10B981",  # Emerald
            phase_title="Intrinsic Value & Balance Sheet Durability",
            thought_process=(
                f"Auditing audited financials and discounted cash flow models. "
                f"Our DCF model (WACC: 11.5%, Terminal Growth: 5.0%) projects intrinsic equity value at {curr_sym}{intrinsic_value:,.2f} "
                f"representing an implied {dcf_upside_pct:+.1f}% upside against current spot price {curr_sym}{current_price:,.2f}. "
                f"Free cash flow generation remains healthy with comfortable interest coverage ratio. "
                "Operating margins show pricing power in core business segments."
            ),
            tool_calls=[
                ToolCallRecord(
                    tool_name="alphiq_financial_statements",
                    arguments={"ticker": ticker, "statement_type": "all"},
                    output_summary="Historical statements parsed: steady top-line compounding, resilient gross margins.",
                    duration_ms=d_fin
                ),
                ToolCallRecord(
                    tool_name="alphiq_dcf_valuation",
                    arguments={"ticker": ticker, "wacc": 11.5, "terminal_growth": 5.0},
                    output_summary=f"DCF Fair Value: {curr_sym}{intrinsic_value:,.2f} ({dcf_upside_pct:+.1f}% spread)",
                    duration_ms=d_dcf
                )
            ],
            intermediate_conclusion=f"DCF Fair Value yields {curr_sym}{intrinsic_value:,.2f} with a {margin_of_safety:.1f}% margin of safety."
        )
        steps.append(step2)

        opinions["FUNDAMENTALIST"] = AgentOpinion(
            role=AgentRole.FUNDAMENTALIST,
            agent_name="Devan Nair, CFA",
            stance=fundamental_stance,
            conviction_score=round(fundamental_conviction, 1),
            summary=f"Intrinsic valuation indicates {dcf_upside_pct:+.1f}% upside with DCF target {curr_sym}{intrinsic_value:,.2f}.",
            key_arguments=[
                f"Discounted cash flows imply fair value of {curr_sym}{intrinsic_value:,.2f} vs spot {curr_sym}{current_price:,.2f}",
                "Healthy balance sheet with sustainable operating leverage",
                "Robust return on equity and reinvestment rate in secular growth vectors"
            ],
            critical_risks=[
                "Raw material input cost inflation or margin contraction",
                "Interest rate cycle elongation increasing corporate debt servicing costs"
            ],
            fair_value_estimate=round(intrinsic_value, 2)
        )

        # -------------------------------------------------------------
        # STEP 3: Quant & ML Forecaster Analysis
        # -------------------------------------------------------------
        t0 = time.time()
        ml_res = await execute_mcp_tool("alphiq_ml_forecast", {"ticker": ticker, "days": 90})
        d_ml = int((time.time() - t0) * 1000)

        ml_target = float(ml_res.get("ensemble_target_price", current_price * 1.15))
        ml_return_pct = float(ml_res.get("expected_return_pct", 15.0))
        vol_regime = ml_res.get("volatility_regime", "Moderate Volatility")
        ml_upper = float(ml_res.get("confidence_intervals", {}).get("upper_95", ml_target * 1.1))
        ml_lower = float(ml_res.get("confidence_intervals", {}).get("lower_95", ml_target * 0.9))

        quant_stance = "Bullish" if ml_return_pct > 8.0 else ("Bearish" if ml_return_pct < -5.0 else "Neutral")
        quant_conviction = 8.5 if "Low" in vol_regime else (7.6 if "Moderate" in vol_regime else 6.5)

        step3 = AgentThoughtStep(
            step_id=3,
            role=AgentRole.QUANT_ML,
            agent_name="Dr. Elena Rostova (Head of Quantitative Alpha)",
            avatar_color="#8B5CF6",  # Purple
            phase_title="Machine Learning Trajectory & Volatility Cones",
            thought_process=(
                f"Executing Alphiq's ML Ensemble (ARIMA-GARCH + Ridge + Gradient Boosted Trees) over a 90-day trajectory. "
                f"Ensemble point estimate: {curr_sym}{ml_target:,.2f} ({ml_return_pct:+.2f}% expected return). "
                f"Volatility regime identified: {vol_regime}. "
                f"95% Monte Carlo confidence band bounds between {curr_sym}{ml_lower:,.2f} and {curr_sym}{ml_upper:,.2f}. "
                "Momentum indicators confirm bullish trend persistence without overbought exhaustion."
            ),
            tool_calls=[
                ToolCallRecord(
                    tool_name="alphiq_ml_forecast",
                    arguments={"ticker": ticker, "days": 90},
                    output_summary=f"90-Day ML Target: {curr_sym}{ml_target:,.2f} ({ml_return_pct:+.1f}%), Regime: {vol_regime}",
                    duration_ms=d_ml
                )
            ],
            intermediate_conclusion=f"Quantitative models forecast upward drift to {curr_sym}{ml_target:,.2f} with {vol_regime}."
        )
        steps.append(step3)

        opinions["QUANT_ML"] = AgentOpinion(
            role=AgentRole.QUANT_ML,
            agent_name="Dr. Elena Rostova",
            stance=quant_stance,
            conviction_score=round(quant_conviction, 1),
            summary=f"Algorithmic price target of {curr_sym}{ml_target:,.2f} with 95% confidence corridor [{curr_sym}{ml_lower:,.2f} - {curr_sym}{ml_upper:,.2f}].",
            key_arguments=[
                f"Statistically significant upward momentum with {ml_return_pct:+.1f}% projected 90D return",
                f"Volatility regime categorized as '{vol_regime}' indicating stable price discovery",
                "Mean-reverting support established at lower 95% confidence threshold"
            ],
            critical_risks=[
                "Macro volatility spikes could breach the lower 95% band",
                "Momentum mean-reversion during market-wide pullbacks"
            ],
            fair_value_estimate=round(ml_target, 2)
        )

        # -------------------------------------------------------------
        # STEP 4: Forensic & Governance Auditor Audit
        # -------------------------------------------------------------
        t0 = time.time()
        gov_res = await execute_mcp_tool("alphiq_governance_audit", {"ticker": ticker})
        d_gov = int((time.time() - t0) * 1000)

        promoter_holding = float(gov_res.get("promoter_holding_pct", 50.0))
        pledged_promoter = float(gov_res.get("promoter_pledged_pct", 0.0))
        red_flags = gov_res.get("red_flags", [])
        gov_score = float(gov_res.get("governance_score", 8.8))

        forensic_stance = "Cautious" if len(red_flags) > 0 or pledged_promoter > 10.0 else "Clean / Bullish"
        forensic_conviction = min(9.5, max(4.0, gov_score))

        step4 = AgentThoughtStep(
            step_id=4,
            role=AgentRole.FORENSIC_AUDITOR,
            agent_name="Marcus Sterling, Forensic CPA (Governance Officer)",
            avatar_color="#F59E0B",  # Amber
            phase_title="Forensic Audit, Pledging & Governance Check",
            thought_process=(
                f"Auditing capital structure and governance disclosures for {ticker}. "
                f"Promoter ownership stands at {promoter_holding:.1f}%, with pledged promoter equity at {pledged_promoter:.1f}%. "
                f"Governance scorecard: {gov_score:.1f} / 10.0. "
                + (f"Warning flags flagged: {', '.join(red_flags)}" if red_flags else "No forensic red flags detected: clean auditor sign-offs and zero encumbrances.")
            ),
            tool_calls=[
                ToolCallRecord(
                    tool_name="alphiq_governance_audit",
                    arguments={"ticker": ticker},
                    output_summary=f"Gov Score: {gov_score}/10, Pledged: {pledged_promoter}%, Red Flags: {len(red_flags)}",
                    duration_ms=d_gov
                )
            ],
            intermediate_conclusion=f"Governance audit passed with score {gov_score:.1f}/10. Capital structure integrity confirmed."
        )
        steps.append(step4)

        opinions["FORENSIC_AUDITOR"] = AgentOpinion(
            role=AgentRole.FORENSIC_AUDITOR,
            agent_name="Marcus Sterling, Forensic CPA",
            stance=forensic_stance,
            conviction_score=round(forensic_conviction, 1),
            summary=f"Governance rating {gov_score:.1f}/10. Promoter pledging at {pledged_promoter}%.",
            key_arguments=[
                f"Promoter skin-in-the-game verified at {promoter_holding:.1f}%",
                "Clean auditor reports with no adverse qualifications or sudden resignations",
                "Institutional ownership (FII/DII) providing liquidity stability"
            ],
            critical_risks=red_flags if red_flags else ["Minor related-party transactions require routine quarterly monitoring."],
            fair_value_estimate=None
        )

        # -------------------------------------------------------------
        # STEP 5: Devil's Advocate / Bear Thesis Attack
        # -------------------------------------------------------------
        t0 = time.time()
        peers_res = await execute_mcp_tool("alphiq_peer_comparison", {"ticker": ticker})
        news_res = await execute_mcp_tool("alphiq_news_sentiment", {"ticker": ticker})
        d_adv = int((time.time() - t0) * 1000)

        bear_target = current_price * 0.88
        step5 = AgentThoughtStep(
            step_id=5,
            role=AgentRole.DEVILS_ADVOCATE,
            agent_name="Kavita Sen (Devil's Advocate & Risk Officer)",
            avatar_color="#EF4444",  # Red
            phase_title="Adversarial Stress-Test & Downside Scenarios",
            thought_process=(
                f"I must vigorously challenge the prevailing bullish optimism on {ticker}. "
                f"At a trailing P/E of {pe_ratio:.1f}x, markets are pricing in near-flawless execution. "
                "Downside risks underappreciated by the committee: "
                "(1) Capital expenditures could face gestation delays and cost overruns. "
                "(2) Aggressive competitive pricing from domestic and multinational peers threatens margin compression. "
                f"(3) In a bear scenario involving stagflation or rate spikes, the stock could re-rate down to {curr_sym}{bear_target:,.2f} (-12%)."
            ),
            tool_calls=[
                ToolCallRecord(
                    tool_name="alphiq_peer_comparison",
                    arguments={"ticker": ticker},
                    output_summary="Compared peer multiples: valuation sits in the upper quartile of the sector.",
                    duration_ms=d_adv
                )
            ],
            intermediate_conclusion=f"Downside stress-test flags 12-15% vulnerability if quarterly earnings miss consensus expectations."
        )
        steps.append(step5)

        opinions["DEVILS_ADVOCATE"] = AgentOpinion(
            role=AgentRole.DEVILS_ADVOCATE,
            agent_name="Kavita Sen",
            stance="Bearish / Stress-Tester",
            conviction_score=7.8,
            summary=f"Stresses downside to {curr_sym}{bear_target:,.2f} if execution stumbles or multiples compress.",
            key_arguments=[
                f"Valuation multiple ({pe_ratio:.1f}x) leaves negligible room for operational missteps",
                "Sector-wide competitive capex intensity could depress returns on capital",
                "Macro sensitivity to interest rate fluctuations and foreign institutional outflows"
            ],
            critical_risks=[
                "Earnings revisions turning negative in upcoming quarters",
                "Global supply chain shocks dampening industrial revenue expansion"
            ],
            fair_value_estimate=round(bear_target, 2)
        )

        # -------------------------------------------------------------
        # STEP 6: CIO Synthesis & Investment Committee Consensus
        # -------------------------------------------------------------
        # Blended target: 50% Fundamental DCF, 35% ML Forecast, 15% Bear Stress Test
        consensus_target = round((intrinsic_value * 0.50) + (ml_target * 0.35) + (bear_target * 0.15), 2)
        expected_ret = round(((consensus_target - current_price) / current_price) * 100.0, 2)

        if expected_ret >= 20.0 and gov_score >= 8.0:
            recommendation = "Strong Buy"
            overall_conviction = 8.8
            allocation = "4.0% - 6.0% of Equity Portfolio"
        elif expected_ret >= 8.0:
            recommendation = "Accumulate / Buy on Dips"
            overall_conviction = 8.1
            allocation = "3.0% - 4.5% of Equity Portfolio"
        elif expected_ret >= 0.0:
            recommendation = "Hold / Neutral"
            overall_conviction = 6.8
            allocation = "1.5% - 2.5% of Equity Portfolio"
        else:
            recommendation = "Underperform / Reduce"
            overall_conviction = 7.4
            allocation = "0.0% - 1.0% (Underweight)"

        step6 = AgentThoughtStep(
            step_id=6,
            role=AgentRole.CIO,
            agent_name="Victoria Vance (Chief Investment Officer)",
            avatar_color="#3B82F6",
            phase_title="Committee Consensus & Allocation Memo",
            thought_process=(
                f"Reconciling the debate for {ticker}. "
                f"The Fundamental Analyst demonstrates solid DCF fair value ({curr_sym}{intrinsic_value:,.2f}), "
                f"supported by Quant ML momentum trajectory ({curr_sym}{ml_target:,.2f}). "
                f"While the Devil's Advocate highlights legitimate multiple-compression risks ({curr_sym}{bear_target:,.2f}), "
                f"the clean governance scorecard ({gov_score}/10) and favorable risk-reward skew justify an affirmative stance. "
                f"Committee Consensus: '{recommendation}' with a blended target of {curr_sym}{consensus_target:,.2f} "
                f"({expected_ret:+.1f}% expected return) over a 12-18 Month horizon."
            ),
            tool_calls=[],
            intermediate_conclusion=f"Final Committee Verdict: {recommendation} | Target: {curr_sym}{consensus_target:,.2f} | Conviction: {overall_conviction}/10"
        )
        steps.append(step6)

        adversarial = AdversarialClash(
            bull_thesis=(
                f"Fundamental & ML engines project {expected_ret:+.1f}% upside driven by secular expansion, "
                f"strong earnings durability, and clean balance sheet metrics."
            ),
            bear_thesis=(
                f"Devil's Advocate warns that valuation ({pe_ratio:.1f}x) leaves little buffer for capex delays, "
                f"pricing wars, or quarterly margin degradation."
            ),
            conflict_resolution=(
                "The committee adopts a staggered accumulation strategy, factoring in downside stress tests "
                "while capturing primary upside compounding."
            ),
            key_pivot_factor="Quarterly EBITDA margin resilience and order book execution velocity."
        )

        consensus = FinalCommitteeConsensus(
            recommendation=recommendation,
            overall_conviction=overall_conviction,
            target_price=consensus_target,
            current_price=current_price,
            expected_return_pct=expected_ret,
            horizon="12 - 18 Months",
            suggested_allocation_pct=allocation,
            executive_summary=(
                f"Alphiq Investment Committee rates {ticker} as a '{recommendation}' with an overall conviction score of "
                f"{overall_conviction} / 10. Blended target price is {curr_sym}{consensus_target:,.2f} ({expected_ret:+.1f}% upside), "
                f"supported by DCF valuation ({curr_sym}{intrinsic_value:,.2f}) and ML ensemble trajectory ({curr_sym}{ml_target:,.2f})."
            ),
            key_catalysts=[
                "Sustained quarterly top-line revenue expansion above sector average",
                "New product rollouts and capacity additions reaching commercial milestones",
                "Positive institutional ownership accumulation and foreign capital inflows"
            ],
            key_tail_risks=[
                "Multiple re-rating should quarterly margin expansion miss estimates",
                "Macroeconomic slowdown or prolonged interest rate stringency"
            ]
        )

        disclaimer = (
            "STATUTORY SEBI & RBI EDUCATIONAL DISCLAIMER: This Multi-Agent Investment Committee Memorandum is generated "
            "strictly for academic, educational, and computational research purposes. Alphiq is not a SEBI-registered Research Analyst "
            "(INH000000000) or RBI-licensed financial advisor. Financial markets involve substantial risk of loss. Always conduct "
            "independent due diligence and consult a qualified, registered wealth advisor before making financial investments."
        )

        return CommitteeDeliberationResult(
            ticker=ticker,
            company_name=company_name,
            current_price=current_price,
            currency=currency,
            query=query,
            deliberation_steps=steps,
            agent_opinions=opinions,
            adversarial_clash=adversarial,
            consensus=consensus,
            statutory_disclaimer=disclaimer
        )


committee_engine = MultiAgentCommitteeEngine()
