#!/usr/bin/env python3
"""
RESET VÀ TẠO LẠI HỆ THỐNG COUPON
- Xóa toàn bộ coupons cũ
- Tạo bộ coupons mới hợp lý
- Validate và test
"""

from datetime import datetime, timedelta
from app.database import coupons_collection, get_next_sequence

def reset_coupons():
    """Xóa toàn bộ coupons cũ"""
    print("\n" + "="*80)
    print("🗑️  BƯỚC 1: XÓA COUPONS CŨ")
    print("="*80)
    
    old_count = coupons_collection.count_documents({})
    print(f"📊 Tìm thấy {old_count} coupons cũ")
    
    if old_count > 0:
        coupons_collection.delete_many({})
        print(f"✅ Đã xóa {old_count} coupons cũ")
    else:
        print("ℹ️  Không có coupons cũ")

def create_smart_coupons():
    """Tạo bộ coupons mới thông minh"""
    print("\n" + "="*80)
    print("✨ BƯỚC 2: TẠO COUPONS MỚI")
    print("="*80 + "\n")
    
    now = datetime.utcnow()
    
    coupons = [
        # 1. Mã chào mừng - Cho khách mới
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "WELCOME10",
            "description": "Chào mừng khách hàng mới - Giảm 10%",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order_value": 200000,  # Đơn tối thiểu 200k
            "max_discount": 50000,      # Giảm tối đa 50k
            "target_type": "all",       # Áp dụng cho tất cả
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=365),  # 1 năm
            "usage_limit": None,        # Không giới hạn
            "usage_per_user": 1,        # Mỗi user dùng 1 lần
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": True,
            "priority": 10,
            "stackable": False,
            "created_at": now
        },
        
        # 2. Mã giảm cố định - Phổ biến
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "SAVE50K",
            "description": "Giảm ngay 50.000đ cho đơn từ 500k",
            "discount_type": "fixed",
            "discount_value": 50000,    # Giảm 50k
            "min_order_value": 500000,  # Đơn tối thiểu 500k
            "max_discount": None,       # Fixed không cần max
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=60),
            "usage_limit": None,
            "usage_per_user": 5,        # Mỗi user dùng 5 lần
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 5,
            "stackable": False,
            "created_at": now
        },
        
        # 3. Mã giảm lớn - Cho đơn giá trị cao
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "MEGA100K",
            "description": "Giảm 100.000đ cho đơn từ 2 triệu",
            "discount_type": "fixed",
            "discount_value": 100000,
            "min_order_value": 2000000,
            "max_discount": None,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=90),
            "usage_limit": None,
            "usage_per_user": 3,
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": True,
            "priority": 15,
            "stackable": False,
            "created_at": now
        },
        
        # 4. Freeship
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "FREESHIP",
            "description": "Miễn phí vận chuyển toàn quốc",
            "discount_type": "freeship",
            "discount_value": 30000,
            "min_order_value": 300000,
            "max_discount": 30000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=180),
            "usage_limit": None,
            "usage_per_user": None,
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 3,
            "stackable": True,
            "created_at": now
        },
        
        # 5. Flash sale - Giảm mạnh
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "FLASH20",
            "description": "Flash Sale - Giảm 20% (Có hạn!)",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_value": 1000000,
            "max_discount": 200000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=30),
            "usage_limit": 500,         # Giới hạn 500 lượt
            "usage_per_user": 1,
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 20,
            "stackable": False,
            "created_at": now
        },
        
        # 6. Mã VIP - Cho khách hàng thân thiết
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "VIP15",
            "description": "Ưu đãi VIP - Giảm 15%",
            "discount_type": "percentage",
            "discount_value": 15,
            "min_order_value": 1500000,
            "max_discount": 300000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=365),
            "usage_limit": None,
            "usage_per_user": 10,
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": True,
            "priority": 12,
            "stackable": False,
            "created_at": now
        },
        
        # 7. Mã cuối tuần
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "WEEKEND",
            "description": "Giảm 30.000đ cho đơn cuối tuần",
            "discount_type": "fixed",
            "discount_value": 30000,
            "min_order_value": 400000,
            "max_discount": None,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=120),
            "usage_limit": None,
            "usage_per_user": None,
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 7,
            "stackable": False,
            "created_at": now
        },
        
        # 8. Mã sinh nhật
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "BIRTHDAY25",
            "description": "Sinh nhật vui vẻ - Giảm 25%",
            "discount_type": "percentage",
            "discount_value": 25,
            "min_order_value": 800000,
            "max_discount": 250000,
            "target_type": "all",
            "target_ids": [],
            "valid_from": now,
            "valid_to": now + timedelta(days=365),
            "usage_limit": None,
            "usage_per_user": 1,
            "used_count": 0,
            "is_active": True,
            "is_auto_apply": False,
            "priority": 18,
            "stackable": False,
            "created_at": now
        }
    ]
    
    # Insert coupons
    coupons_collection.insert_many(coupons)
    print(f"✅ Đã tạo {len(coupons)} coupons mới!\n")
    
    # Print summary
    print("📋 DANH SÁCH COUPONS MỚI:")
    print("-" * 80)
    for i, coupon in enumerate(coupons, 1):
        discount_text = f"{coupon['discount_value']}%" if coupon['discount_type'] == 'percentage' else f"{coupon['discount_value']:,}đ"
        days_left = (coupon['valid_to'] - now).days
        print(f"{i}. {coupon['code']:15} | {discount_text:12} | Còn {days_left:3} ngày | {coupon['description']}")
    print("-" * 80)

def validate_coupons():
    """Validate tất cả coupons"""
    print("\n" + "="*80)
    print("✅ BƯỚC 3: VALIDATE COUPONS")
    print("="*80 + "\n")
    
    now = datetime.utcnow()
    all_coupons = list(coupons_collection.find({}))
    
    valid_count = 0
    invalid_count = 0
    
    for coupon in all_coupons:
        is_valid = True
        issues = []
        
        # Check 1: is_active
        if not coupon.get('is_active', True):
            is_valid = False
            issues.append("is_active = False")
        
        # Check 2: dates
        if coupon.get('valid_from') > now:
            is_valid = False
            issues.append("Chưa bắt đầu")
        
        if coupon.get('valid_to') < now:
            is_valid = False
            issues.append("Đã hết hạn")
        
        # Check 3: discount value
        if coupon.get('discount_type') == 'percentage':
            if coupon.get('discount_value') > 100 and not coupon.get('max_discount'):
                is_valid = False
                issues.append("Percentage >100% nhưng không có max_discount")
        
        # Check 4: usage
        if coupon.get('usage_limit') and coupon.get('used_count', 0) >= coupon['usage_limit']:
            is_valid = False
            issues.append("Đã hết lượt")
        
        if is_valid:
            valid_count += 1
            print(f"✅ {coupon['code']:15} - Hợp lệ")
        else:
            invalid_count += 1
            print(f"❌ {coupon['code']:15} - Không hợp lệ: {', '.join(issues)}")
    
    print(f"\n📊 Kết quả: {valid_count} hợp lệ, {invalid_count} không hợp lệ")
    
    return valid_count, invalid_count

def test_api_simulation():
    """Mô phỏng API /coupons/active"""
    print("\n" + "="*80)
    print("🧪 BƯỚC 4: TEST API SIMULATION")
    print("="*80 + "\n")
    
    now = datetime.utcnow()
    
    # Simulate API filter
    coupons = list(
        coupons_collection.find({
            "is_active": True,
            "valid_from": {"$lte": now},
            "valid_to": {"$gte": now}
        })
    )
    
    result = []
    for coupon in coupons:
        if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
            continue
        result.append(coupon)
    
    print(f"📊 API /coupons/active sẽ trả về: {len(result)} coupons")
    print("\nDanh sách:")
    for i, coupon in enumerate(result, 1):
        print(f"  {i}. {coupon['code']} - {coupon['description']}")
    
    return len(result)

def main():
    print("\n" + "="*80)
    print("🚀 RESET VÀ FIX HỆ THỐNG COUPON")
    print("="*80)
    
    # Step 1: Reset
    reset_coupons()
    
    # Step 2: Create new
    create_smart_coupons()
    
    # Step 3: Validate
    valid_count, invalid_count = validate_coupons()
    
    # Step 4: Test
    api_count = test_api_simulation()
    
    # Final summary
    print("\n" + "="*80)
    print("🎉 HOÀN THÀNH!")
    print("="*80)
    print(f"\n✅ Đã tạo 8 coupons mới")
    print(f"✅ {valid_count} coupons hợp lệ")
    print(f"✅ API sẽ trả về {api_count} coupons cho user")
    
    if invalid_count > 0:
        print(f"\n⚠️  {invalid_count} coupons không hợp lệ (cần kiểm tra)")
    
    print("\n💡 Bước tiếp theo:")
    print("   1. Reload trang Admin Coupons")
    print("   2. Reload trang Checkout")
    print("   3. Test chọn mã giảm giá")
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
