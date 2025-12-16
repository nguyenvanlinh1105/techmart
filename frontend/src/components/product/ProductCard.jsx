import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaEye,
  FaRegHeart,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Badge from "../common/Badge";
import api from "../../services/api";
import QuickAddModal from "./QuickAddModal";

const ProductCard = ({ product, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // --- Logic Map Data (Giữ nguyên) ---
  const id = product.id;
  const name = product.name;
  const image =
    product.images?.[0]?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
  const price = product.price;
  const originalPrice = product.compare_price;
  const rating = product.rating || 0;
  const reviews = product.review_count || 0;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const inStock = product.stock > 0;
  const badge = product.is_featured
    ? "Nổi Bật"
    : product.is_on_sale
    ? "Giảm Giá"
    : null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // --- Logic Wishlist (Giữ nguyên) ---
  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.get("/wishlist");
      const wishlistItems = response.data.items || [];
      const inWishlist = wishlistItems.some(
        (item) => item.product_id === (product.id || product._id)
      );
      setIsInWishlist(inWishlist);
    } catch (error) {
      // Silently fail
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    if (!user) {
      toast.warning("Vui lòng đăng nhập để thêm vào yêu thích");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product.id || product._id}`);
        setIsInWishlist(false);
        toast.success("Đã xóa khỏi yêu thích");
      } else {
        await api.post(`/wishlist/${product.id || product._id}`);
        setIsInWishlist(true);
        toast.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error(
        isInWishlist
          ? "Không thể xóa khỏi yêu thích"
          : "Không thể thêm vào yêu thích"
      );
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (inStock) {
      setShowQuickAdd(true);
    }
  };

  // --- Render: LIST VIEW (Giao diện ngang) ---
  if (viewMode === "list") {
    return (
      <div
        className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
                    transition-all duration-300 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-52"
      >
        {/* Image Section */}
        <Link
          to={`/products/${id}`}
          className="relative sm:w-52 h-48 sm:h-full flex-shrink-0 overflow-hidden"
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
            }}
          />
          {badge && (
            <div className="absolute top-3 left-3">
              <Badge variant={badge.toLowerCase()} className="shadow-md">
                {badge}
              </Badge>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white font-bold text-sm tracking-wider uppercase border border-white px-3 py-1">
                Hết hàng
              </span>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>SKU: {product.sku || "N/A"}</span>
                <span>•</span>
                <span
                  className={`${
                    inStock ? "text-green-600" : "text-red-500"
                  } font-medium`}
                >
                  {inStock ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
              <Link to={`/products/${id}`}>
                <h3 className="font-semibold text-gray-800 text-lg hover:text-purple-600 transition-colors line-clamp-1">
                  {name}
                </h3>
              </Link>
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <div className="flex text-yellow-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.floor(rating)
                          ? "fill-current"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  ({reviews} đánh giá)
                </span>
              </div>
            </div>

            {/* Wishlist Button (Top Right) */}
            <button
              onClick={handleAddToWishlist}
              className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              {isInWishlist ? (
                <FaHeart className="text-red-500 w-5 h-5" />
              ) : (
                <FaRegHeart className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div className="flex flex-col">
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through mb-0.5">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(price)}
                </span>
                {discount > 0 && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/products/${id}`}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Chi tiết
              </Link>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="px-6 py-2.5 bg-gray-900 hover:bg-purple-600 text-white text-sm font-medium rounded-lg 
                         shadow-lg shadow-gray-200 hover:shadow-purple-200 
                         transition-all duration-300 flex items-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaShoppingCart className="w-3.5 h-3.5" />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: GRID VIEW (Giao diện lưới - Modern Card) ---
  return (
    <>
      <div
        className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 
                    hover:border-purple-100 shadow-[0_2px_8px_rgb(0,0,0,0.04)] 
                    hover:shadow-[0_12px_24px_rgb(0,0,0,0.1)] 
                    transition-all duration-300 hover:-translate-y-1"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
          <Link to={`/products/${id}`} className="block w-full h-full">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
              }}
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {badge && (
              <Badge
                variant={badge.toLowerCase()}
                className="shadow-sm backdrop-blur-sm"
              >
                {badge}
              </Badge>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm w-fit">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick Actions (Floating on Right) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <button
              onClick={handleAddToWishlist}
              className="w-9 h-9 rounded-full bg-white text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-md flex items-center justify-center transition-all duration-200"
              title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              {isInWishlist ? (
                <FaHeart className="w-4 h-4 text-red-500" />
              ) : (
                <FaRegHeart className="w-4 h-4" />
              )}
            </button>
            <Link
              to={`/products/${id}`}
              className="w-9 h-9 rounded-full bg-white text-gray-600 hover:text-purple-600 hover:bg-purple-50 shadow-md flex items-center justify-center transition-all duration-200 delay-75"
              title="Xem chi tiết"
            >
              <FaEye className="w-4 h-4" />
            </Link>
          </div>

          {/* Add to Cart Button (Slides up from bottom) */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-full h-11 bg-white hover:bg-blue-500 hover:text-white text-gray-900 font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 border border-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <FaShoppingCart className="w-4 h-4" />
              {inStock ? "Thêm nhanh" : "Hết hàng"}
            </button>
          </div>

          {/* Out of stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px] pointer-events-none">
              <div className="bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-xl">
                Tạm hết hàng
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 bg-white">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <FaStar className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-medium text-gray-500">{rating}</span>
            <span className="text-xs text-gray-300 mx-1">•</span>
            <span className="text-xs text-gray-400">{reviews} đánh giá</span>
          </div>

          {/* Title */}
          <Link to={`/products/${id}`} className="block mb-2">
            <h3
              className="text-[15px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[42px] hover:text-purple-600 transition-colors"
              title={name}
            >
              {name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-400 line-through decoration-gray-300">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuickAddModal
        product={product}
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
};

export default ProductCard;
