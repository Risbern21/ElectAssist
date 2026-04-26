import os
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class CandidateBase(BaseModel):
    name: str = Field(..., description="Full name of the candidate")
    party: str = Field(..., description="Political party affiliation")
    ward: str = Field(..., description="Constituency or ward they are contesting from")
    image: Optional[str] = Field(None, description="URL to the candidate's profile image")

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: str = Field(..., description="Firestore document ID")
    score: int = Field(0, description="Calculated trust score")
    verifiedWorks: int = Field(0, description="Number of verified public works")
    videoProofs: int = Field(0, description="Number of uploaded video proofs")
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
