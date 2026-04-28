"""Tests for POST /api/videos/upload"""
import pytest
from unittest.mock import MagicMock, patch
import io
from core.auth import verify_firebase_token
from main import app


@pytest.mark.anyio
async def test_upload_non_video_file_returns_400(client):
    """Uploading a non-video file (e.g. PDF) should return 400."""
    user_payload = {"uid": "user-uid", "email": "user@elect.com", "role": "user"}
    app.dependency_overrides[verify_firebase_token] = lambda: user_payload
    try:
        response = await client.post(
            "/api/videos/upload",
            data={"candidate_id": "cand-1"},
            files={"file": ("resume.pdf", io.BytesIO(b"fake pdf content"), "application/pdf")},
        )
        assert response.status_code == 400
        assert "video" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.anyio
async def test_upload_without_auth_returns_401(client):
    """Uploading without a valid auth token → 401."""
    response = await client.post(
        "/api/videos/upload",
        data={"candidate_id": "cand-1"},
        files={"file": ("video.mp4", io.BytesIO(b"fake video"), "video/mp4")},
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_upload_valid_video_returns_pending(client, mock_firestore_client):
    """A valid video upload with auth → 200 with pending_moderation status."""
    user_payload = {"uid": "user-uid", "email": "user@elect.com", "role": "user"}
    app.dependency_overrides[verify_firebase_token] = lambda: user_payload

    mock_blob = MagicMock()
    mock_blob.public_url = "https://storage.googleapis.com/bucket/video.mp4"
    mock_bucket = MagicMock()
    mock_bucket.blob.return_value = mock_blob

    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "video-doc-id"
    mock_firestore_client.collection.return_value.document.return_value = mock_doc_ref

    try:
        with patch("firebase_admin.storage.bucket", return_value=mock_bucket):
            response = await client.post(
                "/api/videos/upload",
                data={"candidate_id": "cand-1"},
                files={"file": ("proof.mp4", io.BytesIO(b"fake video bytes"), "video/mp4")},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending_moderation"
        assert "url" in data
        assert "id" in data
    finally:
        app.dependency_overrides.clear()
