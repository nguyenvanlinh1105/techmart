import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaTimes, FaShoppingCart, FaCheckCircle } from 'react-icons/fa'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)
  const audioRef = useRef(null)
  const previousUnreadCountRef = useRef(0)
  const navigate = useNavigate()

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Could not play sound:', error)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const [notificationsRes, countRes] = await Promise.all([
        api.get('/notifications', { params: { limit: 20, unread_only: false } }),
        api.get('/notifications/unread-count')
      ])
      
      const newNotifications = notificationsRes.data || []
      const newUnreadCount = countRes.data?.unread_count || 0
      
      // Check if there's a new notification (unread count increased)
      if (newUnreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current > 0) {
        // New notification arrived!
        playNotificationSound()
        
        // Show toast for new order notifications
        const newNotifs = newNotifications.filter(n => !n.is_read && n.type === 'order')
        if (newNotifs.length > 0) {
          const latest = newNotifs[0]
          toast.success(
            <div>
              <div className="font-bold">🆕 {latest.title}</div>
              <div className="text-sm">{latest.message}</div>
            </div>,
            {
              duration: 5000,
              position: 'top-right',
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }
            }
          )
        }
      }
      
      setNotifications(newNotifications)
      setUnreadCount(newUnreadCount)
      previousUnreadCountRef.current = newUnreadCount
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time polling
  useEffect(() => {
    fetchNotifications()
    
    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 3000)
    
    // Listen for order placement events
    const handleOrderPlaced = () => {
      setTimeout(fetchNotifications, 1000)
    }
    window.addEventListener('orderPlaced', handleOrderPlaced)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('orderPlaced', handleOrderPlaced)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.is_read)
      await Promise.all(
        unreadNotifs.map(n => api.patch(`/notifications/${n.id}/read`))
      )
      fetchNotifications()
      toast.success('Đã đánh dấu tất cả đã đọc')
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    // Navigate based on notification type and link
    if (notification.type === 'order') {
      if (notification.link) {
        // Check if link already has highlight parameter
        if (notification.link.includes('highlight=')) {
          // Link already has highlight, use it directly
          navigate(notification.link)
        } else {
          // Extract order ID from link (format: /admin/orders/{order_id} or /orders/{order_id})
          const orderIdMatch = notification.link.match(/\/(?:admin\/)?orders\/([^\/\?]+)/)
          if (orderIdMatch) {
            const orderId = orderIdMatch[1]
            // Navigate to admin orders page with highlight parameter
            navigate(`/admin/orders?highlight=${orderId}`)
          } else {
            // Fallback: navigate to admin orders page with pending filter
            navigate('/admin/orders?status=pending')
          }
        }
      } else {
        // Default to admin orders page for order notifications without link
        navigate('/admin/orders?status=pending')
      }
      setShowDropdown(false)
    } else if (notification.link) {
      // For other notification types, use the link directly
      navigate(notification.link)
      setShowDropdown(false)
    }
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
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
    return date.toLocaleDateString('vi-VN')
  }

  const unreadNotifications = notifications.filter(n => !n.is_read)
  const orderNotifications = notifications.filter(n => n.type === 'order')

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      >
        <FaBell className="text-xl transition-transform group-hover:rotate-12" />
        
        {/* Badge with animation */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center px-1.5 shadow-lg animate-pulse border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Ripple effect when new notification arrives */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-xl bg-red-500 opacity-0 animate-ping" />
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-16 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg">Thông Báo</h3>
              <p className="text-sm text-purple-100">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
              >
                Đọc tất cả
              </button>
            )}
            <button
              onClick={() => setShowDropdown(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="text-4xl mx-auto mb-3 text-gray-300" />
                <p className="font-semibold">Chưa có thông báo</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    !notification.is_read ? 'bg-blue-50/50 border-l-4 border-l-purple-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      notification.type === 'order' 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-br from-purple-400 to-pink-500'
                    }`}>
                      {notification.type === 'order' ? (
                        <FaShoppingCart className="text-white text-sm" />
                      ) : (
                        <FaBell className="text-white text-sm" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm mb-1 ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/admin/orders')
                  setShowDropdown(false)
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                Xem tất cả đơn hàng →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add CSS animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AdminNotifications

