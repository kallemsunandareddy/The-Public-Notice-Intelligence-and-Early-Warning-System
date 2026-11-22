import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Public Notice Intelligence and Early-Warning System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "civic-notice-intelligence-secret-key-prod-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # SQLite default for instant zero-dependency execution, PostgreSQL supported
    DATABASE_URL: str = "sqlite:///./civic_notices.db"
    
    # Gemini AI
    GEMINI_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Upload storage directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
