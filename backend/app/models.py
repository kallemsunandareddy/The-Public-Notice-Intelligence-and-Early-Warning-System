import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def gen_id():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_id)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="citizen") # 'admin', 'verifier', 'citizen'
    phone = Column(String(20), nullable=True)
    preferred_language = Column(String(10), default="en") # 'en', 'te', 'hi'
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    locations = relationship("UserLocation", back_populates="user", cascade="all, delete-orphan")
    saved_notices = relationship("SavedNotice", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("NotificationLog", back_populates="user", cascade="all, delete-orphan")


class UserLocation(Base):
    __tablename__ = "user_locations"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    state = Column(String(100), default="Telangana")
    district = Column(String(100), default="Hyderabad")
    city = Column(String(100), default="Hyderabad")
    locality = Column(String(100), nullable=False) # e.g. "Kukatpally", "Gachibowli"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="locations")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(String(36), primary_key=True, default=gen_id)
    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    urgency = Column(String(20), nullable=False, default="LOW", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), nullable=False, default="PENDING_REVIEW", index=True) # PENDING_REVIEW, VERIFIED, REJECTED, PUBLISHED, EXPIRED
    
    authority = Column(String(255), nullable=False)
    source_url = Column(String(1000), nullable=True)
    document_path = Column(String(1000), nullable=True)
    file_type = Column(String(50), nullable=True) # pdf, image, manual
    
    original_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=False)
    detailed_summary = Column(Text, nullable=True)
    action_summary = Column(Text, nullable=True)
    
    # Multilingual translations stored in JSON: {en: {...}, te: {...}, hi: {...}}
    translations = Column(JSON, nullable=True)
    
    # Extracted locations: e.g. ["Kukatpally", "Hyderabad"]
    locations = Column(JSON, nullable=True)
    target_audience = Column(String(255), default="General Public")
    
    start_date = Column(String(50), nullable=True)
    start_time = Column(String(50), nullable=True)
    end_time = Column(String(50), nullable=True)
    deadline = Column(String(100), nullable=True)
    contact_info = Column(String(255), nullable=True)
    
    confidence_score = Column(Float, default=0.9)
    requires_human_review = Column(Boolean, default=False)
    
    views_count = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    verified_by = Column(String(255), nullable=True)
    verification_notes = Column(Text, nullable=True)

    feedbacks = relationship("NoticeFeedback", back_populates="notice", cascade="all, delete-orphan")
    notifications = relationship("NotificationRecord", back_populates="notice", cascade="all, delete-orphan")


class SavedNotice(Base):
    __tablename__ = "saved_notices"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    notice_id = Column(String(36), ForeignKey("notices.id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_notices")
    notice = relationship("Notice")


class NotificationRecord(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=gen_id)
    notice_id = Column(String(36), ForeignKey("notices.id"), nullable=True)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    urgency = Column(String(20), default="LOW")
    channel = Column(String(50), default="WEB") # PUSH, WEB, EMAIL, SMS
    target_locations = Column(JSON, nullable=True)
    recipient_count = Column(Float, default=0)
    delivery_status = Column(String(50), default="DELIVERED") # DELIVERED, SENT, FAILED
    sent_at = Column(DateTime, default=datetime.utcnow)

    notice = relationship("Notice", back_populates="notifications")


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    notification_id = Column(String(36), ForeignKey("notifications.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    received_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    notification = relationship("NotificationRecord")


class NoticeFeedback(Base):
    __tablename__ = "notice_feedbacks"

    id = Column(String(36), primary_key=True, default=gen_id)
    notice_id = Column(String(36), ForeignKey("notices.id"), nullable=False)
    user_id = Column(String(36), nullable=True)
    feedback_type = Column(String(50), nullable=False) # REPORT_INCORRECT, CLARIFICATION, SUMMARY_RATING
    comments = Column(Text, nullable=False)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    notice = relationship("Notice", back_populates="feedbacks")

