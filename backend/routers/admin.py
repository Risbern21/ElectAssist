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

@router.delete("/candidates/{candidate_id}")
async def delete_candidate(
    candidate_id: str,
    admin_user: dict = Depends(verify_admin_status)
):
    """
    Secure endpoint allowing ONLY admins to delete candidates.
    """
    db = firestore.client()
    try:
        db.collection('candidates').document(candidate_id).delete()
        return {"status": "success", "message": "Candidate deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database delete failed: {str(e)}")

from typing import List
from schemas.video import VideoResponse, VideoModerateRequest

@router.get("/admin/videos/pending", response_model=List[VideoResponse])
async def get_pending_videos(admin_user: dict = Depends(verify_admin_status)):
    """
    Fetch all videos awaiting moderation.
    """
    db = firestore.client()
    videos_ref = db.collection('videos')
    try:
        docs = videos_ref.where('status', '==', 'pending').stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            results.append(VideoResponse(
                id=doc.id,
                candidate_id=data.get('candidate_id'),
                url=data.get('url'),
                status=data.get('status'),
                uploaded_by=data.get('uploaded_by')
            ))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")

@router.post("/admin/videos/{video_id}/moderate")
async def moderate_video(
    video_id: str,
    req: VideoModerateRequest,
    admin_user: dict = Depends(verify_admin_status)
):
    """
    Approve or reject a video. If approved, increments candidate's score.
    """
    db = firestore.client()
    video_ref = db.collection('videos').document(video_id)
    
    try:
        video_doc = video_ref.get()
        if not video_doc.exists:
            raise HTTPException(status_code=404, detail="Video not found")
            
        data = video_doc.to_dict()
        if data.get('status') != 'pending':
            raise HTTPException(status_code=400, detail="Video is not pending")
            
        new_status = "approved" if req.action == "approve" else "rejected"
        video_ref.update({"status": new_status})
        
        if new_status == "approved":
            candidate_id = data.get('candidate_id')
            candidate_ref = db.collection('candidates').document(candidate_id)
            candidate_ref.update({
                "score": firestore.Increment(10),
                "videoProofs": firestore.Increment(1)
            })
            
        return {"status": "success", "message": f"Video {new_status}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Moderation failed: {str(e)}")
