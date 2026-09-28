import pytest

def test_get_shareholding(client):
    response = client.get("/api/v1/governance/RELIANCE/shareholding")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "history" in data
    assert "key_insights" in data
    assert len(data["history"]) > 0

def test_get_shareholding_404(client):
    response = client.get("/api/v1/governance/INVALID_99/shareholding")
    assert response.status_code == 404

def test_get_governance_events(client):
    response = client.get("/api/v1/governance/TCS/governance-events")
    assert response.status_code == 200
    data = response.json()
    assert "auditor_name" in data
    assert "events" in data

def test_get_governance_events_404(client):
    response = client.get("/api/v1/governance/INVALID_99/governance-events")
    assert response.status_code == 404

def test_get_earnings_analysis(client):
    response = client.get("/api/v1/earnings/INFY")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "INFY"
    assert "quarters" in data
    assert "ai_analysis" in data

def test_get_earnings_analysis_404(client):
    response = client.get("/api/v1/earnings/INVALID_99")
    assert response.status_code == 404

def test_get_news(client):
    response = client.get("/api/v1/news?ticker=RELIANCE")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_news_all(client):
    response = client.get("/api/v1/news")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_thesis(client):
    response = client.get("/api/v1/thesis/RELIANCE")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "overall_view" in data
    assert "bull_case" in data
    assert "bear_case" in data

def test_get_thesis_404(client):
    response = client.get("/api/v1/thesis/INVALID_99")
    assert response.status_code == 404

