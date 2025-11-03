import api from './api'

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData)
    return response.data
  },

  // Get user orders
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params })
    return response.data
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`)
    return response.data
  },

  // Track order
  trackOrder: async (orderNumber) => {
    const response = await api.get(`/orders/track/${orderNumber}`)
    return response.data
  },

  // Apply coupon
  applyCoupon: async (code) => {
    const response = await api.post('/orders/apply-coupon', { code })
    return response.data
  },
}

