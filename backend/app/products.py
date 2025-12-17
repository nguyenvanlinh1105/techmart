from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime

from .models import (
    ProductCreate, ProductUpdate, ProductResponse,
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductApprovalStatus
)
from .database import (
    products_collection, categories_collection, users_collection,
    get_next_sequence, log_activity
)
from .auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api", tags=["Products & Categories"])

# ==================== CATEGORY ROUTES (F07) ====================

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    parent_id: Optional[str] = None,
    limit: int = Query(100, le=100)
):
    """Lấy danh sách danh mục"""
    query = {}
    if parent_id is not None:
        query["parent_id"] = parent_id
    
    categories = list(categories_collection.find(query).limit(limit))
    
    result = []
    for cat in categories:
        # Count products in this category
        product_count = products_collection.count_documents({"category_id": cat["_id"]})
        
        result.append(CategoryResponse(
            id=cat["_id"],
            name=cat["name"],
            slug=cat["slug"],
            description=cat.get("description"),
            image=cat.get("image"),
            parent_id=cat.get("parent_id"),
            icon=cat.get("icon"),
            product_count=product_count,
            created_at=cat["created_at"]
        ))
    
    return result

@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    """Lấy thông tin chi tiết danh mục"""
    category = categories_collection.find_one({"_id": category_id})
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    product_count = products_collection.count_documents({"category_id": category_id})
    
    return CategoryResponse(
        id=category["_id"],
        name=category["name"],
        slug=category["slug"],
        description=category.get("description"),
        image=category.get("image"),
        parent_id=category.get("parent_id"),
        icon=category.get("icon"),
        product_count=product_count,
        created_at=category["created_at"]
    )

@router.post("/admin/categories", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    current_user: dict = Depends(get_current_admin)
):
    """Tạo danh mục mới (Admin only)"""
    
    # Check if slug exists
    if categories_collection.find_one({"slug": category.slug}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category slug already exists"
        )
    
    category_dict = category.dict()
    category_dict["_id"] = f"cat_{get_next_sequence('categories')}"
    category_dict["created_at"] = datetime.utcnow()
    
    categories_collection.insert_one(category_dict)
    log_activity(current_user["_id"], "CATEGORY_CREATED", {"category_id": category_dict["_id"]})
    
    return CategoryResponse(
        id=category_dict["_id"],
        name=category_dict["name"],
        slug=category_dict["slug"],
        description=category_dict.get("description"),
        image=category_dict.get("image"),
        parent_id=category_dict.get("parent_id"),
        icon=category_dict.get("icon"),
        product_count=0,
        created_at=category_dict["created_at"]
    )

@router.put("/admin/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Cập nhật danh mục (Admin only)"""
    
    if not categories_collection.find_one({"_id": category_id}):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    update_data = {k: v for k, v in category_update.dict().items() if v is not None}
    
    categories_collection.update_one(
        {"_id": category_id},
        {"$set": update_data}
    )
    
    log_activity(current_user["_id"], "CATEGORY_UPDATED", {"category_id": category_id})
    
    return await get_category(category_id)

@router.delete("/admin/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_admin)
):
    """Xóa danh mục (Admin only)"""
    
    # Check if category has products
    if products_collection.count_documents({"category_id": category_id}) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with products"
        )
    
    result = categories_collection.delete_one({"_id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    log_activity(current_user["_id"], "CATEGORY_DELETED", {"category_id": category_id})
    
    return {"message": "Category deleted successfully"}

# ==================== PRODUCT ROUTES (F08-F12) ====================

@router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_on_sale: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Lấy danh sách sản phẩm với filter và pagination
    F08: Product List
    F09: Pagination
    F11: Search
    F12: Featured/Sale products
    F29: Filter & Sort
    """
    
    # Build query - Show approved products OR products without approval_status (legacy data)
    # Use simpler query for better performance
    query = {}
    
    # Filter by approval_status only if we want to exclude non-approved
    # For public access, show approved OR legacy products (without approval_status)
    approval_filter = {
        "$or": [
            {"approval_status": ProductApprovalStatus.APPROVED.value},
            {"approval_status": {"$exists": False}},  # Legacy products
            {"approval_status": None}  # Also handle None values
        ]
    }
    # Only add approval filter if we have other conditions, otherwise show all
    query.update(approval_filter)
    
    if category_id:
        query["category_id"] = category_id
    
    if search:
        # Use regex for case-insensitive search
        # Combine with existing query using $and
        search_query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [search.lower()]}}
            ]
        }
        # Merge search with existing query
        original_query = query.copy()
        query = {"$and": [original_query, search_query]}
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    if brand:
        query["brand"] = brand
    
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    if is_on_sale is not None:
        query["is_on_sale"] = is_on_sale
    
    # Sort
    sort_direction = -1 if sort_order == "desc" else 1
    sort_field = sort_by
    
    # Handle special sort cases
    if sort_by == "price" and sort_order == "asc":
        sort_direction = 1  # Low to high
    elif sort_by == "price" and sort_order == "desc":
        sort_direction = -1  # High to low
    
    # Pagination
    skip = (page - 1) * limit
    
    products = list(
        products_collection
        .find(query)
        .sort(sort_field, sort_direction)
        .skip(skip)
        .limit(limit)
    )
    
    result = []
    for prod in products:
        # Enrich with seller info
        seller_name = None
        if prod.get("seller_id"):
            seller = users_collection.find_one({"_id": prod["seller_id"]})
            if seller:
                seller_name = seller.get("full_name")
        
        prod_dict = {
            "id": prod["_id"],
            "name": prod["name"],
            "slug": prod["slug"],
            "description": prod["description"],
            "short_description": prod.get("short_description"),
            "category_id": prod["category_id"],
            "brand": prod.get("brand"),
            "price": prod["price"],
            "compare_price": prod.get("compare_price"),
            "cost_price": prod.get("cost_price"),
            "stock": prod["stock"],
            "sku": prod.get("sku"),
            "images": prod.get("images", []),
            "variants": prod.get("variants", []),
            "tags": prod.get("tags", []),
            "is_featured": prod.get("is_featured", False),
            "is_on_sale": prod.get("is_on_sale", False),
            "meta_title": prod.get("meta_title"),
            "meta_description": prod.get("meta_description"),
            "seller_id": prod.get("seller_id"),
            "store_name": prod.get("store_name"),
            "approval_status": prod.get("approval_status"),
            "rating": prod.get("rating", 0.0),
            "review_count": prod.get("review_count", 0),
            "sold_count": prod.get("sold_count", 0),
            "view_count": prod.get("view_count", 0),
            "created_at": prod["created_at"],
            "updated_at": prod["updated_at"],
            "seller_name": seller_name
        }
        result.append(ProductResponse(**prod_dict))
    
    return result
@router.get("/products/count")
async def count_products(
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_on_sale: Optional[bool] = None
):
    """Đếm tổng số sản phẩm (cho pagination)"""
    
    # Count approved products OR legacy products (without approval_status)
    query = {
        "$or": [
            {"approval_status": ProductApprovalStatus.APPROVED.value},
            {"approval_status": {"$exists": False}},  # Legacy products
            {"approval_status": None}  # Also handle None values
        ]
    }
    
    if category_id:
        query["category_id"] = category_id
    
    if search:
        # Use regex for case-insensitive search
        # Combine with existing query using $and
        search_query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [search.lower()]}}
            ]
        }
        # Merge search with existing query
        original_query = query.copy()
        query = {"$and": [original_query, search_query]}
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    if brand:
        query["brand"] = brand
    
    if is_featured is not None:
        query["is_featured"] = is_featured
    
    if is_on_sale is not None:
        query["is_on_sale"] = is_on_sale
    
    count = products_collection.count_documents(query)
    
    return {"total": count}

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """
    Lấy thông tin chi tiết sản phẩm
    F10: Product Detail
    """
    
    # Find product - allow approved OR legacy products (without approval_status)
    product = products_collection.find_one({
        "_id": product_id,
        "$or": [
            {"approval_status": ProductApprovalStatus.APPROVED.value},
            {"approval_status": {"$exists": False}},
            {"approval_status": None}
        ]
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Increment view count
    products_collection.update_one(
        {"_id": product_id},
        {"$inc": {"view_count": 1}}
    )
    
    # Enrich with seller info
    seller_name = None
    if product.get("seller_id"):
        seller = users_collection.find_one({"_id": product["seller_id"]})
        if seller:
            seller_name = seller.get("full_name")
    
    return ProductResponse(
        id=product["_id"],
        name=product["name"],
        slug=product["slug"],
        description=product["description"],
        short_description=product.get("short_description"),
        category_id=product["category_id"],
        brand=product.get("brand"),
        price=product["price"],
        compare_price=product.get("compare_price"),
        cost_price=product.get("cost_price"),
        stock=product["stock"],
        sku=product.get("sku"),
        images=product.get("images", []),
        variants=product.get("variants", []),
        tags=product.get("tags", []),
        is_featured=product.get("is_featured", False),
        is_on_sale=product.get("is_on_sale", False),
        meta_title=product.get("meta_title"),
        meta_description=product.get("meta_description"),
        seller_id=product.get("seller_id"),
        store_name=product.get("store_name"),
        approval_status=product.get("approval_status"),
        rating=product.get("rating", 0.0),
        review_count=product.get("review_count", 0),
        sold_count=product.get("sold_count", 0),
        view_count=product.get("view_count", 0),
        created_at=product["created_at"],
        updated_at=product["updated_at"],
        seller_name=seller_name
    )

# ==================== ADMIN PRODUCT ROUTES MOVED TO admin.py ====================
# Admin product management endpoints are now in app/admin.py to avoid routing conflicts



# ==================== RELATED PRODUCTS & REVIEWS ====================

@router.get("/products/{product_id}/related", response_model=List[ProductResponse])
async def get_related_products(
    product_id: str,
    limit: int = Query(8, ge=1, le=20)
):
    """Lấy sản phẩm liên quan (cùng danh mục)"""
    
    # Get current product
    product = products_collection.find_one({"_id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Find products in same category, exclude current product
    query = {
        "category_id": product["category_id"],
        "_id": {"$ne": product_id},
        "$or": [
            {"approval_status": ProductApprovalStatus.APPROVED.value},
            {"approval_status": {"$exists": False}},
            {"approval_status": None}
        ]
    }
    
    related = list(
        products_collection
        .find(query)
        .limit(limit)
    )
    
    result = []
    for prod in related:
        seller_name = None
        if prod.get("seller_id"):
            seller = users_collection.find_one({"_id": prod["seller_id"]})
            if seller:
                seller_name = seller.get("full_name")
        
        result.append(ProductResponse(
            id=prod["_id"],
            name=prod["name"],
            slug=prod["slug"],
            description=prod["description"],
            short_description=prod.get("short_description"),
            category_id=prod["category_id"],
            brand=prod.get("brand"),
            price=prod["price"],
            compare_price=prod.get("compare_price"),
            cost_price=prod.get("cost_price"),
            stock=prod["stock"],
            sku=prod.get("sku"),
            images=prod.get("images", []),
            variants=prod.get("variants", []),
            tags=prod.get("tags", []),
            is_featured=prod.get("is_featured", False),
            is_on_sale=prod.get("is_on_sale", False),
            meta_title=prod.get("meta_title"),
            meta_description=prod.get("meta_description"),
            seller_id=prod.get("seller_id"),
            store_name=prod.get("store_name"),
            approval_status=prod.get("approval_status"),
            rating=prod.get("rating", 0.0),
            review_count=prod.get("review_count", 0),
            sold_count=prod.get("sold_count", 0),
            view_count=prod.get("view_count", 0),
            created_at=prod["created_at"],
            updated_at=prod["updated_at"],
            seller_name=seller_name
        ))
    
    return result

@router.get("/products/{product_id}/reviews")
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Lấy đánh giá của sản phẩm"""
    
    # Check if product exists
    if not products_collection.find_one({"_id": product_id}):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # For now, return empty list (reviews feature can be implemented later)
    return []
