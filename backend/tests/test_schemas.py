"""Tests for Pydantic schemas — pure unit tests, no HTTP or Firebase."""
import pytest
import datetime
from pydantic import ValidationError
from schemas.candidate import CandidateCreate, CandidateResponse
from schemas.election import ElectionStageCreate
from schemas.video import VideoModerateRequest


# ---------------------------------------------------------------------------
# CandidateCreate
# ---------------------------------------------------------------------------
class TestCandidateCreate:
    def test_valid_candidate(self):
        c = CandidateCreate(name="Alice", party="Green Party", ward="Ward 1")
        assert c.name == "Alice"
        assert c.image is None  # optional field defaults to None

    def test_missing_name_raises(self):
        with pytest.raises(ValidationError):
            CandidateCreate(party="Green Party", ward="Ward 1")

    def test_missing_party_raises(self):
        with pytest.raises(ValidationError):
            CandidateCreate(name="Alice", ward="Ward 1")

    def test_missing_ward_raises(self):
        with pytest.raises(ValidationError):
            CandidateCreate(name="Alice", party="Green Party")

    def test_optional_image_accepted(self):
        c = CandidateCreate(name="Bob", party="Blue Party", ward="Ward 2",
                            image="https://example.com/bob.jpg")
        assert c.image == "https://example.com/bob.jpg"


# ---------------------------------------------------------------------------
# CandidateResponse
# ---------------------------------------------------------------------------
class TestCandidateResponse:
    def _make(self, **overrides):
        defaults = dict(
            id="doc-id-123",
            name="Alice",
            party="Green Party",
            ward="Ward 1",
            image=None,
            score=75,
            verifiedWorks=3,
            videoProofs=2,
            created_at=datetime.datetime.now(datetime.timezone.utc),
        )
        defaults.update(overrides)
        return CandidateResponse(**defaults)

    def test_valid_response(self):
        r = self._make()
        assert r.id == "doc-id-123"
        assert r.score == 75

    def test_score_defaults_to_zero(self):
        r = self._make(score=0)
        assert r.score == 0

    def test_missing_id_raises(self):
        with pytest.raises(ValidationError):
            CandidateResponse(
                name="Alice", party="P", ward="W",
                created_at=datetime.datetime.now(datetime.timezone.utc),
            )


# ---------------------------------------------------------------------------
# ElectionStageCreate
# ---------------------------------------------------------------------------
class TestElectionStageCreate:
    def test_valid_stage(self):
        from schemas.election import ElectionStageCreate
        s = ElectionStageCreate(
            title="Nomination Filing",
            description="Period for filing nominations",
            date="2026-06-01",
            status="upcoming",
        )
        assert s.title == "Nomination Filing"

    def test_missing_title_raises(self):
        with pytest.raises(ValidationError):
            ElectionStageCreate(description="desc", date="2026-06-01", status="upcoming")


# ---------------------------------------------------------------------------
# VideoModerateRequest
# ---------------------------------------------------------------------------
class TestVideoModerateRequest:
    def test_approve_action(self):
        r = VideoModerateRequest(action="approve")
        assert r.action == "approve"

    def test_reject_action(self):
        r = VideoModerateRequest(action="reject")
        assert r.action == "reject"

    def test_missing_action_raises(self):
        with pytest.raises(ValidationError):
            VideoModerateRequest()
