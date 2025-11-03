import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaBox, 
  FaShippingFast, 
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { orderService } from '../services/orderService';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order from location state or fetch from API
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
    } else if (location.state?.orderId) {
      fetchOrder(location.state.orderId);
    } else {
      // No order data, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const fetchOrder = async (orderId) => {
    try {
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      confirmed: 'text-blue-600 bg-blue-50',
      processing: 'text-purple-600 bg-purple-50',
      shipping: 'text-indigo-600 bg-indigo-50',
      delivered: 'text-green-600 bg-green-50',
      cancelled: 'text-red-600 bg-red-50',
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    return texts[status] || 'Đang xử lý';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 
                        flex items-center justify-center shadow-lg">
            <FaCheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Cảm ơn bạn đã đặt hàng tại TechMart
          </p>
          <p className="text-gray-500">
            Mã đơn hàng: <span className="font-bold text-purple-600">{order.order_number || order._id}</span>
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trạng Thái Đơn Hàng</h2>
            <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {/* Pending */}
              <div className="relative flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${order.status !== 'cancelled' ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <FaCheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đơn hàng đã được tạo</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Confirmed */}
              <div className="relative flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${['confirmed', 'processing', 'shipping', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {['confirmed', 'processing', 'shipping', 'delivered'].includes(order.status) ? (
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <FaClock className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đã xác nhận</p>
                  <p className="text-sm text-gray-500">Đang chờ xử lý</p>
                </div>
              </div>

              {/* Processing */}
              <div className="relative flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${['processing', 'shipping', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {['processing', 'shipping', 'delivered'].includes(order.status) ? (
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <FaBox className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đang đóng gói</p>
                  <p className="text-sm text-gray-500">Chuẩn bị hàng</p>
                </div>
              </div>

              {/* Shipping */}
              <div className="relative flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${['shipping', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {['shipping', 'delivered'].includes(order.status) ? (
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <FaShippingFast className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đang giao hàng</p>
                  <p className="text-sm text-gray-500">Đơn vị vận chuyển đang giao</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="relative flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {order.status === 'delivered' ? (
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <FaBox className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đã giao hàng</p>
                  <p className="text-sm text-gray-500">Hoàn thành</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Giao Hàng</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">{order.shipping_address?.full_name}</p>
                <p className="text-gray-600">{order.shipping_address?.address}</p>
                <p className="text-gray-600">
                  {order.shipping_address?.ward}, {order.shipping_address?.district}
                </p>
                <p className="text-gray-600">{order.shipping_address?.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="w-5 h-5 text-purple-600" />
              <span className="text-gray-900">{order.shipping_address?.phone}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản Phẩm Đã Đặt</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FaBox className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-bold text-purple-600">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(order.subtotal || order.total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí vận chuyển</span>
              <span>{formatPrice(order.shipping_fee || 0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
              <span>Tổng cộng</span>
              <span className="text-purple-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/orders"
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 
                     hover:from-purple-700 hover:to-pink-700
                     text-white font-bold text-center rounded-xl
                     shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                     transition-all duration-300 hover:scale-105"
          >
            Xem Đơn Hàng Của Tôi
          </Link>
          <Link
            to="/products"
            className="flex-1 py-4 px-6 bg-white border-2 border-gray-300 hover:border-purple-600
                     text-gray-900 font-bold text-center rounded-xl
                     transition-all duration-300 hover:scale-105"
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 text-center text-gray-600">
          <p>Cần hỗ trợ? Liên hệ chúng tôi qua:</p>
          <div className="flex items-center justify-center gap-6 mt-2">
            <a href="tel:1900123456" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <FaPhone className="w-4 h-4" />
              <span className="font-semibold">1900 123 456</span>
            </a>
            <a href="mailto:support@techmart.com" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <FaEnvelope className="w-4 h-4" />
              <span className="font-semibold">support@techmart.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

