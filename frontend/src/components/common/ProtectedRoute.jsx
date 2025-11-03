import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user.role !== 'admin') {
    // User is logged in but not admin
    return <Navigate to="/" replace />
  }

  if (sellerOnly) {
    if (user.role !== 'seller') {
      console.log('❌ ProtectedRoute: User is not a seller, role:', user.role)
      return <Navigate to="/" replace />
    }
    
    // Handle seller_status (could be string or enum-like object)
    const sellerStatus = typeof user.seller_status === 'string' 
      ? user.seller_status 
      : user.seller_status?.value || user.seller_status || null
    
    console.log('🔍 ProtectedRoute: seller_status:', sellerStatus)
    
    if (sellerStatus !== 'approved') {
      if (sellerStatus === 'pending') {
        console.log('⚠️ ProtectedRoute: Seller is pending approval')
      } else if (sellerStatus === 'rejected') {
        console.log('❌ ProtectedRoute: Seller was rejected')
      } else if (sellerStatus === 'suspended') {
        console.log('⛔ ProtectedRoute: Seller is suspended')
      } else {
        console.log('❓ ProtectedRoute: Unknown seller_status:', sellerStatus)
      }
      return <Navigate to="/" replace />
    }
    
    console.log('✅ ProtectedRoute: Seller is approved, allowing access')
  }

  return children
}

export default ProtectedRoute


