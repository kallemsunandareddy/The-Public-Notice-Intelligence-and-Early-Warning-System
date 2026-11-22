import urllib.request
import urllib.error
import json

def test_full_role_preservation():
    base_url = "http://127.0.0.1:8000/api"

    # Case 1: Admin logs in -> Token and profile verify role is admin
    admin_login_req = urllib.request.Request(
        f"{base_url}/auth/login",
        data=json.dumps({"email": "admin@smartcity.gov.in", "password": "admin123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    admin_res = json.loads(urllib.request.urlopen(admin_login_req).read())
    admin_token = admin_res["access_token"]
    admin_role = admin_res["user"]["role"]
    assert admin_role == "admin", f"Expected admin role, got {admin_role}"
    print("✓ Test 1: Admin logged in, role is ADMIN.")

    # Profile check with admin token
    profile_req = urllib.request.Request(
        f"{base_url}/auth/profile",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    profile_res = json.loads(urllib.request.urlopen(profile_req).read())
    assert profile_res["role"] == "admin"
    print("✓ Test 2: Server-validated profile confirms role is permanently ADMIN.")

    # Case 2: Admin accesses public notices (as viewing Citizen Portal) -> Role must remain ADMIN
    notices_req = urllib.request.Request(
        f"{base_url}/notices",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    notices_res = json.loads(urllib.request.urlopen(notices_req).read())
    print(f"✓ Test 3: Admin browsed Citizen notice feed ({len(notices_res)} notices loaded).")

    # Re-verify profile after browsing citizen notices
    profile_res_after = json.loads(urllib.request.urlopen(profile_req).read())
    assert profile_res_after["role"] == "admin", "Admin role mutated after accessing citizen portal!"
    print("✓ Test 4: After visiting Citizen portal, Admin role remains strictly ADMIN.")

    # Case 3: Citizen logs in -> Token and profile verify role is citizen
    citizen_login_req = urllib.request.Request(
        f"{base_url}/auth/login",
        data=json.dumps({"email": "citizen@hyderabad.in", "password": "citizen123"}).encode(),
        headers={"Content-Type": "application/json"}
    )
    citizen_res = json.loads(urllib.request.urlopen(citizen_login_req).read())
    citizen_token = citizen_res["access_token"]
    citizen_role = citizen_res["user"]["role"]
    assert citizen_role == "citizen"
    print("✓ Test 5: Citizen logged in, role is CITIZEN.")

    # Case 4: Citizen attempts to access Admin Dashboard -> Backend HTTP 403 Forbidden
    admin_access_req = urllib.request.Request(
        f"{base_url}/admin/dashboard",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    try:
        urllib.request.urlopen(admin_access_req)
        raise AssertionError("Citizen was allowed into Admin Dashboard!")
    except urllib.error.HTTPError as e:
        assert e.code == 403
        print(f"✓ Test 6: Citizen accessing Admin Dashboard rejected with HTTP {e.code} Forbidden.")

    # Case 5: Unauthenticated access to Admin Dashboard -> Backend HTTP 401 Unauthorized
    unauth_req = urllib.request.Request(f"{base_url}/admin/dashboard")
    try:
        urllib.request.urlopen(unauth_req)
        raise AssertionError("Unauthenticated user was allowed into Admin Dashboard!")
    except urllib.error.HTTPError as e:
        assert e.code == 401
        print(f"✓ Test 7: Unauthenticated request rejected with HTTP {e.code} Unauthorized.")

    print("\n🎉 ALL 7 ROLE PRESERVATION & SECURITY TESTS PASSED!")

if __name__ == '__main__':
    test_full_role_preservation()
