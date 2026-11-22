import requests

url = "http://127.0.0.1:8000/api/notices/upload"
pdf_path = "C:\\NxtWave\\sample_public_notice_demo.pdf"

with open(pdf_path, "rb") as f:
    files = {"file": ("sample_public_notice_demo.pdf", f, "application/pdf")}
    data = {
        "manual_title": "",
        "manual_text": "",
        "authority": "",
        "source_url": ""
    }
    response = requests.post(url, files=files, data=data)
    print("Status code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception as e:
        print("Response Text:", response.text)
