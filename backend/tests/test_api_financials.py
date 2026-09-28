import pytest

def test_get_income_statement(client):
    response = client.get("/api/v1/financials/RELIANCE/income-statement")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "years" in data
    assert "rows" in data
    assert "revenue_chart" in data

def test_get_income_statement_404(client):
    response = client.get("/api/v1/financials/NON_EXISTENT_99/income-statement")
    assert response.status_code == 404

def test_get_balance_sheet(client):
    response = client.get("/api/v1/financials/INFY/balance-sheet")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "INFY"
    assert "years" in data
    assert "rows" in data

def test_get_balance_sheet_404(client):
    response = client.get("/api/v1/financials/NON_EXISTENT_99/balance-sheet")
    assert response.status_code == 404

def test_get_cash_flow(client):
    response = client.get("/api/v1/financials/HDFCBANK/cash-flow")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "HDFCBANK"
    assert "years" in data
    assert "rows" in data
    assert "warnings" in data


def test_get_cash_flow_404(client):
    response = client.get("/api/v1/financials/NON_EXISTENT_99/cash-flow")
    assert response.status_code == 404
