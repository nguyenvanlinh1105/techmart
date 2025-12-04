from fastapi import APIRouter, HTTPException, status, Depends, Query, Body
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from collections import defaultdict

from .models import CouponCreate, CouponUpdate, CouponResponse, CouponType, CouponTarget
from .database import (
    coupons_collection, get_next_sequence, log_activity,
    orders_collection, users_collection, products_collection
)
from .auth import get_current_admin, get_current_user

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])

# ==================== ADMIN COUPON MANAGEMENT ====================

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon: CouponCreate,
    current_user: dict = Depends(get_current_admin)
):
    """
    Tạo mã giảm giá mới (Admin only)
    """
    
    # Check if code already exists
    if coupons_collection.find_one({"code": coupon.code.upper()}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giảm giá đã tồn tại"
        )
    
    # Validate dates
    if coupon.valid_to <= coupon.valid_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày kết thúc phải sau ngày bắt đầu"
        )
    
    # Validate discount value
    if coupon.discount_type == "percentage":
        if coupon.discount_value <= 0 or coupon.discount_value > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giảm giá phần trăm phải từ 1% đến 100%"
            )
        # If percentage is high, require max_discount
        if coupon.discount_value >= 50 and not coupon.max_discount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã giảm ≥50% nên có giới hạn tối đa (max_discount) để tránh lỗ"
            )
    elif coupon.discount_type == "fixed":
        if coupon.discount_value <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số tiền giảm phải lớn hơn 0"
            )
        if coupon.discount_value > 10000000:  # 10 triệu
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số tiền giảm quá lớn (>10 triệu). Vui lòng kiểm tra lại!"
            )
    
    coupon_dict = coupon.dict()
    coupon_dict["_id"] = f"coupon_{get_next_sequence('coupons')}"
    coupon_dict["code"] = coupon_dict["code"].upper()
    coupon_dict["created_at"] = datetime.utcnow()
    
    coupons_collection.insert_one(coupon_dict)
    
    log_activity(current_user["_id"], "COUPON_CREATED", {
        "coupon_id": coupon_dict["_id"],
        "code": coupon_dict["code"]
    })
    
    coupon_dict["id"] = coupon_dict["_id"]
    return CouponResponse(**coupon_dict)

@router.get("", response_model=List[CouponResponse])
async def get_coupons(
    current_user: dict = Depends(get_current_admin),
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000)  # Increased from 100 to 1000 for admin
):
    """
    Lấy danh sách mã giảm giá (Admin only)
    """
    
    query = {}
    if is_active is not None:
        query["is_active"] = is_active
    
    skip = (page - 1) * limit
    
    coupons = list(
        coupons_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for coupon in coupons:
        coupon["id"] = coupon["_id"]
        result.append(CouponResponse(**coupon))
    
    return result

@router.get("/active", response_model=List[CouponResponse])
async def get_active_coupons(
    current_user: dict = Depends(get_current_user)
):
    """
    Lấy danh sách mã giảm giá đang hoạt động (cho user)
    """
    
    now = datetime.utcnow()
    
    # Get all coupons for debugging
    all_coupons = list(coupons_collection.find({}))
    print(f"\n📊 Total coupons in DB: {len(all_coupons)}")
    
    # Filter active coupons
    coupons = list(
        coupons_collection.find({
            "is_active": True,
            "valid_from": {"$lte": now},
            "valid_to": {"$gte": now}
        })
    )
    
    print(f"✅ Active coupons (after date filter): {len(coupons)}")
    
    result = []
    for coupon in coupons:
        # Check if usage limit reached
        if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
            print(f"❌ Skipping {coupon['code']}: usage limit reached ({coupon.get('used_count')}/{coupon.get('usage_limit')})")
            continue
        
        print(f"✅ Including coupon: {coupon['code']}")
        coupon["id"] = coupon["_id"]
        result.append(CouponResponse(**coupon))
    
    print(f"📋 Final result: {len(result)} coupons\n")
    return result

@router.get("/{coupon_id}", response_model=CouponResponse)
async def get_coupon(
    coupon_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    Lấy chi tiết mã giảm giá (Admin only)
    """
    
    coupon = coupons_collection.find_one({"_id": coupon_id})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy mã giảm giá"
        )
    
    coupon["id"] = coupon["_id"]
    return CouponResponse(**coupon)

@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str,
    coupon_update: CouponUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """
    Cập nhật mã giảm giá (Admin only)
    """
    
    coupon = coupons_collection.find_one({"_id": coupon_id})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy mã giảm giá"
        )
    
    update_data = {k: v for k, v in coupon_update.dict().items() if v is not None}
    
    if update_data:
        coupons_collection.update_one(
            {"_id": coupon_id},
            {"$set": update_data}
        )
        
        log_activity(current_user["_id"], "COUPON_UPDATED", {
            "coupon_id": coupon_id,
            "code": coupon["code"]
        })
    
    updated_coupon = coupons_collection.find_one({"_id": coupon_id})
    updated_coupon["id"] = updated_coupon["_id"]
    return CouponResponse(**updated_coupon)

@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    Xóa mã giảm giá (Admin only)
    """
    
    coupon = coupons_collection.find_one({"_id": coupon_id})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy mã giảm giá"
        )
    
    coupons_collection.delete_one({"_id": coupon_id})
    
    log_activity(current_user["_id"], "COUPON_DELETED", {
        "coupon_id": coupon_id,
        "code": coupon["code"]
    })
    
    return {"message": "Đã xóa mã giảm giá thành công"}

class ValidateCouponRequest(BaseModel):
    cart_items: Optional[List[Dict[str, Any]]] = []

@router.post("/validate")
async def validate_coupon(
    code: str = Query(...),
    order_total: float = Query(...),
    request_body: ValidateCouponRequest = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Kiểm tra mã giảm giá có hợp lệ không (nâng cao)
    """
    cart_items = request_body.cart_items
    
    coupon = coupons_collection.find_one({"code": code.upper()})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã giảm giá không tồn tại"
        )
    
    # Check if active
    if not coupon.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giảm giá đã bị vô hiệu hóa"
        )
    
    # Check date range
    now = datetime.utcnow()
    if now < coupon["valid_from"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giảm giá chưa có hiệu lực"
        )
    if now > coupon["valid_to"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giảm giá đã hết hạn"
        )
    
    # Check usage limit
    if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giảm giá đã hết lượt sử dụng"
        )
    
    # Check usage per user
    if coupon.get("usage_per_user"):
        user_usage = orders_collection.count_documents({
            "user_id": current_user["_id"],
            "coupon_code": code.upper()
        })
        if user_usage >= coupon["usage_per_user"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bạn đã sử dụng mã này {user_usage} lần (tối đa {coupon['usage_per_user']} lần)"
            )
    
    # Check target type
    target_type = coupon.get("target_type", "all")
    if target_type == "new_user":
        # Check if user is new (no previous orders)
        order_count = orders_collection.count_documents({"user_id": current_user["_id"]})
        if order_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã này chỉ dành cho khách hàng mới"
            )
    elif target_type == "vip":
        # Check if user is VIP (total spent > 50M)
        user_orders = list(orders_collection.find({"user_id": current_user["_id"]}))
        total_spent = sum(float(order.get("total", 0)) for order in user_orders)
        if total_spent < 50000000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã này chỉ dành cho khách hàng VIP"
            )
    elif target_type in ["category", "product", "seller"] and cart_items:
        # Check if cart contains target items
        target_ids = coupon.get("target_ids", [])
        if target_ids:
            valid_items = []
            for item in cart_items:
                product = products_collection.find_one({"_id": item["product_id"]})
                if product:
                    if target_type == "category" and product.get("category_id") in target_ids:
                        valid_items.append(item)
                    elif target_type == "product" and product["_id"] in target_ids:
                        valid_items.append(item)
                    elif target_type == "seller" and product.get("seller_id") in target_ids:
                        valid_items.append(item)
            
            if not valid_items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Giỏ hàng không có sản phẩm áp dụng mã này"
                )
    
    # Check minimum order value
    if coupon.get("min_order_value") and order_total < coupon["min_order_value"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Đơn hàng tối thiểu {coupon['min_order_value']:,.0f}đ để sử dụng mã này"
        )
    
    # Calculate discount
    discount = calculate_discount(coupon, order_total, cart_items)
    
    return {
        "valid": True,
        "code": coupon["code"],
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        "discount_amount": discount,
        "description": coupon.get("description"),
        "target_type": target_type
    }

def calculate_discount(coupon: dict, order_total: float, cart_items: Optional[List[Dict]] = None) -> float:
    """
    Tính toán số tiền giảm giá
    """
    discount_type = coupon.get("discount_type", "percentage")
    
    if discount_type == "percentage":
        discount = order_total * (coupon["discount_value"] / 100)
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    
    elif discount_type == "fixed":
        discount = coupon["discount_value"]
    
    elif discount_type == "freeship":
        # Giả sử phí ship là 30000đ
        discount = min(30000, order_total)
    
    elif discount_type == "tiered":
        # Giảm theo bậc
        tiers = coupon.get("tiers", [])
        discount = 0
        for tier in sorted(tiers, key=lambda x: x.get("min", 0), reverse=True):
            if order_total >= tier.get("min", 0):
                tier_discount = tier.get("discount", 0)
                if tier.get("type") == "percentage":
                    discount = order_total * (tier_discount / 100)
                else:
                    discount = tier_discount
                break
    
    elif discount_type == "buy_x_get_y":
        # Mua X tặng Y - cần cart_items
        discount = 0
        if cart_items:
            buy_qty = coupon.get("buy_quantity", 1)
            get_qty = coupon.get("get_quantity", 1)
            total_qty = sum(item.get("quantity", 0) for item in cart_items)
            if total_qty >= buy_qty:
                # Tính giá trị sản phẩm rẻ nhất để tặng
                cheapest_price = min(item.get("price", 0) for item in cart_items)
                discount = cheapest_price * get_qty
    
    else:
        discount = 0
    
    # Không được vượt quá tổng đơn hàng
    return min(discount, order_total)

@router.get("/auto-apply")
async def get_auto_apply_coupons(
    order_total: float,
    cart_items: Optional[str] = None,  # JSON string
    current_user: dict = Depends(get_current_user)
):
    """
    Lấy danh sách mã giảm giá tự động áp dụng
    """
    import json
    
    cart_data = json.loads(cart_items) if cart_items else []
    
    now = datetime.utcnow()
    
    # Tìm các mã có thể áp dụng
    applicable_coupons = list(
        coupons_collection.find({
            "is_active": True,
            "is_auto_apply": True,
            "valid_from": {"$lte": now},
            "valid_to": {"$gte": now}
        }).sort("priority", -1)
    )
    
    best_coupon = None
    best_discount = 0
    
    for coupon in applicable_coupons:
        try:
            # Validate coupon
            if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
                continue
            
            if coupon.get("min_order_value") and order_total < coupon["min_order_value"]:
                continue
            
            # Calculate discount
            discount = calculate_discount(coupon, order_total, cart_data)
            
            if discount > best_discount:
                best_discount = discount
                best_coupon = coupon
        except:
            continue
    
    if best_coupon:
        return {
            "code": best_coupon["code"],
            "discount_amount": best_discount,
            "description": best_coupon.get("description")
        }
    
    return None

@router.get("/stats/overview")
async def get_coupon_stats(
    current_user: dict = Depends(get_current_admin)
):
    """
    Thống kê mã giảm giá nâng cao
    """
    
    total_coupons = coupons_collection.count_documents({})
    active_coupons = coupons_collection.count_documents({"is_active": True})
    
    now = datetime.utcnow()
    valid_coupons = coupons_collection.count_documents({
        "is_active": True,
        "valid_from": {"$lte": now},
        "valid_to": {"$gte": now}
    })
    
    # Get all coupons with usage
    all_coupons = list(coupons_collection.find({}))
    
    # Calculate total discount given
    total_discount_given = 0
    coupon_usage_by_type = defaultdict(lambda: {"count": 0, "discount": 0})
    
    for coupon in all_coupons:
        # Find orders using this coupon
        orders_with_coupon = list(orders_collection.find({"coupon_code": coupon["code"]}))
        
        for order in orders_with_coupon:
            discount = order.get("discount", 0)
            total_discount_given += discount
            coupon_usage_by_type[coupon["discount_type"]]["count"] += 1
            coupon_usage_by_type[coupon["discount_type"]]["discount"] += discount
    
    # Get most used coupons
    most_used = list(
        coupons_collection
        .find({})
        .sort("used_count", -1)
        .limit(10)
    )
    
    most_used_list = []
    for coupon in most_used:
        # Calculate revenue impact
        orders_with_coupon = list(orders_collection.find({"coupon_code": coupon["code"]}))
        total_orders = len(orders_with_coupon)
        total_revenue = sum(order.get("total", 0) for order in orders_with_coupon)
        total_discount = sum(order.get("discount", 0) for order in orders_with_coupon)
        
        most_used_list.append({
            "code": coupon["code"],
            "description": coupon.get("description"),
            "used_count": coupon.get("used_count", 0),
            "discount_type": coupon["discount_type"],
            "discount_value": coupon["discount_value"],
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_discount": total_discount,
            "avg_discount": total_discount / total_orders if total_orders > 0 else 0,
            "conversion_rate": (total_orders / coupon.get("used_count", 1)) * 100 if coupon.get("used_count") else 0
        })
    
    # Get expiring soon coupons (within 7 days)
    from datetime import timedelta
    expiring_soon = list(
        coupons_collection.find({
            "is_active": True,
            "valid_to": {
                "$gte": now,
                "$lte": now + timedelta(days=7)
            }
        })
    )
    
    # Get best performing coupons (by revenue)
    best_performers = sorted(most_used_list, key=lambda x: x["total_revenue"], reverse=True)[:5]
    
    return {
        "overview": {
            "total_coupons": total_coupons,
            "active_coupons": active_coupons,
            "valid_coupons": valid_coupons,
            "expired_coupons": total_coupons - valid_coupons,
            "expiring_soon": len(expiring_soon),
            "total_discount_given": total_discount_given
        },
        "usage_by_type": dict(coupon_usage_by_type),
        "most_used": most_used_list,
        "best_performers": best_performers,
        "expiring_soon_list": [
            {
                "code": c["code"],
                "valid_to": c["valid_to"].isoformat(),
                "days_left": (c["valid_to"] - now).days
            }
            for c in expiring_soon
        ]
    }

@router.get("/debug/all")
async def debug_all_coupons(
    current_user: dict = Depends(get_current_user)
):
    """
    Debug: Xem tất cả mã và lý do bị lọc
    """
    
    now = datetime.utcnow()
    
    # Get all coupons
    all_coupons = list(coupons_collection.find({}))
    
    result = []
    for coupon in all_coupons:
        status = {
            "code": coupon["code"],
            "is_active": coupon.get("is_active", True),
            "discount_type": coupon.get("discount_type"),
            "discount_value": coupon.get("discount_value"),
            "max_discount": coupon.get("max_discount"),
            "min_order_value": coupon.get("min_order_value", 0),
            "valid_from": coupon.get("valid_from").isoformat() if coupon.get("valid_from") else None,
            "valid_to": coupon.get("valid_to").isoformat() if coupon.get("valid_to") else None,
            "usage_limit": coupon.get("usage_limit"),
            "used_count": coupon.get("used_count", 0),
            "will_show": True,
            "reasons": []
        }
        
        # Check conditions
        if not coupon.get("is_active", True):
            status["will_show"] = False
            status["reasons"].append("Mã bị tắt (is_active = false)")
        
        if coupon.get("valid_from") and coupon["valid_from"] > now:
            status["will_show"] = False
            days_until = (coupon["valid_from"] - now).days
            status["reasons"].append(f"Chưa đến ngày bắt đầu (còn {days_until} ngày)")
        
        if coupon.get("valid_to") and coupon["valid_to"] < now:
            status["will_show"] = False
            days_ago = (now - coupon["valid_to"]).days
            status["reasons"].append(f"Đã hết hạn ({days_ago} ngày trước)")
        
        if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
            status["will_show"] = False
            status["reasons"].append(f"Đã hết lượt ({coupon.get('used_count')}/{coupon.get('usage_limit')})")
        
        if not status["reasons"]:
            status["reasons"].append("✅ Hợp lệ")
        
        result.append(status)
    
    return {
        "total": len(all_coupons),
        "valid": sum(1 for c in result if c["will_show"]),
        "invalid": sum(1 for c in result if not c["will_show"]),
        "coupons": result
    }

@router.get("/stats/performance")
async def get_coupon_performance(
    coupon_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    Thống kê hiệu suất chi tiết của một mã giảm giá
    """
    
    coupon = coupons_collection.find_one({"_id": coupon_id})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy mã giảm giá"
        )
    
    # Get all orders using this coupon
    orders = list(orders_collection.find({"coupon_code": coupon["code"]}))
    
    # Calculate metrics
    total_orders = len(orders)
    total_revenue = sum(order.get("total", 0) for order in orders)
    total_discount = sum(order.get("discount", 0) for order in orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Revenue by day
    revenue_by_day = defaultdict(lambda: {"orders": 0, "revenue": 0, "discount": 0})
    for order in orders:
        date_key = order["created_at"].strftime("%Y-%m-%d")
        revenue_by_day[date_key]["orders"] += 1
        revenue_by_day[date_key]["revenue"] += order.get("total", 0)
        revenue_by_day[date_key]["discount"] += order.get("discount", 0)
    
    # Customer segments
    customer_segments = defaultdict(int)
    for order in orders:
        user = users_collection.find_one({"_id": order["user_id"]})
        if user:
            # Check if new customer
            user_orders = orders_collection.count_documents({"user_id": user["_id"]})
            if user_orders == 1:
                customer_segments["new"] += 1
            else:
                customer_segments["returning"] += 1
    
    # Product categories affected
    category_impact = defaultdict(lambda: {"orders": 0, "revenue": 0})
    for order in orders:
        for item in order.get("items", []):
            product = products_collection.find_one({"_id": item["product_id"]})
            if product:
                cat_id = product.get("category_id")
                if cat_id:
                    category_impact[cat_id]["orders"] += 1
                    category_impact[cat_id]["revenue"] += item.get("subtotal", 0)
    
    return {
        "coupon": {
            "code": coupon["code"],
            "description": coupon.get("description"),
            "discount_type": coupon["discount_type"],
            "discount_value": coupon["discount_value"]
        },
        "performance": {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_discount": total_discount,
            "avg_order_value": avg_order_value,
            "discount_rate": (total_discount / total_revenue * 100) if total_revenue > 0 else 0,
            "roi": ((total_revenue - total_discount) / total_discount) if total_discount > 0 else 0
        },
        "timeline": [
            {
                "date": date,
                "orders": data["orders"],
                "revenue": data["revenue"],
                "discount": data["discount"]
            }
            for date, data in sorted(revenue_by_day.items())
        ],
        "customer_segments": dict(customer_segments),
        "category_impact": dict(category_impact)
    }
