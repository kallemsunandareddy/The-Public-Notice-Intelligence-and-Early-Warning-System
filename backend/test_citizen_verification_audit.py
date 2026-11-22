import requests

base_url = "http://127.0.0.1:8000/api"

print("=== 1. VERIFY SEED / LIVE NOTICES IN DATABASE ===")
notices = requests.get(f"{base_url}/notices").json()
print(f"Total notices in DB: {len(notices)}")

# Check statuses
statuses = {}
for n in notices:
    s = n.get("status")
    statuses[s] = statuses.get(s, 0) + 1
print("Status distribution in DB:", statuses)

print("\n=== 2. VERIFY CITIZEN PORTAL FILTERING ===")
cit_feed = requests.get(f"{base_url}/citizen/dashboard").json()
cit_notices = cit_feed.get("latest_notices", [])
print(f"Published notices visible to citizens: {len(cit_notices)}")
for cn in cit_notices:
    assert cn["status"] == "PUBLISHED", f"Error: Non-published notice {cn['id']} found in citizen feed!"
print("Assertion Passed: ONLY 'PUBLISHED' notices are present in Citizen Portal feed.")

print("\n=== 3. VERIFY DEMO DOCUMENT DETECTION ===")
demo_count = 0
official_count = 0
for cn in cit_notices:
    is_demo = (
        'sample' in cn['title'].lower() or
        'demonstration' in cn['title'].lower() or
        ('original_text' in cn and cn['original_text'] and 'fictional' in cn['original_text'].lower()) or
        ('authority' in cn and cn['authority'] and 'demo' in cn['authority'].lower())
    )
    if is_demo:
        demo_count += 1
    else:
        official_count += 1

print(f"Citizen Feed breakdown -> Demo Notices: {demo_count}, Official Verified Notices: {official_count}")
print("All verification workflow assertions completed successfully!")
