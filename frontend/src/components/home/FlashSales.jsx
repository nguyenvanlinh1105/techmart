import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaFire, FaStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { IoFlashSharp } from 'react-icons/io5';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';

const FlashSales = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 23,
    seconds: 45,
  });
  const [flashProducts, setFlashProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch sale products
  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      const data = await productService.getSaleProducts(4);
      setFlashProducts(data);
    } catch (error) {
      console.error('Error fetching sale products:', error);
      toast.error('Không thể tải sản phẩm giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const calculateProgress = (sold, stock) => {
    const total = sold + stock;
    return (sold / total) * 100;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
            <p className="mt-4 text-gray-300">Đang tải sản phẩm giảm giá...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 
                            flex items-center justify-center shadow-lg shadow-orange-500/50
                            animate-pulse">
                <IoFlashSharp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Giảm Giá{' '}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Sốc
                </span>
              </h2>
            </div>
            <p className="text-xl text-gray-300">
              Ưu đãi có thời hạn - Nhanh tay kẻo lỡ!
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2">
            <FaClock className="w-6 h-6 text-orange-400 animate-pulse" />
            <span className="text-white text-lg mr-3">Kết thúc sau:</span>
            <div className="flex gap-2">
              {[
                { value: timeLeft.hours, label: 'Giờ' },
                { value: timeLeft.minutes, label: 'Phút' },
                { value: timeLeft.seconds, label: 'Giây' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-md 
                                border border-white/20 flex items-center justify-center
                                shadow-lg">
                    <span className="text-2xl font-black text-white">
                      {String(item.value).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashProducts.map((product) => {
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
            const discount = calculateDiscount(product.compare_price, product.price);
            
            return (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl overflow-hidden 
                       shadow-xl hover:shadow-2xl transition-all duration-500
                       hover:-translate-y-2"
            >
              {/* Discount Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg
                            bg-gradient-to-r from-orange-500 to-red-500 
                            text-white font-bold text-sm shadow-lg
                            flex items-center gap-1">
                <FaFire className="w-3 h-3" />
                -{discount}%
              </div>

              {/* Quick Actions */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-10 h-10 rounded-lg bg-white shadow-lg 
                                 flex items-center justify-center
                                 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <FaHeart className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-white shadow-lg 
                                 flex items-center justify-center
                                 hover:bg-purple-50 hover:text-purple-500 transition-colors">
                  <FaEye className="w-4 h-4" />
                </button>
              </div>

              {/* Product Image */}
              <Link to={`/products/${product.id}`} className="block">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={primaryImage?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-6">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2
                               group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.review_count})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-black text-purple-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                  )}
                </div>

                {/* Stock Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Đã bán: {product.sold_count}</span>
                    <span>Còn lại: {product.stock}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full
                               transition-all duration-500"
                      style={{ width: `${calculateProgress(product.sold_count, product.stock)}%` }}
                    />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                                 hover:from-purple-700 hover:to-pink-700
                                 text-white font-bold rounded-xl
                                 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                                 transition-all duration-300
                                 flex items-center justify-center gap-2
                                 hover:scale-105 active:scale-95">
                  <FaShoppingCart className="w-4 h-4" />
                  Thêm Vào Giỏ
                </button>
              </div>
            </div>
          )})}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products?sale=true"
            className="inline-flex items-center gap-2 px-8 py-4 
                     bg-white/10 backdrop-blur-md border border-white/20
                     hover:bg-white/20 text-white font-bold rounded-xl
                     transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Xem Tất Cả Khuyến Mãi
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSales;

