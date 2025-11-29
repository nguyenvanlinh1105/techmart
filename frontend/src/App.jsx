import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';
import GoogleCallback from "./pages/GoogleCallback";
// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import SellerRegister from './pages/SellerRegister';
import Chat from './pages/Chat';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminChat from './pages/admin/AdminChat';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Header & Footer */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Home />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/auth/callback" element={<GoogleCallback />} />

            <Route path="/products" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Products />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/products/:id" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <ProductDetail />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/cart" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Cart />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/checkout" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Checkout />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/order-success" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <OrderSuccess />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/orders" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Orders />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/orders/:id" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <OrderSuccess />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/wishlist" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Wishlist />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/profile" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Profile />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/chat" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Chat />
                </main>
              </div>
            } />
            
            {/* Auth Routes */}
            <Route path="/login" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Login />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/register" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Register />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/seller/register" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <SellerRegister />
                </main>
                <Footer />
              </div>
            } />
            
            <Route path="/forgot-password" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <ForgotPassword />
                </main>
                <Footer />
              </div>
            } />

            {/* Seller Routes */}
            <Route path="/seller" element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <ProtectedRoute sellerOnly={true}>
                    <SellerDashboard />
                  </ProtectedRoute>
                </main>
                <Footer />
              </div>
            } />

            {/* Admin Routes - No Header/Footer (AdminLayout handles it) */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="chat" element={<AdminChat />} />
            </Route>
          </Routes>
          
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
