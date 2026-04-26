from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from firebase_admin import firestore
from schemas.candidate import CandidateResponse

router = APIRouter(tags=["Leaderboard"])

@router.get("/candidates", response_model=List[CandidateResponse])
async def get_leaderboard(ward: Optional[str] = None):
    """
    Public endpoint to fetch candidates, sorted by their trust score.
    Optionally filter by ward.
    """
    db = firestore.client()
    candidates_ref = db.collection('candidates')

    try:
        # If a specific ward is requested, query by it
        if ward and ward != 'All':
            query = candidates_ref.where('ward', '==', ward).order_by('score', direction=firestore.Query.DESCENDING)
        else:
            query = candidates_ref.order_by('score', direction=firestore.Query.DESCENDING)
            
        docs = query.stream()
        
        candidates = []
        for doc in docs:
            doc_dict = doc.to_dict()
            candidates.append(CandidateResponse(id=doc.id, **doc_dict))
            
        return candidates
    except Exception as e:
        print(f"Firestore Error: {e}")
        # In a real app we might raise 500, but returning empty array allows UI to handle gracefully
        # during initial DB setup scenarios.
        return []
