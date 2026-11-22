from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "citizen"
    phone: Optional[str] = None
    preferred_language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LocationPreference(BaseModel):
    state: str = "Telangana"
    district: str = "Hyderabad"
    city: str = "Hyderabad"
    locality: str

class NoticeBase(BaseModel):
    title: str
    category: str
    urgency: str = "LOW"
    authority: str
    source_url: Optional[str] = None
    original_text: Optional[str] = None
    summary: str
    detailed_summary: Optional[str] = None
    action_summary: Optional[str] = None
    translations: Optional[Dict[str, Any]] = None
    locations: Optional[List[str]] = []
    target_audience: Optional[str] = "General Public"
    start_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    deadline: Optional[str] = None
    contact_info: Optional[str] = None

class NoticeCreate(NoticeBase):
    pass

class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    authority: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    summary: Optional[str] = None
    detailed_summary: Optional[str] = None
    action_summary: Optional[str] = None
    locations: Optional[List[str]] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    contact_info: Optional[str] = None
    source_url: Optional[str] = None
    verification_notes: Optional[str] = None

class FeedbackCreate(BaseModel):
    notice_id: str
    feedback_type: str
    comments: str
    rating: Optional[float] = None

