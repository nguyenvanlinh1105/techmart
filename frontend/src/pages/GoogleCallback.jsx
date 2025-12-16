import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Dùng useRef để đảm bảo logic chỉ chạy 1 lần (tránh vấn đề React.StrictMode)
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    // Xử lý nếu Backend trả về lỗi qua URL
    if (error) {
      processed.current = true;
      console.error("Google login error:", error);
      toast.error("Đăng nhập Google thất bại!");
      navigate("/login");
      return;
    }

    if (token) {
      processed.current = true;
      
      // 1. Lưu token vào localStorage
      localStorage.setItem("access_token", token); // Đảm bảo key này khớp với logic trong axiosClient/authService của bạn

      // 2. Gọi API lấy thông tin User hiện tại bằng token mới
      // Thay URL dưới đây bằng endpoint thực tế của bạn
      fetch("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        })
        .then((user) => {
          // 3. Cập nhật Auth Context
          login(user, token);
          toast.success(`Chào mừng ${user.full_name}!`);
          navigate("/"); // Chuyển về trang chủ
        })
        .catch((err) => {
          console.error("Fetch user failed:", err);
          toast.error("Lỗi xác thực người dùng");
          navigate("/login");
        });
    } else {
      // Trường hợp không có token và không có error
      if (!processed.current) {
        navigate("/login");
      }
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Đang xử lý đăng nhập...</h2>
      <p className="text-gray-500">Vui lòng đợi trong giây lát.</p>
    </div>
  );
};

export default GoogleCallback;