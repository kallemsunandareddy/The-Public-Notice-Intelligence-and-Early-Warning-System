#!/usr/bin/env python
"""
Secure Admin Account Creation Utility for Civic Notice Intelligence
Use this CLI tool to initialize or reset the system administrator credentials securely.
No plaintext passwords are ever committed or exposed to the frontend.
"""
import sys
import getpass
from app.database import SessionLocal, Base, engine
from app.models import User
from app.core.auth import get_password_hash

def create_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("==================================================================")
    print("   Civic Notice Intelligence — Administrative Setup Utility")
    print("==================================================================")
    print("Create a verified Administrator account for official civic control.\n")

    email = input("Enter Admin Email (e.g., admin@telangana.gov.in): ").strip()
    if not email or "@" not in email:
        print("❌ Error: Invalid email address provided.")
        sys.exit(1)

    full_name = input("Enter Admin Full Name & Title (e.g., Dr. K. S. Rao - CIO): ").strip()
    if not full_name:
        full_name = "Chief Information Officer"

    password = getpass.getpass("Enter Secure Admin Password (min 6 chars): ")
    if len(password) < 6:
        print("❌ Error: Password must be at least 6 characters long.")
        sys.exit(1)

    confirm = getpass.getpass("Confirm Admin Password: ")
    if password != confirm:
        print("❌ Error: Passwords do not match.")
        sys.exit(1)

    # Check if user already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"\n⚠️ User with email '{email}' already exists.")
        choice = input("Update existing user to ADMIN with this new password? (y/N): ").strip().lower()
        if choice == 'y':
            existing.hashed_password = get_password_hash(password)
            existing.role = "admin"
            existing.full_name = full_name
            db.commit()
            print(f"✅ User '{email}' successfully elevated and password updated to ADMIN role!")
        else:
            print("Cancelled without making changes.")
            db.close()
            return
    else:
        admin_user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role="admin",
            phone="+91 98765 00000",
            preferred_language="en"
        )
        db.add(admin_user)
        db.commit()
        print(f"\n✅ Admin account '{email}' created successfully with ADMIN role!")

    print("==================================================================")
    print("You can now log in through the Admin Portal at http://localhost:5173")
    print("==================================================================")
    db.close()

if __name__ == "__main__":
    create_admin()
