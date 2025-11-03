import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  FaTachometerAlt, FaBoxes, FaShoppingCart, FaUsers, 
  FaChartLine, FaTags, FaBell, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaHome, FaStore
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    navigate('/')
    return null
  }

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: FaBoxes, label: 'Sản Phẩm' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Đơn Hàng' },
    { path: '/admin/users', icon: FaUsers, label: 'Người Dùng' },
    { path: '/admin/sellers', icon: FaStore, label: 'Người Bán', badge: 'new' },
    { path: '/admin/stats', icon: FaChartLine, label: 'Thống Kê' },
    { path: '/admin/coupons', icon: FaTags, label: 'Mã Giảm Giá' },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Đăng xuất thành công!')
    navigate('/')
  }

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white shadow-2xl`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-purple-700">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaTachometerAlt className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-black">TechMart</h1>
              <p className="text-xs text-purple-300">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-purple-950/30 border-b border-purple-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{user?.full_name}</p>
              <p className="text-xs text-purple-300 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive(item.path, item.exact)
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-purple-500/50 text-white'
                  : 'text-purple-200 hover:bg-purple-800/50 hover:text-white'
              }`}
            >
              <item.icon className="text-lg flex-shrink-0" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 bg-purple-950/50 border-t border-purple-700 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-200 hover:bg-purple-800/50 hover:text-white transition-all duration-300"
          >
            <FaHome className="text-lg" />
            <span className="font-semibold">Về Trang Chủ</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all duration-300"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="font-semibold">Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 bg-purple-600 text-white rounded-xl shadow-lg flex items-center justify-center"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="h-20 bg-white shadow-md flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl items-center justify-center text-gray-600 transition-colors"
            >
              <FaBars />
            </button>
            <div>
              <h2 className="text-2xl font-black text-gray-800">
                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin Panel'}
              </h2>
              <p className="text-sm text-gray-500">Quản lý hệ thống TechMart</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </button>
            
            <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-colors">
              <FaCog className="text-xl" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout

