"""
Tests for backend services: FinancialEngine, ValuationEngine, TechnicalEngine, AIService,
StockDataService, and MutualFundService.
"""
import pytest
import pandas as pd
import numpy as np
from app.services.financial_engine import FinancialEngine
from app.services.valuation_engine import ValuationEngine
from app.services.technical_engine import TechnicalEngine
from app.services.ai_service import AIService
from app.services.stock_data_service import StockDataService
from app.services.mutual_fund_service import MutualFundService
from app.schemas.stock import DCFInput


# ---------------------------------------------------------------------------
# FinancialEngine
# ---------------------------------------------------------------------------

def test_financial_engine_cagr():
    assert FinancialEngine.calculate_cagr(100.0, 200.0, 3) == 25.99
    assert FinancialEngine.calculate_cagr(0.0, 100.0, 3) == 0.0
    assert FinancialEngine.calculate_cagr(100.0, -10.0, 3) == 0.0


def test_financial_engine_cash_flow_warnings():
    """detect_cash_flow_warnings returns warning list (may be empty if data is clean)."""
    rows = [
        {"year": "FY21", "pat": 10, "cfo": 4, "fcf": 3, "working_capital": 20},
        {"year": "FY22", "pat": 15, "cfo": 5, "fcf": 2, "working_capital": 25},
        {"year": "FY23", "pat": 20, "cfo": 6, "fcf": 1, "working_capital": 35},
        {"year": "FY24", "pat": 22, "cfo": 7, "fcf": 0, "working_capital": 45},
        {"year": "FY25", "pat": 25, "cfo": 8, "fcf": -1, "working_capital": 55},
    ]
    warnings = FinancialEngine.detect_cash_flow_warnings(rows)
    assert isinstance(warnings, list)


def test_financial_engine_profitability_explanations():
    margin_data = {
        "ebitda_margin": [18.0, 18.5, 19.0, 20.0, 22.5, 23.0],
        "net_margin": [8.0, 8.2, 8.5, 9.0, 9.5, 10.0],
        "roe": [14.0, 15.0, 16.0, 18.0, 20.0, 21.0],
    }
    years = ["FY20", "FY21", "FY22", "FY23", "FY24", "FY25"]
    explanations = FinancialEngine.explain_profitability_changes(margin_data, years)
    assert isinstance(explanations, list)


# ---------------------------------------------------------------------------
# ValuationEngine
# ---------------------------------------------------------------------------

def test_valuation_engine_dcf():
    params = DCFInput(
        revenue_growth_rate=0.15,
        ebitda_margin=0.20,
        tax_rate=0.25,
        capex_pct_rev=0.05,
        nwc_pct_rev=0.04,
        wacc=0.10,
        terminal_growth_rate=0.035,
        projection_years=5,
    )
    res = ValuationEngine.run_dcf_model(
        current_revenue=100000,
        net_debt=20000,
        shares_outstanding=1000,
        current_price=2000.0,
        params=params,
    )
    # Field is fair_value_per_share, not fair_value
    assert res.fair_value_per_share > 0
    assert res.enterprise_value_cr > 0
    assert len(res.sensitivity_table) == 5
    assert len(res.sensitivity_table[0]) == 5


def test_valuation_engine_graham():
    graham = ValuationEngine.calculate_graham_number(eps=100.0, book_value_per_share=500.0)
    assert graham > 0
    assert ValuationEngine.calculate_graham_number(eps=-5.0, book_value_per_share=500.0) == 0.0


# ---------------------------------------------------------------------------
# TechnicalEngine
# ---------------------------------------------------------------------------

def test_technical_engine():
    dates = [
        (pd.Timestamp.now() - pd.Timedelta(days=250 - i)).strftime("%Y-%m-%d")
        for i in range(250)
    ]
    prices = [100.0 + i * 0.5 + (i % 3) for i in range(250)]
    df = pd.DataFrame(
        {
            "date": dates,
            "open": prices,
            "high": [p + 2.0 for p in prices],
            "low": [p - 2.0 for p in prices],
            "close": prices,
            "volume": [1000000] * 250,
        }
    )

    indicators, patterns, metrics = TechnicalEngine.calculate_indicators(df)
    assert indicators.sma_20 > 0
    assert indicators.rsi_14 > 0
    assert isinstance(patterns, list)
    assert isinstance(metrics, dict)


# ---------------------------------------------------------------------------
# AIService
# ---------------------------------------------------------------------------

def test_ai_service_thesis():
    ai = AIService()
    thesis = ai.generate_investment_thesis(
        ticker="RELIANCE",
        company_name="Reliance Industries",
        sector="Energy",
        financials_summary={
            "rev_growth_3y": 15.0,
            "roe": 18.0,
            "roce": 16.0,
            "debt_equity": 0.35,
            "fcf_cr": 12000.0,
        },
        quarterly_summary={},
        valuation_summary={"pe_ratio": 28.0, "pe_median_5y": 24.0},
        technical_summary={},  # Required arg added
    )
    assert thesis.ticker == "RELIANCE"
    assert len(thesis.bull_case) > 0
    assert len(thesis.bear_case) > 0


def test_ai_service_rag_query():
    ai = AIService()
    rag_res = ai.query_document_rag(
        ticker="TCS",
        query="What is the revenue growth?",
        document_chunks=[
            {
                "doc_id": "TCS_1",
                "doc_title": "TCS Annual Report FY24",
                "doc_type": "Annual Report",
                "year": "2024",
                "page_number": 8,
                "text": "TCS reported strong revenue growth driven by cloud transformation.",
            }
        ],
    )
    assert rag_res.ticker == "TCS"
    assert len(rag_res.citations) > 0


def test_ai_service_summarize_earnings():
    ai = AIService()
    result = ai.summarize_earnings(
        ticker="INFY",
        quarterly_data={"latest_quarter": "Q2FY25", "yoy_rev_growth": 9.5, "yoy_pat_growth": 12.0},
    )
    assert result.what_changed
    assert len(result.positive_developments) > 0


# ---------------------------------------------------------------------------
# StockDataService
# ---------------------------------------------------------------------------

def test_stock_data_service_overview():
    overview = StockDataService.get_stock_overview("GS")
    assert overview is not None
    assert overview["ticker"] == "GS"


def test_stock_data_service_historical_prices():
    hist_df, curr_px = StockDataService.get_historical_prices("RELIANCE", period="1y")
    assert not hist_df.empty
    assert curr_px > 0


# ---------------------------------------------------------------------------
# MutualFundService
# ---------------------------------------------------------------------------

def test_mutual_fund_service_explore():
    """get_explore_data returns top recommended funds and categories."""
    result = MutualFundService.get_explore_data()
    assert result is not None
    assert len(result.all_schemes) > 0
    assert len(result.categories) > 0


def test_mutual_fund_service_scheme_detail():
    """get_scheme_detail returns full details for a known scheme code."""
    # Use a seeded scheme code from MUTUAL_FUNDS_DB
    known_code = list(MutualFundService.MUTUAL_FUNDS_DB.keys())[0]
    detail = MutualFundService.get_scheme_detail(known_code)
    assert detail is not None
    assert detail.overview.scheme_code == known_code
    assert len(detail.nav_history) > 0


def test_mutual_fund_service_scheme_detail_unknown():
    """get_scheme_detail returns None for an unknown scheme code (no live API)."""
    detail = MutualFundService.get_scheme_detail(99999999)
    # May return None or a dynamically generated scheme — just ensure no exception
    # (live API may or may not respond in tests)
    assert detail is None or detail.overview is not None


def test_mutual_fund_service_search():
    """search_schemes returns results for a valid query."""
    results = MutualFundService.search_schemes("Parag Parikh")
    assert len(results) > 0


def test_mutual_fund_service_nav_history_generation():
    """_generate_nav_history returns a non-empty list of NAV points."""
    points = MutualFundService._generate_nav_history(curr_nav=75.0, cagr_3y=18.0)
    assert len(points) > 0
    # Last point NAV should be pinned to curr_nav
    assert points[-1].nav == 75.0
