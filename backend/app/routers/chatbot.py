"""
LifeSync AI - Real-Time AI Chatbot & Assistant Router
Handles interactive user inquiries, platform explanations, personal score interpretation, and FAQ retrieval.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user_optional
from app.services.chatbot_service import process_chat_message, FAQ_LIST

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, examples=["What is my current wellness score?"])
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation turns")


class ChatMessageResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    context_used: bool = True
    engine: str = "offline_knowledge_engine"


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    payload: ChatMessageRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Process incoming user prompt using the Hybrid AI Engine:
    - Injects live user context (score, BMI, archetype, recommendations) if authenticated.
    - Uses Google Gemini or OpenAI if configured in .env.
    - Seamlessly falls back to local knowledge retrieval engine.
    """
    result = await process_chat_message(
        user_message=payload.message,
        history=payload.history,
        current_user=current_user,
        db_session=db,
    )
    return ChatMessageResponse(**result)


@router.get("/faq")
def get_chat_faqs():
    """Retrieve categorized FAQs about LifeSync AI services and capabilities."""
    return {"faqs": FAQ_LIST}
