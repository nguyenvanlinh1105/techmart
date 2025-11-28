from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    STAFF = "staff"
    SELLER = "seller"

class SellerStatus(str, Enum):
    PENDING = "pending"  # Chờ duyệt
    APPROVED = "approved"  # Đã duyệt
    REJECTED = "rejected"  # Từ chối
    SUSPENDED = "suspended"  # Tạm dừng

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPING = "shipping"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    COD = "cod"
    VNPAY = "vnpay"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"

class NotificationType(str, Enum):
    ORDER = "order"
    PROMOTION = "promotion"
    SYSTEM = "system"
    REVIEW = "review"

class ConversationStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    PENDING = "pending"

# ==================== USER MODELS (F01-F06) ====================
class Address(BaseModel):
    id: Optional[str] = None
    label: str = "Home"  # Home, Work, Other
    full_name: str
    phone: str
    address: str
    city: str
    city_code: Optional[str] = None  # Mã tỉnh/thành phố
    district: Optional[str] = None
    district_code: Optional[str] = None  # Mã quận/huyện
    ward: Optional[str] = None
    ward_code: Optional[str] = None  # Mã phường/xã
    postal_code: Optional[str] = None
    is_default: bool = False

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    role: UserRole = UserRole.USER
    # Seller specific fields
    seller_status: Optional[SellerStatus] = None  # Only for sellers
    store_name: Optional[str] = None  # Store name for sellers

class UserCreate(UserBase):
    password: str

class SellerRegistration(BaseModel):
    """Model for seller registration with store information"""
    email: EmailStr
    password: str
    full_name: str
    phone: str
    store_name: str  # Required for sellers
    store_description: Optional[str] = None
    tax_code: Optional[str] = None  # Mã số thuế
    business_license: Optional[str] = None  # Giấy phép kinh doanh

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_verified: bool = False
    created_at: datetime
    addresses: List[Address] = []

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

# ==================== CATEGORY MODELS (F07) ====================
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    product_count: int = 0
    created_at: datetime

# ==================== PRODUCT MODELS (F08-F12) ====================
class ProductVariant(BaseModel):
    size: Optional[str] = None
    color: Optional[str] = None
    stock: int = 0
    price_adjustment: float = 0.0  # Additional price for this variant

class ProductImage(BaseModel):
    url: str
    is_primary: bool = False
    alt_text: Optional[str] = None

class ProductApprovalStatus(str, Enum):
    PENDING = "pending"  # Chờ duyệt
    APPROVED = "approved"  # Đã duyệt
    REJECTED = "rejected"  # Từ chối
    DRAFT = "draft"  # Nháp

class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    short_description: Optional[str] = None
    category_id: str
    brand: Optional[str] = None
    price: float
    compare_price: Optional[float] = None  # Original price before discount
    cost_price: Optional[float] = None  # For profit calculation
    stock: int = 0
    sku: Optional[str] = None
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    tags: List[str] = []
    is_featured: bool = False
    is_on_sale: bool = False
    meta_title: Optional[str] = None  # For SEO
    meta_description: Optional[str] = None  # For SEO
    # Seller fields
    seller_id: Optional[str] = None  # ID of seller who created this product
    store_name: Optional[str] = None  # Store name for display
    approval_status: Optional[ProductApprovalStatus] = ProductApprovalStatus.PENDING  # Approval status

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[ProductImage]] = None
    is_featured: Optional[bool] = None
    is_on_sale: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    rating: float = 0.0
    review_count: int = 0
    sold_count: int = 0
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    # Seller info (populated from user data)
    seller_name: Optional[str] = None

# ==================== CART MODELS (F13-F17) ====================
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    variant: Optional[Dict[str, str]] = None  # {size: "M", color: "Red"}
    price: float  # Price at the time of adding to cart

class CartBase(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None  # For guest users
    items: List[CartItem] = []

class CartUpdate(BaseModel):
    items: List[CartItem]

class CartResponse(CartBase):
    id: str
    subtotal: float = 0.0
    total_items: int = 0
    updated_at: datetime

# ==================== COUPON MODELS (F17, F35) ====================
class CouponType(str, Enum):
    PERCENTAGE = "percentage"  # Giảm %
    FIXED = "fixed"  # Giảm cố định
    FREESHIP = "freeship"  # Miễn phí ship
    BUY_X_GET_Y = "buy_x_get_y"  # Mua X tặng Y
    TIERED = "tiered"  # Giảm theo bậc

class CouponTarget(str, Enum):
    ALL = "all"  # Tất cả
    CATEGORY = "category"  # Theo danh mục
    PRODUCT = "product"  # Theo sản phẩm
    SELLER = "seller"  # Theo người bán
    NEW_USER = "new_user"  # Khách hàng mới
    VIP = "vip"  # Khách VIP

class CouponBase(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: CouponType = CouponType.PERCENTAGE
    discount_value: float
    
    # Điều kiện áp dụng
    min_order_value: Optional[float] = None
    max_discount: Optional[float] = None
    target_type: CouponTarget = CouponTarget.ALL
    target_ids: List[str] = []  # IDs của category/product/seller
    
    # Giới hạn sử dụng
    valid_from: datetime
    valid_to: datetime
    usage_limit: Optional[int] = None  # Tổng số lần sử dụng
    usage_per_user: Optional[int] = None  # Số lần/user
    used_count: int = 0
    
    # Tính năng nâng cao
    is_active: bool = True
    is_auto_apply: bool = False  # Tự động áp dụng
    priority: int = 0  # Độ ưu tiên (cao hơn = ưu tiên hơn)
    stackable: bool = False  # Có thể dùng chung với mã khác
    
    # Buy X Get Y
    buy_quantity: Optional[int] = None
    get_quantity: Optional[int] = None
    
    # Tiered discount
    tiers: Optional[List[Dict[str, float]]] = None  # [{"min": 100000, "discount": 10}, ...]

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_value: Optional[float] = None
    max_discount: Optional[float] = None
    valid_to: Optional[datetime] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None
    is_auto_apply: Optional[bool] = None
    priority: Optional[int] = None

class CouponResponse(CouponBase):
    id: str
    created_at: datetime
    usage_stats: Optional[Dict[str, Any]] = None  # Thống kê sử dụng

# ==================== ORDER MODELS (F18-F22) ====================
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_image: Optional[str] = None
    variant: Optional[Dict[str, str]] = None
    quantity: int
    price: float
    subtotal: float

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    district: Optional[str] = None
    ward: Optional[str] = None
    postal_code: Optional[str] = None

class OrderBase(BaseModel):
    user_id: str
    items: List[OrderItem]
    shipping_address: ShippingAddress
    payment_method: PaymentMethod
    subtotal: float
    shipping_fee: float = 0.0
    tax: float = 0.0
    discount: float = 0.0
    total: float
    coupon_code: Optional[str] = None
    note: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    tracking_number: Optional[str] = None
    note: Optional[str] = None

class OrderResponse(OrderBase):
    id: str
    order_number: str
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    tracking_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status_history: List[Dict[str, Any]] = []

# ==================== REVIEW MODELS (F27) ====================
class ReviewBase(BaseModel):
    product_id: str
    user_id: str
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    images: List[str] = []
    is_verified_purchase: bool = False

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None
    images: Optional[List[str]] = None

class ReviewResponse(ReviewBase):
    id: str
    user_name: str
    user_avatar: Optional[str] = None
    helpful_count: int = 0
    created_at: datetime
    admin_reply: Optional[str] = None

# ==================== WISHLIST MODELS (F26) ====================
class WishlistItem(BaseModel):
    product_id: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

class WishlistBase(BaseModel):
    user_id: str
    items: List[WishlistItem] = []

class WishlistResponse(WishlistBase):
    id: str
    updated_at: datetime

# ==================== NOTIFICATION MODELS (F23-F25) ====================
class NotificationBase(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    link: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    created_at: datetime

# ==================== LIVE CHAT MODELS (F41) ====================
class MessageBase(BaseModel):
    conversation_id: str
    sender_id: str
    sender_role: UserRole
    message: str
    attachments: List[str] = []

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    is_read: bool = False
    created_at: datetime

class ConversationBase(BaseModel):
    user_id: str
    admin_id: Optional[str] = None
    status: ConversationStatus = ConversationStatus.OPEN

class ConversationCreate(BaseModel):
    user_id: str

class ConversationResponse(ConversationBase):
    id: str
    last_message: Optional[str] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime

# ==================== ACTIVITY LOG MODELS (F40) ====================
class ActivityLog(BaseModel):
    user_id: str
    action: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ==================== ADMIN ANALYTICS MODELS (F36) ====================
class SalesStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_products_sold: int
    average_order_value: float
    period: str  # daily, weekly, monthly, yearly

class ProductStats(BaseModel):
    product_id: str
    product_name: str
    sold_count: int
    revenue: float
    stock: int

class UserStats(BaseModel):
    total_users: int
    new_users_today: int
    active_users: int
    verified_users: int
