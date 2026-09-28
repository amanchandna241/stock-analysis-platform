import pytest

def test_get_dashboard_overview(client):
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "watchlist" in data
    assert "alerts" in data
    assert "indices" in data

def test_add_remove_watchlist(client):
    # Add ticker to watchlist
    add_res = client.post("/api/v1/dashboard/watchlist/add?ticker=AAPL")
    assert add_res.status_code == 200
    assert add_res.json()["status"] == "success"
    assert "AAPL" in add_res.json()["watchlist"]

    # Remove ticker from watchlist
    rem_res = client.delete("/api/v1/dashboard/watchlist/remove?ticker=AAPL")
    assert rem_res.status_code == 200
    assert rem_res.json()["status"] == "success"

def test_add_remove_alert(client):
    # Add alert
    add_res = client.post("/api/v1/dashboard/alerts/add?ticker=NVDA&condition=PE%20Below%2035&alert_type=Valuation%20Opportunity")
    assert add_res.status_code == 200
    alert_data = add_res.json()
    assert alert_data["status"] == "success"
    assert len(alert_data["alerts"]) > 0
    alert_id = alert_data["alerts"][-1]["id"]

    # Remove alert
    rem_res = client.delete(f"/api/v1/dashboard/alerts/remove?alert_id={alert_id}")
    assert rem_res.status_code == 200
    assert rem_res.json()["status"] == "success"

