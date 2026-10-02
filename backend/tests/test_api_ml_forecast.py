from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ml_forecast_endpoint_default():
    response = client.get("/api/v1/ml/forecast/RELIANCE")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "current_price" in data
    assert "volatility_metrics" in data
    assert "volatility_regime" in data
    assert "monte_carlo_outcomes" in data
    assert "forecast_chart" in data
    assert len(data["forecast_chart"]) == 90

def test_ml_forecast_endpoint_custom_horizon():
    response = client.get("/api/v1/ml/forecast/TCS?days=30")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "TCS"
    assert len(data["forecast_chart"]) == 30
    assert data["monte_carlo_outcomes"]["bear_case"]["price"] > 0
    assert data["monte_carlo_outcomes"]["bull_case"]["price"] > 0
