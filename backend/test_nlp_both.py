from app.services.ocr_service import process_uploaded_document
from app.services.ai_service import analyze_notice_with_rules_nlp

pdf1 = r"C:\NxtWave\sample_public_notice_demo.pdf"
doc1 = process_uploaded_document(pdf1, "sample_public_notice_demo.pdf")
res1 = analyze_notice_with_rules_nlp(doc1["extracted_text"])
print("--- PDF 1 (Water) ---")
print("Title:", res1["title"])
print("Category:", res1["category"])
print("Department:", res1["authority"])
print("Notice ID:", res1["notice_id"])
print("Urgency:", res1["urgency"])
print("Deadline:", res1["deadline"])
print("Locations:", res1["locations"])

print()
pdf2 = r"C:\NxtWave\sample_scholarship_notice_demo.pdf"
doc2 = process_uploaded_document(pdf2, "sample_scholarship_notice_demo.pdf")
res2 = analyze_notice_with_rules_nlp(doc2["extracted_text"])
print("--- PDF 2 (Scholarship) ---")
print("Title:", res2["title"])
print("Category:", res2["category"])
print("Department:", res2["authority"])
print("Notice ID:", res2["notice_id"])
print("Urgency:", res2["urgency"])
print("Deadline:", res2["deadline"])
print("Locations:", res2["locations"])
