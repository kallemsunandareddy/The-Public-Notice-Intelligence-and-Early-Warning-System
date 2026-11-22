import urllib.request
import urllib.error
import json

def test_auth_and_rbac():
    # 1. Login as Citizen
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/login',
        data=json.dumps({'email': 'citizen@hyderabad.in', 'password': 'citizen123'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    citizen_data = json.loads(res.read())
    print("1. Citizen logged in successfully. Role:", citizen_data['user']['role'])
    citizen_token = citizen_data['access_token']

    # 2. Try to access Admin Dashboard with Citizen Token
    admin_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/admin/dashboard',
        headers={'Authorization': f'Bearer {citizen_token}'}
    )
    try:
        urllib.request.urlopen(admin_req)
        print("❌ ERROR: Citizen was allowed into admin dashboard!")
    except urllib.error.HTTPError as e:
        print(f"2. Citizen accessing Admin Dashboard correctly blocked: HTTP {e.code} -> {e.read().decode()}")

    # 3. Login as Admin
    admin_login_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/auth/login',
        data=json.dumps({'email': 'admin@smartcity.gov.in', 'password': 'admin123'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res_admin = urllib.request.urlopen(admin_login_req)
    admin_data = json.loads(res_admin.read())
    print("3. Admin logged in successfully. Role:", admin_data['user']['role'])
    admin_token = admin_data['access_token']

    # 4. Access Admin Dashboard with Admin Token
    admin_access_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/admin/dashboard',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    res_access = urllib.request.urlopen(admin_access_req)
    dashboard_stats = json.loads(res_access.read())
    print(f"4. Admin Dashboard accessed successfully! Total notices: {dashboard_stats['total_collected']}")

if __name__ == '__main__':
    test_auth_and_rbac()
