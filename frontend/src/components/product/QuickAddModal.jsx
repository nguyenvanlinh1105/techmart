import React, { useState } from 'react';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const QuickAddModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  // Get unique sizes and colors from variants
  const sizes = product.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [];
  const colors = product.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    // Validate if product has variants
    if (sizes.length > 0 && !selectedSize) {
      toast.warning('Vui lòng chọn kích thước');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.warning('Vui lòng chọn màu sắc');
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    onClose();
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // Validate if product has variants
    if (sizes.length > 0 && !selectedSize) {
      toast.warning('Vui lòng chọn kích thước');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.warning('Vui lòng chọn màu sắc');
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const incrementQuantity = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">Thêm vào giỏ hàng</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Left: Images */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={product.images?.[selectedImage]?.url || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                    }}
                  />
                  {product.is_on_sale && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Giảm giá
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-purple-600 scale-105'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img
                          src={img.url || img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  {product.brand && (
                    <p className="text-gray-600">Thương hiệu: <span className="font-semibold">{product.brand}</span></p>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-purple-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded">
                        -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <>
                      <FaCheck className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        Còn hàng ({product.stock} sản phẩm)
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 font-semibold">Hết hàng</span>
                  )}
                </div>

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div>
                    <label className="block font-bold text-gray-900 mb-3">
                      Kích thước <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${
                            selectedSize === size
                              ? 'border-purple-600 bg-purple-50 text-purple-600'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <label className="block font-bold text-gray-900 mb-3">
                      Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${
                            selectedColor === color
                              ? 'border-purple-600 bg-purple-50 text-purple-600'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="block font-bold text-gray-900 mb-3">Số lượng</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={decrementQuantity}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <FaMinus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(1, Math.min(val, product.stock || 99)));
                        }}
                        className="w-16 text-center font-bold text-lg border-x-2 border-gray-300 focus:outline-none"
                      />
                      <button
                        onClick={incrementQuantity}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        disabled={quantity >= (product.stock || 99)}
                      >
                        <FaPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      Tối đa: {product.stock || 99}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 px-6 bg-white border-2 border-purple-600 text-purple-600 
                             hover:bg-purple-50 font-bold rounded-xl transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700
                             text-white font-bold rounded-xl
                             shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickAddModal;
