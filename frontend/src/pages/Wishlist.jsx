import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để xem danh sách yêu thích!');
      navigate('/login', { state: { from: '/wishlist' }, replace: true });
      return;
    }
    
    fetchWishlist();
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlist(response.data);
      
      // Fetch product details for each item
      const productPromises = response.data.items.map(item => 
        api.get(`/products/${item.product_id}`).catch(() => null)
      );
      
      const productResults = await Promise.all(productPromises);
      setProducts(productResults.filter(Boolean).map(res => res.data));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success('Đã xóa khỏi danh sách yêu thích');
      fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Không thể xóa khỏi danh sách yêu thích');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!wishlist || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 
                          flex items-center justify-center">
              <FaHeart className="w-16 h-16 text-purple-600" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Danh Sách Yêu Thích Trống</h2>
            <p className="text-xl text-gray-600 mb-8">
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
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
            Danh Sách{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Yêu Thích
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            {products.length} sản phẩm trong danh sách yêu thích
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const productImage = product.images?.[0]?.url || 
                                product.images?.[0] || 
                                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
            
            return (
              <div
                key={product.id || product._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg 
                         hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative">
                  <Link to={`/products/${product.id || product._id}`}>
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
                        }}
                      />
                    </div>
                  </Link>
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => removeFromWishlist(product.id || product._id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 
                             hover:bg-red-500 hover:text-white
                             flex items-center justify-center
                             shadow-lg transition-all duration-300
                             group-hover:scale-110"
                    title="Xóa khỏi yêu thích"
                  >
                    <FaTrash className="w-4 h-4 text-red-500 group-hover:text-white" />
                  </button>
                  
                  {/* Discount badge */}
                  {product.compare_price && product.compare_price > product.price && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-lg
                                  bg-gradient-to-r from-orange-500 to-red-500 
                                  text-white text-sm font-bold shadow-lg">
                      -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <Link to={`/products/${product.id || product._id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-purple-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700
                             text-white font-semibold rounded-lg
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2
                             hover:scale-105 active:scale-95"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

