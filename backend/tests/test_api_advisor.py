from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_advisor_suggested_prompts():
    response = client.get("/api/v1/advisor/suggested-prompts")
    assert response.status_code == 200
    prompts = response.json()
    assert isinstance(prompts, list)
    assert len(prompts) >= 3
    assert any("EV space" in p for p in prompts)

def test_advisor_recommendation_ev_query():
    payload = {"query": "need recommendation in EV space in india for long term"}
    response = client.post("/api/v1/advisor/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "theme_name" in data
    assert "recommended_stocks" in data
    assert len(data["recommended_stocks"]) >= 2
    
    # Check first recommended stock structure
    first_stock = data["recommended_stocks"][0]
    assert first_stock["ticker"] == "TATAMOTORS"
    assert first_stock["allocation_pct"] > 0
    assert "thesis_summary" in first_stock
    assert len(first_stock["key_catalysts"]) > 0

def test_advisor_recommendation_us_tech_query():
    payload = {"query": "Top AI and high dividend US tech stocks"}
    response = client.post("/api/v1/advisor/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "NVDA" in [s["ticker"] for s in data["recommended_stocks"]]
