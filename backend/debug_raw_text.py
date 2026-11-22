from app.services.ocr_service import process_uploaded_document

doc = process_uploaded_document(r"C:\NxtWave\sample_scholarship_notice_demo.pdf", "sample.pdf")
print("EXTRACTED TEXT:")
print(doc["extracted_text"])
