from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.notification_service import notification_service
from core.auth import verify_admin_status

class BroadcastRequest(BaseModel):
    ward: str
    title: str
    body: str

router = APIRouter(tags=["Notifications"])

@router.post("/notifications/broadcast")
async def broadcast_alert(
    request: BroadcastRequest,
    admin_user: dict = Depends(verify_admin_status)
):
    """
    Allows Admins to send push notifications to specific wards
    (e.g., "Polling booth changed for Ward 5").
    """
    success = await notification_service.broadcast_to_ward(
        ward=request.ward,
        message_title=request.title,
        message_body=request.body
    )
    
    if success:
        return {"status": "success", "message": f"Broadcast sent to {request.ward}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to broadcast notification")
