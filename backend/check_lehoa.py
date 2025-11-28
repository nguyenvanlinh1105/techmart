#!/usr/bin/env python3
"""
Check mã LEHOA chi tiết
"""

from datetime import datetime
from app.database import coupons_collection

def check_lehoa():
    print("\n" + "="*80)
    print("KIỂM TRA MÃ LEHOA")
    print("="*80 + "\n")
    
    # Find LEHOA coupon
    lehoa = coupons_collection.find_one({"code": "LEHOA"})
    
    if not lehoa:
        print("❌ KHÔNG TÌM THẤY MÃ LEHOA!")
        return
    
    print("✅ Tìm thấy mã LEHOA\n")
    
    # Print all fields
    print("📋 THÔNG TIN CHI TIẾT:")
    print("-" * 80)
    for key, value in lehoa.items():
        print(f"{key:20} : {value}")
    print("-" * 80)
    
    # Check conditions for /coupons/active
    print("\n🔍 KIỂM TRA ĐIỀU KIỆN HIỂN THỊ:")
    print("-" * 80)
    
    now = datetime.utcnow()
    print(f"⏰ Current time: {now}\n")
    
    # Check 1: is_active
    is_active = lehoa.get('is_active', True)
    if is_active:
        print("✅ is_active = True")
    else:
        print("❌ is_active = False")
    
    # Check 2: valid_from
    valid_from = lehoa.get('valid_from')
    if valid_from:
        if valid_from <= now:
            print(f"✅ valid_from = {valid_from} (đã bắt đầu)")
        else:
            days_until = (valid_from - now).days
            print(f"❌ valid_from = {valid_from} (chưa bắt đầu, còn {days_until} ngày)")
    else:
        print("⚠️ Không có valid_from")
    
    # Check 3: valid_to
    valid_to = lehoa.get('valid_to')
    if valid_to:
        if valid_to >= now:
            days_left = (valid_to - now).days
            print(f"✅ valid_to = {valid_to} (còn {days_left} ngày)")
        else:
            days_ago = (now - valid_to).days
            print(f"❌ valid_to = {valid_to} (đã hết hạn {days_ago} ngày trước)")
    else:
        print("⚠️ Không có valid_to")
    
    # Check 4: usage_limit
    usage_limit = lehoa.get('usage_limit')
    used_count = lehoa.get('used_count', 0)
    if usage_limit:
        if used_count < usage_limit:
            remaining = usage_limit - used_count
            print(f"✅ usage: {used_count}/{usage_limit} (còn {remaining} lượt)")
        else:
            print(f"❌ usage: {used_count}/{usage_limit} (đã hết lượt)")
    else:
        print(f"✅ usage: {used_count}/unlimited")
    
    # Final verdict
    print("\n" + "="*80)
    will_show = (
        is_active and
        valid_from and valid_to and
        valid_from <= now <= valid_to and
        (not usage_limit or used_count < usage_limit)
    )
    
    if will_show:
        print("🎯 KẾT LUẬN: ✅ MÃ NÀY SẼ HIỂN THỊ TRONG /coupons/active")
    else:
        print("🎯 KẾT LUẬN: ❌ MÃ NÀY KHÔNG HIỂN THỊ")
        print("\nLÝ DO:")
        if not is_active:
            print("  - is_active = False")
        if not valid_from or not valid_to:
            print("  - Thiếu valid_from hoặc valid_to")
        elif valid_from > now:
            print("  - Chưa đến ngày bắt đầu")
        elif valid_to < now:
            print("  - Đã hết hạn")
        if usage_limit and used_count >= usage_limit:
            print("  - Đã hết lượt sử dụng")
    
    print("="*80 + "\n")
    
    # Check discount value
    print("⚠️ CẢNH BÁO VỀ DISCOUNT:")
    discount_type = lehoa.get('discount_type')
    discount_value = lehoa.get('discount_value')
    
    if discount_type == 'percentage' and discount_value > 100:
        print(f"❗ Mã này có discount_value = {discount_value}% (>100%)")
        print(f"   Đây là giảm {discount_value}%, không phải {discount_value}đ!")
        print(f"   max_discount = {lehoa.get('max_discount')}")
        print(f"   → Nếu muốn giảm {discount_value}đ, đổi discount_type thành 'fixed'")

if __name__ == "__main__":
    check_lehoa()
