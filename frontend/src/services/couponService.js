import api from './api';

export const couponService = {
  // Create new coupon (Admin)
  createCoupon: async (couponData) => {
    const response = await api.post('/coupons', couponData);
    return response.data;
  },

  // Get all coupons (Admin)
  getCoupons: async (params = {}) => {
    // Set high limit to get all coupons by default (max 1000 from backend)
    const defaultParams = { limit: 500, ...params };
    const response = await api.get('/coupons', { params: defaultParams });
    return response.data;
  },

  // Get active coupons (User)
  getActiveCoupons: async () => {
    const response = await api.get('/coupons/active');
    return response.data;
  },

  // Get coupon by ID (Admin)
  getCouponById: async (id) => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  // Update coupon (Admin)
  updateCoupon: async (id, couponData) => {
    const response = await api.put(`/coupons/${id}`, couponData);
    return response.data;
  },

  // Delete coupon (Admin)
  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  // Validate coupon
  validateCoupon: async (code, orderTotal, cartItems = []) => {
    const response = await api.post('/coupons/validate', {
      cart_items: cartItems
    }, {
      params: { code, order_total: orderTotal }
    });
    return response.data;
  },

  // Get coupon statistics (Admin)
  getCouponStats: async () => {
    const response = await api.get('/coupons/stats/overview');
    return response.data;
  },

  // Get coupon performance (Admin)
  getCouponPerformance: async (couponId) => {
    const response = await api.get(`/coupons/stats/performance`, {
      params: { coupon_id: couponId }
    });
    return response.data;
  },

  // Get auto-apply coupons
  getAutoApplyCoupons: async (orderTotal, cartItems = []) => {
    const response = await api.get('/coupons/auto-apply', {
      params: {
        order_total: orderTotal,
        cart_items: JSON.stringify(cartItems)
      }
    });
    return response.data;
  },
};
