from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import os
import shutil
from datetime import datetime
from app.core.config import settings
from app.services.ocr_service import process_uploaded_document
from app.core.auth import require_admin_user
from app.models import User

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/extract-text")
async def extract_text_from_file(
    file: UploadFile = File(...),
    current_admin: User = Depends(require_admin_user)
):
    """Extracts raw text from an uploaded PDF or image file on demand."""
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    saved_filename = f"extract_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        doc_info = process_uploaded_document(file_path, file.filename)
        return {
            "filename": file.filename,
            "file_type": doc_info["file_type"],
            "extracted_text": doc_info["extracted_text"],
            "char_count": doc_info["char_count"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
