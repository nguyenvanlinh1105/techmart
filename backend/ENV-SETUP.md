# 🔐 HƯỚNG DẪN TẠO FILE .ENV

## Bước 1: Tạo file `.env` trong thư mục `backend/`

Tạo file mới với tên `.env` (dấu chấm ở đầu) và thêm nội dung sau:

```
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017

# Database Name
DB_NAME=ecommert

# JWT Secret Key (Đổi thành chuỗi ngẫu nhiên an toàn trong production!)
SECRET_KEY=your-secret-key-change-this-in-production
```

## Bước 2: Tùy chỉnh giá trị

- **MONGO_URI**: Nếu MongoDB chạy ở địa chỉ/port khác, đổi giá trị này
- **DB_NAME**: Tên database MongoDB (hiện tại đang dùng `ecommert`)
- **SECRET_KEY**: Đổi thành chuỗi ngẫu nhiên an toàn (dùng để mã hóa JWT token)

## Cách tạo file nhanh (Windows):

```cmd
cd backend
echo MONGO_URI=mongodb://localhost:27017 > .env
echo DB_NAME=ecommert >> .env
echo SECRET_KEY=your-secret-key-change-this-in-production >> .env
```

## Cách tạo file nhanh (Linux/Mac):

```bash
cd backend
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017
DB_NAME=ecommert
SECRET_KEY=your-secret-key-change-this-in-production
EOF
```

## Lưu ý:

- File `.env` đã được thêm vào `.gitignore` nên sẽ không bị commit lên Git
- KHÔNG share file `.env` với người khác (chứa thông tin nhạy cảm)
- Trong production, dùng các biến môi trường an toàn hơn (AWS Secrets Manager, Azure Key Vault, etc.)

