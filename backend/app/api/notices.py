import os
import shutil
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notice, User, NotificationRecord
from app.schemas import NoticeCreate, NoticeUpdate, FeedbackCreate
from app.core.config import settings
from app.core.auth import get_current_user, require_admin_user
from app.services.ocr_service import process_uploaded_document
from app.services.ai_service import analyze_notice_with_gemini
from app.services.notification_service import dispatch_early_warning_notifications

router = APIRouter(prefix="/notices", tags=["Notices"])

@router.get("")
def get_notices(
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Notice)
    if category and category != "All":
        query = query.filter(Notice.category == category)
    if urgency and urgency != "All":
        query = query.filter(Notice.urgency == urgency)
    if status and status != "All":
        query = query.filter(Notice.status == status)
    if search:
        search_f = f"%{search}%"
        query = query.filter(Notice.title.ilike(search_f) | Notice.summary.ilike(search_f))
        
    notices = query.order_by(Notice.created_at.desc()).limit(limit).all()
    
    # Filter location if provided
    if location and location != "All":
        filtered = []
        loc_low = location.lower()
        for n in notices:
            if n.locations and any(loc_low in str(l).lower() for l in n.locations):
                filtered.append(n)
        return filtered

    return notices

@router.get("/{id}")
def get_notice_by_id(id: str, db: Session = Depends(get_db)):
    notice = db.query(Notice).filter(Notice.id == id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    notice.views_count = (notice.views_count or 0) + 1
    db.commit()
    return notice

@router.post("/upload")
async def upload_notice_document(
    file: Optional[UploadFile] = File(None),
    manual_title: Optional[str] = Form(None),
    manual_text: Optional[str] = Form(None),
    authority: Optional[str] = Form(None),
    source_url: Optional[str] = Form(None),
    current_admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    saved_filename = ""
    extracted_text = ""
    file_type = "manual"
    
    if file and file.filename:
        saved_filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        doc_info = process_uploaded_document(file_path, file.filename)
        extracted_text = doc_info["extracted_text"]
        file_type = doc_info["file_type"]
    elif manual_text:
        extracted_text = manual_text.strip()
        file_type = "manual"
    else:
        raise HTTPException(status_code=400, detail="Must provide either an uploaded document or manual text")

    if not extracted_text:
        extracted_text = manual_text or f"Notice document: {file.filename if file else 'Uploaded document'}"
        
    # AI Engine Processing: Summarize, classify, detect urgency and deadlines, translate
    ai_result = await analyze_notice_with_gemini(extracted_text)
    
    notice = Notice(
        title=manual_title.strip() if manual_title and manual_title.strip() else ai_result.get("title", "Official Public Notice"),
        category=ai_result.get("category", "General Government Information"),
        urgency=ai_result.get("urgency", "LOW"),
        status="PENDING_REVIEW",  # Demands admin review for safety & reliability
        authority=authority.strip() if authority and authority.strip() else ai_result.get("authority", "Official Government Dept"),
        source_url=source_url.strip() if source_url and source_url.strip() else "https://telangana.gov.in/notifications",
        document_path=saved_filename,
        file_type=file_type,
        original_text=extracted_text,
        summary=ai_result.get("summary", ""),
        detailed_summary=ai_result.get("detailed_summary", ""),
        action_summary=ai_result.get("action_summary", ""),
        translations=ai_result.get("translations", {}),
        locations=ai_result.get("locations", ["Hyderabad"]),
        target_audience=ai_result.get("target_audience", "General Public"),
        start_date=ai_result.get("start_date"),
        deadline=ai_result.get("deadline"),
        contact_info=ai_result.get("notice_id"),
        confidence_score=ai_result.get("confidence_score", 0.95),
        requires_human_review=ai_result.get("requires_human_review", False),
        created_at=datetime.utcnow()
    )
    
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

@router.put("/{id}")
def update_notice(
    id: str, 
    updates: NoticeUpdate, 
    current_admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    notice = db.query(Notice).filter(Notice.id == id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    for field, val in updates.dict(exclude_unset=True).items():
        setattr(notice, field, val)
        
    db.commit()
    db.refresh(notice)
    return notice

@router.delete("/{id}")
def delete_notice(
    id: str, 
    current_admin: User = Depends(require_admin_user),
    db: Session = Depends(get_db)
):
    notice = db.query(Notice).filter(Notice.id == id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully"}
