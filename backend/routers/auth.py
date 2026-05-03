from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth, firestore
from core.auth import verify_firebase_token
import datetime

router = APIRouter(tags=["Authentication"])

@router.post("/auth/sync")
async def sync_user_role(user_token: dict = Depends(verify_firebase_token)):
    """
    Syncs the user's role from Firestore to Firebase Auth Custom Claims.
    This ensures the role is 'saved in the authentication part' (the ID token).
    """
    uid = user_token.get("uid")
    email = user_token.get("email")
    
    db = firestore.client()
    user_ref = db.collection('users').document(uid)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        # Create default user profile in DB if it doesn't exist
        role = "user"
        user_ref.set({
            "uid": uid,
            "email": email,
            "role": role,
            "ward": "All",
            "created_at": datetime.datetime.now(datetime.timezone.utc),
            "last_login": datetime.datetime.now(datetime.timezone.utc)
        })
    else:
        # Use existing role from DB
        user_data = user_doc.to_dict()
        role = user_data.get("role", "user")
        user_ref.update({
            "last_login": datetime.datetime.now(datetime.timezone.utc)
        })

    try:
        # Set Custom Claims in Firebase Auth
        # This is what puts the role into the 'authentication part'
        auth.set_custom_user_claims(uid, {"role": role})
        
        return {
            "status": "success",
            "message": f"User synced. Role '{role}' saved to authentication claims.",
            "role": role,
            "ward": user_doc.to_dict().get("ward", "All") if user_doc.exists else "All"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set auth claims: {str(e)}")

from pydantic import BaseModel
class WardUpdate(BaseModel):
    ward: str

@router.put("/auth/ward")
async def update_user_ward(ward_data: WardUpdate, user_token: dict = Depends(verify_firebase_token)):
    uid = user_token.get("uid")
    db = firestore.client()
    user_ref = db.collection('users').document(uid)
    user_ref.update({"ward": ward_data.ward})
    return {"status": "success", "ward": ward_data.ward}


