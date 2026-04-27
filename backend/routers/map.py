from fastapi import APIRouter, Depends, HTTPException
from typing import List
from firebase_admin import firestore
from schemas.map import PollingBoothCreate, PollingBoothResponse
from core.auth import verify_admin_status
import datetime

router = APIRouter(tags=["Map Polling Booths"])

@router.get("/map/booths", response_model=List[PollingBoothResponse])
async def get_booths():
    """
    Returns polling booths from Firestore.
    """
    db = firestore.client()
    booths_ref = db.collection('polling_booths')
    
    try:
        docs = booths_ref.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            results.append(PollingBoothResponse(
                id=doc.id,
                **data
            ))
        return results
    except Exception as e:
        print(f"Error fetching booths: {e}")
        return []

@router.post("/map/booths", response_model=PollingBoothResponse)
async def create_booth(
    booth: PollingBoothCreate,
    admin_user: dict = Depends(verify_admin_status)
):
    """
    Secure endpoint allowing ONLY admins to add new polling booths.
    """
    db = firestore.client()
    booths_ref = db.collection('polling_booths')
    
    doc_data = booth.dict()
    doc_data["created_at"] = datetime.datetime.now(datetime.timezone.utc)
    doc_data["created_by"] = admin_user.get("uid")
    
    try:
        doc_ref = booths_ref.document()
        doc_ref.set(doc_data)
        
        return PollingBoothResponse(
            id=doc_ref.id,
            **booth.dict()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write failed: {str(e)}")
