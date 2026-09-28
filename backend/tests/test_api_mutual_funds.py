"""
Tests for the /api/v1/mutual-funds endpoints.
"""
import pytest


def test_get_mutual_funds_explore(client):
    """GET /mutual-funds/explore returns the full explore response."""
    response = client.get("/api/v1/mutual-funds/explore")
    assert response.status_code == 200
    data = response.json()
    assert "all_schemes" in data
    assert "top_recommended" in data
    assert "categories" in data
    assert len(data["all_schemes"]) > 0


def test_get_mutual_fund_detail(client):
    """GET /mutual-funds/{scheme_code} returns full scheme details."""
    explore_res = client.get("/api/v1/mutual-funds/explore").json()
    scheme_code = explore_res["all_schemes"][0]["scheme_code"]

    response = client.get(f"/api/v1/mutual-funds/{scheme_code}")
    assert response.status_code == 200
    data = response.json()
    assert data["overview"]["scheme_code"] == scheme_code
    assert "nav_history" in data
    assert "top_holdings" in data


def test_get_mutual_fund_detail_dynamic_fallback(client):
    """
    GET /mutual-funds/{scheme_code} either returns a 200 with dynamically generated data
    or a 404 — both are acceptable because get_scheme_detail falls back to the live
    mfapi.in API for any unknown scheme code. We simply ensure no 5xx error occurs.
    """
    response = client.get("/api/v1/mutual-funds/99999999")
    assert response.status_code in (200, 404)


def test_search_mutual_funds(client):
    """GET /mutual-funds/search?q=... returns a list of matching schemes."""
    response = client.get("/api/v1/mutual-funds/search?q=Parag")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_search_mutual_funds_generic(client):
    """Searching for a broad term returns results."""
    response = client.get("/api/v1/mutual-funds/search?q=fund")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
