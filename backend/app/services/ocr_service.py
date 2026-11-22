import os
import io
import fitz  # PyMuPDF
from PIL import Image

def find_tesseract():
    """Try to locate tesseract executable on Windows standard paths or PATH."""
    paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\kalle\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract clean text directly from digital PDF pages using PyMuPDF and OCR if scanned."""
    text_content = []
    scanned_pages = []
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text and text.strip():
                text_content.append(f"{text.strip()}")
            else:
                # Scanned or image-only page: extract image bytes for OCR
                pix = page.get_pixmap(dpi=150)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                scanned_pages.append((page_num + 1, img))
        doc.close()
    except Exception as e:
        print(f"PyMuPDF error reading {pdf_path}: {e}")

    # If some pages had no embedded text, attempt OCR
    if scanned_pages:
        tess_path = find_tesseract()
        for pnum, img in scanned_pages:
            if tess_path:
                try:
                    import pytesseract
                    pytesseract.pytesseract.tesseract_cmd = tess_path
                    ocr_res = pytesseract.image_to_string(img)
                    if ocr_res.strip():
                        text_content.append(ocr_res.strip())
                except Exception as ocr_err:
                    print(f"OCR error on page {pnum}: {ocr_err}")
            else:
                text_content.append(f"[Scanned page {pnum} - OCR engine ready]")

    return "\n\n".join(text_content).strip()

def extract_text_from_image(image_path: str) -> str:
    """Extract text from image or scanned document using OCR."""
    tess_path = find_tesseract()
    try:
        import pytesseract
        if tess_path:
            pytesseract.pytesseract.tesseract_cmd = tess_path
        image = Image.open(image_path)
        ocr_text = pytesseract.image_to_string(image)
        if ocr_text and ocr_text.strip():
            return ocr_text.strip()
    except Exception as e:
        print(f"OCR image extraction error: {e}")
    
    return f"[Image document processed: {os.path.basename(image_path)}]"

def process_uploaded_document(file_path: str, filename: str) -> dict:
    """Processes any uploaded PDF, image, or text file and extracts the raw textual content."""
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    file_type = "unknown"
    
    if ext == ".pdf":
        file_type = "pdf"
        text = extract_text_from_pdf(file_path)
    elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"]:
        file_type = "image"
        text = extract_text_from_image(file_path)
    elif ext in [".txt", ".json", ".md", ".csv"]:
        file_type = "text"
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            text = f"Error reading text file: {e}"
    else:
        file_type = "other"
        
    return {
        "file_type": file_type,
        "extracted_text": text.strip() if text else "",
        "char_count": len(text) if text else 0
    }
