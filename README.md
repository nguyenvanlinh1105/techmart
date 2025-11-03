# 🛍️ TechMart E-Commerce Platform

Nền tảng E-Commerce hiện đại với giao diện cực kỳ xịn xò!

---

## ⚠️ LƯU Ý: CẦN XÓA FOLDER TRÙNG!

**Có folder `frontend/frontend/` bị lồng nhau!**

### Cách xóa:
1. Mở File Explorer
2. Vào: `C:\Users\ACER\Desktop\Đồ án thầy quân\techmart\frontend`
3. **Xóa folder `frontend`** bên trong (folder con trùng tên)
4. Giữ lại các file khác

---

## 🚀 Cách Chạy App

### **Cách 1: Double-click file .bat** (DỄ NHẤT)
1. Vào folder: `frontend/`
2. Double-click: `CLEAN-AND-RUN.bat`

### **Cách 2: Dùng CMD**
```bash
cd frontend
npm install
npm run dev
```

**Mở:** http://localhost:5173

---

## 🎯 Các Trang

- **Homepage**: `/`
- **Products**: `/products`
- **Product Detail**: `/products/1`
- **Cart**: `/cart`
- **Checkout**: `/checkout`
- **Login**: `/login`
- **Register**: `/register`

---

## 🎨 Tính Năng

✨ Glassmorphism effects  
🌈 Gradient animations  
💫 Smooth transitions  
📱 Fully responsive  
🛒 30+ components  

---

## 🛠️ Tech Stack

- React 19
- Vite
- Tailwind CSS
- React Router DOM
- React Icons
- Axios

---

## 📁 Cấu Trúc

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # Header, Footer
│   │   ├── home/         # Homepage sections
│   │   ├── product/      # Product components
│   │   └── common/       # Reusable UI
│   ├── pages/            # Page components
│   ├── contexts/         # Auth, Cart contexts
│   ├── services/         # API services
│   └── utils/            # Utilities
├── public/               # Static assets
└── package.json
```

---

## 🐛 Sửa Lỗi Thường Gặp

### Lỗi: `@tailwind base` không tồn tại
→ Đã sửa trong `index.css`

### Lỗi: PowerShell path encoding
→ Dùng CMD hoặc file .bat thay vì PowerShell

### Lỗi: Port 5173 đã được dùng
```bash
npm run dev -- --port 3000
```

---

**Made with ❤️ by TechMart Team**
