import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mcp_tools_discovery():
    response = client.get("/api/v1/mcp/tools")
    assert response.status_code == 200
    data = response.json()
    assert data["tool_count"] >= 5
    tool_names = [t["name"] for t in data["tools"]]
    assert "alphiq_stock_overview" in tool_names
    assert "alphiq_financial_statements" in tool_names
    assert "alphiq_ml_forecast" in tool_names
    assert "alphiq_dcf_valuation" in tool_names
    assert "alphiq_governance_audit" in tool_names
    assert "alphiq_rag_search" in tool_names

def test_mcp_direct_tool_execution():
    response = client.post(
        "/api/v1/mcp/tools/alphiq_stock_overview/execute",
        json={"ticker": "RELIANCE"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tool_name"] == "alphiq_stock_overview"
    assert data["result"]["ticker"] == "RELIANCE"
    assert data["result"]["current_price"] > 0

def test_mcp_jsonrpc_initialize():
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {}
    }
    response = client.post("/api/v1/mcp/rpc", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["jsonrpc"] == "2.0"
    assert data["id"] == 1
    assert "serverInfo" in data["result"]
    assert data["result"]["serverInfo"]["name"] == "alphiq-equity-mcp-server"

def test_mcp_jsonrpc_tools_list():
    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }
    response = client.post("/api/v1/mcp/rpc", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "tools" in data["result"]
    assert len(data["result"]["tools"]) >= 5

def test_mcp_jsonrpc_tools_call():
    payload = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "alphiq_stock_overview",
            "arguments": {"ticker": "TATAMOTORS"}
        }
    }
    response = client.post("/api/v1/mcp/rpc", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "content" in data["result"]
    assert data["result"]["isError"] is False
    text = data["result"]["content"][0]["text"]
    assert "TATAMOTORS" in text

def test_mcp_client_config():
    response = client.get("/api/v1/mcp/config")
    assert response.status_code == 200
    data = response.json()
    assert "claude_desktop" in data
    assert "mcpServers" in data["claude_desktop"]
