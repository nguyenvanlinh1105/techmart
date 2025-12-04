import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBox, 
  FaEye, 
  FaTimes, 
  FaShoppingBag,
  FaChevronRight,
  FaClock,
  FaCheckCircle,
  FaShippingFast,
  FaStar
} from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ReviewModal from '../components/ReviewModal';

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  // Check for highlight parameter from notification click
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const highlightId = params.get('highlight')
    if (highlightId) {
      setHighlightedOrderId(highlightId)
      // Scroll to highlighted order after load
      setTimeout(() => {
        const element = document.getElementById(`order-${highlightId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Remove highlight after 5 seconds
          setTimeout(() => setHighlightedOrderId(null), 5000)
        }
      }, 1000)
    }
  }, [location.search])

  useEffect(() => {
    console.log('📍 Orders.jsx useEffect triggered');
    console.log('   - authLoading:', authLoading);
    console.log('   - user:', user);
    
    // Wait for auth to load
    if (authLoading) {
      console.log('⏳ Auth is still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    
    console.log('✅ User found, fetching orders:', user);
    fetchOrders();
  }, [user, authLoading, navigate, selectedTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = selectedTab !== 'all' ? { status_filter: selectedTab } : {};
      const data = await orderService.getOrders(params);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng. Vui lòng kiểm tra backend!');
      setOrders([]); // Empty array if error
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await orderService.cancelOrder(orderId);
      toast.success('Đã hủy đơn hàng thành công');
      fetchOrders(); // Refresh
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Không thể hủy đơn hàng');
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
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
      processing: 'text-purple-600 bg-purple-50 border-purple-200',
      shipping: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      delivered: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
      returned: 'text-gray-600 bg-gray-50 border-gray-200',
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
      returned: 'Đã trả hàng',
    };
    return texts[status] || 'Đang xử lý';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      confirmed: FaCheckCircle,
      processing: FaBox,
      shipping: FaShippingFast,
      delivered: FaCheckCircle,
      cancelled: FaTimes,
      returned: FaBox,
    };
    const Icon = icons[status] || FaClock;
    return <Icon className="w-4 h-4" />;
  };

  const tabs = [
    { key: 'all', label: 'Tất cả', count: orders.length },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Đơn Hàng{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Của Tôi
            </span>
          </h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap
                          ${selectedTab === tab.key
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                          }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
                                 ${selectedTab === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <FaShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'all' 
                ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!' 
                : `Không có đơn hàng nào ở trạng thái "${tabs.find(t => t.key === selectedTab)?.label}"`
              }
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 
                       bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-700 hover:to-pink-700
                       text-white font-bold rounded-xl
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                       transition-all duration-300 hover:scale-105"
            >
              <FaShoppingBag className="w-5 h-5" />
              Bắt Đầu Mua Sắm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderId = order.id || order._id
              const isHighlighted = highlightedOrderId === orderId
              return (
              <div
                key={orderId}
                id={`order-${orderId}`}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  isHighlighted 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-purple-500 shadow-xl ring-4 ring-purple-200' 
                    : ''
                }`}
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Mã đơn hàng</p>
                        <p className="font-bold text-gray-900">{order.order_number || order._id}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border font-semibold flex items-center gap-2
                                    ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Đặt ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4 mb-4">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaBox className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity}
                            {item.variant && (item.variant.size || item.variant.color) && (
                              <span className="ml-2 text-gray-500">
                                ({[item.variant.size, item.variant.color].filter(Boolean).join(', ')})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="font-bold text-purple-600">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => {
                                setReviewingProduct(item);
                                setReviewingOrder(order);
                              }}
                              className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 
                                       font-semibold rounded-lg transition-colors flex items-center gap-2
                                       border border-yellow-200"
                            >
                              <FaStar className="w-4 h-4" />
                              Đánh giá
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-sm text-gray-600 text-center">
                        + {order.items.length - 2} sản phẩm khác
                      </p>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="text-2xl font-black text-purple-600">{formatPrice(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id || order._id)}
                          className="px-6 py-3 border-2 border-red-300 text-red-600 font-semibold rounded-xl
                                   hover:bg-red-50 hover:border-red-500
                                   transition-all duration-300"
                        >
                          <FaTimes className="inline-block w-4 h-4 mr-2" />
                          Hủy đơn
                        </button>
                      )}
                      <Link
                        to={`/orders/${order.id || order._id}`}
                        state={{ order }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                                 hover:from-purple-700 hover:to-pink-700
                                 text-white font-semibold rounded-xl
                                 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                                 transition-all duration-300 hover:scale-105
                                 flex items-center gap-2"
                      >
                        <FaEye className="w-4 h-4" />
                        Xem chi tiết
                        <FaChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cần hỗ trợ?</h3>
          <p className="text-gray-600 mb-4">
            Liên hệ với chúng tôi để được giải đáp thắc mắc về đơn hàng
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="tel:1900123456"
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl
                       hover:bg-gray-50 transition-colors shadow-md"
            >
              Hotline: 1900 123 456
            </a>
            <a
              href="mailto:support@techmart.com"
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl
                       hover:bg-gray-50 transition-colors shadow-md"
            >
              Email hỗ trợ
            </a>
          </div>
        </div>

        {/* Review Modal */}
        {reviewingProduct && (
          <ReviewModal
            product={reviewingProduct}
            orderId={reviewingOrder?.id || reviewingOrder?._id}
            onClose={() => {
              setReviewingProduct(null);
              setReviewingOrder(null);
            }}
            onSuccess={() => {
              fetchOrders(); // Refresh orders
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
