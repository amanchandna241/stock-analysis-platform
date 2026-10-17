import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_committee_personas():
    response = client.get("/api/v1/agents/personas")
    assert response.status_code == 200
    data = response.json()
    assert data["quorum_size"] == 5
    assert len(data["agents"]) == 5
    roles = [a["role"] for a in data["agents"]]
    assert "CIO" in roles
    assert "FUNDAMENTALIST" in roles
    assert "QUANT_ML" in roles
    assert "FORENSIC_AUDITOR" in roles
    assert "DEVILS_ADVOCATE" in roles

def test_get_sample_tickers():
    response = client.get("/api/v1/agents/sample-tickers")
    assert response.status_code == 200
    tickers = response.json()
    assert len(tickers) >= 5
    symbols = [t["ticker"] for t in tickers]
    assert "TATAMOTORS" in symbols
    assert "RELIANCE" in symbols

def test_committee_deliberation_tatamotors():
    response = client.post(
        "/api/v1/agents/committee/deliberate",
        json={"ticker": "TATAMOTORS", "query": "Assess Tata Motors long-term commercial semiconductor and EV roadmap"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "TATAMOTORS"
    assert data["current_price"] > 0
    assert len(data["deliberation_steps"]) == 6
    assert "FUNDAMENTALIST" in data["agent_opinions"]
    assert "QUANT_ML" in data["agent_opinions"]
    assert "FORENSIC_AUDITOR" in data["agent_opinions"]
    assert "DEVILS_ADVOCATE" in data["agent_opinions"]
    assert data["consensus"]["target_price"] > 0
    assert data["consensus"]["overall_conviction"] >= 1.0
    assert "SEBI" in data["statutory_disclaimer"]
