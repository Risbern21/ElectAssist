from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from core.auth import verify_firebase_token
from firebase_admin import firestore, storage
import uuid
import datetime

router = APIRouter(tags=["Video Proofs"])

@router.post("/videos/upload")
async def upload_proof(
    candidate_id: str = Form(...),
    file: UploadFile = File(...),
    user_token: dict = Depends(verify_firebase_token)
):
    """
    Accepts video proof uploads from authenticated citizens.
    Uploads to GCS and stores metadata in Firestore for moderation.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed")
        
    try:
        # Upload to Cloud Storage
        bucket = storage.bucket()
        unique_filename = f"videos/{uuid.uuid4()}_{file.filename}"
        blob = bucket.blob(unique_filename)
        
        # Read file contents and upload
        file_content = await file.read()
        blob.upload_from_string(file_content, content_type=file.content_type)
        blob.make_public()
        public_url = blob.public_url

        # Store metadata in Firestore
        db = firestore.client()
        videos_ref = db.collection('videos')
        
        doc_data = {
            "candidate_id": candidate_id,
            "url": public_url,
            "status": "pending",
            "uploaded_by": user_token.get("uid"),
            "created_at": datetime.datetime.now(datetime.timezone.utc)
        }
        
        doc_ref = videos_ref.document()
        doc_ref.set(doc_data)

        return {
            "status": "pending_moderation",
            "message": f"Video uploaded successfully. Sent to AI moderation queue.",
            "url": public_url,
            "id": doc_ref.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
