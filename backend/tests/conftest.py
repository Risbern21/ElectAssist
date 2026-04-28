"""
Shared pytest fixtures for ElectAssist backend tests.

All Firebase Admin SDK, Firestore, and Vertex AI calls are patched at the
module level so tests run without any real cloud credentials.
"""
import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient, ASGITransport


# ---------------------------------------------------------------------------
# Patch Firebase Admin SDK before the app is imported
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True, scope="session")
def patch_firebase():
    """Prevent firebase_admin.initialize_app() from running during tests."""
    with patch("firebase_admin.initialize_app"), \
         patch("firebase_admin._apps", {}):
        yield


# ---------------------------------------------------------------------------
# Provide a fully-patched FastAPI test client
# ---------------------------------------------------------------------------
@pytest.fixture()
def mock_firestore_client():
    """Return a fresh MagicMock per test — avoids side_effect bleed between tests."""
    return MagicMock()


@pytest.fixture()
async def client(mock_firestore_client):
    """
    Async httpx client wired to the FastAPI app.
    Patches:
      - firebase_admin.firestore.client  → MagicMock
      - firebase_admin.auth             → MagicMock
      - services.rag_service.RAGService → avoids Vertex AI init
    """
    with patch("firebase_admin.firestore.client", return_value=mock_firestore_client), \
         patch("firebase_admin.auth"), \
         patch("services.rag_service.vertexai"), \
         patch("services.rag_service.GenerativeModel"):

        # Import app AFTER patches are in place
        from main import app  # noqa: PLC0415

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac


# ---------------------------------------------------------------------------
# Helper: build a fake Firebase token payload
# ---------------------------------------------------------------------------
def make_token_payload(uid: str = "test-uid", email: str = "test@example.com",
                       role: str = "user") -> dict:
    return {"uid": uid, "email": email, "role": role}


@pytest.fixture()
def admin_token():
    return make_token_payload(role="admin")


@pytest.fixture()
def user_token():
    return make_token_payload(role="user")
