"""
FastAPI Endpoints for Alphiq Model Context Protocol (MCP) Integration
Supports standard JSON-RPC 2.0 requests over HTTP and REST discovery.
"""
import os
import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Request, Body
from app.mcp.tools import MCP_TOOLS, execute_mcp_tool
from app.mcp.server import handle_jsonrpc_request

router = APIRouter(prefix="/mcp", tags=["Model Context Protocol (MCP)"])


@router.post("/rpc")
async def mcp_jsonrpc_handler(request: Request):
    """
    Standard Model Context Protocol (MCP) JSON-RPC 2.0 endpoint.
    Compatible with external agent frameworks, web clients, and MCP inspectors.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    response = await handle_jsonrpc_request(body)
    return response


@router.get("/tools")
def get_mcp_tools():
    """
    Returns the list of registered Alphiq MCP tools and their full JSON Schema definitions.
    """
    return {
        "server": "Alphiq Equity Research MCP Server",
        "protocol_version": "2024-11-05",
        "tool_count": len(MCP_TOOLS),
        "tools": MCP_TOOLS
    }


@router.post("/tools/{tool_name}/execute")
async def execute_tool_endpoint(tool_name: str, arguments: Dict[str, Any] = Body(...)):
    """
    Directly executes an Alphiq MCP tool with the supplied arguments.
    Useful for interactive testing and debugging from the frontend sandbox.
    """
    # Check if tool exists
    tool_exists = any(t["name"] == tool_name for t in MCP_TOOLS)
    if not tool_exists:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found in MCP registry.")

    result = await execute_mcp_tool(tool_name, arguments)
    return {
        "tool_name": tool_name,
        "arguments": arguments,
        "result": result
    }


@router.get("/config")
def get_mcp_client_config():
    """
    Returns copy-paste configuration snippets for integrating Alphiq MCP Server
    with Claude Desktop, Antigravity IDE, Cursor, and custom Python agents.
    """
    cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    python_path = os.path.join(cwd, "venv", "Scripts", "python.exe")
    server_path = os.path.join(cwd, "app", "mcp", "server.py")

    claude_desktop_snippet = {
        "mcpServers": {
            "alphiq": {
                "command": python_path,
                "args": [server_path]
            }
        }
    }

    http_rpc_snippet = {
        "mcpServers": {
            "alphiq-http": {
                "url": "http://127.0.0.1:8000/api/v1/mcp/rpc",
                "transport": "http-jsonrpc"
            }
        }
    }

    return {
        "claude_desktop": claude_desktop_snippet,
        "http_jsonrpc": http_rpc_snippet,
        "python_command": python_path,
        "server_script": server_path,
        "documentation": "Add this snippet to %APPDATA%/Claude/claude_desktop_config.json to enable Alphiq tools in Claude Desktop."
    }
