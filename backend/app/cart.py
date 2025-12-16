from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from datetime import datetime

from .models import CartUpdate, CartResponse, CartItem, CouponResponse
from .database import (
    carts_collection, products_collection, coupons_collection,
    get_next_sequence, log_activity
)
from .auth import get_current_user

router = APIRouter(prefix="/api", tags=["Cart & Coupons"])

# ==================== CART ROUTES (F13-F16) ====================

def calculate_cart_totals(items: list):
    """Tính tổng tiền giỏ hàng"""
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    total_items = sum(item["quantity"] for item in items)
    return subtotal, total_items

@router.get("/cart", response_model=CartResponse)
async def get_cart(
    current_user: dict = Depends(get_current_user),
    session_id: Optional[str] = None
):
    """
    Lấy giỏ hàng của user
    F15: Xem giỏ hàng
    """
    
    # Find cart by user_id or session_id
    query = {"user_id": current_user["_id"]}
    if session_id:
        query = {"$or": [{"user_id": current_user["_id"]}, {"session_id": session_id}]}
    
    cart = carts_collection.find_one(query)
    
    if not cart:
        # Create empty cart
        cart = {
            "_id": f"cart_{get_next_sequence('carts')}",
            "user_id": current_user["_id"],
            "items": [],
            "updated_at": datetime.utcnow()
        }
        carts_collection.insert_one(cart)
    
    subtotal, total_items = calculate_cart_totals(cart.get("items", []))
    
    return CartResponse(
        id=cart["_id"],
        user_id=cart.get("user_id"),
        session_id=cart.get("session_id"),
        items=cart.get("items", []),
        subtotal=subtotal,
        total_items=total_items,
        updated_at=cart["updated_at"]
    )

@router.post("/cart/add")
async def add_to_cart(
    product_id: str,
    quantity: int = 1,
    variant: Optional[dict] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Thêm sản phẩm vào giỏ hàng
    F13: Chọn size & số lượng
    F14: Add to Cart
    """
    
    # Get product
    product = products_collection.find_one({"_id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check stock
    if product["stock"] < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock"
        )
    
    # Get or create cart
    cart = carts_collection.find_one({"user_id": current_user["_id"]})
    
    if not cart:
        cart = {
            "_id": f"cart_{get_next_sequence('carts')}",
            "user_id": current_user["_id"],
            "items": [],
            "updated_at": datetime.utcnow()
        }
        carts_collection.insert_one(cart)
    
    # Check if product already in cart
    items = cart.get("items", [])
    existing_item = None
    
    for item in items:
        if item["product_id"] == product_id and item.get("variant") == variant:
            existing_item = item
            break
    
    if existing_item:
        # Update quantity
        carts_collection.update_one(
            {
                "_id": cart["_id"],
                "items.product_id": product_id,
                "items.variant": variant
            },
            {
                "$inc": {"items.$.quantity": quantity},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    else:
        # Add new item
        new_item = {
            "product_id": product_id,
            "quantity": quantity,
            "variant": variant,
            "price": product["price"]
        }
        
        carts_collection.update_one(
            {"_id": cart["_id"]},
            {
                "$push": {"items": new_item},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    log_activity(current_user["_id"], "ADDED_TO_CART", {
        "product_id": product_id,
        "quantity": quantity
    })
    
    return {"message": "Product added to cart successfully"}

@router.put("/cart/update")
async def update_cart(
    cart_update: CartUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cập nhật giỏ hàng
    F16: Chỉnh sửa giỏ hàng
    """
    
    cart = carts_collection.find_one({"user_id": current_user["_id"]})
    
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    # Validate all products and stock
    for item in cart_update.items:
        product = products_collection.find_one({"_id": item.product_id})
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product['name']}"
            )
    
    # Update cart
    items_dict = [item.dict() for item in cart_update.items]
    
    carts_collection.update_one(
        {"_id": cart["_id"]},
        {
            "$set": {
                "items": items_dict,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    log_activity(current_user["_id"], "CART_UPDATED")
    
    return {"message": "Cart updated successfully"}

@router.delete("/cart/item/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Xóa sản phẩm khỏi giỏ hàng"""
    
    result = carts_collection.update_one(
        {"user_id": current_user["_id"]},
        {
            "$pull": {"items": {"product_id": product_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    log_activity(current_user["_id"], "REMOVED_FROM_CART", {"product_id": product_id})
    
    return {"message": "Item removed from cart"}

@router.delete("/cart/clear")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Xóa tất cả sản phẩm trong giỏ hàng"""
    
    carts_collection.update_one(
        {"user_id": current_user["_id"]},
        {
            "$set": {
                "items": [],
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    log_activity(current_user["_id"], "CART_CLEARED")
    
    return {"message": "Cart cleared successfully"}

# ==================== COUPON ROUTES (F17, F35) ====================

@router.get("/coupons/validate/{code}")
async def validate_coupon(
    code: str,
    cart_total: float,
    current_user: dict = Depends(get_current_user)
):
    """
    Kiểm tra mã giảm giá
    F17: Áp dụng mã giảm giá
    """
    
    coupon = coupons_collection.find_one({"code": code.upper()})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    # Check if active
    if not coupon.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon is not active"
        )
    
    # Check date validity
    now = datetime.utcnow()
    if now < coupon["valid_from"] or now > coupon["valid_to"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon has expired or not yet valid"
        )
    
    # Check usage limit
    if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon usage limit reached"
        )
    
    # Check minimum order value
    if coupon.get("min_order_value") and cart_total < coupon["min_order_value"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order value is {coupon['min_order_value']}"
        )
    
    # Calculate discount
    if coupon["discount_type"] == "percentage":
        discount = cart_total * (coupon["discount_value"] / 100)
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    else:  # fixed
        discount = coupon["discount_value"]
    
    return {
        "code": coupon["code"],
        "discount": discount,
        "discount_type": coupon["discount_type"],
        "discount_value": coupon["discount_value"],
        "description": coupon.get("description", "")
    }

@router.get("/coupons/available")
async def get_available_coupons(current_user: dict = Depends(get_current_user)):
    """Lấy danh sách mã giảm giá khả dụng"""
    
    now = datetime.utcnow()
    
    coupons = list(coupons_collection.find({
        "is_active": True,
        "valid_from": {"$lte": now},
        "valid_to": {"$gte": now}
    }))
    
    result = []
    for coupon in coupons:
        # Check usage limit
        if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
            continue
        
        result.append(CouponResponse(
            id=coupon["_id"],
            code=coupon["code"],
            description=coupon.get("description"),
            discount_type=coupon["discount_type"],
            discount_value=coupon["discount_value"],
            min_order_value=coupon.get("min_order_value"),
            max_discount=coupon.get("max_discount"),
            valid_from=coupon["valid_from"],
            valid_to=coupon["valid_to"],
            usage_limit=coupon.get("usage_limit"),
            used_count=coupon.get("used_count", 0),
            is_active=coupon.get("is_active", True),
            created_at=coupon["created_at"]
        ))
    
    return result

