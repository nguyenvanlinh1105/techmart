import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      // 1. Lấy token và lỗi từ URL
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      // 2. Xử lý lỗi nếu có
      if (error) {
        console.error("Google Login Error:", error);
        toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
        navigate('/login');
        return;
      }

      if (!token) {
        navigate('/login');
        return;
      }

      // 3. Có token -> Gọi API lấy thông tin User
      try {
        // Lưu tạm token để authService có thể dùng nó trong header Authorization
        localStorage.setItem('token', token); 
        
        // Gọi API /me để lấy thông tin chi tiết user (role, name, avatar...)
        const userData = await authService.getCurrentUser();

        // 4. Cập nhật Context và hoàn tất đăng nhập
        login(userData, token);
        
        toast.success(`Chào mừng ${userData.full_name}!`);
        navigate('/'); // Chuyển về trang chủ
        
      } catch (err) {
        console.error("Fetch user info failed:", err);
        toast.error("Lỗi khi lấy thông tin tài khoản.");
        localStorage.removeItem('token'); // Xóa token lỗi
        navigate('/login');
      }
    };

    handleGoogleLogin();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Đang xử lý đăng nhập...</h2>
      <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
    </div>
  );
};

export default LoginSuccess;