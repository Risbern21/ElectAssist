"""Tests for admin endpoints: /api/admin/* and /api/candidates (admin CRUD)"""
import pytest
from unittest.mock import MagicMock
import datetime
from core.auth import verify_admin_status, verify_firebase_token
from main import app


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
ADMIN_PAYLOAD = {"uid": "admin-uid", "email": "admin@elect.com", "role": "admin"}


def _override_admin():
    app.dependency_overrides[verify_admin_status] = lambda: ADMIN_PAYLOAD


def _clear():
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# GET /api/admin/verify
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_admin_verify_without_auth_returns_401(client):
    response = await client.get("/api/admin/verify")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_admin_verify_with_admin_token(client):
    _override_admin()
    try:
        response = await client.get("/api/admin/verify")
        assert response.status_code == 200
        assert response.json()["isAdmin"] is True
    finally:
        _clear()


# ---------------------------------------------------------------------------
# POST /api/candidates  (admin-only creation)
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_create_candidate_without_auth_returns_401(client):
    payload = {"name": "Test User", "party": "Test Party", "ward": "Ward 1"}
    response = await client.post("/api/candidates", json=payload)
    assert response.status_code == 401


@pytest.mark.anyio
async def test_create_candidate_with_admin_token(client, mock_firestore_client):
    _override_admin()
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "new-cand-id"
    mock_firestore_client.collection.return_value.document.return_value = mock_doc_ref
    try:
        payload = {"name": "Alice", "party": "Green Party", "ward": "Ward 2"}
        response = await client.post("/api/candidates", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Alice"
        assert data["id"] == "new-cand-id"
    finally:
        _clear()


@pytest.mark.anyio
async def test_create_candidate_missing_required_fields_returns_422(client):
    _override_admin()
    try:
        response = await client.post("/api/candidates", json={"name": "Incomplete"})
        assert response.status_code == 422
    finally:
        _clear()


# ---------------------------------------------------------------------------
# DELETE /api/candidates/{id}
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_delete_candidate_without_auth_returns_401(client):
    response = await client.delete("/api/candidates/some-id")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_delete_candidate_with_admin_token(client, mock_firestore_client):
    _override_admin()
    try:
        response = await client.delete("/api/candidates/some-id")
        assert response.status_code == 200
        assert response.json()["status"] == "success"
    finally:
        _clear()


# ---------------------------------------------------------------------------
# POST /api/admin/videos/{id}/moderate
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_moderate_video_not_found_returns_404(client, mock_firestore_client):
    _override_admin()
    mock_video_doc = MagicMock()
    mock_video_doc.exists = False
    mock_firestore_client.collection.return_value.document.return_value.get.return_value = (
        mock_video_doc
    )
    try:
        response = await client.post(
            "/api/admin/videos/missing-id/moderate",
            json={"action": "approve"},
        )
        assert response.status_code == 404
    finally:
        _clear()


@pytest.mark.anyio
async def test_moderate_video_not_pending_returns_400(client, mock_firestore_client):
    _override_admin()
    mock_video_doc = MagicMock()
    mock_video_doc.exists = True
    mock_video_doc.to_dict.return_value = {"status": "approved", "candidate_id": "cand-1"}
    mock_firestore_client.collection.return_value.document.return_value.get.return_value = (
        mock_video_doc
    )
    try:
        response = await client.post(
            "/api/admin/videos/some-id/moderate",
            json={"action": "approve"},
        )
        assert response.status_code == 400
    finally:
        _clear()


@pytest.mark.anyio
async def test_moderate_video_approve_updates_candidate(client, mock_firestore_client):
    _override_admin()
    mock_video_doc = MagicMock()
    mock_video_doc.exists = True
    mock_video_doc.to_dict.return_value = {"status": "pending", "candidate_id": "cand-1"}
    mock_firestore_client.collection.return_value.document.return_value.get.return_value = (
        mock_video_doc
    )
    try:
        response = await client.post(
            "/api/admin/videos/some-id/moderate",
            json={"action": "approve"},
        )
        assert response.status_code == 200
        assert "approved" in response.json()["message"]
    finally:
        _clear()
