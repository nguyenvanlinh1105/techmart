import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTrash, 
  FaMinus, 
  FaPlus, 
  FaShoppingCart, 
  FaArrowRight,
  FaTags,
  FaTruck,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, updateQuantity: updateCartQuantity, removeFromCart, getCartTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items by key

  // Bắt buộc đăng nhập để vào giỏ hàng
  useEffect(() => {
    if (authLoading) return; // Đợi auth load xong
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để xem giỏ hàng!');
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, authLoading, navigate, location]);

  // Hiển thị loading khi đang check auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa login, không render gì (sẽ redirect ở useEffect)
  if (!user) {
    return null;
  }
  
  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const updateQuantity = (id, delta, selectedSize, selectedColor) => {
    const item = cartItems.find(
      i => i.id === id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
    );
    if (item) {
      const newQuantity = item.quantity + delta;
      
      // Kiểm tra stock
      const availableStock = item.stock || 0;
      
      if (newQuantity > availableStock) {
        toast.warning(`Chỉ còn ${availableStock} sản phẩm trong kho`);
        return;
      }
      
      if (newQuantity > 0) {
        updateCartQuantity(id, newQuantity, selectedSize, selectedColor);
      }
    }
  };

  const removeItem = (id, selectedSize, selectedColor) => {
    removeFromCart(id, selectedSize, selectedColor);
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 10 });
    } else {
      alert('Invalid coupon code');
    }
  };

  // Get item key for tracking
  const getItemKey = (item) => `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
  
  // Initialize selected items (all selected by default)
  useEffect(() => {
    if (cartItems.length > 0) {
      const allKeys = new Set(cartItems.map(item => getItemKey(item)));
      setSelectedItems(allKeys);
    }
  }, [cartItems.length]); // Only when cartItems count changes
  
  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set()); // Deselect all
    } else {
      const allKeys = new Set(cartItems.map(item => getItemKey(item)));
      setSelectedItems(allKeys); // Select all
    }
  };
  
  // Toggle single item
  const toggleItem = (itemKey) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedItems(newSelected);
  };
  
  // Calculate totals only for selected items
  const getSelectedSubtotal = () => {
    return cartItems
      .filter(item => selectedItems.has(getItemKey(item)))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const subtotal = getSelectedSubtotal();
  const shipping = subtotal > 5000000 ? 0 : 30000; // Free shipping over 5M VND
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
  const tax = 0; // No tax in Vietnam for now
  const total = subtotal + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 
                          flex items-center justify-center">
              <FaShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-purple-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 md:mb-4">Giỏ Hàng Trống</h2>
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
              Bạn chưa thêm sản phẩm nào vào giỏ hàng
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 
                       bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-700 hover:to-pink-700
                       text-white font-bold rounded-xl
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                       transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Bắt Đầu Mua Sắm
              <FaArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-6 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-4">
            Giỏ{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hàng
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            {cartItems.length} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-bold text-gray-900">
                  Chọn tất cả ({selectedItems.size}/{cartItems.length})
                </span>
              </label>
            </div>
            
            {cartItems.map((item) => {
              const itemKey = getItemKey(item);
              const isSelected = selectedItems.has(itemKey);
              
              return (
              <div
                key={itemKey}
                className={`bg-white rounded-2xl shadow-lg p-6 
                         transition-all duration-300 hover:shadow-xl border-2
                         ${isSelected ? 'border-purple-500' : 'border-transparent'}
                         ${item.stock === 0 ? 'opacity-60' : ''}`}
              >
                <div className="flex gap-6">
                  {/* Checkbox */}
                  <label className="flex items-start pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(itemKey)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.id}`}
                    className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100
                             hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={item.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
                      }}
                    />
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">Hết Hàng</span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.id}`}
                        className="font-bold text-gray-900 text-lg mb-2 hover:text-purple-600 
                                 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="flex gap-4 text-sm text-gray-600 mb-2">
                        {item.selectedSize && <span>Kích thước: <span className="font-semibold">{item.selectedSize}</span></span>}
                        {item.selectedColor && <span>Màu: <span className="font-semibold">{item.selectedColor}</span></span>}
                      </div>
                      
                      {/* Stock Warning */}
                      <div className="flex items-center gap-2 mb-3">
                        {item.stock > 0 && item.stock <= 10 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-lg">
                            <FaExclamationTriangle className="w-3 h-3" />
                            <span>Chỉ còn {item.stock} sản phẩm</span>
                          </div>
                        )}
                        {item.stock === 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">
                            <FaExclamationTriangle className="w-3 h-3" />
                            <span>Hết hàng</span>
                          </div>
                        )}
                        {item.quantity > item.stock && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">
                            <FaExclamationTriangle className="w-3 h-3" />
                            <span>Vượt quá số lượng có sẵn!</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-2xl font-black text-purple-600">{formatPrice(item.price)}</p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1, item.selectedSize, item.selectedColor)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-purple-600 
                                     text-gray-900 hover:text-white
                                     flex items-center justify-center
                                     transition-all duration-300
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:scale-110 active:scale-95"
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1, item.selectedSize, item.selectedColor)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-purple-600 
                                     text-gray-900 hover:text-white
                                     flex items-center justify-center
                                     transition-all duration-300
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:scale-110 active:scale-95"
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 text-center">
                          Tối đa: {item.stock}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg 
                                 transition-colors flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        <span className="font-semibold">Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Tổng Đơn Hàng</h2>

                {/* Coupon Input */}
                <div className="mb-6">
                  <label className="block font-semibold text-gray-900 mb-2">
                    Bạn có mã giảm giá?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl
                               transition-colors"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <FaTags className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Đã áp dụng {appliedCoupon.code}! Giảm {appliedCoupon.discount}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-y border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600">MIỄN PHÍ</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4">
                  <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 
                                 bg-clip-text text-transparent">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                           hover:from-purple-700 hover:to-pink-700
                           text-white font-bold text-lg rounded-xl
                           shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                           transition-all duration-300
                           flex items-center justify-center gap-2
                           hover:scale-105 active:scale-95"
                >
                  Tiến Hành Thanh Toán
                  <FaArrowRight className="w-5 h-5" />
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  className="block text-center py-3 text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Tiếp Tục Mua Sắm
                </Link>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <FaTruck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Miễn Phí Vận Chuyển</p>
                    <p className="text-xs text-gray-600">Đơn hàng trên 5 triệu VNĐ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <FaShieldAlt className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Thanh Toán An Toàn</p>
                    <p className="text-xs text-gray-600">Bảo mật 100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

