import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 Sending request to:', config.url);
      console.log('🔑 Token type:', token.startsWith('eyJ') ? 'JWT' : 'Mock');
      console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear auth if it's a real 401 from auth endpoints
    // Don't clear for network errors or when backend is down
    if (error.response?.status === 401 && error.response?.data?.detail === 'Invalid authentication') {
      console.log('🚨 Real 401 - Invalid token, logging out');
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      window.location.href = '/login'
    } else if (error.response?.status === 401) {
      console.log('⚠️ 401 but not clearing localStorage (could be mock mode)');
    } else if (error.code === 'ERR_NETWORK') {
      console.log('⚠️ Network error - backend might be down, keeping localStorage');
    }
    return Promise.reject(error)
  }
)

export default api

