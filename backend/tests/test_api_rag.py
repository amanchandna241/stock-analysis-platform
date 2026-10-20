import pytest
import io
from pypdf import PdfWriter

def test_rag_query_reliance(client):
    payload = {"ticker": "RELIANCE", "query": "What is the green energy capital expenditure strategy?"}
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "answer" in data
    assert "citations" in data
    assert len(data["citations"]) > 0
    assert "confidence_score" in data
    assert data["confidence_score"] > 0

def test_rag_query_tatamotors(client):
    payload = {"ticker": "TATAMOTORS", "query": "What is JLR free cash flow and EV roadmap?"}
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "TATAMOTORS"
    assert any("JLR" in c["content_snippet"] or "Jaguar" in c["content_snippet"] for c in data["citations"])

def test_get_rag_documents(client):
    response = client.get("/api/v1/rag/TCS/documents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_rag_stats(client):
    response = client.get("/api/v1/rag/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["total_chunks"] > 0
    assert data["total_documents"] > 0
    assert data["vocabulary_features"] > 0

def test_upload_rag_text_document(client):
    file_content = b"Tata Motors inaugurated a new manufacturing line in Sanand targeting 300,000 EVs per annum."
    files = {"file": ("tatamotors_press.txt", io.BytesIO(file_content), "text/plain")}
    data = {"ticker": "TATAMOTORS", "doc_type": "Corporate Filing", "year": "2024"}
    response = client.post("/api/v1/rag/upload", data=data, files=files)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["ticker"] == "TATAMOTORS"
    assert res_data["chunks_indexed"] >= 1

def test_upload_rag_pdf_document(client):
    # Create valid in-memory PDF using pypdf
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_buffer.seek(0)

    files = {"file": ("test_report.pdf", pdf_buffer, "application/pdf")}
    data = {"ticker": "INFY", "doc_type": "Annual Report", "year": "2024"}
    response = client.post("/api/v1/rag/upload", data=data, files=files)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["ticker"] == "INFY"

def test_mcp_rag_tool_execution(client):
    payload = {
        "ticker": "TATAMOTORS",
        "query": "What is the semiconductor fab capex?"
    }
    response = client.post("/api/v1/mcp/tools/alphiq_rag_search/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tool_name"] == "alphiq_rag_search"
    assert "citations" in data["result"]
    assert len(data["result"]["citations"]) > 0
