import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaArrowRight,
  FaTags,
  FaTruck,
  FaShieldAlt,
  FaExclamationCircle,
  FaStore,
} from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const {
    cartItems,
    updateQuantity: updateCartQuantity,
    removeFromCart,
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // --- Logic giữ nguyên như cũ ---
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.warning("Vui lòng đăng nhập để xem giỏ hàng!");
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [user, authLoading, navigate, location]);

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  if (!user) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const updateQuantity = (id, delta, selectedSize, selectedColor) => {
    const item = cartItems.find(
      (i) =>
        i.id === id &&
        i.selectedSize === selectedSize &&
        i.selectedColor === selectedColor
    );
    if (item) {
      const newQuantity = item.quantity + delta;
      const availableStock = item.stock || 0;
      if (newQuantity > availableStock) {
        toast.warning(`Chỉ còn ${availableStock} sản phẩm trong kho`);
        return;
      }
      if (newQuantity > 0)
        updateCartQuantity(id, newQuantity, selectedSize, selectedColor);
    }
  };

  const removeItem = (id, selectedSize, selectedColor) =>
    removeFromCart(id, selectedSize, selectedColor);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE10")
      setAppliedCoupon({ code: "SAVE10", discount: 10 });
    else toast.error("Mã giảm giá không hợp lệ");
  };

  const getItemKey = (item) =>
    `${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`;

  // Logic chọn item
  useEffect(() => {
    if (cartItems.length > 0) {
      const allKeys = new Set(cartItems.map((item) => getItemKey(item)));
      setSelectedItems(allKeys);
    }
  }, [cartItems.length]);

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(cartItems.map((item) => getItemKey(item))));
  };

  const toggleItem = (itemKey) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemKey)) newSelected.delete(itemKey);
    else newSelected.add(itemKey);
    setSelectedItems(newSelected);
  };

  const getSelectedSubtotal = () =>
    cartItems
      .filter((item) => selectedItems.has(getItemKey(item)))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const subtotal = getSelectedSubtotal();
  const shipping = subtotal > 5000000 ? 0 : 30000;
  const discount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;
  const total = subtotal + shipping - discount;

  // --- Render Empty Cart ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-48 h-48 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <FaShoppingCart className="w-20 h-20 text-purple-200" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-500 mb-8">
            Có vẻ như bạn chưa thêm sản phẩm nào. Hãy khám phá cửa hàng ngay
            nhé!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-purple-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Khám phá ngay <FaArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Giỏ Hàng{" "}
              <span className="text-purple-600">({cartItems.length})</span>
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <FaStore className="text-purple-500" />
              Kiểm tra kỹ sản phẩm trước khi thanh toán
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {/* Select All Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between sticky top-20 z-10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.size === cartItems.length &&
                      cartItems.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="peer w-5 h-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-purple-600 checked:border-purple-600 transition-all"
                  />
                  <svg
                    className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1 top-1"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3 8L6 11L11 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </span>
              </label>

              {selectedItems.size > 0 && (
                <button
                  onClick={() => {
                    /* Logic xóa nhiều */
                  }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Xóa đã chọn
                </button>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemKey = getItemKey(item);
                const isSelected = selectedItems.has(itemKey);

                return (
                  <div
                    key={itemKey}
                    className={`group relative bg-white rounded-2xl p-4 md:p-6 transition-all duration-300
                      ${
                        isSelected
                          ? "border-2 border-purple-500 shadow-purple-100"
                          : "border border-gray-100 shadow-sm"
                      }
                      hover:shadow-lg hover:border-purple-200
                    `}
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* 1. Checkbox Area */}
                      <div className="flex items-center pt-2 md:pt-0">
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItem(itemKey)}
                            className="peer w-5 h-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 checked:bg-purple-600 checked:border-purple-600 transition-all"
                          />
                          <svg
                            className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-1 top-1"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </label>
                      </div>

                      {/* 2. Product Image */}
                      <Link
                        to={`/products/${item.id}`}
                        className="block relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100"
                      >
                        <img
                          src={
                            item.images?.[0]?.url ||
                            item.image ||
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {item.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white text-xs font-bold px-2 py-1 border border-white rounded">
                              HẾT HÀNG
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* 3. Info & Actions Grid */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Info Section */}
                        <div className="flex flex-col justify-between">
                          <div>
                            <Link
                              to={`/products/${item.id}`}
                              className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 mb-2"
                            >
                              {item.name}
                            </Link>

                            {/* Variants Chips */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.selectedSize && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Màu: {item.selectedColor}
                                </span>
                              )}
                            </div>

                            {/* Stock Warnings */}
                            {item.stock > 0 && item.stock <= 5 && (
                              <div className="flex items-center gap-1.5 text-orange-600 text-xs font-medium bg-orange-50 w-fit px-2 py-1 rounded-md">
                                <FaExclamationCircle />
                                <span>Sắp hết hàng: chỉ còn {item.stock}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity Section */}
                        <div className="flex flex-col md:items-end justify-between gap-4">
                          <div className="text-left md:text-right">
                            <div className="text-xl font-bold text-purple-600">
                              {formatPrice(item.price)}
                            </div>
                            {/* Optional: Original price logic if you have it */}
                            {/* <div className="text-sm text-gray-400 line-through">100.000 đ</div> */}
                          </div>

                          <div className="flex items-center justify-between md:justify-end w-full gap-4">
                            {/* Modern Quantity Button */}
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    -1,
                                    item.selectedSize,
                                    item.selectedColor
                                  )
                                }
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all"
                              >
                                <FaMinus className="w-2.5 h-2.5" />
                              </button>

                              <input
                                type="text"
                                readOnly
                                value={item.quantity}
                                className="w-10 text-center bg-transparent font-bold text-gray-900 text-sm focus:outline-none"
                              />

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    1,
                                    item.selectedSize,
                                    item.selectedColor
                                  )
                                }
                                disabled={item.quantity >= item.stock}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all"
                              >
                                <FaPlus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() =>
                                removeItem(
                                  item.id,
                                  item.selectedSize,
                                  item.selectedColor
                                )
                              }
                              className="group/btn flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                              title="Xóa sản phẩm"
                            >
                              <FaTrash className="w-4 h-4 transform group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-6 md:p-8 border border-purple-50">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                  Tổng quan đơn hàng
                </h2>

                {/* Coupon */}
                <div className="mb-6 group">
                  <div className="flex gap-2 relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                      <FaTags />
                    </div>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Mã giảm giá"
                      className="flex-1 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-gray-900 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-gray-200"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Áp dụng mã <strong>{appliedCoupon.code}</strong>: -
                      {appliedCoupon.discount}%
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-100 my-6"></div>

                {/* Price Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          Miễn phí
                        </span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-100 my-6"></div>

                {/* Total */}
                <div className="flex justify-between items-end mb-8">
                  <span className="text-gray-900 font-bold">Tổng cộng</span>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-purple-600 leading-none">
                      {formatPrice(total)}
                    </span>
                    <span className="text-xs text-gray-400 font-normal mt-1">
                      (Đã bao gồm VAT)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-1 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                >
                  Thanh Toán Ngay <FaArrowRight />
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/products"
                    className="text-sm text-gray-500 hover:text-purple-600 font-medium transition-colors"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center text-center">
                  <FaTruck className="text-purple-600 w-6 h-6 mb-2" />
                  <span className="text-xs font-bold text-gray-800">
                    Freeship từ 5TR
                  </span>
                </div>
                <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center text-center">
                  <FaShieldAlt className="text-green-600 w-6 h-6 mb-2" />
                  <span className="text-xs font-bold text-gray-800">
                    Bảo mật 100%
                  </span>
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
