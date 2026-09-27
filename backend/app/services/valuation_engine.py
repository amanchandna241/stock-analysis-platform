from typing import List, Dict, Any
from app.schemas.stock import DCFInput, DCFResult, DCFSensitivityCell

class ValuationEngine:
    @staticmethod
    def run_dcf_model(
        current_revenue: float,
        net_debt: float,
        shares_outstanding: float,
        current_price: float,
        params: DCFInput
    ) -> DCFResult:
        """
        Runs a 5-year Discounted Cash Flow (DCF) model and generates a 5x5 WACC vs Terminal Growth sensitivity matrix.
        """
        def calculate_ev(wacc: float, g_term: float) -> tuple[float, List[Dict[str, Any]]]:
            projections = []
            rev = current_revenue
            pv_fcf_total = 0.0

            for yr in range(1, params.projection_years + 1):
                prev_rev = rev
                rev = rev * (1.0 + params.revenue_growth_rate)
                ebitda = rev * params.ebitda_margin
                depr = ebitda * 0.20 # assume depreciation is ~20% of EBITDA
                ebit = ebitda - depr
                nopat = ebit * (1.0 - params.tax_rate)
                capex = rev * params.capex_pct_rev
                dnwc = (rev - prev_rev) * params.nwc_pct_rev
                fcff = nopat + depr - capex - dnwc
                
                df = pow(1.0 + wacc, yr)
                pv_fcff = fcff / df
                pv_fcf_total += pv_fcff

                projections.append({
                    "year": f"Year {yr}",
                    "revenue": round(rev, 2),
                    "ebitda": round(ebitda, 2),
                    "nopat": round(nopat, 2),
                    "fcff": round(fcff, 2),
                    "pv_fcff": round(pv_fcff, 2)
                })

            last_fcff = projections[-1]["fcff"]
            terminal_fcff = last_fcff * (1.0 + g_term)
            
            # Avoid divide by zero
            denom = max(0.001, wacc - g_term)
            terminal_value = terminal_fcff / denom
            pv_terminal_value = terminal_value / pow(1.0 + wacc, params.projection_years)
            
            enterprise_value = pv_fcf_total + pv_terminal_value
            return enterprise_value, projections

        # Base case EV & projections
        base_ev, projections = calculate_ev(params.wacc, params.terminal_growth_rate)
        equity_val = base_ev - net_debt
        fair_value_per_share = round(equity_val / max(0.0001, shares_outstanding), 2)
        margin_of_safety = round(((fair_value_per_share - current_price) / max(0.01, current_price)) * 100.0, 2)

        # Sensitivity Matrix (5x5)
        wacc_steps = [params.wacc - 0.02, params.wacc - 0.01, params.wacc, params.wacc + 0.01, params.wacc + 0.02]
        growth_steps = [params.terminal_growth_rate - 0.01, params.terminal_growth_rate - 0.005, params.terminal_growth_rate, params.terminal_growth_rate + 0.005, params.terminal_growth_rate + 0.01]

        sensitivity_matrix: List[List[DCFSensitivityCell]] = []

        for w in wacc_steps:
            row_cells = []
            for g in growth_steps:
                ev_sens, _ = calculate_ev(w, g)
                eq_sens = ev_sens - net_debt
                px_sens = round(eq_sens / max(0.0001, shares_outstanding), 2)
                row_cells.append(DCFSensitivityCell(
                    wacc=round(w * 100, 1),
                    terminal_growth=round(g * 100, 1),
                    implied_share_price=max(0.0, px_sens)
                ))
            sensitivity_matrix.append(row_cells)

        return DCFResult(
            enterprise_value_cr=round(base_ev, 2),
            net_debt_cr=round(net_debt, 2),
            equity_value_cr=round(equity_val, 2),
            shares_outstanding_cr=round(shares_outstanding, 2),
            fair_value_per_share=fair_value_per_share,
            current_price=current_price,
            margin_of_safety_pct=margin_of_safety,
            projections=projections,
            sensitivity_table=sensitivity_matrix,
            sensitivity_waccs=[round(w * 100, 1) for w in wacc_steps],
            sensitivity_growths=[round(g * 100, 1) for g in growth_steps]
        )
