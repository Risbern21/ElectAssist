import datetime
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from schemas.candidate import CandidateCreate, CandidateResponse
from core.auth import verify_admin_status

router = APIRouter(tags=["Admin"])

@router.get("/admin/verify")
async def check_admin_status(admin_user: dict = Depends(verify_admin_status)):
    """
    Returns true if the token belongs to a verified admin.
    """
    return {"isAdmin": True, "uid": admin_user.get("uid")}

@router.post("/candidates", response_model=CandidateResponse)
async def create_candidate(
    candidate: CandidateCreate,
    admin_user: dict = Depends(verify_admin_status)
):
    """
    Secure endpoint allowing ONLY admins to add new candidates to the system.
    """
    db = firestore.client()
    candidates_ref = db.collection('candidates')
    
    # Firestore document definition
    doc_data = {
        "name": candidate.name,
        "party": candidate.party,
        "ward": candidate.ward,
        "image": candidate.image,
        "score": 0,
        "verifiedWorks": 0,
        "videoProofs": 0,
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "created_by": admin_user.get("uid")
    }
    
    try:
        # Add a new document with an auto-generated ID
        doc_ref = candidates_ref.document()
        doc_ref.set(doc_data)
        
        # Return the response block
        response_model = CandidateResponse(
            id=doc_ref.id,
            **doc_data
        )
        return response_model
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write failed: {str(e)}")
