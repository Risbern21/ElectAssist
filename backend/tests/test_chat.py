"""Tests for POST /api/chat"""
import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.anyio
async def test_chat_returns_answer(client):
    """A valid query should return a 200 with an 'answer' field."""
    with patch(
        "services.rag_service.rag_service.generate_response",
        new_callable=AsyncMock,
        return_value="Candidate A has a trust score of 92%.",
    ):
        response = await client.post("/api/chat", json={"query": "Who is Candidate A?"})

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["answer"]) > 0


@pytest.mark.anyio
async def test_chat_empty_query_returns_answer(client):
    """Even an empty query should be forwarded to the RAG service (validation is upstream)."""
    with patch(
        "services.rag_service.rag_service.generate_response",
        new_callable=AsyncMock,
        return_value="Please provide a more specific question.",
    ):
        response = await client.post("/api/chat", json={"query": ""})

    assert response.status_code == 200


@pytest.mark.anyio
async def test_chat_service_error_returns_500(client):
    """If the RAG service raises, the endpoint should return HTTP 500."""
    with patch(
        "services.rag_service.rag_service.generate_response",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Vertex AI unreachable"),
    ):
        response = await client.post("/api/chat", json={"query": "Tell me about elections."})

    assert response.status_code == 500
    assert "RAG processing failed" in response.json()["detail"]


@pytest.mark.anyio
async def test_chat_missing_query_field_returns_422(client):
    """A request body without 'query' should fail schema validation."""
    response = await client.post("/api/chat", json={})
    assert response.status_code == 422
