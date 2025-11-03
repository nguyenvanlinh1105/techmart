import { createContext, useContext, useState, useEffect } from 'react'
import { STORAGE_KEYS } from '../utils/constants'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    console.log('🔄 AuthContext: Loading from localStorage...');
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    
    console.log('📦 Stored Token:', token ? token.substring(0, 30) + '...' : 'NULL');
    console.log('📦 Stored User:', storedUser ? storedUser.substring(0, 50) + '...' : 'NULL');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('✅ User loaded from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    } else {
      console.log('⚠️ No user data in localStorage');
    }
    setLoading(false)
    console.log('🏁 AuthContext loading complete');
  }, [])

  const login = (userData, token) => {
    console.log('🔐 AuthContext.login() called with:', userData);
    console.log('🔑 Token:', token);
    
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    
    console.log('✅ Saved to localStorage');
    console.log('   - Key USER_DATA:', STORAGE_KEYS.USER_DATA);
    console.log('   - Key AUTH_TOKEN:', STORAGE_KEYS.AUTH_TOKEN);
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
  }

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

