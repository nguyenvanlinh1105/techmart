import api from './api'

// Helper function to normalize product data
const normalizeProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    id: product._id || product.id, // Map _id to id
  };
};

const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct);
};

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params })
    return normalizeProducts(response.data)
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return normalizeProduct(response.data)
  },

  // Search products
  searchProducts: async (query) => {
    const response = await api.get('/products', { params: { search: query } })
    return normalizeProducts(response.data)
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get('/products', { params: { category_id: categoryId, ...params } })
    return normalizeProducts(response.data)
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products', { params: { is_featured: true, limit } })
    return normalizeProducts(response.data)
  },

  // Get on-sale products
  getSaleProducts: async (limit = 8) => {
    const response = await api.get('/products', { params: { is_on_sale: true, limit } })
    return normalizeProducts(response.data)
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/categories')
    return response.data
  },

  // Get category by ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Get related products
  getRelatedProducts: async (productId) => {
    const response = await api.get(`/products/${productId}/related`)
    return normalizeProducts(response.data)
  },

  // Add product review
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData)
    return response.data
  },

  // Get product reviews
  getReviews: async (productId, page = 1, limit = 20) => {
    const response = await api.get(`/products/${productId}/reviews`, { params: { page, limit } })
    return response.data
  },

  // Get products count for pagination
  getProductsCount: async (params = {}) => {
    const response = await api.get('/products/count', { params })
    return response.data
  },
}

