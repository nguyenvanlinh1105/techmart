"""
Script để tạo mã giảm giá mẫu
Chạy: python seed_coupons.py
"""

from datetime import datetime, timedelta
from app.database import coupons_collection, get_next_sequence

def create_sample_coupons():
    """Tạo mã giảm giá mẫu"""
    print("[INFO] Đang tạo mã giảm giá...")
    
    now = datetime.utcnow()
    
    coupons = [
        # Mã giảm % cơ bản
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "WELCOME10",
            "description": "Giảm 10% cho đơn hàng đầu tiên",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order_value": 500000,
            "max_discount": 100000,
            "target_type": "new_user",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=90),
            "usage_limit": 1000,
            "usage_per_user": 1,
            "used_count": 45,
            "is_active": True,
            "is_auto_apply": True,
            "priority": 10,
            "stackable": False,
            "created_at": now
        },
        # Mã giảm cố định
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "SAVE50K",
            "description": "Giảm 50.000đ cho đơn từ 1 triệu",
            "discount_type": "fixed",
            "discount_value": 50000,
            "min_order_value": 1000000,
            "max_discount": None,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=30),
            "usage_limit": 500,
            "usage_per_user": 3,
            "used_count": 123,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 5,
            "stackable": False,
            "created_at": now
        },
        # Mã VIP
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "VIP20",
            "description": "Giảm 20% dành cho khách VIP",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_value": 2000000,
            "max_discount": 500000,
            "target_type": "vip",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=365),
            "usage_limit": None,
            "usage_per_user": 10,
            "used_count": 67,
            "is_active": True,
            "is_auto_apply": True,
            "priority": 15,
            "stackable": False,
            "created_at": now
        },
        # Mã freeship
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "FREESHIP",
            "description": "Miễn phí vận chuyển",
            "discount_type": "freeship",
            "discount_value": 30000,
            "min_order_value": 300000,
            "max_discount": 30000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=60),
            "usage_limit": 2000,
            "usage_per_user": 5,
            "used_count": 234,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 3,
            "stackable": True,
            "created_at": now
        },
        # Flash sale (extended to 7 days for testing)
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "FLASH30",
            "description": "Flash Sale - Giảm 30%",
            "discount_type": "percentage",
            "discount_value": 30,
            "min_order_value": 1500000,
            "max_discount": 1000000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=7),  # Changed from 24 hours to 7 days
            "usage_limit": 100,
            "usage_per_user": 1,
            "used_count": 78,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 20,
            "stackable": False,
            "created_at": now
        },
        # Mã giảm theo bậc
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "TIER2024",
            "description": "Giảm theo bậc: 5%-10%-15%",
            "discount_type": "tiered",
            "discount_value": 0,
            "min_order_value": 500000,
            "max_discount": None,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=180),
            "usage_limit": None,
            "usage_per_user": None,
            "used_count": 156,
            "is_active": True,
            "is_auto_apply": True,
            "priority": 8,
            "stackable": False,
            "tiers": [
                {"min": 500000, "discount": 5, "type": "percentage"},
                {"min": 2000000, "discount": 10, "type": "percentage"},
                {"min": 5000000, "discount": 15, "type": "percentage"}
            ],
            "created_at": now
        },
        # Mã sắp hết hạn (extended to 14 days for testing)
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "LASTCHANCE",
            "description": "Cơ hội cuối - Giảm 25%",
            "discount_type": "percentage",
            "discount_value": 25,
            "min_order_value": 800000,
            "max_discount": 300000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now - timedelta(days=20),
            "valid_to": now + timedelta(days=14),  # Changed from 3 days to 14 days
            "usage_limit": 200,
            "usage_per_user": 2,
            "used_count": 189,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 12,
            "stackable": False,
            "created_at": now - timedelta(days=20)
        },
        # Mã đã hết hạn
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "EXPIRED15",
            "description": "Mã đã hết hạn",
            "discount_type": "percentage",
            "discount_value": 15,
            "min_order_value": 500000,
            "max_discount": 200000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now - timedelta(days=60),
            "valid_to": now - timedelta(days=1),
            "usage_limit": 500,
            "usage_per_user": 3,
            "used_count": 456,
            "is_active": False,
            "is_auto_apply": False,
            "priority": 5,
            "stackable": False,
            "created_at": now - timedelta(days=60)
        }
    ]
    
    # Xóa coupons cũ
    coupons_collection.delete_many({})
    
    # Insert coupons mới
    coupons_collection.insert_many(coupons)
    print(f"[OK] Đã tạo {len(coupons)} mã giảm giá!")
    
    # In ra thống kê
    print("\n=== THỐNG KÊ MÃ GIẢM GIÁ ===")
    print(f"Tổng số mã: {len(coupons)}")
    print(f"Đang hoạt động: {sum(1 for c in coupons if c['is_active'])}")
    print(f"Tự động áp dụng: {sum(1 for c in coupons if c['is_auto_apply'])}")
    print(f"Sắp hết hạn (< 7 ngày): {sum(1 for c in coupons if c['is_active'] and (c['valid_to'] - now).days < 7)}")
    print("\n=== DANH SÁCH MÃ ===")
    for coupon in coupons:
        status = "✓ Hoạt động" if coupon['is_active'] else "✗ Tắt"
        days_left = (coupon['valid_to'] - now).days
        print(f"{coupon['code']:15} | {status:15} | Còn {days_left:3} ngày | {coupon['description']}")

if __name__ == "__main__":
    print("=" * 60)
    print("SEED COUPONS - TẠO MÃ GIẢM GIÁ MẪU")
    print("=" * 60)
    create_sample_coupons()
    print("\n[SUCCESS] Hoàn thành!")
