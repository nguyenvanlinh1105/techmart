import api from './api';

export const analyticsService = {
  // Get dashboard overview statistics
  getDashboardStats: async (days = 30) => {
    const response = await api.get('/analytics/dashboard', { params: { days } });
    return response.data;
  },

  // Get top selling products
  getTopProducts: async (limit = 10, days = 30) => {
    const response = await api.get('/analytics/top-products', { params: { limit, days } });
    return response.data;
  },

  // Get top categories
  getTopCategories: async (limit = 10) => {
    const response = await api.get('/analytics/top-categories', { params: { limit } });
    return response.data;
  },

  // Get revenue by category (for pie chart)
  getRevenueByCategory: async (days = 30) => {
    const response = await api.get('/analytics/revenue-by-category', { params: { days } });
    return response.data;
  },

  // Get customer statistics
  getCustomerStats: async (days = 30) => {
    const response = await api.get('/analytics/customer-stats', { params: { days } });
    return response.data;
  },

  // Get sales forecast
  getSalesForecast: async (days = 30) => {
    const response = await api.get('/analytics/sales-forecast', { params: { days } });
    return response.data;
  },

  // Get revenue analysis (multi-dimensional)
  getRevenueAnalysis: async (days = 30) => {
    const response = await api.get('/analytics/revenue-analysis', { params: { days } });
    return response.data;
  },

  // Get customer RFM analysis
  getCustomerRFM: async () => {
    const response = await api.get('/analytics/customer-rfm');
    return response.data;
  },

  // Get product performance
  getProductPerformance: async (days = 30, limit = 20) => {
    const response = await api.get('/analytics/product-performance', { params: { days, limit } });
    return response.data;
  },

  // Get seller performance
  getSellerPerformance: async (days = 30) => {
    const response = await api.get('/analytics/seller-performance', { params: { days } });
    return response.data;
  },

  // Get comparison analysis
  getComparisonAnalysis: async (period1Days = 30, period2Days = 30) => {
    const response = await api.get('/analytics/comparison', {
      params: { period1_days: period1Days, period2_days: period2Days }
    });
    return response.data;
  },
};
