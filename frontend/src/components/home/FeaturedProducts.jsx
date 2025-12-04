import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';

const FeaturedProducts = () => {
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await productService.getFeaturedProducts(10);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      toast.error('Không thể tải sản phẩm nổi bật');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeInfo = (product) => {
    if (product.is_on_sale) {
      return { text: 'Giảm Giá', color: 'from-red-500 to-orange-500' };
    }
    if (product.sold_count > 100) {
      return { text: 'Bán Chạy', color: 'from-yellow-500 to-orange-500' };
    }
    if (product.rating >= 4.8) {
      return { text: 'Đánh Giá Cao', color: 'from-green-500 to-emerald-500' };
    }
    return { text: 'Nổi Bật', color: 'from-purple-500 to-pink-500' };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <IoSparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                Sản Phẩm{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nổi Bật
                </span>
              </h2>
            </div>
            <p className="text-xl text-gray-600">
              Bộ sưu tập cao cấp được tuyển chọn
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-purple-600 
                       text-gray-600 hover:text-white
                       flex items-center justify-center
                       transition-all duration-300 hover:scale-110 active:scale-95
                       shadow-lg hover:shadow-purple-500/25"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-purple-600 
                       text-gray-600 hover:text-white
                       flex items-center justify-center
                       transition-all duration-300 hover:scale-110 active:scale-95
                       shadow-lg hover:shadow-purple-500/25"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-4"
        >
          {products.map((product) => {
            const badge = getBadgeInfo(product);
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
            
            return (
            <div
              key={product.id}
              className="group relative flex-shrink-0 w-80 bg-white rounded-2xl 
                       shadow-xl hover:shadow-2xl transition-all duration-500
                       hover:-translate-y-2 border border-gray-100"
            >
              {/* Badge */}
              <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg
                            bg-gradient-to-r ${badge.color}
                            text-white font-bold text-sm shadow-lg
                            flex items-center gap-1`}>
                <IoSparkles className="w-3 h-3" />
                {badge.text}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-10 h-10 rounded-lg bg-white shadow-lg 
                                 flex items-center justify-center
                                 hover:bg-red-50 hover:text-red-500 transition-colors
                                 hover:scale-110 active:scale-95">
                  <FaHeart className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-white shadow-lg 
                                 flex items-center justify-center
                                 hover:bg-purple-50 hover:text-purple-500 transition-colors
                                 hover:scale-110 active:scale-95">
                  <FaEye className="w-4 h-4" />
                </button>
              </div>

              {/* Product Image */}
              <Link to={`/products/${product.id}`} className="block">
                <div className="relative h-80 overflow-hidden rounded-t-2xl bg-gray-100">
                  <img
                    src={primaryImage?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                  
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-6">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2
                               group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
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
                  <span className="text-sm font-medium text-gray-600">
                    {product.rating} ({product.review_count})
                  </span>
                </div>

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {product.compare_price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 
                                   bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <button className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 
                                   hover:from-purple-700 hover:to-pink-700
                                   text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                                   flex items-center justify-center
                                   transition-all duration-300 hover:scale-110 active:scale-95">
                    <FaShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500 pointer-events-none rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              -skew-x-12 group-hover:animate-shine" />
              </div>
            </div>
          )})}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 
                     bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700
                     text-white font-bold rounded-xl
                     shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                     transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Xem Tất Cả Sản Phẩm
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;

