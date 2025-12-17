#!/usr/bin/env python3
"""
Check admin user trong database
"""

from app.database import users_collection
from app.models import UserRole

def check_admin():
    print("\n" + "="*80)
    print("KIỂM TRA ADMIN USER")
    print("="*80 + "\n")
    
    # Find all admin users
    admins = list(users_collection.find({"role": "admin"}))
    
    if not admins:
        print("❌ KHÔNG TÌM THẤY ADMIN USER NÀO!")
        print("\n🔧 Để tạo admin user, chạy:")
        print("   python create_admin.py")
        return
    
    print(f"✅ Tìm thấy {len(admins)} admin user(s)\n")
    
    for i, admin in enumerate(admins, 1):
        print(f"📋 ADMIN {i}:")
        print("-" * 40)
        print(f"ID       : {admin.get('_id')}")
        print(f"Email    : {admin.get('email')}")
        print(f"Name     : {admin.get('full_name')}")
        print(f"Phone    : {admin.get('phone')}")
        print(f"Role     : {admin.get('role')}")
        print(f"Verified : {admin.get('is_verified', False)}")
        print(f"Created  : {admin.get('created_at')}")
        print("-" * 40)
        print()
    
    # Check specific admin@techmart.com
    main_admin = users_collection.find_one({"email": "admin@techmart.com"})
    if main_admin:
        print("✅ Admin chính (admin@techmart.com) tồn tại")
        print("   Password: admin123")
    else:
        print("❌ Admin chính (admin@techmart.com) không tồn tại")
        print("   Chạy: python create_admin.py để tạo")
    
    print("="*80 + "\n")

if __name__ == "__main__":
    check_admin()