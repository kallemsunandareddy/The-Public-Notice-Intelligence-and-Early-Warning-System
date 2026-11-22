import fitz

doc = fitz.open(r"C:\NxtWave\backend\app\uploads\20261118150401_sample_scholarship_notice_demo.pdf")
print("Page count:", len(doc))
for i, page in enumerate(doc):
    print(f"--- Page {i+1} ---")
    print(page.get_text())
doc.close()
