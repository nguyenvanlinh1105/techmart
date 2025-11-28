#!/usr/bin/env python3
"""
Debug script để xem tại sao chỉ 3 coupons được load
"""

from datetime import datetime
from app.database import coupons_collection

def debug_coupons():
    print("\n" + "="*80)
    print("DEBUG: TẠI SAO CHỈ 3 COUPONS ĐƯỢC LOAD?")
    print("="*80 + "\n")
    
    now = datetime.utcnow()
    print(f"⏰ Current time: {now}\n")
    
    # Get all coupons
    all_coupons = list(coupons_collection.find({}))
    print(f"📊 Total coupons in DB: {len(all_coupons)}\n")
    
    if len(all_coupons) == 0:
        print("❌ NO COUPONS IN DATABASE!")
        print("💡 Run: python seed_coupons.py")
        return
    
    # Simulate the API filter
    print("🔍 Checking each coupon against API filters:\n")
    print("-" * 80)
    
    passed = []
    failed = []
    
    for i, coupon in enumerate(all_coupons, 1):
        code = coupon['code']
        reasons = []
        will_pass = True
        
        print(f"\n{i}. {code}")
        print(f"   Description: {coupon.get('description', 'N/A')}")
        
        # Check 1: is_active
        is_active = coupon.get('is_active', True)
        if not is_active:
            reasons.append("❌ is_active = False")
            will_pass = False
        else:
            print(f"   ✅ is_active = True")
        
        # Check 2: valid_from
        valid_from = coupon.get('valid_from')
        if valid_from:
            if valid_from > now:
                days_until = (valid_from - now).days
                reasons.append(f"❌ Not started yet (in {days_until} days)")
                will_pass = False
            else:
                print(f"   ✅ valid_from = {valid_from} (started)")
        else:
            reasons.append("⚠️ No valid_from")
        
        # Check 3: valid_to
        valid_to = coupon.get('valid_to')
        if valid_to:
            if valid_to < now:
                days_ago = (now - valid_to).days
                reasons.append(f"❌ Expired {days_ago} days ago")
                will_pass = False
            else:
                days_left = (valid_to - now).days
                hours_left = (valid_to - now).seconds // 3600
                print(f"   ✅ valid_to = {valid_to} ({days_left}d {hours_left}h left)")
        else:
            reasons.append("⚠️ No valid_to")
        
        # Check 4: usage_limit
        usage_limit = coupon.get('usage_limit')
        used_count = coupon.get('used_count', 0)
        if usage_limit:
            if used_count >= usage_limit:
                reasons.append(f"❌ Usage limit reached ({used_count}/{usage_limit})")
                will_pass = False
            else:
                remaining = usage_limit - used_count
                print(f"   ✅ usage: {used_count}/{usage_limit} ({remaining} left)")
        else:
            print(f"   ✅ usage: {used_count}/unlimited")
        
        # Result
        if will_pass:
            print(f"   🎯 RESULT: ✅ WILL SHOW TO USER")
            passed.append(code)
        else:
            print(f"   🎯 RESULT: ❌ WILL NOT SHOW")
            for reason in reasons:
                print(f"      {reason}")
            failed.append(code)
        
        print("-" * 80)
    
    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}\n")
    
    print(f"✅ Coupons that WILL show: {len(passed)}")
    for code in passed:
        print(f"   - {code}")
    
    print(f"\n❌ Coupons that WON'T show: {len(failed)}")
    for code in failed:
        print(f"   - {code}")
    
    print(f"\n📊 Expected result: {len(passed)} coupons in /coupons/active\n")

if __name__ == "__main__":
    debug_coupons()
