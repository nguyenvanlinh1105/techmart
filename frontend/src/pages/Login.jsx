import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaGoogle,
  FaFacebook,
  FaTwitter,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";
import { IoStorefront } from "react-icons/io5";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLogin = localStorage.getItem("saved_login");

    if (savedLogin) {
      const parsed = JSON.parse(savedLogin);
      setFormData({
        email: parsed.email,
        password: parsed.password,
        remember: true,
      });
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (user) {
      // If user is already logged in, redirect
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      login(response.user, response.access_token);
      toast.success("Đăng nhập thành công!");
      console.log("✅ Đăng nhập thành công:", response.user);

      if (formData.remember) {
        localStorage.setItem(
          "saved_login",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
          })
        );
      } else {
        localStorage.removeItem("saved_login");
      }

      // Navigate to home
      navigate("/");
    } catch (error) {
      console.error("❌ Login error:", error);

      // Show specific error message
      const errorMessage =
        error.response?.data?.detail ||
        "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "Google") {
      window.location.href = "http://localhost:8000/api/auth/google";
    } else {
      console.log(`Login with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md 
                        flex items-center justify-center shadow-xl"
          >
            <IoStorefront className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-black text-white">TechMart</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Chào Mừng Trở Lại!
            </h1>
            <p className="text-gray-600">Đăng nhập để tiếp tục mua sắm</p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleSocialLogin("Google")}
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
                onClick={() => handleSocialLogin("Facebook")}
                className="py-3 px-4 bg-white border-2 border-gray-200 rounded-xl
                         hover:bg-gray-50 hover:border-blue-300 transition-all duration-300
                         flex items-center justify-center gap-2 font-semibold text-gray-700
                         hover:scale-105 active:scale-95"
              >
                <FaFacebook className="w-5 h-5 text-blue-600" />
                Facebook
              </button>
              <button
                onClick={() => handleSocialLogin("Twitter")}
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
              <span className="px-4 bg-white text-sm text-gray-500">
                Hoặc đăng nhập bằng email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Địa Chỉ Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                           transition-all duration-300"
                  placeholder="john@example.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Mật Khẩu
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                           transition-all duration-300"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                Quên Mật Khẩu?
              </Link>
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
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-6">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-bold text-purple-600 hover:text-purple-700"
            >
              Đăng Ký
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

export default Login;
