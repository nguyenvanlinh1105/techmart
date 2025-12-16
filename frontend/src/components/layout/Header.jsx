import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaHeart, FaBell, FaShoppingBag } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { ROUTES } from '../../utils/constants'
import api from '../../services/api'
import { productService } from '../../services/productService'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [categories, setCategories] = useState([])
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 600
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } catch (error) {
      console.log('Could not play sound:', error)
    }
  }

  // Fetch notifications with sound detection
  useEffect(() => {
    if (isAuthenticated() && user) {
      let previousUnreadCount = 0
      
      const fetchWithSoundCheck = async () => {
        const oldCount = previousUnreadCount
        const [notificationsRes, countRes] = await Promise.all([
          api.get('/notifications', { params: { limit: 20 } }),
          api.get('/notifications/unread-count')
        ])
        const newNotifications = notificationsRes.data || []
        const newUnreadCount = countRes.data?.unread_count || 0
        
        // Check if new notification arrived (unread count increased)
        if (newUnreadCount > oldCount && oldCount >= 0) {
          playNotificationSound()
        }
        
        setNotifications(newNotifications)
        setUnreadCount(newUnreadCount)
        previousUnreadCount = newUnreadCount
      }
      
      fetchWithSoundCheck()
      const interval = setInterval(fetchWithSoundCheck, 5000) // Refresh every 5 seconds for real-time
      
      // Listen for order placement event to refresh notifications immediately
      const handleOrderPlaced = () => {
        console.log('🔄 Order placed, refreshing notifications...')
        let retries = 0
        const maxRetries = 5
        const checkNotifications = () => {
          retries++
          fetchWithSoundCheck()
          if (retries < maxRetries) {
            setTimeout(checkNotifications, 1000)
          }
        }
        setTimeout(checkNotifications, 500)
      }
      window.addEventListener('orderPlaced', handleOrderPlaced)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('orderPlaced', handleOrderPlaced)
      }
    } else {
      // Clear notifications if logged out
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!isAuthenticated() || !user) return
    
    try {
      const [notificationsRes, countRes] = await Promise.all([
        api.get('/notifications', { params: { limit: 10 } }),
        api.get('/notifications/unread-count')
      ])
      console.log('📬 Fetched notifications:', notificationsRes.data.length)
      console.log('📊 Unread count:', countRes.data.unread_count)
      console.log('📋 Notifications:', notificationsRes.data)
      setNotifications(notificationsRes.data || [])
      setUnreadCount(countRes.data?.unread_count || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Don't show toast on every fetch, only log
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read
    try {
      await api.patch(`/notifications/${notification.id}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
    
    // Navigate based on notification type and link
    if (notification.type === 'order' && notification.link) {
      // Extract order ID from link (format: /orders/{order_id})
      const orderIdMatch = notification.link.match(/\/orders\/([^\/]+)/)
      if (orderIdMatch) {
        const orderId = orderIdMatch[1]
        // Navigate to orders page with highlight parameter
        navigate(`/orders?highlight=${orderId}`)
      } else {
        // Fallback: navigate to orders page
        navigate('/orders')
      }
      setShowNotifications(false)
    } else if (notification.link) {
      // For other notification types, use the link directly
      navigate(notification.link)
      setShowNotifications(false)
    } else if (notification.type === 'order') {
      // Default to orders page for order notifications without link
      navigate('/orders')
      setShowNotifications(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${searchQuery}`)
      setShowSearch(false)
    }
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-2 text-center text-sm font-medium bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
        <p className="container mx-auto px-4">
          ⚡ Flash Sale: Giảm đến 50% - Miễn phí vận chuyển cho đơn từ 500k | 
          <span className="ml-2 underline cursor-pointer hover:text-purple-100">Chi tiết →</span>
        </p>
      </div>

      {/* Main Header */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'backdrop-blur-md bg-white/80 shadow-lg' 
            : 'bg-white/95 backdrop-blur-sm shadow-md'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
                <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <FaShoppingBag className="text-white text-2xl" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  TechMart
                </span>
                <p className="text-xs text-gray-500">Siêu Thị Đẳng Cấp</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, danh mục..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-gray-50 focus:bg-white"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all"
                >
                  Tìm
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Mobile */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FaSearch className="text-gray-700 text-xl" />
              </button>

              {/* Notifications */}
              {isAuthenticated() && (
                <div className="relative group">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  >
                    <FaBell className="text-lg md:text-xl transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse border-2 border-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                        <span className="absolute inset-0 rounded-xl bg-red-500 opacity-0 animate-ping" />
                      </>
                    )}
                  </button>
                  {showNotifications && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 bg-black/20 z-40 md:hidden"
                        onClick={() => setShowNotifications(false)}
                      />
                      {/* Dropdown */}
                      <div className="fixed md:absolute right-0 top-20 md:top-full mt-2 w-full md:w-96 lg:w-[480px] max-w-[calc(100vw-2rem)] md:max-w-none bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] md:max-h-[600px] overflow-hidden animate-slideDown">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                          <div>
                            <h3 className="font-black text-lg">Thông Báo</h3>
                            <p className="text-sm text-purple-100">
                              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                          >
                            ×
                          </button>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[calc(80vh-80px)] md:max-h-[520px]">
                          {notifications.length > 0 ? (
                            <div className="py-2">
                              {notifications.map((notif) => {
                                const isOrderNotif = notif.type === 'order'
                                const getIcon = () => {
                                  if (isOrderNotif) {
                                    if (notif.message?.includes('đã được tạo')) return '🛒'
                                    if (notif.message?.includes('xác nhận')) return '✅'
                                    if (notif.message?.includes('xu ly')) return '⚙️'
                                    if (notif.message?.includes('giao')) return '🚚'
                                    if (notif.message?.includes('huy')) return '❌'
                                    return '📦'
                                  }
                                  return '🔔'
                                }
                                
                                const getColor = () => {
                                  if (isOrderNotif) {
                                    if (notif.message?.includes('đã được tạo')) return 'from-green-400 to-emerald-500'
                                    if (notif.message?.includes('xác nhận')) return 'from-blue-400 to-cyan-500'
                                    if (notif.message?.includes('xu ly')) return 'from-purple-400 to-pink-500'
                                    if (notif.message?.includes('giao')) return 'from-orange-400 to-red-500'
                                    if (notif.message?.includes('huy')) return 'from-red-400 to-pink-500'
                                    return 'from-purple-400 to-pink-500'
                                  }
                                  return 'from-purple-400 to-pink-500'
                                }

                                return (
                                  <button
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-0 ${
                                      !notif.is_read ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-l-4 border-l-purple-500' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-4">
                                      {/* Icon */}
                                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getColor()} flex items-center justify-center text-2xl shadow-lg`}>
                                        {getIcon()}
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <h4 className={`font-bold text-sm mb-1 ${
                                              !notif.is_read ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                              {notif.title}
                                            </h4>
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                              {notif.message}
                                            </p>
                                          </div>
                                          {!notif.is_read && (
                                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                          {(() => {
                                            const date = new Date(notif.created_at)
                                            const now = new Date()
                                            const diff = now - date
                                            const seconds = Math.floor(diff / 1000)
                                            const minutes = Math.floor(seconds / 60)
                                            const hours = Math.floor(minutes / 60)
                                            const days = Math.floor(hours / 24)

                                            if (seconds < 60) return 'Vừa xong'
                                            if (minutes < 60) return `${minutes} phút trước`
                                            if (hours < 24) return `${hours} giờ trước`
                                            if (days < 7) return `${days} ngày trước`
                                            return date.toLocaleDateString('vi-VN', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="px-6 py-16 text-center text-gray-500">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaBell className="text-3xl text-gray-300" />
                              </div>
                              <p className="font-semibold text-base">Chưa có thông báo</p>
                              <p className="text-sm text-gray-400 mt-1">Các thông báo mới sẽ hiển thị ở đây</p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
                            <button
                              onClick={() => {
                                navigate('/orders')
                                setShowNotifications(false)
                              }}
                              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                            >
                              Xem tất cả đơn hàng →
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Wishlist */}
              <Link
                to={ROUTES.WISHLIST}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-xl transition-colors group"
              >
                <FaHeart className="text-gray-700 group-hover:text-red-500 text-xl transition-colors" />
                <span className="hidden xl:block text-sm font-medium text-gray-700">Yêu thích</span>
              </Link>

              {/* Cart */}
              <Link
                to={ROUTES.CART}
                className="relative flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-xl transition-all group"
              >
                <div className="relative">
                  <FaShoppingCart className="text-gray-700 group-hover:text-purple-600 text-xl transition-colors" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse-slow">
                      {getCartCount()}
                    </span>
                  )}
                </div>
                <span className="hidden xl:block text-sm font-medium text-gray-700">Giỏ hàng</span>
              </Link>

              {/* User */}
              {isAuthenticated() ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {(user?.full_name || user?.name || user?.email || 'U')?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.full_name || user?.name || user?.email || 'User'}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 border border-gray-100 z-50">
                    <Link to={ROUTES.PROFILE} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <FaUser className="text-gray-500" />
                      <span className="text-sm font-medium">Tài khoản của tôi</span>
                    </Link>
                    <Link to={ROUTES.ORDERS} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <FaShoppingBag className="text-gray-500" />
                      <span className="text-sm font-medium">Đơn hàng</span>
                    </Link>
                    <Link to="/chat" className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors group/chat">
                      <div className="relative">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      </div>
                      <span className="text-sm font-medium text-purple-600 group-hover/chat:text-purple-700">💬 Chat hỗ trợ</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to={ROUTES.ADMIN} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-t">
                        <span className="text-sm font-medium text-purple-600">⚡ Quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 border-t"
                    >
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  <FaUser className="text-lg" />
                  <span className="hidden md:block">Đăng nhập</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="lg:hidden py-4 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-gray-50"
                  autoFocus
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>
          )}
        </div>

        {/* Categories Navigation */}
        <div className="hidden lg:block border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1 py-3 overflow-x-auto custom-scrollbar">
              <Link
                to={ROUTES.PRODUCTS}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all whitespace-nowrap"
              >
                🔥 Tất cả
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`${ROUTES.PRODUCTS}?category=${category.id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all whitespace-nowrap"
                >
                  {category.icon} {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 lg:hidden animate-slide-in-right overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <button onClick={() => setIsMenuOpen(false)}>
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`${ROUTES.PRODUCTS}?category=${category.id}`}
                      className="block px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.icon} {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  )
}

export default Header
