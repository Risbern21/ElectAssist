from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, firestore

security = HTTPBearer()

def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifies the Firebase ID token and extracts user information."""
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_admin_status(user_token: dict = Depends(verify_firebase_token)):
    """
    Checks if the decoded token has administrative rights by explicitly
    verifying if their role in the 'users' Firestore collection is 'admin'.
    """
    uid = user_token.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User UID not found. Cannot verify admin status."
        )
        
    db = firestore.client()
    user_doc = db.collection('users').document(uid).get()
    
    if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied. You do not have administrator privileges."
        )
        
    return user_token
