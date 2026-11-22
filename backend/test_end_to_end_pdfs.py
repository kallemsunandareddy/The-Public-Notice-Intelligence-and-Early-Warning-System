import requests

url_extract = "http://127.0.0.1:8000/api/documents/extract-text"
url_upload = "http://127.0.0.1:8000/api/notices/upload"

print("================ TEST 1: WATER NOTICE PDF ================")
with open(r"C:\NxtWave\sample_public_notice_demo.pdf", "rb") as f:
    files = {"file": ("sample_public_notice_demo.pdf", f, "application/pdf")}
    resp_ext = requests.post(url_extract, files=files)
    print("Extract status:", resp_ext.status_code)
    text1 = resp_ext.json().get("extracted_text", "")
    print("Extracted char count:", len(text1))

with open(r"C:\NxtWave\sample_public_notice_demo.pdf", "rb") as f:
    files = {"file": ("sample_public_notice_demo.pdf", f, "application/pdf")}
    resp_up = requests.post(url_upload, files=files)
    data1 = resp_up.json()
    print("AI Results 1:")
    print(" - Title:", data1.get("title"))
    print(" - Category:", data1.get("category"))
    print(" - Department:", data1.get("authority"))
    print(" - Notice ID:", data1.get("contact_info"))
    print(" - Urgency:", data1.get("urgency"))
    print(" - Deadline:", data1.get("deadline"))
    print(" - Location:", data1.get("locations"))

print("\n================ TEST 2: SCHOLARSHIP NOTICE PDF ================")
with open(r"C:\NxtWave\sample_scholarship_notice_demo.pdf", "rb") as f:
    files = {"file": ("sample_scholarship_notice_demo.pdf", f, "application/pdf")}
    resp_ext2 = requests.post(url_extract, files=files)
    print("Extract status:", resp_ext2.status_code)
    text2 = resp_ext2.json().get("extracted_text", "")
    print("Extracted char count:", len(text2))

with open(r"C:\NxtWave\sample_scholarship_notice_demo.pdf", "rb") as f:
    files = {"file": ("sample_scholarship_notice_demo.pdf", f, "application/pdf")}
    resp_up2 = requests.post(url_upload, files=files)
    data2 = resp_up2.json()
    print("AI Results 2:")
    print(" - Title:", data2.get("title"))
    print(" - Category:", data2.get("category"))
    print(" - Department:", data2.get("authority"))
    print(" - Notice ID:", data2.get("contact_info"))
    print(" - Urgency:", data2.get("urgency"))
    print(" - Deadline:", data2.get("deadline"))
    print(" - Location:", data2.get("locations"))
