from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from core.auth import verify_firebase_token

router = APIRouter(tags=["Video Proofs"])

@router.post("/videos/upload")
async def upload_proof(
    candidate_id: str,
    file: UploadFile = File(...),
    user_token: dict = Depends(verify_firebase_token)
):
    """
    Accepts video proof uploads from authenticated citizens.
    In production, this uploads to GCS and triggers the Video Intelligence API.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed")
        
    # Placeholder for Phase 2 GCS upload logic
    return {
        "status": "pending_moderation",
        "message": f"Video received. Sent to AI moderation queue for candidate {candidate_id}.",
        "uploaded_by": user_token.get("uid")
    }
