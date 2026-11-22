from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Notice, User, UserLocation, SavedNotice, NotificationLog, NotificationRecord, NoticeFeedback
from app.schemas import FeedbackCreate, LocationPreference

router = APIRouter(prefix="/citizen", tags=["Citizen Portal"])

@router.get("/dashboard")
def get_citizen_dashboard(locality: Optional[str] = None, language: str = "en", db: Session = Depends(get_db)):
    """Fetch personalized feed: emergency alerts, local notices, upcoming deadlines."""
    all_published = db.query(Notice).filter(Notice.status == "PUBLISHED").order_by(Notice.created_at.desc()).all()
    
    # 1. Critical Emergency Alerts
    emergency_alerts = [n for n in all_published if n.urgency == "CRITICAL"]
    
    # 2. Location-matched Notices
    local_notices = []
    if locality and locality != "All":
        loc_l = locality.lower()
        local_notices = [n for n in all_published if n.locations and any(loc_l in str(l).lower() for l in n.locations)]
    else:
        local_notices = all_published[:6]
        
    # 3. Upcoming Deadlines
    deadlines = [n for n in all_published if n.deadline is not None][:5]

    return {
        "emergency_alerts": emergency_alerts,
        "local_notices": local_notices,
        "latest_notices": all_published[:12],
        "upcoming_deadlines": deadlines,
        "active_locality": locality or "Hyderabad"
    }

@router.get("/notifications")
def get_citizen_notifications(db: Session = Depends(get_db)):
    """Retrieve notifications sent to citizens."""
    records = db.query(NotificationRecord).order_by(NotificationRecord.sent_at.desc()).limit(30).all()
    return records

@router.post("/locations")
def add_user_location(pref: LocationPreference, db: Session = Depends(get_db)):
    # Default to first citizen demo user
    user = db.query(User).filter(User.role == "citizen").first()
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    loc = UserLocation(
        user_id=user.id,
        state=pref.state,
        district=pref.district,
        city=pref.city,
        locality=pref.locality
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return {"message": "Location saved successfully", "locality": loc.locality}

@router.get("/locations")
def get_user_locations(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "citizen").first()
    if not user:
        return []
    return db.query(UserLocation).filter(UserLocation.user_id == user.id).all()

@router.post("/saved-notices/{notice_id}")
def toggle_save_notice(notice_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "citizen").first()
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    existing = db.query(SavedNotice).filter(SavedNotice.user_id == user.id, SavedNotice.notice_id == notice_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Notice removed from bookmarks"}
        
    saved = SavedNotice(user_id=user.id, notice_id=notice_id)
    db.add(saved)
    db.commit()
    return {"saved": True, "message": "Notice saved to bookmarks"}

@router.get("/saved-notices")
def get_saved_notices(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == "citizen").first()
    if not user:
        return []
    saved = db.query(SavedNotice).filter(SavedNotice.user_id == user.id).all()
    notice_ids = [s.notice_id for s in saved]
    return db.query(Notice).filter(Notice.id.in_(notice_ids)).all()

@router.post("/feedback")
def submit_feedback(fb: FeedbackCreate, db: Session = Depends(get_db)):
    feedback_entry = NoticeFeedback(
        notice_id=fb.notice_id,
        feedback_type=fb.feedback_type,
        comments=fb.comments,
        rating=fb.rating
    )
    db.add(feedback_entry)
    db.commit()
    return {"message": "Thank you! Your feedback helps keep civic notices accurate and accessible."}

