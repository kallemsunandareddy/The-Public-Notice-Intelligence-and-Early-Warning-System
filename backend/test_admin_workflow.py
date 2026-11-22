import requests

base_url = "http://127.0.0.1:8000/api"

# 1. Upload sample scholarship PDF
with open(r"C:\NxtWave\sample_scholarship_notice_demo.pdf", "rb") as f:
    files = {"file": ("sample_scholarship_notice_demo.pdf", f, "application/pdf")}
    res = requests.post(f"{base_url}/notices/upload", files=files)
    notice = res.json()
    notice_id = notice["id"]
    print("1. Uploaded notice ID:", notice_id)
    print("   Initial Status:", notice["status"])

# 2. Edit Notice
edit_payload = {
    "title": "Merit Scholarship Application 2026-2027 (Verified Edition)",
    "verification_notes": "Reviewed and verified against department records"
}
res_edit = requests.put(f"{base_url}/notices/{notice_id}", json=edit_payload)
print("2. Edited Title:", res_edit.json()["title"])

# 3. Verify Notice
res_verify = requests.post(f"{base_url}/admin/notices/{notice_id}/verify")
print("3. Status after Verify:", res_verify.json()["status"])

# 4. Approve Notice
res_approve = requests.post(f"{base_url}/admin/notices/{notice_id}/approve")
print("4. Status after Approve:", res_approve.json()["status"])

# 5. Check Citizen feed before publish (Should NOT be visible)
res_cit_before = requests.get(f"{base_url}/citizen/dashboard")
visible_before = any(n["id"] == notice_id for n in res_cit_before.json()["latest_notices"])
print("5. Visible in Citizen Portal before Publish?", visible_before)

# 6. Publish Notice
res_pub = requests.post(f"{base_url}/admin/notices/{notice_id}/publish")
print("6. Status after Publish:", res_pub.json()["status"])

# 7. Check Citizen feed after publish (Must be visible)
res_cit_after = requests.get(f"{base_url}/citizen/dashboard")
visible_after = any(n["id"] == notice_id for n in res_cit_after.json()["latest_notices"])
print("7. Visible in Citizen Portal after Publish?", visible_after)

# 8. Check Dashboard stats update
res_dash = requests.get(f"{base_url}/admin/dashboard")
stats = res_dash.json()
print("8. Dashboard Stats:")
print("   - Notices Ingested:", stats["total_collected"])
print("   - Pending Review:", stats["pending_review"])
print("   - Verified:", stats["total_verified"])
print("   - Published:", stats["published_notices"])
print("   - Deadlines Active:", stats["upcoming_deadlines"])

# 9. Test Reject Workflow on a new notice
with open(r"C:\NxtWave\sample_public_notice_demo.pdf", "rb") as f:
    files = {"file": ("test_reject.pdf", f, "application/pdf")}
    res_rej_upload = requests.post(f"{base_url}/notices/upload", files=files)
    rej_id = res_rej_upload.json()["id"]

res_reject = requests.post(f"{base_url}/admin/notices/{rej_id}/reject?reason=Document+unclear")
print("9. Rejected notice status:", res_reject.status_code)
res_cit_rej = requests.get(f"{base_url}/citizen/dashboard")
visible_rej = any(n["id"] == rej_id for n in res_cit_rej.json()["latest_notices"])
print("   Is Rejected notice visible to citizens?", visible_rej)
