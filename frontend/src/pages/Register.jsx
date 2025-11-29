import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaTwitter, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaPhone } from 'react-icons/fa';
import { IoStorefront } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (user) {
      navigate('/', { replace: true });
      // toast.info('Bạn đã đăng nhập rồi!');
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Call real API
        const response = await authService.register({
          email: formData.email,
          full_name: formData.fullName,  // Backend expects full_name with underscore
          phone: formData.phone,
          password: formData.password,
        });
        
        // Tự động đăng nhập sau khi đăng ký
        login(response.user, response.access_token);
        
        toast.success('Đăng ký thành công! Bạn đã được tự động đăng nhập.');
        console.log('Đăng ký thành công:', response.user);
        navigate('/');
      } catch (error) {
        console.error('Register error:', error);
        toast.error(error.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Sign up with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4 py-12">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md 
                        flex items-center justify-center shadow-xl">
            <IoStorefront className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-black text-white">TechMart</span>
        </Link>

        {/* Register Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Tạo Tài Khoản</h1>
            <p className="text-gray-600">Tham gia TechMart ngay hôm nay</p>
          </div>

          {/* Social Signup */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl
                       hover:bg-gray-50 hover:border-red-300 transition-all duration-300
                       flex items-center justify-center gap-3 font-semibold text-gray-700
                       hover:scale-105 active:scale-95"
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              Continue with Google
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="py-3 px-4 bg-white border-2 border-gray-200 rounded-xl
                         hover:bg-gray-50 hover:border-blue-300 transition-all duration-300
                         flex items-center justify-center gap-2 font-semibold text-gray-700
                         hover:scale-105 active:scale-95"
              >
                <FaFacebook className="w-5 h-5 text-blue-600" />
                Facebook
              </button>
              <button
                onClick={() => handleSocialLogin('Twitter')}
                className="py-3 px-4 bg-white border-2 border-gray-200 rounded-xl
                         hover:bg-gray-50 hover:border-sky-300 transition-all duration-300
                         flex items-center justify-center gap-2 font-semibold text-gray-700
                         hover:scale-105 active:scale-95"
              >
                <FaTwitter className="w-5 h-5 text-sky-500" />
                Twitter
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">Or register with email</span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Họ và Tên *
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500
                           transition-all duration-300 ${
                             errors.fullName ? 'border-red-500' : 'border-gray-200'
                           }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Địa Chỉ Email *
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500
                           transition-all duration-300 ${
                             errors.email ? 'border-red-500' : 'border-gray-200'
                           }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500
                           transition-all duration-300 ${
                             errors.phone ? 'border-red-500' : 'border-gray-200'
                           }`}
                  placeholder="+1 (234) 567-890"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Mật Khẩu *
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500
                           transition-all duration-300 ${
                             errors.password ? 'border-red-500' : 'border-gray-200'
                           }`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Xác Nhận Mật Khẩu *
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500
                           transition-all duration-300 ${
                             errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                           }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="font-semibold text-purple-600 hover:text-purple-700">
                    Điều Khoản & Điều Kiện
                  </Link>
                  {' '}và{' '}
                  <Link to="/privacy" className="font-semibold text-purple-600 hover:text-purple-700">
                    Chính Sách Bảo Mật
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-700 hover:to-pink-700
                       text-white font-bold text-lg rounded-xl
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                       transition-all duration-300
                       hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Đang đăng ký...' : 'Tạo Tài Khoản'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">
              Đăng Nhập
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center mt-6 text-white/90 hover:text-white font-semibold"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Register;

