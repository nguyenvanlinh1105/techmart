import api from './api'

export const sellerService = {
  // Get seller products
  getProducts: async (params = {}) => {
    const response = await api.get('/seller/products', { params })
    return response.data
  },

  // Create product
  createProduct: async (productData) => {
    const response = await api.post('/seller/products', productData)
    return response.data
  },

  // Update product
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/seller/products/${productId}`, productData)
    return response.data
  },

  // Delete product
  deleteProduct: async (productId) => {
    const response = await api.delete(`/seller/products/${productId}`)
    return response.data
  },

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/seller/products/${productId}/reviews`, { params })
    return response.data
  },

  // Get seller stats
  getStats: async () => {
    const response = await api.get('/seller/stats')
    return response.data
  },
}

