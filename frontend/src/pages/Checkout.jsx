import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaCheck, 
  FaCreditCard, 
  FaMoneyBillWave,
  FaLock,
  FaShieldAlt,
  FaTags,
  FaPercent,
  FaUniversity,
  FaMobileAlt,
  FaWallet,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { SiVisa, SiMastercard } from 'react-icons/si';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { couponService } from '../services/couponService';
import { toast } from 'react-toastify';
import AddressSelector from '../components/AddressSelector';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  // Bắt buộc đăng nhập để thanh toán
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để thanh toán!');
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, authLoading, navigate, location]);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get saved addresses from user profile
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    cityCode: '',
    district: '',
    districtCode: '',
    ward: '',
    wardCode: '',
    zipCode: '',
    country: 'Việt Nam',
  });

  const [newAddress, setNewAddress] = useState({
    label: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    cityCode: '',
    district: '',
    districtCode: '',
    ward: '',
    wardCode: '',
    zipCode: '',
    isDefault: false,
  });

  const [addressData, setAddressData] = useState({
    provinceCode: '',
    provinceName: '',
    districtCode: '',
    districtName: '',
    wardCode: '',
    wardName: ''
  });

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Memoized onChange handler to prevent infinite re-renders
  const handleAddressChange = useCallback((data) => {
    setAddressData(data);
    setShippingInfo(prev => ({
      ...prev,
      city: data.provinceName,
      cityCode: data.provinceCode,
      district: data.districtName,
      districtCode: data.districtCode,
      ward: data.wardName,
      wardCode: data.wardCode
    }));
  }, []);

  // Available discount coupons from API
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Use cartItems from useCart (no mock data)
  const subtotal = getCartTotal();
  const shipping = subtotal > 5000000 ? 0 : 30000; // Free shipping over 5M VND
  
  // Calculate discount from applied coupon
  const discount = appliedCoupon?.discount_amount || 0;
  const total = subtotal - discount + shipping;

  // Load available coupons
  useEffect(() => {
    const loadCoupons = async () => {
      if (!isAuthenticated()) return;
      
      try {
        setLoadingCoupons(true);
        const coupons = await couponService.getActiveCoupons();
        setAvailableCoupons(coupons);
      } catch (error) {
        console.error('Error loading coupons:', error);
        setAvailableCoupons([]);
      } finally {
        setLoadingCoupons(false);
      }
    };
    
    loadCoupons();
    
    // Listen for coupon created event from admin
    const handleCouponCreated = () => {
      console.log('🎉 Coupon created event received, reloading...');
      loadCoupons();
    };
    
    window.addEventListener('couponCreated', handleCouponCreated);
    
    return () => {
      window.removeEventListener('couponCreated', handleCouponCreated);
    };
  }, [isAuthenticated]);

  // Auto-apply best coupon
  useEffect(() => {
    const autoApplyCoupon = async () => {
      if (!isAuthenticated() || appliedCoupon || subtotal === 0) return;
      
      try {
        const cartData = cartItems.map(item => ({
          product_id: item.id || item._id,
          quantity: item.quantity,
          price: item.price
        }));
        
        const bestCoupon = await couponService.getAutoApplyCoupons(subtotal, cartData);
        if (bestCoupon) {
          setAppliedCoupon(bestCoupon);
          toast.success(`Đã tự động áp dụng mã ${bestCoupon.code}!`, {
            icon: '🎉'
          });
        }
      } catch (error) {
        console.error('Error auto-applying coupon:', error);
      }
    };
    
    autoApplyCoupon();
  }, [subtotal, cartItems, isAuthenticated, appliedCoupon]);

  const applyCoupon = async (coupon) => {
    try {
      // Check if cart is empty
      if (cartItems.length === 0) {
        toast.warning('Giỏ hàng trống! Vui lòng thêm sản phẩm trước.');
        return;
      }
      
      // Check if order meets minimum
      if (coupon.min_order_value && subtotal < coupon.min_order_value) {
        toast.warning(`Đơn hàng tối thiểu ${formatPrice(coupon.min_order_value)} để dùng mã này`);
        return;
      }
      
      // Validate coupon with API
      const cartData = cartItems.map(item => ({
        product_id: item.id || item._id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const validation = await couponService.validateCoupon(coupon.code, subtotal, cartData);
      
      if (validation.valid) {
        setAppliedCoupon(validation);
        setCouponCode(validation.code);
        setShowCoupons(false);
        toast.success(`Đã áp dụng mã ${validation.code}! Giảm ${formatPrice(validation.discount_amount)}`);
      } else {
        toast.warning('Mã không hợp lệ');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      const errorMsg = error.response?.data?.detail || 'Không thể áp dụng mã giảm giá';
      toast.error(errorMsg);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  // Load user addresses and auto-fill info when logged in
  useEffect(() => {
    if (isAuthenticated() && user) {
      // Load addresses from user profile
      if (user.addresses && Array.isArray(user.addresses)) {
        setSavedAddresses(user.addresses);
        
        // Auto-select default address if exists
        const defaultAddress = user.addresses.find(addr => addr.is_default || addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          selectAddress(defaultAddress);
        }
      }
      
      // Set email from user account
      setShippingInfo(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.full_name || user.fullName || user.name || '',
        phone: user.phone || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Select an address
  const selectAddress = (address) => {
    setShippingInfo({
      fullName: address.full_name || address.fullName,
      email: shippingInfo.email, // Keep email from user
      phone: address.phone,
      address: address.address,
      city: address.city,
      cityCode: address.city_code || address.cityCode || '',
      district: address.district || address.state || '',
      districtCode: address.district_code || address.districtCode || '',
      ward: address.ward || '',
      wardCode: address.ward_code || address.wardCode || '',
      zipCode: address.postal_code || address.zipCode || '',
      country: 'Việt Nam',
    });
    setSelectedAddressId(address.id);
    
    // Update address selector
    setAddressData({
      provinceCode: address.city_code || address.cityCode || '',
      provinceName: address.city || '',
      districtCode: address.district_code || address.districtCode || '',
      districtName: address.district || address.state || '',
      wardCode: address.ward_code || address.wardCode || '',
      wardName: address.ward || ''
    });
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.fullName || !newAddress.phone || !newAddress.address) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!addressData.provinceCode || !addressData.districtCode || !addressData.wardCode) {
      toast.error('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare address data for backend
      const addressToSave = {
        label: newAddress.label,
        full_name: newAddress.fullName,
        phone: newAddress.phone,
        address: newAddress.address,
        city: addressData.provinceName,
        city_code: addressData.provinceCode,
        district: addressData.districtName,
        district_code: addressData.districtCode,
        ward: addressData.wardName,
        ward_code: addressData.wardCode,
        postal_code: newAddress.zipCode || '',
        is_default: newAddress.isDefault || false
      };

      // Call API to save address
      const response = await authService.addAddress(addressToSave, user.email);
      
      // Update local state with new addresses from response
      if (response.addresses) {
        setSavedAddresses(response.addresses);
        
        // Find the newly added address and select it
        const addedAddress = response.addresses[response.addresses.length - 1];
        if (addedAddress) {
          setSelectedAddressId(addedAddress.id);
          selectAddress(addedAddress);
        }
      }
      
      setShowAddressModal(false);
      toast.success('Đã thêm địa chỉ mới!');
      resetNewAddressForm();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Không thể thêm địa chỉ. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        const response = await authService.deleteAddress(id, user.email);
        
        // Update local state
        if (response.addresses) {
          setSavedAddresses(response.addresses);
        }
        
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
        }
        
        toast.success('Đã xóa địa chỉ!');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Không thể xóa địa chỉ. Vui lòng thử lại!');
      }
    }
  };

  // Set default address (can be implemented later with API)
  const setDefaultAddress = async (id) => {
    // Update local state immediately for better UX
    setSavedAddresses(savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
      is_default: addr.id === id,
    })));
    
    // TODO: Call API to update default address in backend
    toast.success('Đã đặt làm địa chỉ mặc định!');
  };

  // Reset new address form
  const resetNewAddressForm = () => {
    setNewAddress({
      label: '',
      fullName: user?.fullName || user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      cityCode: '',
      district: '',
      districtCode: '',
      ward: '',
      wardCode: '',
      zipCode: '',
      isDefault: false,
    });
    setAddressData({
      provinceCode: '',
      provinceName: '',
      districtCode: '',
      districtName: '',
      wardCode: '',
      wardName: ''
    });
  };

  const steps = [
    { number: 1, title: 'Giao Hàng', icon: '📦' },
    { number: 2, title: 'Thanh Toán', icon: '💳' },
    { number: 3, title: 'Xác Nhận', icon: '✅' },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleNextStep = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Place order - Submit to API
      await handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);

      // Validate
      if (cartItems.length === 0) {
        toast.error('Giỏ hàng trống');
        return;
      }

      // Check if user has selected an address OR filled manual input
      if (!selectedAddressId && (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address)) {
        toast.error('Vui lòng chọn địa chỉ giao hàng hoặc nhập thông tin giao hàng');
        return;
      }

      // Get shipping address - either from saved address or manual input
      let shippingAddressData;
      
      if (selectedAddressId) {
        const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
        if (!selectedAddress) {
          toast.error('Địa chỉ không hợp lệ');
          return;
        }
        shippingAddressData = {
          full_name: selectedAddress.full_name || selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city || '',
          district: selectedAddress.district || selectedAddress.state || '',
          ward: selectedAddress.ward || '',
          postal_code: selectedAddress.postal_code || selectedAddress.zipCode || ''
        };
      } else {
        // Use manual input from shippingInfo
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
          toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
          return;
        }
        shippingAddressData = {
          full_name: shippingInfo.fullName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city || '',
          district: shippingInfo.district || '',
          ward: shippingInfo.ward || '',
          postal_code: shippingInfo.zipCode || ''
        };
      }

      // Prepare order data
      const subtotal = getCartTotal();
      const shipping = subtotal > 5000000 ? 0 : 30000;
      const discount = appliedCoupon?.discount_amount || 0;
      const total = subtotal + shipping - discount;

      const orderData = {
        user_id: user._id || user.id,
        items: cartItems.map(item => {
          const itemData = {
            product_id: item.id || item._id,
            product_name: item.name,
            product_image: item.images?.[0]?.url || item.image || null,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
          };
          
          // Only add variant if there's size or color
          if (item.selectedSize || item.selectedColor) {
            itemData.variant = {
              size: item.selectedSize || '',
              color: item.selectedColor || ''
            };
          }
          
          return itemData;
        }),
        shipping_address: shippingAddressData,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code || null,
        subtotal,
        shipping_fee: shipping,
        tax: 0,
        discount,
        total,
        note: ''
      };

      // DEBUG: Log payload
      console.log('📦 Order Payload:', JSON.stringify(orderData, null, 2));

      // Call API
      const createdOrder = await orderService.createOrder(orderData);

      // Clear cart
      clearCart();

      // Show success
      toast.success('Đặt hàng thành công!');

      // Trigger notification refresh in Header
      window.dispatchEvent(new CustomEvent('orderPlaced'));

      // Navigate to success page
      navigate('/order-success', { 
        state: { order: createdOrder },
        replace: true
      });

    } catch (error) {
      console.error('Error placing order:', error);
      console.error('❌ Error detail:', error.response?.data);
      
      // Show detailed error message
      let errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại!';
      
      if (error.response?.data) {
        if (Array.isArray(error.response.data.detail)) {
          // Pydantic validation errors
          const errors = error.response.data.detail.map(err => {
            const location = err.loc?.join('.') || 'unknown';
            return `${location}: ${err.msg}`;
          });
          errorMessage = errors.join(', ');
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Thanh Toán{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              An Toàn
            </span>
          </h1>
          <p className="text-xl text-gray-600">Hoàn tất đơn hàng một cách an toàn</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl
                                 transition-all duration-300 ${
                                   currentStep >= step.number
                                     ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                     : 'bg-gray-200 text-gray-500'
                                 }`}>
                    {currentStep > step.number ? <FaCheck /> : step.icon}
                  </div>
                  <span className={`mt-2 font-semibold ${
                    currentStep >= step.number ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-4 transition-all duration-300 ${
                    currentStep > step.number
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                
                {/* Saved Addresses */}
                {isAuthenticated() && savedAddresses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black text-gray-900">Địa Chỉ Đã Lưu</h2>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                                 text-white font-semibold rounded-lg transition-colors"
                      >
                        <FaPlus className="w-4 h-4" />
                        Thêm Địa Chỉ
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => selectAddress(address)}
                          className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className={`w-5 h-5 ${
                                selectedAddressId === address.id ? 'text-purple-600' : 'text-gray-400'
                              }`} />
                              <h3 className="font-bold text-gray-900">{address.label}</h3>
                              {address.isDefault && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-900 font-semibold">{address.full_name || address.fullName}</p>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                          <p className="text-gray-600 text-sm mt-2">
                            {address.address}
                            {address.ward && `, ${address.ward}`}
                            {address.district && `, ${address.district}`}
                            {address.city && `, ${address.city}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Address Input (for guests or editing) */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    {isAuthenticated() ? 'Hoặc Nhập Địa Chỉ Khác' : 'Thông Tin Giao Hàng'}
                  </h2>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-semibold text-gray-900 mb-2">
                          Họ và Tên *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-900 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="email@vidu.com"
                          disabled={isAuthenticated()}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-900 mb-2">
                        Số Điện Thoại *
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0912 345 678"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-900 mb-2">
                        Địa Chỉ *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="123 Đường ABC, Phường XYZ, Quận DEF"
                      />
                    </div>

                    {/* Address Selector for manual input */}
                    <AddressSelector
                      value={addressData}
                      onChange={handleAddressChange}
                      required={true}
                    />

                    <div>
                      <label className="block font-semibold text-gray-900 mb-2">
                        Mã Bưu Chính
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="100000 (tùy chọn)"
                      />
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Phương Thức Thanh Toán</h2>
                
                {/* Payment Method Selection */}
                <div className="space-y-4 mb-8">
                  {/* VNPay */}
                  <button
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`w-full p-6 border-2 rounded-2xl transition-all duration-300 ${
                      paymentMethod === 'vnpay'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                          <FaWallet className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">VNPay</p>
                          <p className="text-sm text-gray-600">Ví điện tử VNPay</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          Phổ biến
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Chuyển khoản ngân hàng */}
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`w-full p-6 border-2 rounded-2xl transition-all duration-300 ${
                      paymentMethod === 'bank'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <FaUniversity className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Chuyển Khoản Ngân Hàng</p>
                          <p className="text-sm text-gray-600">Chuyển khoản qua ATM/Internet Banking</p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Thanh toán khi nhận hàng */}
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-6 border-2 rounded-2xl transition-all duration-300 ${
                      paymentMethod === 'cod'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <FaMoneyBillWave className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Thanh Toán Khi Nhận Hàng (COD)</p>
                          <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* VNPay Instructions */}
                {paymentMethod === 'vnpay' && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <FaMobileAlt className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-blue-900 mb-2">Hướng dẫn thanh toán VNPay</h3>
                        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                          <li>Nhấn "Đặt Hàng" để chuyển đến cổng thanh toán VNPay</li>
                          <li>Quét mã QR hoặc chọn ngân hàng để thanh toán</li>
                          <li>Xác nhận giao dịch trên ứng dụng ngân hàng</li>
                          <li>Đơn hàng sẽ được xác nhận sau khi thanh toán thành công</li>
                        </ol>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                      <FaShieldAlt className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Bảo mật cao:</span> Giao dịch được mã hóa SSL 256-bit
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Instructions */}
                {paymentMethod === 'bank' && (
                  <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <FaUniversity className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div className="w-full">
                        <h3 className="font-bold text-purple-900 mb-3">Thông tin chuyển khoản</h3>
                        <div className="bg-white rounded-lg p-4 space-y-3">
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Ngân hàng:</span>
                            <span className="font-bold text-gray-900">Vietcombank</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Số tài khoản:</span>
                            <span className="font-bold text-gray-900 font-mono">1234567890</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Chủ tài khoản:</span>
                            <span className="font-bold text-gray-900">CONG TY TECHMART</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nội dung:</span>
                            <span className="font-bold text-purple-600">DH{Date.now().toString().slice(-6)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-purple-800 mt-3">
                          💡 <span className="font-semibold">Lưu ý:</span> Vui lòng nhập đúng nội dung chuyển khoản để đơn hàng được xử lý nhanh chóng
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* COD Instructions */}
                {paymentMethod === 'cod' && (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FaMoneyBillWave className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-green-900 mb-2">Thanh toán khi nhận hàng</h3>
                        <ul className="text-sm text-green-800 space-y-2 list-disc list-inside">
                          <li>Kiểm tra sản phẩm trước khi thanh toán</li>
                          <li>Thanh toán bằng tiền mặt cho nhân viên giao hàng</li>
                          <li>Phí COD: Miễn phí cho đơn hàng trên 500.000đ</li>
                        </ul>
                        <div className="mt-4 p-3 bg-white rounded-lg flex items-center gap-2">
                          <FaShieldAlt className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-gray-700">
                            Được kiểm tra hàng trước khi thanh toán
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Xem Lại Đơn Hàng</h2>
                
                {/* Shipping Address */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4">Địa Chỉ Giao Hàng</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {shippingInfo.fullName}<br />
                    {shippingInfo.address}
                    {shippingInfo.ward && `, ${shippingInfo.ward}`}
                    {shippingInfo.district && `, ${shippingInfo.district}`}
                    {shippingInfo.city && `, ${shippingInfo.city}`}
                    {shippingInfo.zipCode && ` ${shippingInfo.zipCode}`}<br />
                    {shippingInfo.email}<br />
                    {shippingInfo.phone}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4">Phương Thức Thanh Toán</h3>
                  <p className="text-gray-700">
                    {paymentMethod === 'vnpay' && '💳 VNPay - Ví điện tử'}
                    {paymentMethod === 'bank' && '🏦 Chuyển Khoản Ngân Hàng'}
                    {paymentMethod === 'cod' && '💵 Thanh Toán Khi Nhận Hàng (COD)'}
                  </p>
                </div>

                {/* Order Items */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4">Sản Phẩm Đặt Hàng</h3>
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div key={`${item.id}-${item.selectedSize || 'nosize'}-${item.selectedColor || 'nocolor'}-${index}`} className="flex justify-between">
                        <span className="text-gray-700">
                          {item.name} × {item.quantity}
                          {(item.selectedSize || item.selectedColor) && (
                            <span className="text-gray-500 text-sm ml-2">
                              ({[item.selectedSize, item.selectedColor].filter(Boolean).join(', ')})
                            </span>
                          )}
                        </span>
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-xl
                           transition-colors"
                >
                  Quay Lại
                </button>
              )}
              <button
                onClick={handleNextStep}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700
                         text-white font-bold text-lg rounded-xl
                         shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                         transition-all duration-300
                         hover:scale-105 active:scale-95"
              >
                {currentStep === 3 ? 'Đặt Hàng' : 'Tiếp Tục'}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Tổng Đơn Hàng</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize || 'nosize'}-${item.selectedColor || 'nocolor'}-${index}`} className="flex justify-between">
                    <span className="text-gray-700">
                      {item.name} <span className="text-gray-500">×{item.quantity}</span>
                      {(item.selectedSize || item.selectedColor) && (
                        <span className="text-gray-500 text-xs block">
                          {[item.selectedSize, item.selectedColor].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Discount Coupon Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 
                           hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <FaTags className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">
                      {appliedCoupon ? 'Đã áp dụng mã giảm giá' : 'Chọn mã giảm giá'}
                    </span>
                  </div>
                  <FaPercent className="w-4 h-4 text-purple-600" />
                </button>
                


                {/* Applied Coupon Display */}
                {appliedCoupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCheck className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-bold text-green-900">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Xóa
                    </button>
                  </div>
                )}

                {/* Coupon Selection */}
                {showCoupons && (
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">

                    {/* Warning if cart is empty */}
                    {cartItems.length === 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        ⚠️ Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi áp dụng mã.
                      </div>
                    )}
                    
                    {loadingCoupons ? (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Đang tải mã giảm giá...</p>
                      </div>
                    ) : availableCoupons.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600">Không có mã giảm giá khả dụng</p>
                      </div>
                    ) : (
                      availableCoupons.map((coupon) => {
                        const isApplied = appliedCoupon?.code === coupon.code;
                        const discountText = coupon.discount_type === 'percentage' 
                          ? `-${coupon.discount_value}%`
                          : coupon.discount_type === 'freeship'
                          ? 'FREESHIP'
                          : `-${formatPrice(coupon.discount_value)}`;
                        
                        return (
                          <button
                            key={coupon.id}
                            onClick={() => applyCoupon(coupon)}
                            disabled={isApplied}
                            className={`w-full p-3 border-2 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                              isApplied
                                ? 'border-green-500 bg-green-50 cursor-not-allowed'
                                : 'border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-purple-900">{coupon.code}</p>
                                  {coupon.is_auto_apply && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                      Auto
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{coupon.description}</p>
                                {coupon.min_order_value > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Đơn tối thiểu: {formatPrice(coupon.min_order_value)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-3">
                                <p className="text-2xl font-black text-purple-600">
                                  {discountText}
                                </p>
                                {coupon.max_discount && coupon.discount_type === 'percentage' && (
                                  <p className="text-xs text-gray-500">
                                    Tối đa {formatPrice(coupon.max_discount)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-2">
                      <FaTags className="w-4 h-4" />
                      Giảm giá ({appliedCoupon?.code})
                    </span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-green-600">
                    {shipping === 0 ? 'MIỄN PHÍ' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Tổng cộng</span>
                <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 
                               bg-clip-text text-transparent">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <FaShieldAlt className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-bold block">Thanh Toán An Toàn</span>
                  Thanh toán của bạn được bảo vệ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">Thêm Địa Chỉ Mới</h2>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-5">
                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Nhãn Địa Chỉ * (VD: Nhà riêng, Văn phòng...)
                  </label>
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nhà riêng"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">
                      Họ và Tên *
                    </label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">
                      Số Điện Thoại *
                    </label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Địa Chỉ Chi Tiết *
                  </label>
                  <input
                    type="text"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  />
                </div>

                {/* Address Selector Component */}
                <AddressSelector
                  value={addressData}
                  onChange={handleAddressChange}
                  required={true}
                />

                <div>
                  <label className="block font-semibold text-gray-900 mb-2">
                    Mã Bưu Chính
                  </label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="100000 (tùy chọn)"
                  />
                </div>

                <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <label htmlFor="isDefault" className="font-semibold text-gray-900 cursor-pointer">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 
                             text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700
                             text-white font-bold rounded-xl
                             shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                             transition-all duration-300"
                  >
                    Lưu Địa Chỉ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

