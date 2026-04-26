from firebase_admin import firestore
import datetime

class LeaderboardService:
    def __init__(self):
        self.db = firestore.client()

    def _calculate_score(self, community_likes: int, video_proofs: int, verified_works: int) -> int:
        """
        Implements the Leaderboard Scoring Algorithm:
        - Community Like Score (40%)
        - Video Proof Score (40%)
        - Verified Work Count (20%)
        
        This is a simplified normalization assuming theoretical max bounds.
        In production, this would scale relative to the highest candidate.
        """
        # Example normalization bounds (these would be dynamic in production)
        MAX_LIKES = 1000
        MAX_VIDEOS = 50
        MAX_WORKS = 20

        # Calculate weighted percentages
        like_pct = min((community_likes / MAX_LIKES) * 100, 100) * 0.40
        video_pct = min((video_proofs / MAX_VIDEOS) * 100, 100) * 0.40
        work_pct = min((verified_works / MAX_WORKS) * 100, 100) * 0.20

        total_score = round(like_pct + video_pct + work_pct)
        return total_score

    async def recalculate_candidate_score(self, candidate_id: str):
        """
        Triggered when a new like, video proof, or work is verified.
        Recalculates the trust score and updates Firestore.
        """
        candidate_ref = self.db.collection('candidates').document(candidate_id)
        doc = candidate_ref.get()
        
        if not doc.exists:
            raise ValueError(f"Candidate {candidate_id} not found")
            
        data = doc.to_dict()
        
        # In a real app, 'community_likes' might be an aggregation query over a subcollection
        # For Phase 2, we assume the integer fields are updated directly.
        likes = data.get('community_likes', 0) 
        videos = data.get('videoProofs', 0)
        works = data.get('verifiedWorks', 0)
        
        new_score = self._calculate_score(likes, videos, works)
        
        candidate_ref.update({
            'score': new_score,
            'last_score_update': datetime.datetime.now(datetime.timezone.utc)
        })
        
        return new_score

leaderboard_service = LeaderboardService()
