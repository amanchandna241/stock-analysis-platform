import numpy as np
from typing import List, Dict, Any
from app.schemas.stock import CashFlowWarning

class FinancialEngine:
    @staticmethod
    def calculate_cagr(start_val: float, end_val: float, years: int) -> float:
        if start_val <= 0 or end_val <= 0 or years <= 0:
            return 0.0
        return round((pow(end_val / start_val, 1.0 / years) - 1.0) * 100.0, 2)

    @staticmethod
    def detect_cash_flow_warnings(rows: List[Dict[str, Any]], currency: str = "INR") -> List[CashFlowWarning]:
        """
        Scans financial rows for Cash Flow red flags:
        1. PAT rising but FCF falling
        2. CFO consistently below PAT
        3. Working capital deteriorating
        """
        warnings = []
        if len(rows) < 3:
            return warnings

        unit = "M" if currency == "USD" else "Cr"
        symbol = "$" if currency == "USD" else "₹"

        # Sort chronologically (assuming years like FY21, FY22, ...)
        sorted_rows = sorted(rows, key=lambda x: x.get('year', ''))

        # Flag 1: PAT rising but FCF falling over last 3 years
        last_3 = sorted_rows[-3:]
        pat_trend = [r.get('pat', 0) for r in last_3]
        fcf_trend = [r.get('fcf', 0) for r in last_3]

        if pat_trend[-1] > pat_trend[0] and fcf_trend[-1] < fcf_trend[0]:
            warnings.append(CashFlowWarning(
                year=last_3[-1].get('year', 'Recent'),
                warning_type="Divergence: PAT Rising vs FCF Falling",
                severity="HIGH",
                description=f"Net Profit (PAT) increased from {symbol}{pat_trend[0]} {unit} to {symbol}{pat_trend[-1]} {unit}, but Free Cash Flow dropped from {symbol}{fcf_trend[0]} {unit} to {symbol}{fcf_trend[-1]} {unit}. Indicates potential earnings quality or capital intensity risks."
            ))

        # Flag 2: CFO consistently below PAT (CFO / PAT < 0.8)
        cfo_pat_ratios = []
        for r in sorted_rows[-5:]:
            pat = r.get('pat', 0)
            cfo = r.get('cfo', 0)
            if pat > 0:
                ratio = cfo / pat
                if ratio < 0.8:
                    cfo_pat_ratios.append((r.get('year'), ratio, cfo, pat))

        if len(cfo_pat_ratios) >= 2:
            years_str = ", ".join([x[0] for x in cfo_pat_ratios])
            warnings.append(CashFlowWarning(
                year=sorted_rows[-1].get('year', ''),
                warning_type="Cash Conversion Lag (CFO < PAT)",
                severity="HIGH",
                description=f"Cash Flow from Operations (CFO) was significantly below PAT (<80%) in years: {years_str}. Profit is locked in working capital or accrued income."
            ))

        # Flag 3: Working capital deterioration
        wc_trend = [r.get('working_capital', 0) for r in last_3]
        if len(wc_trend) >= 3 and wc_trend[-1] > wc_trend[0] * 1.4:
            warnings.append(CashFlowWarning(
                year=last_3[-1].get('year', ''),
                warning_type="Working Capital Expansion",
                severity="MEDIUM",
                description=f"Working capital expanded rapidly from {symbol}{wc_trend[0]} {unit} to {symbol}{wc_trend[-1]} {unit} over 3 years, consuming cash flow."
            ))

        return warnings

    @staticmethod
    def explain_profitability_changes(margin_data: Dict[str, List[float]], years: List[str]) -> List[str]:
        explanations = []
        if len(years) < 2:
            return explanations

        ebitda_margins = margin_data.get('ebitda_margin', [])
        net_margins = margin_data.get('net_margin', [])
        roes = margin_data.get('roe', [])

        if len(ebitda_margins) >= 5:
            change_5y = round(ebitda_margins[-1] - ebitda_margins[-5], 2)
            if change_5y > 2.0:
                explanations.append(f"Operating Margin Expansion: EBITDA margin expanded by {change_5y}% over the last 5 years, driven by operational leverage and cost efficiencies.")
            elif change_5y < -2.0:
                explanations.append(f"Margin Compression Warning: EBITDA margin compressed by {abs(change_5y)}% over 5 years due to raw material input costs or price competition.")
            else:
                explanations.append("Stable Profitability: EBITDA margin has remained steady within a narrow band over the 5-year cycle.")

        if len(roes) >= 5:
            roe_5y = roes[-5]
            roe_current = roes[-1]
            if roe_current >= 20.0:
                explanations.append(f"High Return on Equity: Current ROE of {roe_current}% highlights high pricing power and capital efficiency.")
            elif roe_current < roe_5y - 3.0:
                explanations.append(f"ROE Decline: ROE dropped from {roe_5y}% to {roe_current}%, signalling lower asset turnover or leverage reduction.")

        return explanations
