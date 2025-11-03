
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from .models import (
    ReviewCreate, ReviewUpdate, ReviewResponse,
    WishlistResponse, WishlistItem,
    NotificationCreate, NotificationResponse
)
from .database import (
    reviews_collection, wishlists_collection, notifications_collection,
    products_collection, orders_collection, users_collection,
    get_next_sequence, log_activity, create_notification_safe
)
from .auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api", tags=["Reviews, Wishlist & Notifications"])

# ==================== ADDRESS GEOGRAPHY API (Proxy to avoid CORS) ====================
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False
    print("[WARNING] httpx not installed, geography API will not work")

# Fallback: Danh sách đầy đủ 63 tỉnh/thành phố Việt Nam
VIETNAM_PROVINCES = [
    {"code": "01", "name": "Thành phố Hà Nội"},
    {"code": "02", "name": "Tỉnh Hà Giang"},
    {"code": "04", "name": "Tỉnh Cao Bằng"},
    {"code": "06", "name": "Tỉnh Bắc Kạn"},
    {"code": "08", "name": "Tỉnh Tuyên Quang"},
    {"code": "10", "name": "Tỉnh Lào Cai"},
    {"code": "11", "name": "Tỉnh Điện Biên"},
    {"code": "12", "name": "Tỉnh Lai Châu"},
    {"code": "14", "name": "Tỉnh Sơn La"},
    {"code": "15", "name": "Tỉnh Yên Bái"},
    {"code": "17", "name": "Tỉnh Hoà Bình"},
    {"code": "19", "name": "Tỉnh Thái Nguyên"},
    {"code": "20", "name": "Tỉnh Lạng Sơn"},
    {"code": "22", "name": "Tỉnh Quảng Ninh"},
    {"code": "24", "name": "Tỉnh Bắc Giang"},
    {"code": "25", "name": "Tỉnh Phú Thọ"},
    {"code": "26", "name": "Tỉnh Vĩnh Phúc"},
    {"code": "27", "name": "Tỉnh Bắc Ninh"},
    {"code": "30", "name": "Tỉnh Hải Dương"},
    {"code": "31", "name": "Thành phố Hải Phòng"},
    {"code": "33", "name": "Tỉnh Hưng Yên"},
    {"code": "34", "name": "Tỉnh Thái Bình"},
    {"code": "35", "name": "Tỉnh Hà Nam"},
    {"code": "36", "name": "Tỉnh Nam Định"},
    {"code": "37", "name": "Tỉnh Ninh Bình"},
    {"code": "38", "name": "Tỉnh Thanh Hóa"},
    {"code": "40", "name": "Tỉnh Nghệ An"},
    {"code": "42", "name": "Tỉnh Hà Tĩnh"},
    {"code": "44", "name": "Tỉnh Quảng Bình"},
    {"code": "45", "name": "Tỉnh Quảng Trị"},
    {"code": "46", "name": "Tỉnh Thừa Thiên Huế"},
    {"code": "48", "name": "Thành phố Đà Nẵng"},
    {"code": "49", "name": "Tỉnh Quảng Nam"},
    {"code": "51", "name": "Tỉnh Quảng Ngãi"},
    {"code": "52", "name": "Tỉnh Bình Định"},
    {"code": "54", "name": "Tỉnh Phú Yên"},
    {"code": "56", "name": "Tỉnh Khánh Hòa"},
    {"code": "58", "name": "Tỉnh Ninh Thuận"},
    {"code": "60", "name": "Tỉnh Bình Thuận"},
    {"code": "62", "name": "Tỉnh Kon Tum"},
    {"code": "64", "name": "Tỉnh Gia Lai"},
    {"code": "66", "name": "Tỉnh Đắk Lắk"},
    {"code": "67", "name": "Tỉnh Đắk Nông"},
    {"code": "68", "name": "Tỉnh Lâm Đồng"},
    {"code": "70", "name": "Tỉnh Bình Phước"},
    {"code": "72", "name": "Tỉnh Tây Ninh"},
    {"code": "74", "name": "Tỉnh Bình Dương"},
    {"code": "75", "name": "Tỉnh Đồng Nai"},
    {"code": "77", "name": "Tỉnh Bà Rịa - Vũng Tàu"},
    {"code": "79", "name": "Thành phố Hồ Chí Minh"},
    {"code": "80", "name": "Tỉnh Long An"},
    {"code": "82", "name": "Tỉnh Tiền Giang"},
    {"code": "83", "name": "Tỉnh Bến Tre"},
    {"code": "84", "name": "Tỉnh Trà Vinh"},
    {"code": "86", "name": "Tỉnh Vĩnh Long"},
    {"code": "87", "name": "Tỉnh Đồng Tháp"},
    {"code": "89", "name": "Tỉnh An Giang"},
    {"code": "91", "name": "Tỉnh Kiên Giang"},
    {"code": "92", "name": "Thành phố Cần Thơ"},
    {"code": "93", "name": "Tỉnh Hậu Giang"},
    {"code": "94", "name": "Tỉnh Sóc Trăng"},
    {"code": "95", "name": "Tỉnh Bạc Liêu"},
    {"code": "96", "name": "Tỉnh Cà Mau"},
]

@router.get("/provinces")
async def get_provinces():
    """Lấy danh sách tỉnh/thành phố Việt Nam (proxy để tránh CORS)"""
    try:
        if HAS_HTTPX:
            # Use verify=False to ignore SSL certificate issues in development
            async with httpx.AsyncClient(timeout=10.0, verify=False, follow_redirects=True) as client:
                # Try multiple API endpoints
                api_urls = [
                    "https://provinces.open-api.vn/api/p/",
                    "http://provinces.open-api.vn/api/p/",
                    "https://provinces.open-api.vn/api/",
                ]
                
                for api_url in api_urls:
                    try:
                        response = await client.get(api_url)
                        if response.status_code == 200:
                            data = response.json()
                            provinces = data if isinstance(data, list) else (data.get("data", []) if isinstance(data, dict) else [])
                            if provinces and len(provinces) > 0:
                                result = [{"code": str(item.get("code")), "name": item.get("name")} for item in provinces if item.get("code") and item.get("name")]
                                if len(result) > 50:  # Valid data should have many provinces
                                    print(f"[GEOGRAPHY] Loaded {len(result)} provinces from API")
                                    return result
                    except Exception as e:
                        print(f"[GEOGRAPHY] API URL {api_url} failed: {e}")
                        continue
    except Exception as e:
        print(f"[GEOGRAPHY] Error fetching provinces from API: {e}")
    
    # Return fallback with full list
    print(f"[GEOGRAPHY] Using fallback: {len(VIETNAM_PROVINCES)} provinces")
    return VIETNAM_PROVINCES

@router.get("/provinces/{province_code}/districts")
async def get_districts(province_code: str):
    """Lấy danh sách quận/huyện theo tỉnh/thành phố (proxy để tránh CORS)"""
    try:
        if HAS_HTTPX:
            async with httpx.AsyncClient(timeout=15.0, verify=False, follow_redirects=True) as client:
                # Try multiple API endpoints
                api_urls = [
                    f"https://provinces.open-api.vn/api/p/{province_code}?depth=2",
                    f"http://provinces.open-api.vn/api/p/{province_code}?depth=2",
                    f"https://provinces.open-api.vn/api/p/{province_code}",
                ]
                
                for api_url in api_urls:
                    try:
                        response = await client.get(api_url)
                        if response.status_code == 200:
                            data = response.json()
                            districts = data.get("districts", []) if isinstance(data, dict) else []
                            if districts and len(districts) > 0:
                                result = [{"code": str(item.get("code")), "name": item.get("name")} for item in districts if item.get("code") and item.get("name")]
                                print(f"[GEOGRAPHY] Loaded {len(result)} districts for province {province_code}")
                                return result
                    except Exception as e:
                        print(f"[GEOGRAPHY] District API URL {api_url} failed: {e}")
                        continue
    except Exception as e:
        print(f"[GEOGRAPHY] Error fetching districts: {e}")
    
    # Return empty list if API fails (no fallback data for districts)
    print(f"[GEOGRAPHY] No districts found for province {province_code}")
    return []

@router.get("/districts/{district_code}/wards")
async def get_wards(district_code: str):
    """Lấy danh sách phường/xã theo quận/huyện (proxy để tránh CORS)"""
    try:
        if HAS_HTTPX:
            async with httpx.AsyncClient(timeout=15.0, verify=False, follow_redirects=True) as client:
                # Try multiple API endpoints
                api_urls = [
                    f"https://provinces.open-api.vn/api/d/{district_code}?depth=2",
                    f"http://provinces.open-api.vn/api/d/{district_code}?depth=2",
                    f"https://provinces.open-api.vn/api/d/{district_code}",
                ]
                
                for api_url in api_urls:
                    try:
                        response = await client.get(api_url)
                        if response.status_code == 200:
                            data = response.json()
                            wards = data.get("wards", []) if isinstance(data, dict) else []
                            if wards and len(wards) > 0:
                                result = [{"code": str(item.get("code")), "name": item.get("name")} for item in wards if item.get("code") and item.get("name")]
                                print(f"[GEOGRAPHY] Loaded {len(result)} wards for district {district_code}")
                                return result
                    except Exception as e:
                        print(f"[GEOGRAPHY] Ward API URL {api_url} failed: {e}")
                        continue
    except Exception as e:
        print(f"[GEOGRAPHY] Error fetching wards: {e}")
    
    # Return empty list if API fails (no fallback data for wards)
    print(f"[GEOGRAPHY] No wards found for district {district_code}")
    return []

# ==================== REVIEW ROUTES (F27) ====================

@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    """Lấy danh sách đánh giá của sản phẩm - F27"""
    
    skip = (page - 1) * limit
    sort_direction = -1 if sort_order == "desc" else 1
    
    reviews = list(
        reviews_collection
        .find({"product_id": product_id})
        .sort(sort_by, sort_direction)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for review in reviews:
        # Get user info
        user = users_collection.find_one({"_id": review["user_id"]})
        
        result.append(ReviewResponse(
            id=review["_id"],
            product_id=review["product_id"],
            user_id=review["user_id"],
            user_name=user.get("full_name", "Anonymous") if user else "Anonymous",
            user_avatar=user.get("avatar") if user else None,
            rating=review["rating"],
            title=review.get("title"),
            comment=review.get("comment"),
            images=review.get("images", []),
            is_verified_purchase=review.get("is_verified_purchase", False),
            helpful_count=review.get("helpful_count", 0),
            created_at=review["created_at"],
            admin_reply=review.get("admin_reply")
        ))
    
    return result

@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Tạo đánh giá sản phẩm - F27"""
    
    # Check if product exists
    product = products_collection.find_one({"_id": review.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user already reviewed this product
    existing_review = reviews_collection.find_one({
        "product_id": review.product_id,
        "user_id": current_user["_id"]
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Check if user purchased this product (verified purchase)
    purchased = orders_collection.find_one({
        "user_id": current_user["_id"],
        "items.product_id": review.product_id,
        "status": "delivered"
    })
    
    try:
        review_dict = review.model_dump()  # Pydantic v2
    except AttributeError:
        review_dict = review.dict()  # Pydantic v1
    review_dict["_id"] = f"review_{get_next_sequence('reviews')}"
    review_dict["user_id"] = current_user["_id"]
    review_dict["is_verified_purchase"] = bool(purchased)
    review_dict["helpful_count"] = 0
    review_dict["created_at"] = datetime.utcnow()
    
    reviews_collection.insert_one(review_dict)
    
    # Update product rating
    pipeline = [
        {"$match": {"product_id": review.product_id}},
        {"$group": {
            "_id": None,
            "avg_rating": {"$avg": "$rating"},
            "count": {"$sum": 1}
        }}
    ]
    
    stats = list(reviews_collection.aggregate(pipeline))
    
    if stats:
        products_collection.update_one(
            {"_id": review.product_id},
            {
                "$set": {
                    "rating": round(stats[0]["avg_rating"], 1),
                    "review_count": stats[0]["count"]
                }
            }
        )
    
    log_activity(current_user["_id"], "REVIEW_CREATED", {
        "product_id": review.product_id,
        "rating": review.rating
    })
    
    # Get user info for response
    user = users_collection.find_one({"_id": current_user["_id"]})
    
    return ReviewResponse(
        id=review_dict["_id"],
        product_id=review_dict["product_id"],
        user_id=review_dict["user_id"],
        user_name=user.get("full_name", "Anonymous"),
        user_avatar=user.get("avatar"),
        rating=review_dict["rating"],
        title=review_dict.get("title"),
        comment=review_dict.get("comment"),
        images=review_dict.get("images", []),
        is_verified_purchase=review_dict["is_verified_purchase"],
        helpful_count=review_dict["helpful_count"],
        created_at=review_dict["created_at"],
        admin_reply=review_dict.get("admin_reply")
    )

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Cập nhật đánh giá - F27"""
    
    review = reviews_collection.find_one({
        "_id": review_id,
        "user_id": current_user["_id"]
    })
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    try:
        update_dict = review_update.model_dump(exclude_unset=True)  # Pydantic v2
    except AttributeError:
        update_dict = review_update.dict(exclude_unset=True)  # Pydantic v1
    update_data = {k: v for k, v in update_dict.items() if v is not None}
    
    reviews_collection.update_one(
        {"_id": review_id},
        {"$set": update_data}
    )
    
    # Recalculate product rating if rating changed
    if "rating" in update_data:
        pipeline = [
            {"$match": {"product_id": review["product_id"]}},
            {"$group": {
                "_id": None,
                "avg_rating": {"$avg": "$rating"}
            }}
        ]
        
        stats = list(reviews_collection.aggregate(pipeline))
        
        if stats:
            products_collection.update_one(
                {"_id": review["product_id"]},
                {"$set": {"rating": round(stats[0]["avg_rating"], 1)}}
            )
    
    log_activity(current_user["_id"], "REVIEW_UPDATED", {"review_id": review_id})
    
    updated_review = reviews_collection.find_one({"_id": review_id})
    user = users_collection.find_one({"_id": current_user["_id"]})
    
    return ReviewResponse(
        id=updated_review["_id"],
        product_id=updated_review["product_id"],
        user_id=updated_review["user_id"],
        user_name=user.get("full_name", "Anonymous"),
        user_avatar=user.get("avatar"),
        rating=updated_review["rating"],
        title=updated_review.get("title"),
        comment=updated_review.get("comment"),
        images=updated_review.get("images", []),
        is_verified_purchase=updated_review.get("is_verified_purchase", False),
        helpful_count=updated_review.get("helpful_count", 0),
        created_at=updated_review["created_at"],
        admin_reply=updated_review.get("admin_reply")
    )

@router.delete("/reviews/{review_id}")
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Xóa đánh giá - F27"""
    
    review = reviews_collection.find_one({
        "_id": review_id,
        "user_id": current_user["_id"]
    })
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    product_id = review["product_id"]
    
    reviews_collection.delete_one({"_id": review_id})
    
    # Update product rating and count
    pipeline = [
        {"$match": {"product_id": product_id}},
        {"$group": {
            "_id": None,
            "avg_rating": {"$avg": "$rating"},
            "count": {"$sum": 1}
        }}
    ]
    
    stats = list(reviews_collection.aggregate(pipeline))
    
    if stats:
        products_collection.update_one(
            {"_id": product_id},
            {
                "$set": {
                    "rating": round(stats[0]["avg_rating"], 1),
                    "review_count": stats[0]["count"]
                }
            }
        )
    else:
        products_collection.update_one(
            {"_id": product_id},
            {"$set": {"rating": 0.0, "review_count": 0}}
        )
    
    log_activity(current_user["_id"], "REVIEW_DELETED", {"review_id": review_id})
    
    return {"message": "Review deleted successfully"}

@router.post("/reviews/{review_id}/helpful")
async def mark_review_helpful(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Đánh dấu đánh giá hữu ích"""
    
    result = reviews_collection.update_one(
        {"_id": review_id},
        {"$inc": {"helpful_count": 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return {"message": "Marked as helpful"}

# ==================== WISHLIST ROUTES (F26) ====================

@router.get("/wishlist", response_model=WishlistResponse)
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    """Lấy danh sách yêu thích - F26"""
    
    wishlist = wishlists_collection.find_one({"user_id": current_user["_id"]})
    
    if not wishlist:
        # Create empty wishlist
        wishlist = {
            "_id": f"wishlist_{get_next_sequence('wishlists')}",
            "user_id": current_user["_id"],
            "items": [],
            "updated_at": datetime.utcnow()
        }
        wishlists_collection.insert_one(wishlist)
    
    return WishlistResponse(
        id=wishlist["_id"],
        user_id=wishlist["user_id"],
        items=wishlist.get("items", []),
        updated_at=wishlist["updated_at"]
    )

@router.post("/wishlist/{product_id}")
async def add_to_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Thêm sản phẩm vào wishlist - F26"""
    
    # Check if product exists
    product = products_collection.find_one({"_id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get or create wishlist
    wishlist = wishlists_collection.find_one({"user_id": current_user["_id"]})
    
    if not wishlist:
        wishlist = {
            "_id": f"wishlist_{get_next_sequence('wishlists')}",
            "user_id": current_user["_id"],
            "items": [],
            "updated_at": datetime.utcnow()
        }
        wishlists_collection.insert_one(wishlist)
    
    # Check if product already in wishlist
    if any(item["product_id"] == product_id for item in wishlist.get("items", [])):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in wishlist"
        )
    
    # Add to wishlist
    new_item = WishlistItem(
        product_id=product_id,
        added_at=datetime.utcnow()
    )
    
    wishlists_collection.update_one(
        {"_id": wishlist["_id"]},
        {
            "$push": {"items": new_item.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    log_activity(current_user["_id"], "ADDED_TO_WISHLIST", {"product_id": product_id})
    
    return {"message": "Product added to wishlist"}

@router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Xóa sản phẩm khỏi wishlist - F26"""
    
    result = wishlists_collection.update_one(
        {"user_id": current_user["_id"]},
        {
            "$pull": {"items": {"product_id": product_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in wishlist"
        )
    
    log_activity(current_user["_id"], "REMOVED_FROM_WISHLIST", {"product_id": product_id})
    
    return {"message": "Product removed from wishlist"}

# ==================== NOTIFICATION ROUTES (F23-F25) ====================

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    unread_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Lấy danh sách thông báo
    F23: Thông báo đơn hàng
    F25: In-App Notification
    """
    
    query = {"user_id": current_user["_id"]}
    
    if unread_only:
        query["is_read"] = False
    
    skip = (page - 1) * limit
    
    notifications = list(
        notifications_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for notif in notifications:
        result.append(NotificationResponse(
            id=notif["_id"],
            user_id=notif["user_id"],
            type=notif["type"],
            title=notif["title"],
            message=notif["message"],
            link=notif.get("link"),
            data=notif.get("data"),
            is_read=notif.get("is_read", False),
            created_at=notif["created_at"]
        ))
    
    return result

@router.get("/notifications/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Đếm số thông báo chưa đọc"""
    
    count = notifications_collection.count_documents({
        "user_id": current_user["_id"],
        "is_read": False
    })
    
    return {"unread_count": count}

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Đánh dấu thông báo đã đọc"""
    
    result = notifications_collection.update_one(
        {
            "_id": notification_id,
            "user_id": current_user["_id"]
        },
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@router.patch("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Đánh dấu tất cả thông báo đã đọc"""
    
    notifications_collection.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "All notifications marked as read"}

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Xóa thông báo"""
    
    result = notifications_collection.delete_one({
        "_id": notification_id,
        "user_id": current_user["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification deleted"}

# ==================== ADMIN - Reply to Review ====================

@router.patch("/admin/reviews/{review_id}/reply")
async def reply_to_review(
    review_id: str,
    reply: str,
    current_user: dict = Depends(get_current_admin)
):
    """Admin trả lời đánh giá"""
    
    result = reviews_collection.update_one(
        {"_id": review_id},
        {"$set": {"admin_reply": reply}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Notify user
    review = reviews_collection.find_one({"_id": review_id})
    
    create_notification_safe(
        user_id=review["user_id"],
        type="review",
        title="Admin đã phản hồi đánh giá của bạn",
        message=reply[:100] + "..." if len(reply) > 100 else reply,
        link=f"/products/{review['product_id']}"
    )
    
    log_activity(current_user["_id"], "REVIEW_REPLIED", {"review_id": review_id})
    
    return {"message": "Reply added successfully"}

