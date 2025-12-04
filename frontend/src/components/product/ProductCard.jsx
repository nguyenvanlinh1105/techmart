import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';
import api from '../../services/api';
import QuickAddModal from './QuickAddModal';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Map API data to component props
  const id = product.id;
  const name = product.name;
  const image = product.images?.[0]?.url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  const price = product.price;
  const originalPrice = product.compare_price;
  const rating = product.rating || 0;
  const reviews = product.review_count || 0;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const inStock = product.stock > 0;
  const badge = product.is_featured ? 'Nổi Bật' : product.is_on_sale ? 'Giảm Giá' : null;
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  
  // Check if product is in wishlist
  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, product.id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.get('/wishlist');
      const wishlistItems = response.data.items || [];
      const inWishlist = wishlistItems.some(item => item.product_id === (product.id || product._id));
      setIsInWishlist(inWishlist);
    } catch (error) {
      // Silently fail - wishlist might not exist
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product.id || product._id}`);
        setIsInWishlist(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await api.post(`/wishlist/${product.id || product._id}`);
        setIsInWishlist(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(isInWishlist ? 'Không thể xóa khỏi yêu thích' : 'Không thể thêm vào yêu thích');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Wait for auth to load first
    if (loading) {
      return; // Don't do anything while loading
    }
    
    // Kiểm tra đăng nhập
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    if (inStock) {
      // Open quick add modal instead of adding directly
      setShowQuickAdd(true);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                    transition-all duration-300 overflow-hidden
                    flex flex-col md:flex-row">
        {/* Image */}
        <Link to={`/products/${id}`} className="relative md:w-64 flex-shrink-0">
          <div className="relative h-64 md:h-full overflow-hidden bg-gray-100">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
              }}
            />
            
            {/* Badge */}
            {badge && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant={badge.toLowerCase()}>{badge}</Badge>
              </div>
            )}
            
            {/* Discount */}
            {discount > 0 && (
              <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg
                            bg-gradient-to-r from-orange-500 to-red-500 
                            text-white font-bold text-sm shadow-lg">
                -{discount}%
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <Link to={`/products/${id}`}>
              <h3 className="font-bold text-gray-900 text-xl mb-3 
                           group-hover:text-purple-600 transition-colors">
                {name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {rating} ({reviews} đánh giá)
              </span>
            </div>

            {/* Stock Status */}
            <p className={`text-sm font-semibold mb-4 ${
              inStock ? 'text-green-600' : 'text-red-600'
            }`}>
              {inStock ? 'Còn hàng' : 'Hết hàng'}
            </p>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 
                             bg-clip-text text-transparent">
                {formatPrice(price)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAddToWishlist}
                className={`w-10 h-10 rounded-lg flex items-center justify-center
                               transition-all duration-300
                               ${isInWishlist 
                                 ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                 : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500'
                               }`}
                title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
              >
                <FaHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              <Link 
                to={`/products/${id}`}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-purple-50 
                               text-gray-600 hover:text-purple-500
                               flex items-center justify-center
                               transition-colors"
              >
                <FaEye className="w-4 h-4" />
              </Link>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700
                         text-white font-bold rounded-xl
                         shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                         transition-all duration-300
                         flex items-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95"
              >
                <FaShoppingCart className="w-4 h-4" />
                Thêm Vào Giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <>
    <div className="group relative bg-white rounded-2xl overflow-hidden 
                  shadow-lg hover:shadow-2xl transition-all duration-500
                  hover:-translate-y-2">
      
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant={badge.toLowerCase()}>{badge}</Badge>
        </div>
      )}

      {/* Discount */}
      {discount > 0 && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg
                      bg-gradient-to-r from-orange-500 to-red-500 
                      text-white font-bold text-sm shadow-lg">
          -{discount}%
        </div>
      )}

      {/* Quick Actions */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-2
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handleAddToWishlist}
          className={`w-10 h-10 rounded-lg bg-white shadow-lg 
                         flex items-center justify-center
                         transition-all duration-300
                         hover:scale-110 active:scale-95
                         ${isInWishlist ? 'text-red-500' : 'hover:bg-red-50 hover:text-red-500'}`}
          title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <FaHeart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
        <Link
          to={`/products/${id}`}
          className="w-10 h-10 rounded-lg bg-white shadow-lg 
                         flex items-center justify-center
                         hover:bg-purple-50 hover:text-purple-500 transition-colors
                         hover:scale-110 active:scale-95"
        >
          <FaEye className="w-4 h-4" />
        </Link>
      </div>

      {/* Product Image */}
      <Link to={`/products/${id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
            }}
          />
          
          {/* Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Hết Hàng</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link to={`/products/${id}`}>
          <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2
                       group-hover:text-purple-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1 mb-4">
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-2xl font-black text-purple-600">
            {formatPrice(price)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                   hover:from-purple-700 hover:to-pink-700
                   text-white font-bold rounded-xl
                   shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                   transition-all duration-300
                   flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:scale-105 active:scale-95"
        >
          <FaShoppingCart className="w-4 h-4" />
          {inStock ? 'Thêm Vào Giỏ' : 'Hết Hàng'}
        </button>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                      -skew-x-12 group-hover:animate-shine" />
      </div>
    </div>
    
    {/* Quick Add Modal */}
    <QuickAddModal 
      product={product}
      isOpen={showQuickAdd}
      onClose={() => setShowQuickAdd(false)}
    />
    </>
  );
};

export default ProductCard;
