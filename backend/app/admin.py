from fastapi import APIRouter, HTTPException, status, Depends, Query, Body, UploadFile, File
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import os

# Múi giờ Việt Nam (UTC+7)
VIETNAM_TZ = timezone(timedelta(hours=7))

def get_vietnam_now():
    """Lấy thời gian hiện tại theo múi giờ Việt Nam"""
    return datetime.now(VIETNAM_TZ)

from .models import (
    UserResponse, CouponCreate, CouponUpdate, CouponResponse,
    SalesStats, ProductStats, UserStats, UserRole, SellerStatus, ProductApprovalStatus
)
from .database import (
    users_collection, products_collection, orders_collection,
    coupons_collection, activity_logs_collection, categories_collection,
    get_next_sequence, log_activity, create_notification_safe
)
from .auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ==================== IMAGE UPLOAD ====================

@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin)
):
    """Upload image for products"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    try:
        # Create upload directory
        upload_dir = "uploads/products"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Return URL
        image_url = f"http://localhost:8000/uploads/products/{unique_filename}"
        
        try:
            log_activity(current_user["_id"], "IMAGE_UPLOADED", {
                "filename": unique_filename,
                "original_name": file.filename
            })
        except Exception as e:
            print(f"Warning: Could not log activity: {e}")
        
        return {"url": image_url, "filename": unique_filename}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

# ==================== USER MANAGEMENT (F33) ====================

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: dict = Depends(get_current_admin),
    role: Optional[UserRole] = None,
    is_verified: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Lấy danh sách người dùng (Admin only) - F33 - KHÔNG bao gồm sellers"""
    
    # Exclude sellers - sellers được quản lý riêng ở /admin/sellers
    query = {"role": {"$ne": UserRole.SELLER}}
    
    if role:
        # Nếu role được chỉ định, vẫn loại trừ sellers
        if role != UserRole.SELLER:
            query["role"] = role
        else:
            # Nếu query sellers, return empty (dùng /admin/sellers thay thế)
            return []
    
    if is_verified is not None:
        query["is_verified"] = is_verified
    
    skip = (page - 1) * limit
    
    users = list(
        users_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for user in users:
        result.append(UserResponse(
            id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            phone=user.get("phone"),
            avatar=user.get("avatar"),
            role=user["role"],
            is_verified=user.get("is_verified", False),
            created_at=user["created_at"],
            addresses=user.get("addresses", [])
        ))
    
    return result

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: dict = Depends(get_current_admin)
):
    """Cập nhật quyền người dùng - F33"""
    
    user = users_collection.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"role": new_role}}
    )
    
    log_activity(current_user["_id"], "USER_ROLE_UPDATED", {
        "user_id": user_id,
        "new_role": new_role
    })
    
    return {"message": f"User role updated to {new_role}"}

@router.patch("/users/{user_id}/block")
async def block_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Khóa tài khoản người dùng - F33"""
    
    user = users_collection.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user["role"] == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot block admin user"
        )
    
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"is_blocked": True}}
    )
    
    log_activity(current_user["_id"], "USER_BLOCKED", {"user_id": user_id})
    
    return {"message": "User blocked successfully"}

@router.patch("/users/{user_id}/unblock")
async def unblock_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Mở khóa tài khoản người dùng - F33"""
    
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"is_blocked": False}}
    )
    
    log_activity(current_user["_id"], "USER_UNBLOCKED", {"user_id": user_id})
    
    return {"message": "User unblocked successfully"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Xóa người dùng - F33"""
    
    user = users_collection.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user["role"] == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete admin user"
        )
    
    # Check if user has active orders
    active_orders = orders_collection.count_documents({
        "user_id": user_id,
        "status": {"$in": ["pending", "confirmed", "processing", "shipping"]}
    })
    
    if active_orders > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete user with active orders"
        )
    
    users_collection.delete_one({"_id": user_id})
    
    log_activity(current_user["_id"], "USER_DELETED", {"user_id": user_id})
    
    return {"message": "User deleted successfully"}

# ==================== COUPON MANAGEMENT (F35) ====================

@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon: CouponCreate,
    current_user: dict = Depends(get_current_admin)
):
    """Tạo mã giảm giá mới - F35"""
    
    # Check if code already exists
    if coupons_collection.find_one({"code": coupon.code.upper()}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists"
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
    
    return CouponResponse(**coupon_dict)

@router.get("/coupons", response_model=List[CouponResponse])
async def get_all_coupons(
    current_user: dict = Depends(get_current_admin),
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Lấy danh sách mã giảm giá - F35"""
    
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
        result.append(CouponResponse(**coupon))
    
    return result

@router.put("/coupons/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str,
    coupon_update: CouponUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Cập nhật mã giảm giá - F35"""
    
    coupon = coupons_collection.find_one({"_id": coupon_id})
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    update_data = {k: v for k, v in coupon_update.dict().items() if v is not None}
    
    coupons_collection.update_one(
        {"_id": coupon_id},
        {"$set": update_data}
    )
    
    log_activity(current_user["_id"], "COUPON_UPDATED", {"coupon_id": coupon_id})
    
    updated_coupon = coupons_collection.find_one({"_id": coupon_id})
    return CouponResponse(**updated_coupon)

@router.delete("/coupons/{coupon_id}")
async def delete_coupon(
    coupon_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Xóa mã giảm giá - F35"""
    
    result = coupons_collection.delete_one({"_id": coupon_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    log_activity(current_user["_id"], "COUPON_DELETED", {"coupon_id": coupon_id})
    
    return {"message": "Coupon deleted successfully"}

# ==================== PRODUCT MANAGEMENT ====================

@router.get("/products")
async def get_all_products_admin(
    current_user: dict = Depends(get_current_admin),
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Lấy tất cả sản phẩm cho admin"""
    
    query = {}
    
    if category_id:
        query["category_id"] = category_id
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    
    products = list(
        products_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for prod in products:
        result.append({
            "id": prod["_id"],
            "_id": prod["_id"],
            "name": prod["name"],
            "slug": prod["slug"],
            "description": prod["description"],
            "short_description": prod.get("short_description"),
            "category_id": prod["category_id"],
            "brand": prod.get("brand"),
            "price": prod["price"],
            "compare_price": prod.get("compare_price"),
            "stock": prod["stock"],
            "sku": prod.get("sku"),
            "images": prod.get("images", []),
            "variants": prod.get("variants", []),
            "tags": prod.get("tags", []),
            "is_featured": prod.get("is_featured", False),
            "is_on_sale": prod.get("is_on_sale", False),
            "rating": prod.get("rating", 0.0),
            "review_count": prod.get("review_count", 0),
            "sold_count": prod.get("sold_count", 0),
            "view_count": prod.get("view_count", 0),
            "created_at": prod["created_at"],
            "updated_at": prod["updated_at"]
        })
    
    return result

@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: dict,
    current_user: dict = Depends(get_current_admin)
):
    """Tạo sản phẩm mới (Admin)"""
    
    # Validate required fields
    required_fields = ['name', 'category_id', 'brand', 'price', 'stock']
    for field in required_fields:
        if field not in product_data or product_data[field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Check if category exists
    if not categories_collection.find_one({"_id": product_data["category_id"]}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )
    
    # Generate slug if not provided
    if not product_data.get("slug"):
        base_slug = product_data["name"].lower()
        # Convert Vietnamese to ASCII
        base_slug = (base_slug
            .replace('à', 'a').replace('á', 'a').replace('ạ', 'a').replace('ả', 'a').replace('ã', 'a')
            .replace('â', 'a').replace('ầ', 'a').replace('ấ', 'a').replace('ậ', 'a').replace('ẩ', 'a').replace('ẫ', 'a')
            .replace('ă', 'a').replace('ằ', 'a').replace('ắ', 'a').replace('ặ', 'a').replace('ẳ', 'a').replace('ẵ', 'a')
            .replace('è', 'e').replace('é', 'e').replace('ẹ', 'e').replace('ẻ', 'e').replace('ẽ', 'e')
            .replace('ê', 'e').replace('ề', 'e').replace('ế', 'e').replace('ệ', 'e').replace('ể', 'e').replace('ễ', 'e')
            .replace('ì', 'i').replace('í', 'i').replace('ị', 'i').replace('ỉ', 'i').replace('ĩ', 'i')
            .replace('ò', 'o').replace('ó', 'o').replace('ọ', 'o').replace('ỏ', 'o').replace('õ', 'o')
            .replace('ô', 'o').replace('ồ', 'o').replace('ố', 'o').replace('ộ', 'o').replace('ổ', 'o').replace('ỗ', 'o')
            .replace('ơ', 'o').replace('ờ', 'o').replace('ớ', 'o').replace('ợ', 'o').replace('ở', 'o').replace('ỡ', 'o')
            .replace('ù', 'u').replace('ú', 'u').replace('ụ', 'u').replace('ủ', 'u').replace('ũ', 'u')
            .replace('ư', 'u').replace('ừ', 'u').replace('ứ', 'u').replace('ự', 'u').replace('ử', 'u').replace('ữ', 'u')
            .replace('ỳ', 'y').replace('ý', 'y').replace('ỵ', 'y').replace('ỷ', 'y').replace('ỹ', 'y')
            .replace('đ', 'd'))
        
        import re
        base_slug = re.sub(r'[^a-z0-9\s]', '', base_slug)
        base_slug = re.sub(r'\s+', '-', base_slug.strip())
        product_data["slug"] = f"{base_slug}-{get_next_sequence('products')}"
    
    # Create product dict based on seed_data.py structure
    product_dict = {
        "_id": f"prod_{get_next_sequence('products')}",
        "name": product_data["name"],
        "slug": product_data.get("slug"),
        "description": product_data.get("description", ""),
        "short_description": product_data.get("short_description", product_data.get("description", "")[:100]),
        "category_id": product_data["category_id"],
        "brand": product_data["brand"],
        "price": int(product_data["price"]),
        "compare_price": int(product_data.get("compare_price", 0)) if product_data.get("compare_price") else None,
        "stock": int(product_data["stock"]),
        "sku": product_data.get("sku", f"{product_data['brand'][:3].upper()}-{get_next_sequence('products')}"),
        "images": product_data.get("images", [{"url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", "is_primary": True, "alt_text": product_data["name"]}]),
        "variants": product_data.get("variants", []),
        "tags": product_data.get("tags", [product_data["brand"].lower(), "admin-created"]),
        "is_featured": product_data.get("is_featured", False),
        "is_on_sale": product_data.get("is_on_sale", False),
        "rating": 0.0,
        "review_count": 0,
        "sold_count": 0,
        "view_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    products_collection.insert_one(product_dict)
    
    try:
        log_activity(current_user["_id"], "PRODUCT_CREATED", {
            "product_id": product_dict["_id"],
            "product_name": product_dict["name"]
        })
    except Exception as e:
        print(f"Warning: Could not log activity: {e}")
    
    return {"message": "Product created successfully", "product_id": product_dict["_id"]}

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product_data: dict,
    current_user: dict = Depends(get_current_admin)
):
    """Cập nhật sản phẩm (Admin)"""
    
    product = products_collection.find_one({"_id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Prepare update data
    update_data = {}
    
    # Only update fields that are provided
    if "name" in product_data:
        update_data["name"] = product_data["name"]
    if "description" in product_data:
        update_data["description"] = product_data["description"]
    if "short_description" in product_data:
        update_data["short_description"] = product_data["short_description"]
    if "category_id" in product_data:
        update_data["category_id"] = product_data["category_id"]
    if "brand" in product_data:
        update_data["brand"] = product_data["brand"]
    if "price" in product_data:
        update_data["price"] = int(product_data["price"])
    if "compare_price" in product_data:
        update_data["compare_price"] = int(product_data["compare_price"]) if product_data["compare_price"] else None
    if "stock" in product_data:
        update_data["stock"] = int(product_data["stock"])
    if "sku" in product_data:
        update_data["sku"] = product_data["sku"]
    if "images" in product_data:
        update_data["images"] = product_data["images"]
    if "variants" in product_data:
        update_data["variants"] = product_data["variants"]
    if "tags" in product_data:
        update_data["tags"] = product_data["tags"]
    if "is_featured" in product_data:
        update_data["is_featured"] = product_data["is_featured"]
    if "is_on_sale" in product_data:
        update_data["is_on_sale"] = product_data["is_on_sale"]
    
    update_data["updated_at"] = datetime.utcnow()
    
    products_collection.update_one(
        {"_id": product_id},
        {"$set": update_data}
    )
    
    try:
        log_activity(current_user["_id"], "PRODUCT_UPDATED", {"product_id": product_id})
    except Exception as e:
        print(f"Warning: Could not log activity: {e}")
    
    return {"message": "Product updated successfully"}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Xóa sản phẩm (Admin)"""
    
    result = products_collection.delete_one({"_id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    try:
        log_activity(current_user["_id"], "PRODUCT_DELETED", {"product_id": product_id})
    except Exception as e:
        print(f"Warning: Could not log activity: {e}")
    
    return {"message": "Product deleted successfully"}

# ==================== STATISTICS & ANALYTICS (F36) ====================

@router.get("/stats/sales")
async def get_sales_stats(
    current_user: dict = Depends(get_current_admin),
    period: str = "daily"  # daily, weekly, monthly, yearly
):
    """Thống kê doanh thu - F36"""
    
    # Calculate date range based on period (Vietnam timezone)
    now = get_vietnam_now()
    
    if period == "daily":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    elif period == "yearly":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    # Remove timezone for MongoDB query
    start_date = start_date.replace(tzinfo=None)
    
    # Aggregate orders
    pipeline = [
        {
            "$match": {
                "status": "delivered",
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total"},
                "total_orders": {"$sum": 1},
                "total_products_sold": {
                    "$sum": {
                        "$sum": "$items.quantity"
                    }
                }
            }
        }
    ]
    
    result = list(orders_collection.aggregate(pipeline))
    
    if result:
        stats = result[0]
        return SalesStats(
            total_revenue=stats.get("total_revenue", 0),
            total_orders=stats.get("total_orders", 0),
            total_products_sold=stats.get("total_products_sold", 0),
            average_order_value=stats.get("total_revenue", 0) / stats.get("total_orders", 1),
            period=period
        )
    else:
        return SalesStats(
            total_revenue=0,
            total_orders=0,
            total_products_sold=0,
            average_order_value=0,
            period=period
        )

@router.get("/stats/products/best-sellers")
async def get_best_selling_products(
    current_user: dict = Depends(get_current_admin),
    limit: int = Query(10, le=50)
):
    """Sản phẩm bán chạy - F36"""
    
    products = list(
        products_collection
        .find()
        .sort("sold_count", -1)
        .limit(limit)
    )
    
    result = []
    for product in products:
        result.append(ProductStats(
            product_id=product["_id"],
            product_name=product["name"],
            sold_count=product.get("sold_count", 0),
            revenue=product.get("sold_count", 0) * product["price"],
            stock=product["stock"]
        ))
    
    return result

@router.get("/stats/users")
async def get_user_stats(current_user: dict = Depends(get_current_admin)):
    """Thống kê người dùng - F36"""
    
    total_users = users_collection.count_documents({})
    
    # New users today (Vietnam timezone)
    today_start = get_vietnam_now().replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    new_users_today = users_collection.count_documents({
        "created_at": {"$gte": today_start}
    })
    
    # Active users (users with orders)
    active_users_pipeline = [
        {"$group": {"_id": "$user_id"}},
        {"$count": "active_users"}
    ]
    
    active_result = list(orders_collection.aggregate(active_users_pipeline))
    active_users = active_result[0]["active_users"] if active_result else 0
    
    # Verified users
    verified_users = users_collection.count_documents({"is_verified": True})
    
    return UserStats(
        total_users=total_users,
        new_users_today=new_users_today,
        active_users=active_users,
        verified_users=verified_users
    )

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_admin)):
    """Tổng quan dashboard - F36"""
    
    # Total stats
    total_users = users_collection.count_documents({})
    total_products = products_collection.count_documents({})
    total_orders = orders_collection.count_documents({})
    
    # Revenue
    revenue_pipeline = [
        {"$match": {"status": {"$in": ["delivered", "shipping", "processing"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    
    revenue_result = list(orders_collection.aggregate(revenue_pipeline))
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Monthly revenue (Vietnam timezone)
    now_vn = get_vietnam_now()
    monthly_start = (now_vn - timedelta(days=30)).replace(tzinfo=None)
    monthly_revenue_pipeline = [
        {
            "$match": {
                "status": {"$in": ["delivered", "shipping", "processing"]},
                "created_at": {"$gte": monthly_start}
            }
        },
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    
    monthly_revenue_result = list(orders_collection.aggregate(monthly_revenue_pipeline))
    monthly_revenue = monthly_revenue_result[0]["total"] if monthly_revenue_result else 0
    
    # Pending orders
    pending_orders = orders_collection.count_documents({"status": "pending"})
    
    # In stock products
    in_stock_products = products_collection.count_documents({"stock": {"$gt": 0}})
    
    # New users this week (Vietnam timezone)
    week_start = (now_vn - timedelta(days=7)).replace(tzinfo=None)
    new_users_week = users_collection.count_documents({"created_at": {"$gte": week_start}})
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue,
        "pending_orders": pending_orders,
        "in_stock_products": in_stock_products,
        "new_users_week": new_users_week
    }

# ==================== ACTIVITY LOGS (F40) ====================

@router.get("/activity-logs")
async def get_activity_logs(
    current_user: dict = Depends(get_current_admin),
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    """Xem log hoạt động - F40"""
    
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    
    if action:
        query["action"] = action
    
    skip = (page - 1) * limit
    
    logs = list(
        activity_logs_collection
        .find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    
    return logs

# ==================== SELLER MANAGEMENT ====================

@router.get("/sellers")
async def get_sellers(
    current_user: dict = Depends(get_current_admin),
    status: Optional[SellerStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Lấy danh sách sellers để admin duyệt"""
    
    query = {"role": UserRole.SELLER}
    
    if status:
        query["seller_status"] = status.value
    
    skip = (page - 1) * limit
    
    sellers = list(
        users_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for seller in sellers:
        # Count products
        product_count = products_collection.count_documents({"seller_id": seller["_id"]})
        
        result.append({
            "id": seller["_id"],
            "email": seller.get("email"),
            "full_name": seller.get("full_name"),
            "phone": seller.get("phone"),
            "store_name": seller.get("store_name"),
            "store_description": seller.get("store_description"),
            "tax_code": seller.get("tax_code"),
            "business_license": seller.get("business_license"),
            "seller_status": seller.get("seller_status"),
            "created_at": seller.get("created_at"),
            "product_count": product_count
        })
    
    return result

@router.patch("/sellers/{seller_id}/approve")
async def approve_seller(
    seller_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Admin duyệt tài khoản seller"""
    
    seller = users_collection.find_one({"_id": seller_id, "role": UserRole.SELLER})
    
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    # Update seller status
    users_collection.update_one(
        {"_id": seller_id},
        {
            "$set": {
                "seller_status": SellerStatus.APPROVED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification for seller
    create_notification_safe(
        user_id=seller_id,
        type="system",
        title="Tài khoản đã được duyệt",
        message=f"Tài khoản người bán '{seller.get('store_name')}' đã được admin duyệt. Bạn có thể bắt đầu bán hàng!"
    )
    
    log_activity(current_user["_id"], "SELLER_APPROVED", {
        "seller_id": seller_id,
        "store_name": seller.get("store_name")
    })
    
    return {"message": "Seller approved successfully"}

@router.patch("/sellers/{seller_id}/reject")
async def reject_seller(
    seller_id: str,
    current_user: dict = Depends(get_current_admin),
    reason: Optional[str] = Body(None, embed=True)
):
    """Admin từ chối tài khoản seller"""
    
    seller = users_collection.find_one({"_id": seller_id, "role": UserRole.SELLER})
    
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    # Update seller status
    users_collection.update_one(
        {"_id": seller_id},
        {
            "$set": {
                "seller_status": SellerStatus.REJECTED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification for seller
    create_notification_safe(
        user_id=seller_id,
        type="system",
        title="Tài khoản bị từ chối",
        message=f"Tài khoản người bán '{seller.get('store_name')}' đã bị từ chối." + (f" Lý do: {reason}" if reason else "")
    )
    
    log_activity(current_user["_id"], "SELLER_REJECTED", {
        "seller_id": seller_id,
        "reason": reason
    })
    
    return {"message": "Seller rejected successfully"}

@router.patch("/sellers/{seller_id}/suspend")
async def suspend_seller(
    seller_id: str,
    current_user: dict = Depends(get_current_admin),
    reason: Optional[str] = Body(None, embed=True)
):
    """Admin tạm dừng tài khoản seller"""
    
    seller = users_collection.find_one({"_id": seller_id, "role": UserRole.SELLER})
    
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    # Update seller status
    users_collection.update_one(
        {"_id": seller_id},
        {
            "$set": {
                "seller_status": SellerStatus.SUSPENDED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification for seller
    create_notification_safe(
        user_id=seller_id,
        type="system",
        title="Tài khoản bị tạm dừng",
        message=f"Tài khoản người bán '{seller.get('store_name')}' đã bị tạm dừng." + (f" Lý do: {reason}" if reason else "")
    )
    
    log_activity(current_user["_id"], "SELLER_SUSPENDED", {
        "seller_id": seller_id,
        "reason": reason
    })
    
    return {"message": "Seller suspended successfully"}

# ==================== PRODUCT APPROVAL ====================

@router.get("/products/pending")
async def get_pending_products(
    current_user: dict = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Lấy danh sách sản phẩm chờ duyệt"""
    
    query = {"approval_status": ProductApprovalStatus.PENDING}
    
    skip = (page - 1) * limit
    
    products = list(
        products_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for product in products:
        # Enrich with seller info
        seller = None
        if product.get("seller_id"):
            seller = users_collection.find_one({"_id": product["seller_id"]})
        
        product_dict = dict(product)
        product_dict["id"] = product_dict["_id"]
        if seller:
            product_dict["seller_name"] = seller.get("full_name")
            product_dict["seller_email"] = seller.get("email")
        
        result.append(product_dict)
    
    return result

@router.patch("/products/{product_id}/approve")
async def approve_product(
    product_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Admin duyệt sản phẩm"""
    
    product = products_collection.find_one({"_id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update product status
    products_collection.update_one(
        {"_id": product_id},
        {
            "$set": {
                "approval_status": ProductApprovalStatus.APPROVED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification for seller
    if product.get("seller_id"):
        create_notification_safe(
            user_id=product["seller_id"],
            type="system",
            title="Sản phẩm đã được duyệt",
            message=f"Sản phẩm '{product.get('name')}' đã được admin duyệt và hiển thị trên website.",
            link=f"/products/{product_id}"
        )
    
    log_activity(current_user["_id"], "PRODUCT_APPROVED", {
        "product_id": product_id,
        "product_name": product.get("name")
    })
    
    return {"message": "Product approved successfully"}

@router.patch("/products/{product_id}/reject")
async def reject_product(
    product_id: str,
    current_user: dict = Depends(get_current_admin),
    reason: Optional[str] = Body(None, embed=True)
):
    """Admin từ chối sản phẩm"""
    
    product = products_collection.find_one({"_id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update product status
    products_collection.update_one(
        {"_id": product_id},
        {
            "$set": {
                "approval_status": ProductApprovalStatus.REJECTED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification for seller
    if product.get("seller_id"):
        create_notification_safe(
            user_id=product["seller_id"],
            type="system",
            title="Sản phẩm bị từ chối",
            message=f"Sản phẩm '{product.get('name')}' đã bị từ chối." + (f" Lý do: {reason}" if reason else "")
        )
    
    log_activity(current_user["_id"], "PRODUCT_REJECTED", {
        "product_id": product_id,
        "reason": reason
    })
    
    return {"message": "Product rejected successfully"}

