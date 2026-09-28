from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.stock_data_service import StockDataService
from app.services.financial_engine import FinancialEngine
from app.schemas.stock import (
    IncomeStatementResponse, AnnualFinancialRow,
    BalanceSheetResponse, BalanceSheetRow,
    CashFlowResponse, CashFlowRow
)

router = APIRouter(prefix="/financials", tags=["Financials"])

@router.get("/{ticker}/income-statement", response_model=IncomeStatementResponse)
def get_income_statement(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    years = data['financials_years']
    rev = data['revenue']
    ebitda = data['ebitda']
    pat = data['pat']
    eps = data['eps']

    rows = []
    rev_chart = []
    ebitda_chart = []
    pat_chart = []
    margin_chart = []

    for i, yr in enumerate(years):
        r_val = rev[i]
        e_val = ebitda[i]
        ebit_val = round(e_val * 0.82, 2)
        pbt_val = round(pat[i] * 1.32, 2)
        p_val = pat[i]
        eps_val = eps[i]

        gross_m = 58.5 # industry standard estimate
        ebitda_m = round((e_val / max(1.0, r_val)) * 100.0, 2)
        ebit_m = round((ebit_val / max(1.0, r_val)) * 100.0, 2)
        pat_m = round((p_val / max(1.0, r_val)) * 100.0, 2)

        rows.append(AnnualFinancialRow(
            year=yr,
            revenue=r_val,
            ebitda=e_val,
            ebit=ebit_val,
            pbt=pbt_val,
            pat=p_val,
            eps=eps_val,
            gross_margin=gross_m,
            ebitda_margin=ebitda_m,
            ebit_margin=ebit_m,
            pat_margin=pat_m
        ))

        rev_chart.append({"year": yr, "revenue": r_val})
        ebitda_chart.append({"year": yr, "ebitda": e_val})
        pat_chart.append({"year": yr, "pat": p_val})
        margin_chart.append({"year": yr, "ebitda_margin": ebitda_m, "net_margin": pat_m})

    return IncomeStatementResponse(
        ticker=data['ticker'],
        years=years,
        rows=rows,
        revenue_chart=rev_chart,
        ebitda_chart=ebitda_chart,
        pat_chart=pat_chart,
        margin_trend=margin_chart,
        currency=data.get('currency', 'INR')
    )

@router.get("/{ticker}/balance-sheet", response_model=BalanceSheetResponse)
def get_balance_sheet(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    years = data['financials_years']
    cash = data['cash']
    debt = data['debt']
    receivables = data['receivables']
    inventory = data['inventory']
    assets = data['total_assets']
    equity = data['equity']
    ebitda = data['ebitda']
    rev = data['revenue']

    rows = []
    for i, yr in enumerate(years):
        c = cash[i]
        d = debt[i]
        nd = round(d - c, 2)
        rec = receivables[i]
        inv = inventory[i]
        pay = round(rec * 0.75, 2)
        tot_a = assets[i]
        eq = equity[i]
        e_val = ebitda[i]

        d_e = round(d / max(1.0, eq), 2)
        nd_ebitda = round(nd / max(1.0, e_val), 2)
        curr_ratio = round((c + rec + inv) / max(1.0, pay + 100), 2)
        int_cov = round((e_val * 0.8) / max(1.0, d * 0.075), 2)
        asset_turnover = round(rev[i] / max(1.0, tot_a), 2)

        rows.append(BalanceSheetRow(
            year=yr,
            cash=c,
            debt=d,
            net_debt=nd,
            receivables=rec,
            inventory=inv,
            payables=pay,
            total_assets=tot_a,
            equity=eq,
            debt_to_equity=d_e,
            net_debt_to_ebitda=nd_ebitda,
            current_ratio=curr_ratio,
            interest_coverage=int_cov,
            asset_turnover=asset_turnover
        ))

    return BalanceSheetResponse(ticker=data['ticker'], years=years, rows=rows, currency=data.get('currency', 'INR'))

@router.get("/{ticker}/cash-flow", response_model=CashFlowResponse)
def get_cash_flow(ticker: str):
    data = StockDataService.get_stock_overview(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")

    years = data['financials_years']
    cfo = data['cfo']
    capex = data['capex']
    pat = data['pat']
    receivables = data['receivables']
    inventory = data['inventory']

    rows = []
    raw_dicts = []
    for i, yr in enumerate(years):
        cfo_val = cfo[i]
        cap_val = capex[i]
        fcf_val = round(cfo_val - cap_val, 2)
        cfi_val = round(-cap_val * 1.1, 2)
        cff_val = round(-pat[i] * 0.3, 2) # Dividend & interest payment estimate
        pat_val = pat[i]
        ratio = round(fcf_val / max(1.0, pat_val), 2)
        wc = round(receivables[i] + inventory[i], 2)

        rows.append(CashFlowRow(
            year=yr,
            cfo=cfo_val,
            capex=cap_val,
            fcf=fcf_val,
            cfi=cfi_val,
            cff=cff_val,
            pat=pat_val,
            fcf_to_pat_ratio=ratio,
            working_capital=wc
        ))
        raw_dicts.append({
            "year": yr,
            "cfo": cfo_val,
            "capex": cap_val,
            "fcf": fcf_val,
            "pat": pat_val,
            "working_capital": wc
        })

    warnings = FinancialEngine.detect_cash_flow_warnings(raw_dicts, currency=data.get('currency', 'INR'))

    return CashFlowResponse(
        ticker=data['ticker'],
        years=years,
        rows=rows,
        warnings=warnings,
        currency=data.get('currency', 'INR')
    )
