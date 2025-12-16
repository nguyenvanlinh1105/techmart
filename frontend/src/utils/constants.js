// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
}

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPED]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
}

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
  MOMO: 'momo',
  VNPAY: 'vnpay',
}

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PAYMENT_METHODS.CARD]: 'Thẻ tín dụng/ghi nợ',
  [PAYMENT_METHODS.MOMO]: 'Ví MoMo',
  [PAYMENT_METHODS.VNPAY]: 'VNPAY',
}

// Categories
export const CATEGORIES = [
  { id: 'electronics', name: 'Điện tử', icon: '📱' },
  { id: 'fashion', name: 'Thời trang', icon: '👗' },
  { id: 'home', name: 'Nhà cửa', icon: '🏠' },
  { id: 'sports', name: 'Thể thao', icon: '⚽' },
  { id: 'books', name: 'Sách', icon: '📚' },
  { id: 'beauty', name: 'Làm đẹp', icon: '💄' },
  { id: 'toys', name: 'Đồ chơi', icon: '🧸' },
  { id: 'food', name: 'Thực phẩm', icon: '🍔' },
]

// Sort Options
export const SORT_OPTIONS = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá thấp đến cao' },
  { value: 'price_desc', label: 'Giá cao đến thấp' },
  { value: 'name_asc', label: 'Tên A-Z' },
  { value: 'name_desc', label: 'Tên Z-A' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
]

// Pagination
export const ITEMS_PER_PAGE = 12

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  STAFF: 'staff',
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART: 'cart_items',
  WISHLIST: 'wishlist_items',
}

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công! Vui lòng đăng nhập.',
  ADD_TO_CART: 'Đã thêm vào giỏ hàng',
  REMOVE_FROM_CART: 'Đã xóa khỏi giỏ hàng',
  ADD_TO_WISHLIST: 'Đã thêm vào yêu thích',
  REMOVE_FROM_WISHLIST: 'Đã xóa khỏi yêu thích',
  ORDER_SUCCESS: 'Đặt hàng thành công!',
  ERROR: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
}

