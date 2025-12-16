import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaStore, 
  FaBox, 
  FaShoppingBag, 
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaStar
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { sellerService } from '../../services/sellerService';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    // Debug: log user object
    console.log('🔍 SellerDashboard - User object:', user);
    console.log('🔍 SellerDashboard - user.role:', user?.role);
    console.log('🔍 SellerDashboard - user.seller_status:', user?.seller_status);
    
    // Check if user is seller and approved
    if (!user || user.role !== 'seller') {
      console.log('❌ Not a seller, redirecting...');
      toast.error('Bạn không có quyền truy cập');
      navigate('/');
      return;
    }
    
    // Handle seller_status (could be string or enum-like)
    const sellerStatus = typeof user.seller_status === 'string' 
      ? user.seller_status 
      : user.seller_status?.value || user.seller_status;
    
    console.log('🔍 SellerDashboard - sellerStatus after processing:', sellerStatus);
    
    if (sellerStatus !== 'approved') {
      if (sellerStatus === 'pending') {
        toast.warning('Tài khoản của bạn đang chờ admin duyệt');
      } else if (sellerStatus === 'rejected') {
        toast.error('Tài khoản của bạn đã bị từ chối');
      } else if (sellerStatus === 'suspended') {
        toast.error('Tài khoản của bạn đã bị tạm dừng');
      } else {
        toast.error(`Trạng thái tài khoản: ${sellerStatus || 'unknown'}`);
      }
      navigate('/');
      return;
    }
    
    // User is approved seller, fetch stats
    console.log('✅ Seller approved, fetching stats...');
    fetchStats();
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching seller stats...');
      const data = await sellerService.getStats();
      console.log('📊 Stats received:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Không thể tải thống kê: ' + (error.response?.data?.detail || error.message));
      // Set default stats if API fails
      setStats({
        total_products: 0,
        pending_products: 0,
        approved_products: 0,
        rejected_products: 0,
        total_orders: 0,
        total_revenue: 0,
        store_name: user?.store_name || 'Cửa hàng'
      });
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Show dashboard even if stats is null (use default values)
  const displayStats = stats || {
    total_products: 0,
    pending_products: 0,
    approved_products: 0,
    rejected_products: 0,
    total_orders: 0,
    total_revenue: 0,
    store_name: user?.store_name || 'Cửa hàng'
  };
  
  // Don't block rendering if stats failed - show UI with default values
  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Bảng Điều Khiển{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Người Bán
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Chào mừng, {user?.store_name || user?.full_name}!
              </p>
            </div>
            <button
              onClick={() => navigate('/seller/products')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Quản Lý Sản Phẩm
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Products */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaBox className="text-purple-600 text-xl" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Tổng Sản Phẩm</h3>
            <p className="text-3xl font-black text-gray-900">{displayStats.total_products}</p>
          </div>

          {/* Approved Products */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Đã Duyệt</h3>
            <p className="text-3xl font-black text-gray-900">{displayStats.approved_products}</p>
          </div>

          {/* Pending Products */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Chờ Duyệt</h3>
            <p className="text-3xl font-black text-gray-900">{displayStats.pending_products}</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaShoppingBag className="text-blue-600 text-xl" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Đơn Hàng</h3>
            <p className="text-3xl font-black text-gray-900">{displayStats.total_orders}</p>
          </div>
        </div>

        {/* Revenue & Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tổng Doanh Thu</h3>
                <p className="text-4xl font-black">{formatPrice(displayStats.total_revenue || 0)}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <FaDollarSign className="text-3xl" />
              </div>
            </div>
            <p className="text-purple-100 text-sm">
              Tổng doanh thu từ tất cả đơn hàng đã hoàn thành
            </p>
          </div>

          {/* Product Status Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Trạng Thái Sản Phẩm</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-xl" />
                  <span className="font-semibold text-gray-900">Đã Duyệt</span>
                </div>
                <span className="text-2xl font-black text-green-600">{displayStats.approved_products}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaClock className="text-yellow-600 text-xl" />
                  <span className="font-semibold text-gray-900">Chờ Duyệt</span>
                </div>
                <span className="text-2xl font-black text-yellow-600">{displayStats.pending_products}</span>
              </div>
              
              {displayStats.rejected_products > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaTimesCircle className="text-red-600 text-xl" />
                    <span className="font-semibold text-gray-900">Bị Từ Chối</span>
                  </div>
                  <span className="text-2xl font-black text-red-600">{displayStats.rejected_products}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Thao Tác Nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/seller/products/new')}
              className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all text-left"
            >
              <FaBox className="text-2xl mb-2" />
              <h4 className="font-bold text-lg mb-1">Thêm Sản Phẩm Mới</h4>
              <p className="text-purple-100 text-sm">Đăng sản phẩm mới lên cửa hàng</p>
            </button>
            
            <button
              onClick={() => navigate('/seller/products?status=pending')}
              className="p-6 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-all text-left"
            >
              <FaClock className="text-2xl mb-2" />
              <h4 className="font-bold text-lg mb-1">Sản Phẩm Chờ Duyệt</h4>
              <p className="text-yellow-700/70 text-sm">Xem các sản phẩm đang chờ admin duyệt</p>
            </button>
            
            <button
              onClick={() => navigate('/seller/reviews')}
              className="p-6 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition-all text-left"
            >
              <FaStar className="text-2xl mb-2" />
              <h4 className="font-bold text-lg mb-1">Xem Đánh Giá</h4>
              <p className="text-blue-700/70 text-sm">Xem đánh giá từ khách hàng</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

