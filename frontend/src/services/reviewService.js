import api from './api';

export const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get product reviews
  getProductReviews: async (productId, page = 1, limit = 10, sortBy = 'created_at') => {
    const response = await api.get(`/reviews/product/${productId}`, {
      params: { page, limit, sort_by: sortBy }
    });
    return response.data;
  },

  // Get my reviews
  getMyReviews: async (page = 1, limit = 20) => {
    const response = await api.get('/reviews/my-reviews', {
      params: { page, limit }
    });
    return response.data;
  },

  // Check if can review
  canReviewProduct: async (productId) => {
    const response = await api.get(`/reviews/can-review/${productId}`);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Get review stats
  getReviewStats: async (productId) => {
    const response = await api.get(`/reviews/stats/${productId}`);
    return response.data;
  },
};
