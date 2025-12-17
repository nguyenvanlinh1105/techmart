"""Kiểm tra categories trong database"""
from app.database import categories_collection

categories = list(categories_collection.find())
print(f"\n📦 Tổng số categories: {len(categories)}\n")

for cat in categories:
    print(f"  - {cat['_id']}: {cat['name']}")

if len(categories) == 0:
    print("\n⚠️  KHÔNG CÓ CATEGORY NÀO!")
    print("💡 Chạy: python seed_data.py để tạo categories")
