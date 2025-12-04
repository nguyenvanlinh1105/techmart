import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FaBoxes, FaShoppingCart, FaUsers, FaDollarSign,
  FaArrowUp, FaArrowDown, FaEye, FaChartLine,
  FaClock, FaCheckCircle, FaTruck, FaTimesCircle
} from 'react-icons/fa'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/orders/admin/all?limit=5')
      ])
      
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const statCards = [
    {
      title: 'Tổng Doanh Thu',
      value: formatPrice(stats?.total_revenue || 0),
      change: '+12.5%',
      icon: FaDollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Đơn Hàng',
      value: stats?.total_orders || 0,
      change: '+8.2%',
      icon: FaShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Sản Phẩm',
      value: stats?.total_products || 0,
      change: '+3.1%',
      icon: FaBoxes,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Khách Hàng',
      value: stats?.total_users || 0,
      change: '+15.3%',
      icon: FaUsers,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  const orderStatusConfig = {
    pending: { label: 'Chờ Xác Nhận', icon: FaClock, color: 'text-yellow-600 bg-yellow-50' },
    confirmed: { label: 'Đã Xác Nhận', icon: FaCheckCircle, color: 'text-blue-600 bg-blue-50' },
    shipping: { label: 'Đang Giao', icon: FaTruck, color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Đã Giao', icon: FaCheckCircle, color: 'text-green-600 bg-green-50' },
    cancelled: { label: 'Đã Hủy', icon: FaTimesCircle, color: 'text-red-600 bg-red-50' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-3xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-black mb-2">Chào mừng trở lại! 👋</h1>
        <p className="text-purple-100 text-lg">Đây là tổng quan hoạt động hệ thống của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="text-2xl text-white" />
              </div>
              <span className="flex items-center text-sm font-bold text-green-600">
                <FaArrowUp className="mr-1" />
                {card.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">{card.title}</h3>
            <p className="text-3xl font-black text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800">Đơn Hàng Gần Đây</h2>
            <Link
              to="/admin/orders"
              className="text-purple-600 hover:text-purple-700 font-bold text-sm flex items-center"
            >
              Xem Tất Cả
              <FaEye className="ml-2" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusInfo = orderStatusConfig[order.status] || orderStatusConfig.pending
                return (
                  <div
                    key={order.id || order._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${statusInfo.color} flex items-center justify-center`}>
                        <statusInfo.icon className="text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">#{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-purple-600">{formatPrice(order.total_amount || order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-black text-gray-800 mb-6">Thống Kê Nhanh</h2>
          
          <div className="space-y-4">
            {/* Products Stock */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Sản Phẩm Tồn Kho</span>
                <span className="text-2xl font-black text-purple-600">{stats?.in_stock_products || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Đơn Chờ Xử Lý</span>
                <span className="text-2xl font-black text-yellow-600">{stats?.pending_orders || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                  style={{ width: '45%' }}
                ></div>
              </div>
            </div>

            {/* Revenue This Month */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Doanh Thu Tháng Này</span>
                <span className="text-2xl font-black text-green-600">
                  {formatPrice(stats?.monthly_revenue || 0)}
                </span>
              </div>
              <div className="flex items-center text-sm text-green-600 font-bold">
                <FaArrowUp className="mr-1" />
                +25.3% so với tháng trước
              </div>
            </div>

            {/* New Users This Week */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Khách Hàng Mới (Tuần)</span>
                <span className="text-2xl font-black text-blue-600">{stats?.new_users_week || 0}</span>
              </div>
              <div className="flex items-center text-sm text-blue-600 font-bold">
                <FaArrowUp className="mr-1" />
                +18.7% so với tuần trước
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-black text-gray-800 mb-6">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products?action=add"
            className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white text-center hover:scale-105 transition-transform shadow-lg"
          >
            <FaBoxes className="text-4xl mx-auto mb-3" />
            <p className="font-bold">Thêm Sản Phẩm</p>
          </Link>

          <Link
            to="/admin/orders?status=pending"
            className="p-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl text-white text-center hover:scale-105 transition-transform shadow-lg"
          >
            <FaClock className="text-4xl mx-auto mb-3" />
            <p className="font-bold">Đơn Chờ</p>
          </Link>

          <Link
            to="/admin/users"
            className="p-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl text-white text-center hover:scale-105 transition-transform shadow-lg"
          >
            <FaUsers className="text-4xl mx-auto mb-3" />
            <p className="font-bold">Khách Hàng</p>
          </Link>

          <Link
            to="/admin/stats"
            className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white text-center hover:scale-105 transition-transform shadow-lg"
          >
            <FaChartLine className="text-4xl mx-auto mb-3" />
            <p className="font-bold">Báo Cáo</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

