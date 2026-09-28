import pytest
import io

def test_rag_query(client):
    payload = {"ticker": "RELIANCE", "query": "What is the revenue growth strategy?"}
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "RELIANCE"
    assert "answer" in data
    assert "citations" in data

def test_get_rag_documents(client):
    response = client.get("/api/v1/rag/TCS/documents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_upload_rag_document(client):
    file_content = b"Sample annual report text for RELIANCE FY24 expansion."
    files = {"file": ("reliance_fy24.txt", io.BytesIO(file_content), "text/plain")}
    data = {"ticker": "RELIANCE", "doc_type": "Annual Report"}
    response = client.post("/api/v1/rag/upload", data=data, files=files)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["ticker"] == "RELIANCE"
