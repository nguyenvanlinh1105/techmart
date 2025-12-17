import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FaEye, FaCheck, FaTruck, FaTimes, FaSearch, FaFileExcel, FaDownload } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import api from '../../services/api'

const AdminOrders = () => {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [highlightedOrderId, setHighlightedOrderId] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusChange, setStatusChange] = useState({ orderId: null, newStatus: null, note: '' })



  // Check for highlight parameter from notification click
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const highlightId = params.get('highlight')
    const statusParam = params.get('status')
    
    if (highlightId) {
      setHighlightedOrderId(highlightId)
      // Only auto-filter to pending if status param is not set
      // This allows viewing delivered orders even when clicking notification
      if (!statusParam) {
        setStatusFilter('pending')
      }
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
    
    // Also check for status filter in URL
    if (statusParam) {
      setStatusFilter(statusParam)
    }
  }, [location.search])

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      // Chỉ thêm status_filter khi có giá trị thực sự
      if (statusFilter && statusFilter.trim() !== '') {
        params.status_filter = statusFilter
      }
      
      const response = await api.get('/orders/admin/all', { params })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Không thể tải đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus, note = '') => {
    try {
      await api.patch(`/orders/admin/${orderId}`, {
        status: newStatus,
        note: note || `Cập nhật trạng thái: ${newStatus}`
      })
      
      toast.success('Cập nhật trạng thái thành công!')
      fetchOrders()
      setShowModal(false)
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(error.response?.data?.detail || 'Không thể cập nhật đơn hàng')
    }
  }

  const handleStatusChange = (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return
    
    // Nếu là thay đổi lớn (nhảy bước), hiển thị modal xác nhận
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipping', 'delivered']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const newIndex = statusOrder.indexOf(newStatus)
    
    if (Math.abs(newIndex - currentIndex) > 1 || newStatus === 'cancelled') {
      setStatusChange({
        orderId,
        newStatus,
        currentStatus,
        note: ''
      })
      setShowStatusModal(true)
    } else {
      // Thay đổi bình thường, cập nhật luôn
      const statusLabels = {
        'confirmed': 'Xác nhận đơn hàng',
        'processing': 'Chuyển sang xử lý',
        'shipping': 'Bắt đầu giao hàng',
        'delivered': 'Hoàn thành giao hàng'
      }
      handleUpdateStatus(orderId, newStatus, statusLabels[newStatus])
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const statusConfig = {
    pending: { 
      label: 'Chờ Xác Nhận', 
      color: 'bg-yellow-100 text-yellow-700',
      action: { status: 'confirmed', label: 'Xác Nhận', icon: FaCheck, color: 'bg-blue-600' }
    },
    confirmed: { 
      label: 'Đã Xác Nhận', 
      color: 'bg-blue-100 text-blue-700',
      action: { status: 'processing', label: 'Xử Lý', icon: FaTruck, color: 'bg-purple-600' }
    },
    processing: { 
      label: 'Đang Xử Lý', 
      color: 'bg-purple-100 text-purple-700',
      action: { status: 'shipping', label: 'Giao Hàng', icon: FaTruck, color: 'bg-orange-600' }
    },
    shipping: { 
      label: 'Đang Giao', 
      color: 'bg-orange-100 text-orange-700',
      action: { status: 'delivered', label: 'Hoàn Thành', icon: FaCheck, color: 'bg-green-600' }
    },
    delivered: { 
      label: 'Đã Giao', 
      color: 'bg-green-100 text-green-700'
    },
    cancelled: { 
      label: 'Đã Hủy', 
      color: 'bg-red-100 text-red-700'
    }
  }

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shipping_address?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Export to Excel
  const exportToExcel = () => {
    try {
      console.log('📊 Starting Excel export...')
      console.log('📋 Filtered orders:', filteredOrders.length)
      
      if (filteredOrders.length === 0) {
        toast.error('Không có dữ liệu để xuất Excel')
        return
      }

      // Prepare main data
      const exportData = filteredOrders.map(order => ({
        'Mã Đơn Hàng': order.order_number,
        'Khách Hàng': order.shipping_address?.full_name || 'N/A',
        'Email': order.user_email || 'N/A',
        'Số Điện Thoại': order.shipping_address?.phone || 'N/A',
        'Địa Chỉ': `${order.shipping_address?.address || ''}, ${order.shipping_address?.district || ''}, ${order.shipping_address?.city || ''}`,
        'Tổng Tiền (VND)': order.total_amount || order.total,
        'Trạng Thái': statusConfig[order.status]?.label || order.status,
        'Phương Thức Thanh Toán': order.payment_method === 'cod' ? 'COD' : 'VNPay',
        'Ngày Đặt': new Date(order.created_at).toLocaleDateString('vi-VN'),
        'Thời Gian Đặt': new Date(order.created_at).toLocaleTimeString('vi-VN'),
        'Ghi Chú': order.note || ''
      }))

      // Create workbook
      const wb = XLSX.utils.book_new()
      
      // Main orders sheet
      const ws = XLSX.utils.json_to_sheet(exportData)
      
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Mã Đơn Hàng
        { wch: 20 }, // Khách Hàng
        { wch: 25 }, // Email
        { wch: 15 }, // Số Điện Thoại
        { wch: 45 }, // Địa Chỉ
        { wch: 18 }, // Tổng Tiền
        { wch: 15 }, // Trạng Thái
        { wch: 20 }, // Phương Thức Thanh Toán
        { wch: 12 }, // Ngày Đặt
        { wch: 12 }, // Thời Gian Đặt
        { wch: 25 }  // Ghi Chú
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Đơn Hàng')

      // Create summary sheet
      const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.total_amount || order.total), 0)
      const stats = {
        'pending': filteredOrders.filter(o => o.status === 'pending').length,
        'confirmed': filteredOrders.filter(o => o.status === 'confirmed').length,
        'processing': filteredOrders.filter(o => o.status === 'processing').length,
        'shipping': filteredOrders.filter(o => o.status === 'shipping').length,
        'delivered': filteredOrders.filter(o => o.status === 'delivered').length,
        'cancelled': filteredOrders.filter(o => o.status === 'cancelled').length,
      }

      const summaryData = [
        { 'Thông Tin': 'Ngày Xuất Báo Cáo', 'Giá Trị': new Date().toLocaleString('vi-VN') },
        { 'Thông Tin': 'Tổng Số Đơn Hàng', 'Giá Trị': filteredOrders.length },
        { 'Thông Tin': 'Tổng Giá Trị (VND)', 'Giá Trị': totalAmount.toLocaleString('vi-VN') },
        { 'Thông Tin': '', 'Giá Trị': '' }, // Empty row
        { 'Thông Tin': 'THỐNG KÊ THEO TRẠNG THÁI', 'Giá Trị': '' },
        { 'Thông Tin': 'Chờ Xác Nhận', 'Giá Trị': stats.pending },
        { 'Thông Tin': 'Đã Xác Nhận', 'Giá Trị': stats.confirmed },
        { 'Thông Tin': 'Đang Xử Lý', 'Giá Trị': stats.processing },
        { 'Thông Tin': 'Đang Giao', 'Giá Trị': stats.shipping },
        { 'Thông Tin': 'Đã Giao', 'Giá Trị': stats.delivered },
        { 'Thông Tin': 'Đã Hủy', 'Giá Trị': stats.cancelled },
      ]

      if (statusFilter) {
        summaryData.splice(4, 0, { 'Thông Tin': 'Bộ Lọc Trạng Thái', 'Giá Trị': statusConfig[statusFilter]?.label })
      }
      if (searchTerm) {
        summaryData.splice(statusFilter ? 5 : 4, 0, { 'Thông Tin': 'Từ Khóa Tìm Kiếm', 'Giá Trị': searchTerm })
      }

      const summaryWs = XLSX.utils.json_to_sheet(summaryData)
      summaryWs['!cols'] = [{ wch: 25 }, { wch: 30 }]
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Thống Kê Tổng Hợp')
      
      const fileName = `don-hang-${new Date().toISOString().split('T')[0]}.xlsx`
      console.log('💾 Saving Excel file as:', fileName)
      XLSX.writeFile(wb, fileName)
      
      console.log('✅ Excel export completed successfully')
      toast.success(`Xuất Excel thành công! (${filteredOrders.length} đơn hàng)`)
    } catch (error) {
      console.error('❌ Error exporting to Excel:', error)
      toast.error(`Lỗi khi xuất Excel: ${error.message}`)
    }
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Quản Lý Đơn Hàng</h1>
            <p className="text-gray-600 mt-1">Tổng số: <span className="font-bold text-purple-600">{orders.length}</span> đơn hàng</p>
          </div>
          
          {/* Export Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <FaFileExcel className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setHighlightedOrderId(null) // Clear highlight when filtering
            }}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ Xác Nhận</option>
            <option value="confirmed">Đã Xác Nhận</option>
            <option value="processing">Đang Xử Lý</option>
            <option value="shipping">Đang Giao</option>
            <option value="delivered">Đã Giao</option>
            <option value="cancelled">Đã Hủy</option>
          </select>

          {/* Export Summary */}
          <div className="flex items-center justify-end">
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
              <span className="font-semibold">Hiển thị:</span> {filteredOrders.length} đơn hàng
              {statusFilter && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {statusConfig[statusFilter]?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Mã Đơn</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Khách Hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tổng Tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Trạng Thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Ngày Đặt</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending
                  const orderId = order.id || order._id
                  const isHighlighted = highlightedOrderId === orderId
                  return (
                    <tr 
                      key={orderId} 
                      id={`order-${orderId}`}
                      className={`hover:bg-gray-50 transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-purple-500 shadow-md' 
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-purple-600">
                          #{order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {order.shipping_address?.full_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          {formatPrice(order.total_amount || order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowModal(true)
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>

                          {/* Quick Status Change Dropdown */}
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <select
                              value={order.status}
                              onChange={(e) => {
                                handleStatusChange(order.id || order._id, e.target.value, order.status)
                              }}
                              className="px-3 py-2 text-sm font-semibold border-2 border-gray-300 rounded-lg 
                                       focus:border-purple-500 focus:outline-none
                                       bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                              title="Thay đổi trạng thái"
                            >
                              <option value="pending">Chờ Xác Nhận</option>
                              <option value="confirmed">Đã Xác Nhận</option>
                              <option value="processing">Đang Xử Lý</option>
                              <option value="shipping">Đang Giao</option>
                              <option value="delivered">Đã Giao</option>
                              <option value="cancelled">Hủy Đơn</option>
                            </select>
                          )}
                          
                          {/* Quick Action Button (Next Step) */}
                          {config.action && order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id || order._id, config.action.status)}
                              className={`px-3 py-2 ${config.action.color} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-bold flex items-center`}
                              title={`Bước tiếp theo: ${config.action.label}`}
                            >
                              <config.action.icon className="mr-1" />
                              {config.action.label}
                            </button>
                          )}
                          
                          {/* Cancel Button */}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => handleUpdateStatus(order.id || order._id, 'cancelled', 'Hủy bởi admin')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Hủy đơn"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-xl font-bold">Không tìm thấy đơn hàng</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">Chi Tiết Đơn Hàng</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Mã Đơn Hàng</p>
                  <p className="font-mono font-bold text-purple-600">#{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Ngày Đặt</p>
                  <p className="font-bold">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Trạng Thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Thanh Toán</p>
                  <p className="font-bold">{selectedOrder.payment_method === 'cod' ? 'COD' : 'VNPay'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3">Thông Tin Khách Hàng</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Họ tên:</span> {selectedOrder.shipping_address?.full_name}</p>
                  <p><span className="font-semibold">SĐT:</span> {selectedOrder.shipping_address?.phone}</p>
                  <p><span className="font-semibold">Địa chỉ:</span> {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.district}, {selectedOrder.shipping_address?.city}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-bold text-lg mb-3">Sản Phẩm</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-purple-600">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold">Tổng Cộng:</span>
                  <span className="text-2xl font-black text-purple-600">
                    {formatPrice(selectedOrder.total_amount || selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && statusChange.orderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-black">Xác Nhận Thay Đổi Trạng Thái</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-gray-700 mb-2">
                  Bạn có chắc muốn thay đổi trạng thái đơn hàng từ:
                </p>
                <div className="flex items-center justify-center gap-4 my-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[statusChange.currentStatus]?.color}`}>
                    {statusConfig[statusChange.currentStatus]?.label}
                  </span>
                  <span className="text-2xl">→</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[statusChange.newStatus]?.color}`}>
                    {statusConfig[statusChange.newStatus]?.label}
                  </span>
                </div>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú (tùy chọn):
                </label>
                <textarea
                  value={statusChange.note}
                  onChange={(e) => setStatusChange({...statusChange, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Lý do thay đổi trạng thái..."
                  rows="3"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(
                      statusChange.orderId, 
                      statusChange.newStatus, 
                      statusChange.note || `Thay đổi trạng thái thành ${statusConfig[statusChange.newStatus]?.label}`
                    )
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all"
                >
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders

