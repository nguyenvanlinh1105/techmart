"""
Script to create admin user in MongoDB
Run: python create_admin.py
"""

import asyncio
from datetime import datetime
from passlib.context import CryptContext
from app.database import users_collection

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    """Create an admin user"""
    
    # Check if admin already exists
    admin_email = "admin@techmart.com"
    existing_admin = users_collection.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"✅ Admin user already exists: {admin_email}")
        print(f"   Password: admin123")
        return
    
    # Create admin user
    admin_user = {
        "_id": "user_admin_001",
        "email": admin_email,
        "password": pwd_context.hash("admin123"),
        "full_name": "Admin TechMart",
        "phone": "0900000000",
        "role": "admin",
        "is_verified": True,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "addresses": []
    }
    
    users_collection.insert_one(admin_user)
    
    print("=" * 60)
    print("✅ ADMIN USER CREATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"📧 Email: {admin_email}")
    print(f"🔑 Password: admin123")
    print(f"👤 Role: admin")
    print("=" * 60)
    print("\n💡 Login at: http://localhost:5173/login")
    print("💡 Admin Panel: http://localhost:5173/admin")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(create_admin_user())
    print("\n✨ Done!")

