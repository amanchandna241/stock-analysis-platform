import pytest

def test_get_profitability(client):
    response = client.get("/api/v1/analytics/RELIANCE/profitability")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "metrics" in data
    assert "roe" in data["metrics"]
    assert "roce" in data["metrics"]
    assert "ebitda_margin" in data["metrics"]

def test_get_profitability_404(client):
    response = client.get("/api/v1/analytics/INVALID_99/profitability")
    assert response.status_code == 404

def test_get_cagr_growth(client):
    response = client.get("/api/v1/analytics/TCS/growth")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "TCS"
    assert "table" in data
    assert len(data["table"]) > 0

def test_get_cagr_growth_404(client):
    response = client.get("/api/v1/analytics/INVALID_99/growth")
    assert response.status_code == 404

def test_get_valuation(client):
    response = client.get("/api/v1/valuation/INFY")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "INFY"
    assert "dcf_default" in data
    assert "relative_table" in data

def test_get_valuation_404(client):
    response = client.get("/api/v1/valuation/INVALID_99")
    assert response.status_code == 404

def test_calculate_custom_dcf(client):
    payload = {
        "revenue_growth_rate": 0.12,
        "ebitda_margin": 0.22,
        "tax_rate": 0.25,
        "capex_pct_rev": 0.05,
        "nwc_pct_rev": 0.04,
        "wacc": 0.11,
        "terminal_growth_rate": 0.045
    }
    response = client.post("/api/v1/valuation/RELIANCE/dcf-calculator", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fair_value_per_share" in data
    assert "sensitivity_table" in data

def test_calculate_custom_dcf_404(client):
    payload = {
        "revenue_growth_rate": 0.12,
        "ebitda_margin": 0.22
    }
    response = client.post("/api/v1/valuation/INVALID_99/dcf-calculator", json=payload)
    assert response.status_code == 404

def test_get_peer_comparison(client):
    response = client.get("/api/v1/peers/HDFCBANK")
    assert response.status_code == 200
    data = response.json()
    assert data["target_ticker"] == "HDFCBANK"
    assert len(data["peers"]) > 0

def test_get_peer_comparison_404(client):
    response = client.get("/api/v1/peers/INVALID_99")
    assert response.status_code == 404

def test_get_technicals(client):
    response = client.get("/api/v1/technicals/RELIANCE")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "indicators" in data
    assert "patterns" in data
    assert "chart_data" in data

def test_get_technicals_404(client):
    response = client.get("/api/v1/technicals/INVALID_99")
    assert response.status_code == 404
