"""
Alphiq Model Context Protocol (MCP) Server
Implements JSON-RPC 2.0 MCP specification (version 2024-11-05).
Supports both:
  1. Stdio transport (CLI mode for Claude Desktop, Antigravity IDE, Cursor)
  2. HTTP/SSE transport (FastAPI integration)
"""
import sys
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from app.mcp.tools import MCP_TOOLS, execute_mcp_tool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alphiq_mcp_server")

SERVER_INFO = {
    "name": "alphiq-equity-mcp-server",
    "version": "1.0.0"
}

PROTOCOL_VERSION = "2024-11-05"


async def handle_jsonrpc_request(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handles a single JSON-RPC 2.0 request compliant with MCP specification.
    """
    req_id = request.get("id")
    method = request.get("method", "")
    params = request.get("params", {})

    # 1. Initialize Handshake
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {
                    "tools": {"listChanged": False},
                    "resources": {"subscribe": False, "listChanged": False}
                },
                "serverInfo": SERVER_INFO
            }
        }

    # 2. Ping
    elif method == "ping":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {}
        }

    # 3. Tools Listing
    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": MCP_TOOLS
            }
        }

    # 4. Tools Call
    elif method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})

        if not tool_name:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32602,
                    "message": "Missing 'name' in tools/call params"
                }
            }

        tool_result = await execute_mcp_tool(tool_name, arguments)
        is_error = "error" in tool_result and len(tool_result) == 1

        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(tool_result, indent=2, ensure_ascii=False)
                    }
                ],
                "isError": is_error
            }
        }

    # 5. Resources Listing
    elif method == "resources/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "resources": [
                    {
                        "uri": "alphiq://platform/status",
                        "name": "Alphiq Platform Status",
                        "description": "Realtime operating metrics of Alphiq equity intelligence platform",
                        "mimeType": "application/json"
                    }
                ]
            }
        }

    # 6. Notifications / Initialized confirmation
    elif method == "notifications/initialized":
        return {}

    # Unknown Method
    else:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {
                "code": -32601,
                "message": f"Method '{method}' not found."
            }
        }


async def run_stdio_server():
    """
    Runs the MCP server over standard I/O (stdin/stdout).
    Used by Claude Desktop or command-line MCP clients.
    """
    logger.info("Starting Alphiq MCP Server in stdio mode...")
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    loop = asyncio.get_event_loop()
    await loop.connect_read_pipe(lambda: protocol, sys.stdin)

    while True:
        try:
            line = await reader.readline()
            if not line:
                break
            line_str = line.decode("utf-8").strip()
            if not line_str:
                continue

            req = json.loads(line_str)
            response = await handle_jsonrpc_request(req)
            if response:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
        except Exception as e:
            logger.error(f"Error in stdio loop: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(run_stdio_server())
