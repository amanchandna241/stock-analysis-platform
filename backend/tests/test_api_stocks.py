import pytest

def test_get_stock_overview_known(client):
    response = client.get("/api/v1/stocks/RELIANCE/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "current_price" in data
    assert "sector" in data
    assert "business_summary" in data

def test_get_stock_overview_alias_hdfc(client):
    response = client.get("/api/v1/stocks/HDFC/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "HDFCBANK"

def test_get_stock_overview_unknown(client):
    response = client.get("/api/v1/stocks/UNKNOWN_INVALID_TICKER_99/overview")
    assert response.status_code == 404
    assert response.json()["detail"] == "Stock not found"

def test_get_stock_snapshot_known(client):
    response = client.get("/api/v1/stocks/TCS/snapshot")
    assert response.status_code == 200
    data = response.json()
    assert "revenue_growth_3y" in data
    assert "roe" in data
    assert "roce" in data
    assert "formulas" in data

def test_get_stock_snapshot_unknown(client):
    response = client.get("/api/v1/stocks/UNKNOWN_INVALID_TICKER_99/snapshot")
    assert response.status_code == 404

def test_stock_search(client):
    response = client.get("/api/v1/stocks/search?q=goldman")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert results[0]["ticker"] == "GS"
    assert "Goldman" in results[0]["name"]

def test_stock_search_short_query(client):
    response = client.get("/api/v1/stocks/search?q=a")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
