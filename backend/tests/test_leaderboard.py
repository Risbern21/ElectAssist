"""Tests for GET /api/candidates (leaderboard)"""
import pytest
from unittest.mock import MagicMock, patch
import datetime


def _make_fake_doc(doc_id: str, name: str, ward: str, score: int = 50):
    """Helper that mimics a Firestore document snapshot."""
    doc = MagicMock()
    doc.id = doc_id
    doc.to_dict.return_value = {
        "name": name,
        "party": "Test Party",
        "ward": ward,
        "image": None,
        "score": score,
        "verifiedWorks": 2,
        "videoProofs": 1,
        "created_at": datetime.datetime.now(datetime.timezone.utc),
    }
    return doc


@pytest.mark.anyio
async def test_leaderboard_returns_all_candidates(client, mock_firestore_client):
    """GET /api/candidates with no filter returns all candidates sorted by score."""
    fake_docs = [
        _make_fake_doc("id1", "Alice", "Ward 1", score=90),
        _make_fake_doc("id2", "Bob", "Ward 2", score=70),
    ]
    mock_query = MagicMock()
    mock_query.stream.return_value = iter(fake_docs)
    mock_firestore_client.collection.return_value.order_by.return_value = mock_query

    response = await client.get("/api/candidates")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Alice"


@pytest.mark.anyio
async def test_leaderboard_filters_by_ward(client, mock_firestore_client):
    """GET /api/candidates?ward=Ward+1 applies ward filter."""
    fake_docs = [_make_fake_doc("id1", "Alice", "Ward 1", score=90)]
    mock_query = MagicMock()
    mock_query.stream.return_value = iter(fake_docs)
    (mock_firestore_client.collection.return_value
     .where.return_value.order_by.return_value) = mock_query

    response = await client.get("/api/candidates?ward=Ward+1")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["ward"] == "Ward 1"


@pytest.mark.anyio
async def test_leaderboard_returns_empty_on_firestore_error(client, mock_firestore_client):
    """If Firestore raises, the endpoint gracefully returns an empty list."""
    mock_firestore_client.collection.return_value.order_by.side_effect = Exception("DB unavailable")

    response = await client.get("/api/candidates")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.anyio
async def test_leaderboard_all_ward_treated_as_no_filter(client, mock_firestore_client):
    """ward=All should behave the same as no ward filter."""
    fake_docs = [_make_fake_doc("id1", "Charlie", "Ward 3", score=60)]
    mock_query = MagicMock()
    mock_query.stream.return_value = iter(fake_docs)
    mock_firestore_client.collection.return_value.order_by.return_value = mock_query

    response = await client.get("/api/candidates?ward=All")

    assert response.status_code == 200
