import api from './api'

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login
  login: async (credentials) => {
    console.log('🔐 authService.login() sending:', credentials);
    const response = await api.post('/auth/login', credentials)
    console.log('✅ authService.login() response:', response.data);
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await api.post('/auth/change-password', passwords)
    return response.data
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    })
    return response.data
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token })
    return response.data
  },

  // Add address
  addAddress: async (address, userEmail) => {
    const response = await api.post(`/auth/addresses?user_email=${userEmail}`, address)
    return response.data
  },

  // Delete address
  deleteAddress: async (addressId, userEmail) => {
    const response = await api.delete(`/auth/addresses/${addressId}?user_email=${userEmail}`)
    return response.data
  },

  // Seller registration
  registerSeller: async (sellerData) => {
    const response = await api.post('/auth/register-seller', sellerData)
    return response.data
  },
}

