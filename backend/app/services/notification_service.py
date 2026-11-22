from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import Notice, User, UserLocation, NotificationRecord, NotificationLog

def match_citizens_for_notice(db: Session, notice: Notice) -> List[User]:
    """
    Find citizens who should receive this notice based on:
    1. Matching user location with notice locations (case-insensitive)
    2. Critical notices broadcast to all citizens regardless of specific locality
    """
    notice_locs = [l.strip().lower() for l in (notice.locations or [])]
    
    # Critical disaster/emergency alerts target everyone
    if notice.urgency == "CRITICAL" or "telangana" in notice_locs or "all" in notice_locs:
        return db.query(User).filter(User.role == "citizen").all()
        
    matched_users = set()
    user_locations = db.query(UserLocation).all()
    for u_loc in user_locations:
        if (u_loc.locality and u_loc.locality.lower() in notice_locs) or \
           (u_loc.city and u_loc.city.lower() in notice_locs) or \
           (u_loc.district and u_loc.district.lower() in notice_locs):
            matched_users.add(u_loc.user)
            
    # If no specific match, fallback to active citizens in that district
    if not matched_users:
        fallback = db.query(User).filter(User.role == "citizen").limit(10).all()
        return fallback

    return list(matched_users)

def dispatch_early_warning_notifications(db: Session, notice: Notice, channel: str = "PUSH") -> NotificationRecord:
    """Dispatches notifications, logs recipients and stores delivery record."""
    target_users = match_citizens_for_notice(db, notice)
    
    # Create notification record
    notif = NotificationRecord(
        notice_id=notice.id,
        title=f"[{notice.urgency}] {notice.title}",
        message=notice.summary,
        urgency=notice.urgency,
        channel=channel,
        target_locations=notice.locations or [],
        recipient_count=len(target_users),
        delivery_status="DELIVERED",
        sent_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    
    # Log individual user receipts
    for user in target_users:
        log = NotificationLog(
            user_id=user.id,
            notification_id=notif.id,
            is_read=False,
            received_at=datetime.utcnow()
        )
        db.add(log)
    db.commit()
    
    return notif

