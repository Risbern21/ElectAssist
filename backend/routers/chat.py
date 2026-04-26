from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from services.rag_service import rag_service

class ChatQuery(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str

router = APIRouter(tags=["Chatbot RAG"])

@router.post("/chat", response_model=ChatResponse)
async def process_chat(request: ChatQuery):
    """
    Takes a citizen query, augments it with live Firestore context,
    and returns a Gemini-generated answer.
    """
    try:
        answer = await rag_service.generate_response(request.query)
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG processing failed: {str(e)}")
