from fastapi import APIRouter, Depends, HTTPException
from typing import List
from firebase_admin import firestore
from schemas.election import ElectionStageCreate, ElectionStageResponse
from core.auth import verify_admin_status
import datetime

router = APIRouter(tags=["Elections Timeline"])

@router.get("/elections/timeline", response_model=List[ElectionStageResponse])
async def get_timeline():
    """
    Returns the current election cycle roadmap from Firestore.
    """
    db = firestore.client()
    stages_ref = db.collection('election_stages')
    
    try:
        docs = stages_ref.order_by('created_at').stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            results.append(ElectionStageResponse(
                id=doc.id,
                **data
            ))
        return results
    except Exception as e:
        # Fallback if collection doesn't exist or error occurs
        print(f"Error fetching timeline: {e}")
        return []

@router.post("/elections/timeline", response_model=ElectionStageResponse)
async def create_stage(
    stage: ElectionStageCreate,
    admin_user: dict = Depends(verify_admin_status)
):
    """
    Secure endpoint allowing ONLY admins to add new election stages.
    """
    db = firestore.client()
    stages_ref = db.collection('election_stages')
    
    doc_data = stage.dict()
    doc_data["created_at"] = datetime.datetime.now(datetime.timezone.utc)
    doc_data["created_by"] = admin_user.get("uid")
    
    try:
        doc_ref = stages_ref.document()
        doc_ref.set(doc_data)
        
        return ElectionStageResponse(
            id=doc_ref.id,
            **stage.dict()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write failed: {str(e)}")
