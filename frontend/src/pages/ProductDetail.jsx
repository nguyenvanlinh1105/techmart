import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaStar, 
  FaShoppingCart, 
  FaHeart, 
  FaMinus,
  FaPlus,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheck,
  FaShare,
  FaStore
} from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });

  // Fetch product data
  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      // Fetch product details
      const productData = await productService.getProductById(id);
      setProduct(productData);
      
      // Set default variant if available
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
      
      // Fetch related products
      try {
        const relatedData = await productService.getRelatedProducts(id);
        setRelatedProducts(relatedData);
      } catch (error) {
        console.log('No related products found');
      }
      
      // Fetch reviews
      try {
        const reviewsData = await productService.getReviews(id);
        setReviews(reviewsData);
      } catch (error) {
        console.log('No reviews found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
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

  const calculateDiscount = () => {
    if (!product?.compare_price || !product?.price) return 0;
    return Math.round(((product.compare_price - product.price) / product.compare_price) * 100);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Wait for auth to load
    if (authLoading) return;
    
    // Kiểm tra đăng nhập
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    addToCart(product, quantity, selectedVariant?.size, selectedVariant?.color);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Wait for auth to load
    if (authLoading) return;
    
    // Kiểm tra đăng nhập
    if (!user) {
      toast.warning('Vui lòng đăng nhập để mua hàng');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    // Add to cart first
    addToCart(product, quantity, selectedVariant?.size, selectedVariant?.color);
    // Navigate to checkout
    navigate('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      await productService.addReview({
        product_id: id,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      });
      
      toast.success('Đã gửi đánh giá thành công!');
      setNewReview({ rating: 5, title: '', comment: '' });
      fetchProductData(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Không thể gửi đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
          <Link to="/products" className="text-purple-600 hover:text-purple-700">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const discount = calculateDiscount();
  
  // Mock related products if not available
  const displayRelatedProducts = relatedProducts.length > 0 ? relatedProducts : [
    {
      id: 101,
      name: 'Sản phẩm liên quan',
      images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80' }],
      price: 149000,
      rating: 4.7,
    },
    {
      id: 102,
      name: 'USB-C Charging Cable',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
      price: 19.99,
      rating: 4.5,
    },
    {
      id: 103,
      name: 'Headphone Stand',
      image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&q=80',
      price: 29.99,
      rating: 4.6,
    },
    {
      id: 104,
      name: 'Audio Adapter',
      image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80',
      price: 24.99,
      rating: 4.4,
    },
  ];

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const maxStock = selectedVariant?.stock || product.stock || 999;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const productImages = product.images?.length > 0 
    ? product.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-gray-600 hover:text-purple-600">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-gray-600 hover:text-purple-600">Sản phẩm</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          
          {/* Images Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl aspect-square">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                }}
              />
              
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-6 left-6 px-4 py-2 rounded-xl
                              bg-gradient-to-r from-orange-500 to-red-500 
                              text-white font-bold text-lg shadow-lg">
                  -{discount}% GIẢM
                </div>
              )}

              {/* Wishlist & Share */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button className="w-12 h-12 rounded-xl bg-white shadow-lg 
                                 flex items-center justify-center
                                 hover:bg-red-50 hover:text-red-500 transition-colors
                                 hover:scale-110 active:scale-95">
                  <FaHeart className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-xl bg-white shadow-lg 
                                 flex items-center justify-center
                                 hover:bg-purple-50 hover:text-purple-500 transition-colors
                                 hover:scale-110 active:scale-95">
                  <FaShare className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden 
                           border-2 transition-all duration-300
                           hover:scale-105 ${
                             selectedImage === index
                               ? 'border-purple-600 shadow-lg shadow-purple-500/25'
                               : 'border-gray-200 hover:border-purple-300'
                           }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            
            {/* Brand */}
            {product.brand && (
              <Link to={`/products?brand=${product.brand.toLowerCase()}`} 
                    className="inline-block text-purple-600 hover:text-purple-700 font-semibold text-lg">
                {product.brand}
              </Link>
            )}

            {/* Store Name - Hiển thị tên cửa hàng nếu có */}
            {product.store_name && (
              <div className="flex items-center gap-2 text-purple-600">
                <FaStore className="w-5 h-5" />
                <span className="font-semibold text-lg">{product.store_name}</span>
                {product.seller_name && (
                  <span className="text-gray-500 text-sm">- {product.seller_name}</span>
                )}
              </div>
            )}

            {/* Name */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{product.rating}</span>
              </div>
              <span className="text-gray-600">({product.review_count} đánh giá)</span>
              <span className="text-gray-600">• Đã bán: {product.sold_count}</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 
                             bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-2xl text-gray-400 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block font-bold text-gray-900 mb-3">Chọn phiên bản</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`p-4 rounded-xl font-semibold transition-all duration-300 text-left
                               ${selectedVariant === variant
                                 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                 : variant.stock > 0
                                   ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                   : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                               }`}
                    >
                      <div className="flex flex-col gap-1">
                        {variant.size && <div className="text-sm">{variant.size}</div>}
                        {variant.color && <div className="text-sm">{variant.color}</div>}
                        <div className="text-xs opacity-75">
                          {variant.stock > 0 ? `Còn ${variant.stock}` : 'Hết hàng'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block font-bold text-gray-900 mb-3">Số lượng</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg bg-white hover:bg-purple-600 
                             text-gray-900 hover:text-white
                             flex items-center justify-center
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:scale-110 active:scale-95"
                  >
                    <FaMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (selectedVariant?.stock || product.stock || 999)}
                    className="w-10 h-10 rounded-lg bg-white hover:bg-purple-600 
                             text-gray-900 hover:text-white
                             flex items-center justify-center
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed
                             hover:scale-110 active:scale-95"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-600">
                  Còn {selectedVariant?.stock || product.stock || 0} sản phẩm
                </span>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (selectedVariant && selectedVariant.stock === 0)}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                               hover:from-purple-700 hover:to-pink-700
                               disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
                               text-white font-bold text-lg rounded-xl
                               shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                               transition-all duration-300
                               flex items-center justify-center gap-3
                               hover:scale-105 active:scale-95 disabled:scale-100">
                <FaShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Hết hàng' : 'Thêm Vào Giỏ'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.stock === 0 || (selectedVariant && selectedVariant.stock === 0)}
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800
                               disabled:bg-gray-400 disabled:cursor-not-allowed
                               text-white font-bold text-lg rounded-xl
                               transition-all duration-300
                               hover:scale-105 active:scale-95 disabled:scale-100">
                Mua Ngay
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FaTruck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Miễn Phí Ship</p>
                  <p className="text-xs text-gray-600">Đơn từ 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <FaShieldAlt className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Bảo Hành 1 Năm</p>
                  <p className="text-xs text-gray-600">100% chính hãng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                  <FaUndo className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Đổi Trả 30 Ngày</p>
                  <p className="text-xs text-gray-600">Hoàn tiền dễ dàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-purple-600 text-purple-600 font-bold">
                Description
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-purple-600 font-semibold">
                Specifications
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-purple-600 font-semibold">
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Features List */}
          {product.features && product.features.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 
                                flex items-center justify-center flex-shrink-0">
                    <FaCheck className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900">Đánh Giá Khách Hàng</h2>
            <span className="text-gray-600">({reviews.length} đánh giá)</span>
          </div>
          
          {/* Review Form */}
          {user ? (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg mb-4">Viết đánh giá của bạn</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Đánh giá</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="text-3xl transition-colors"
                      >
                        <FaStar className={star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tiêu đề (tùy chọn)</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Tóm tắt đánh giá của bạn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg
                           hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Gửi Đánh Giá
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-600 mb-4">Vui lòng đăng nhập để viết đánh giá</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700"
              >
                Đăng Nhập
              </button>
            </div>
          )}
          
          {/* Reviews List */}
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.user_avatar || `https://i.pravatar.cc/150?u=${review.user_name}`}
                      alt={review.user_name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.user_name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {review.is_verified_purchase && (
                              <span className="text-xs text-green-600 font-semibold">✓ Đã mua hàng</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {review.title && <h5 className="font-semibold text-gray-900 mb-1">{review.title}</h5>}
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {displayRelatedProducts && displayRelatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-8">Sản Phẩm Liên Quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayRelatedProducts.map((relatedProduct) => {
                const relatedImage = relatedProduct.images?.[0]?.url || relatedProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
                return (
                  <Link
                    key={relatedProduct.id}
                    to={`/products/${relatedProduct.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg 
                             hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={relatedImage}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-purple-600">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <FaStar className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">{relatedProduct.rating || 5.0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

