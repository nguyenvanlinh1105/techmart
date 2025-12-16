from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from .models import (
    ProductCreate, ProductUpdate, ProductResponse,
    ReviewResponse, ProductApprovalStatus
)
from .database import (
    products_collection, reviews_collection, orders_collection,
    users_collection, categories_collection, log_activity,
    get_next_sequence
)
from .auth import get_current_seller

router = APIRouter(prefix="/api/seller", tags=["Seller"])

# ==================== SELLER PRODUCT MANAGEMENT ====================

@router.get("/products", response_model=List[ProductResponse])
async def get_seller_products(
    current_seller: dict = Depends(get_current_seller),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ProductApprovalStatus] = None
):
    """Lấy danh sách sản phẩm của seller"""
    
    query = {"seller_id": current_seller["_id"]}
    
    if status:
        query["approval_status"] = status.value
    
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
        product["id"] = product["_id"]
        result.append(ProductResponse(**product))
    
    return result

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_seller: dict = Depends(get_current_seller)
):
    """Seller tạo sản phẩm mới (chờ admin duyệt)"""
    
    # Check if category exists
    category = categories_collection.find_one({"_id": product_data.category_id})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if slug already exists
    if products_collection.find_one({"slug": product_data.slug}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product slug already exists"
        )
    
    # Create product
    product_dict = product_data.dict()
    product_dict["_id"] = f"product_{get_next_sequence('products')}"
    product_dict["seller_id"] = current_seller["_id"]
    product_dict["store_name"] = current_seller.get("store_name", "Unknown Store")
    product_dict["approval_status"] = ProductApprovalStatus.PENDING  # Chờ duyệt
    product_dict["rating"] = 0.0
    product_dict["review_count"] = 0
    product_dict["sold_count"] = 0
    product_dict["view_count"] = 0
    product_dict["created_at"] = datetime.utcnow()
    product_dict["updated_at"] = datetime.utcnow()
    
    products_collection.insert_one(product_dict)
    
    # Log activity
    log_activity(current_seller["_id"], "SELLER_PRODUCT_CREATED", {
        "product_id": product_dict["_id"],
        "product_name": product_data.name
    })
    
    product_dict["id"] = product_dict["_id"]
    return ProductResponse(**product_dict)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_seller: dict = Depends(get_current_seller)
):
    """Seller cập nhật sản phẩm (nếu đã approved, sẽ về pending sau khi update)"""
    
    product = products_collection.find_one({
        "_id": product_id,
        "seller_id": current_seller["_id"]
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update product
    update_data = product_update.dict(exclude_unset=True)
    
    # If product was approved and is being updated, set back to pending
    if product.get("approval_status") == ProductApprovalStatus.APPROVED and update_data:
        update_data["approval_status"] = ProductApprovalStatus.PENDING
    
    update_data["updated_at"] = datetime.utcnow()
    
    products_collection.update_one(
        {"_id": product_id},
        {"$set": update_data}
    )
    
    # Get updated product
    updated_product = products_collection.find_one({"_id": product_id})
    updated_product["id"] = updated_product["_id"]
    
    log_activity(current_seller["_id"], "SELLER_PRODUCT_UPDATED", {
        "product_id": product_id
    })
    
    return ProductResponse(**updated_product)

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_seller: dict = Depends(get_current_seller)
):
    """Seller xóa sản phẩm"""
    
    product = products_collection.find_one({
        "_id": product_id,
        "seller_id": current_seller["_id"]
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    products_collection.delete_one({"_id": product_id})
    
    log_activity(current_seller["_id"], "SELLER_PRODUCT_DELETED", {
        "product_id": product_id
    })
    
    return {"message": "Product deleted successfully"}

# ==================== SELLER REVIEWS ====================

@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    current_seller: dict = Depends(get_current_seller),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Seller xem đánh giá của sản phẩm"""
    
    # Check if product belongs to seller
    product = products_collection.find_one({
        "_id": product_id,
        "seller_id": current_seller["_id"]
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get reviews
    skip = (page - 1) * limit
    reviews = list(
        reviews_collection
        .find({"product_id": product_id})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for review in reviews:
        # Enrich with user info
        user = users_collection.find_one({"_id": review.get("user_id")})
        if user:
            review["user_name"] = user.get("full_name", "Anonymous")
            review["user_avatar"] = user.get("avatar")
        
        review["id"] = review["_id"]
        result.append(ReviewResponse(**review))
    
    return result

# ==================== SELLER STATS ====================

@router.get("/stats")
async def get_seller_stats(current_seller: dict = Depends(get_current_seller)):
    """Thống kê của seller"""
    
    seller_id = current_seller["_id"]
    
    # Product stats - Handle enum values correctly
    total_products = products_collection.count_documents({"seller_id": seller_id})
    pending_products = products_collection.count_documents({
        "seller_id": seller_id,
        "approval_status": ProductApprovalStatus.PENDING.value
    })
    approved_products = products_collection.count_documents({
        "seller_id": seller_id,
        "approval_status": ProductApprovalStatus.APPROVED.value
    })
    rejected_products = products_collection.count_documents({
        "seller_id": seller_id,
        "approval_status": ProductApprovalStatus.REJECTED.value
    })
    
    # Order stats (orders containing seller's products)
    seller_orders = []
    all_orders = orders_collection.find({"status": {"$ne": "cancelled"}})
    for order in all_orders:
        items = order.get("items", [])
        for item in items:
            # Check if product belongs to seller
            product = products_collection.find_one({"_id": item.get("product_id")})
            if product and product.get("seller_id") == seller_id:
                seller_orders.append(order)
                break
    
    total_orders = len(seller_orders)
    total_revenue = sum(order.get("total", 0) for order in seller_orders)
    
    return {
        "total_products": total_products,
        "pending_products": pending_products,
        "approved_products": approved_products,
        "rejected_products": rejected_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "store_name": current_seller.get("store_name")
    }

