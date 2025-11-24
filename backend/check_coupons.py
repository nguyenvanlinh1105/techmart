"""
Script kiểm tra trạng thái mã giảm giá
"""

from app.database import coupons_collection
from datetime import datetime

def check_all_coupons():
    now = datetime.utcnow()
    all_coupons = list(coupons_collection.find({}))
    
    print(f"\n{'='*80}")
    print(f"KIỂM TRA MÃ GIẢM GIÁ - {now.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")
    
    print(f"Tổng số mã trong DB: {len(all_coupons)}\n")
    
    active_count = 0
    
    for i, coupon in enumerate(all_coupons, 1):
        code = coupon.get('code', 'N/A')
        is_active = coupon.get('is_active', True)
        valid_from = coupon.get('valid_from')
        valid_to = coupon.get('valid_to')
        used = coupon.get('used_count', 0)
        limit = coupon.get('usage_limit')
        discount_type = coupon.get('discount_type', 'N/A')
        discount_value = coupon.get('discount_value', 0)
        min_order = coupon.get('min_order_value', 0)
        
        print(f"{i}. {code}")
        print(f"   Loại: {discount_type} | Giá trị: {discount_value}")
        print(f"   Đơn tối thiểu: {min_order:,.0f}đ")
        print(f"   is_active: {is_active}")
        
        if valid_from:
            print(f"   valid_from: {valid_from.strftime('%Y-%m-%d %H:%M:%S')}")
            if valid_from > now:
                print(f"   ⚠️  CHƯA BẮT ĐẦU (còn {(valid_from - now).days} ngày)")
        
        if valid_to:
            print(f"   valid_to: {valid_to.strftime('%Y-%m-%d %H:%M:%S')}")
            if valid_to < now:
                print(f"   ❌ ĐÃ HẾT HẠN ({(now - valid_to).days} ngày trước)")
        
        if limit:
            print(f"   Sử dụng: {used}/{limit}")
            if used >= limit:
                print(f"   ❌ ĐÃ HẾT LƯỢT")
        else:
            print(f"   Sử dụng: {used}/∞ (không giới hạn)")
        
        # Kiểm tra điều kiện
        is_valid = True
        reasons = []
        
        if not is_active:
            is_valid = False
            reasons.append("Mã bị tắt")
        
        if valid_from and valid_from > now:
            is_valid = False
            reasons.append("Chưa đến ngày bắt đầu")
        
        if valid_to and valid_to < now:
            is_valid = False
            reasons.append("Đã hết hạn")
        
        if limit and used >= limit:
            is_valid = False
            reasons.append("Đã hết lượt sử dụng")
        
        if is_valid:
            print(f"   ✅ HỢP LỆ - Sẽ hiển thị cho user")
            active_count += 1
        else:
            print(f"   ❌ KHÔNG HỢP LỆ - Lý do: {', '.join(reasons)}")
        
        print()
    
    print(f"{'='*80}")
    print(f"KẾT QUẢ: {active_count}/{len(all_coupons)} mã hợp lệ")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    check_all_coupons()
