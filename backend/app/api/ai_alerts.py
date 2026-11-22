from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notice, NotificationRecord
from app.services.ai_service import analyze_notice_with_gemini, analyze_notice_with_rules_nlp
from app.services.notification_service import dispatch_early_warning_notifications
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(tags=["AI Intelligence & Early Warnings"])

class AIExtractRequest(BaseModel):
    text: str

class AlertGenerateRequest(BaseModel):
    notice_id: str
    channel: Optional[str] = "PUSH"

@router.post("/ai/extract")
async def ai_extract_notice(req: AIExtractRequest):
    """Extracts structured entities, categories, deadlines, and multilingual summaries."""
    return await analyze_notice_with_gemini(req.text)

@router.post("/ai/summarize")
def ai_summarize_notice(req: AIExtractRequest):
    result = analyze_notice_with_rules_nlp(req.text)
    return {
        "short_summary": result["summary"],
        "detailed_summary": result["detailed_summary"],
        "action_summary": result["action_summary"]
    }

@router.post("/ai/classify")
def ai_classify_notice(req: AIExtractRequest):
    result = analyze_notice_with_rules_nlp(req.text)
    return {
        "category": result["category"],
        "urgency": result["urgency"],
        "confidence": result["confidence_score"]
    }

@router.post("/ai/translate")
def ai_translate_notice(req: AIExtractRequest):
    result = analyze_notice_with_rules_nlp(req.text)
    return result["translations"]

@router.post("/alerts/generate")
def trigger_alert_generation(req: AlertGenerateRequest, db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == req.notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    record = dispatch_early_warning_notifications(db, notice, channel=req.channel or "PUSH")
    return {
        "status": "DISPATCHED",
        "notification_id": record.id,
        "title": record.title,
        "recipient_count": record.recipient_count,
        "urgency": record.urgency
    }

@router.get("/alerts")
def list_alerts(db: Session = Depends(get_db)):
    return db.query(NotificationRecord).order_by(NotificationRecord.sent_at.desc()).all()

@router.get("/analytics/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    return {
        "notices_today": 8,
        "active_citizens_reached": 14250,
        "average_ai_confidence": 0.95,
        "urgent_warnings_active": 3
    }

