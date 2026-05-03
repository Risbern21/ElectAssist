"""Tests for GET /api/elections/timeline and POST /api/elections/timeline"""
import pytest
from unittest.mock import MagicMock, patch
import datetime


from main import app
from core.auth import verify_firebase_token

def _make_stage_doc(doc_id: str, title: str):
    doc = MagicMock()
    doc.id = doc_id
    doc.to_dict.return_value = {
        "title": title,
        "description": "Some description",
        "date": "2026-06-01",
        "status": "upcoming",
        "created_at": datetime.datetime.now(datetime.timezone.utc),
    }
    return doc

@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[verify_firebase_token] = lambda: {"uid": "test-uid", "email": "test@test.com"}
    yield
    # Only clear if it's verify_firebase_token to not mess up other tests that override it locally
    if verify_firebase_token in app.dependency_overrides:
        del app.dependency_overrides[verify_firebase_token]

@pytest.mark.anyio
async def test_get_timeline_returns_stages(client, mock_firestore_client):
    """GET /api/elections/timeline returns a list of stages."""
    fake_docs = [
        _make_stage_doc("s1", "Nomination Filing"),
        _make_stage_doc("s2", "Campaigning Period"),
    ]
    mock_query = MagicMock()
    mock_query.stream.return_value = iter(fake_docs)
    mock_firestore_client.collection.return_value.order_by.return_value = mock_query

    response = await client.get("/api/elections/timeline")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Nomination Filing"


@pytest.mark.anyio
async def test_get_timeline_returns_empty_on_error(client, mock_firestore_client):
    """GET /api/elections/timeline returns [] if Firestore fails."""
    mock_firestore_client.collection.return_value.order_by.side_effect = Exception("DB error")

    response = await client.get("/api/elections/timeline")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.anyio
async def test_create_stage_without_auth_returns_401(client):
    """POST /api/elections/timeline without a valid token → 401."""
    app.dependency_overrides.clear()
    payload = {
        "title": "Polling Day",
        "description": "Final voting day",
        "date": "2026-09-15",
        "status": "upcoming",
    }
    response = await client.post("/api/elections/timeline", json=payload)
    assert response.status_code == 401


@pytest.mark.anyio
async def test_create_stage_with_admin_token(client, mock_firestore_client):
    """POST /api/elections/timeline with valid admin token → 200."""
    from core.auth import verify_admin_status
    from main import app

    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new-stage-id"
    mock_firestore_client.collection.return_value.document.return_value = mock_doc_ref

    admin_payload = {"uid": "admin-uid", "email": "admin@elect.com", "role": "admin"}

    app.dependency_overrides[verify_admin_status] = lambda: admin_payload
    try:
        payload = {
            "title": "Polling Day",
            "description": "Final voting day",
            "date": "2026-09-15",
            "status": "upcoming",
        }
        response = await client.post("/api/elections/timeline", json=payload)
        assert response.status_code == 200
        assert response.json()["title"] == "Polling Day"
    finally:
        app.dependency_overrides.clear()
