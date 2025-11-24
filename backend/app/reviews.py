from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from .models import ReviewCreate, ReviewUpdate, ReviewResponse
from .database import (
    reviews_collection, products_collection, orders_collection, users_collection,
    get_next_sequence, log_activity
)
from .auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

# ==================== REVIEWS ====================

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Tạo đánh giá sản phẩm (chỉ cho sản phẩm đã mua và giao thành công)
    """
    
    # Kiểm tra sản phẩm tồn tại
    product = products_collection.find_one({"_id": review.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm không tồn tại"
        )
    
    # Kiểm tra user đã mua sản phẩm này chưa
    purchased_order = orders_collection.find_one({
        "user_id": current_user["_id"],
        "status": "delivered",
        "items.product_id": review.product_id
    })
    
    if not purchased_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn chỉ có thể đánh giá sản phẩm đã mua và giao thành công"
        )
    
    # Kiểm tra đã đánh giá chưa
    existing_review = reviews_collection.find_one({
        "user_id": current_user["_id"],
        "product_id": review.product_id
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã đánh giá sản phẩm này rồi"
        )
    
    # Tạo review
    review_dict = review.dict()
    review_dict["_id"] = f"review_{get_next_sequence('reviews')}"
    review_dict["user_id"] = current_user["_id"]
    review_dict["user_name"] = current_user.get("full_name", "Anonymous")
    review_dict["user_avatar"] = current_user.get("avatar")
    review_dict["is_verified_purchase"] = True
    review_dict["helpful_count"] = 0
    review_dict["created_at"] = datetime.utcnow()
    review_dict["admin_reply"] = None
    
    reviews_collection.insert_one(review_dict)
    
    # Cập nhật rating và review_count của sản phẩm
    update_product_rating(review.product_id)
    
    log_activity(current_user["_id"], "REVIEW_CREATED", {
        "review_id": review_dict["_id"],
        "product_id": review.product_id,
        "rating": review.rating
    })
    
    review_dict["id"] = review_dict["_id"]
    return ReviewResponse(**review_dict)

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    sort_by: str = Query("created_at", regex="^(created_at|rating|helpful_count)$")
):
    """
    Lấy danh sách đánh giá của sản phẩm
    """
    
    skip = (page - 1) * limit
    
    # Sort direction
    sort_direction = -1  # Descending
    
    reviews = list(
        reviews_collection
        .find({"product_id": product_id})
        .sort(sort_by, sort_direction)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for review in reviews:
        review["id"] = review["_id"]
        result.append(ReviewResponse(**review))
    
    return result

@router.get("/my-reviews", response_model=List[ReviewResponse])
async def get_my_reviews(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Lấy danh sách đánh giá của user hiện tại
    """
    
    skip = (page - 1) * limit
    
    reviews = list(
        reviews_collection
        .find({"user_id": current_user["_id"]})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for review in reviews:
        review["id"] = review["_id"]
        result.append(ReviewResponse(**review))
    
    return result

@router.get("/can-review/{product_id}")
async def can_review_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Kiểm tra user có thể đánh giá sản phẩm này không
    """
    
    # Kiểm tra đã mua và giao thành công
    purchased_order = orders_collection.find_one({
        "user_id": current_user["_id"],
        "status": "delivered",
        "items.product_id": product_id
    })
    
    if not purchased_order:
        return {
            "can_review": False,
            "reason": "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa giao thành công"
        }
    
    # Kiểm tra đã đánh giá chưa
    existing_review = reviews_collection.find_one({
        "user_id": current_user["_id"],
        "product_id": product_id
    })
    
    if existing_review:
        return {
            "can_review": False,
            "reason": "Bạn đã đánh giá sản phẩm này rồi",
            "review_id": existing_review["_id"]
        }
    
    return {
        "can_review": True,
        "order_id": purchased_order["_id"]
    }

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cập nhật đánh giá (chỉ user tạo review mới được sửa)
    """
    
    review = reviews_collection.find_one({"_id": review_id})
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá"
        )
    
    # Kiểm tra quyền
    if review["user_id"] != current_user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền sửa đánh giá này"
        )
    
    # Update
    update_data = {k: v for k, v in review_update.dict().items() if v is not None}
    
    if update_data:
        reviews_collection.update_one(
            {"_id": review_id},
            {"$set": update_data}
        )
        
        # Cập nhật rating sản phẩm nếu rating thay đổi
        if "rating" in update_data:
            update_product_rating(review["product_id"])
    
    updated_review = reviews_collection.find_one({"_id": review_id})
    updated_review["id"] = updated_review["_id"]
    return ReviewResponse(**updated_review)

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Xóa đánh giá (user hoặc admin)
    """
    
    review = reviews_collection.find_one({"_id": review_id})
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá"
        )
    
    # Kiểm tra quyền (user tạo review hoặc admin)
    if review["user_id"] != current_user["_id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa đánh giá này"
        )
    
    product_id = review["product_id"]
    
    reviews_collection.delete_one({"_id": review_id})
    
    # Cập nhật rating sản phẩm
    update_product_rating(product_id)
    
    return {"message": "Đã xóa đánh giá thành công"}

@router.post("/{review_id}/helpful")
async def mark_review_helpful(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Đánh dấu đánh giá hữu ích
    """
    
    review = reviews_collection.find_one({"_id": review_id})
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá"
        )
    
    # Tăng helpful_count
    reviews_collection.update_one(
        {"_id": review_id},
        {"$inc": {"helpful_count": 1}}
    )
    
    return {"message": "Đã đánh dấu hữu ích"}

@router.post("/{review_id}/reply")
async def reply_to_review(
    review_id: str,
    reply: str,
    current_user: dict = Depends(get_current_admin)
):
    """
    Admin trả lời đánh giá
    """
    
    review = reviews_collection.find_one({"_id": review_id})
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá"
        )
    
    reviews_collection.update_one(
        {"_id": review_id},
        {"$set": {"admin_reply": reply}}
    )
    
    return {"message": "Đã trả lời đánh giá"}

@router.get("/stats/{product_id}")
async def get_review_stats(product_id: str):
    """
    Thống kê đánh giá của sản phẩm
    """
    
    reviews = list(reviews_collection.find({"product_id": product_id}))
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {
                "5": 0,
                "4": 0,
                "3": 0,
                "2": 0,
                "1": 0
            }
        }
    
    # Calculate stats
    total_reviews = len(reviews)
    total_rating = sum(r["rating"] for r in reviews)
    average_rating = total_rating / total_reviews
    
    # Rating distribution
    rating_dist = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for review in reviews:
        rating_dist[str(review["rating"])] += 1
    
    return {
        "total_reviews": total_reviews,
        "average_rating": round(average_rating, 1),
        "rating_distribution": rating_dist
    }

def update_product_rating(product_id: str):
    """
    Cập nhật rating và review_count của sản phẩm
    """
    
    reviews = list(reviews_collection.find({"product_id": product_id}))
    
    if not reviews:
        products_collection.update_one(
            {"_id": product_id},
            {"$set": {"rating": 0, "review_count": 0}}
        )
        return
    
    total_rating = sum(r["rating"] for r in reviews)
    average_rating = total_rating / len(reviews)
    
    products_collection.update_one(
        {"_id": product_id},
        {"$set": {
            "rating": round(average_rating, 1),
            "review_count": len(reviews)
        }}
    )
