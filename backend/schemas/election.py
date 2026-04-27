from pydantic import BaseModel
from typing import Optional

class ElectionStageCreate(BaseModel):
    title: str
    date: str
    status: str
    description: str
    aiPrompt: Optional[str] = ""

class ElectionStageResponse(ElectionStageCreate):
    id: str
