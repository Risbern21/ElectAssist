from pydantic import BaseModel

class PollingBoothCreate(BaseModel):
    name: str
    lat: float
    lng: float

class PollingBoothResponse(PollingBoothCreate):
    id: str
