import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.database import Base, engine
from app.api import auth, notices, admin, citizen, ai_alerts, documents
from seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

# Seed realistic demonstration dataset if first run
seed_database()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Smart Civic Information and Public Alert Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files safely
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(notices.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(citizen.router, prefix=settings.API_V1_STR)
app.include_router(ai_alerts.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": "1.0.0",
        "docs": "/docs",
        "api_prefix": settings.API_V1_STR
    }

@app.get("/api/health")
def health_check():
    return {"status": "HEALTHY", "ai_engine": "ACTIVE", "notification_gateway": "READY"}

