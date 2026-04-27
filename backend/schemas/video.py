from pydantic import BaseModel
from typing import Optional

class VideoResponse(BaseModel):
    id: str
    candidate_id: str
    url: str
    status: str
    uploaded_by: str

class VideoModerateRequest(BaseModel):
    action: str  # "approve" or "reject"
