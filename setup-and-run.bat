@echo off
chcp 65001 >nul
echo ====================================
echo TechMart - Setup và Chạy Tự Động
echo ====================================
echo.

REM Kiểm tra Python
echo [1/6] Kiểm tra Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python chưa được cài đặt!
    echo Vui lòng cài Python từ: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✓ Python đã cài đặt

REM Kiểm tra Node.js
echo [2/6] Kiểm tra Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chưa được cài đặt!
    echo Vui lòng cài Node.js từ: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js đã cài đặt

REM Kiểm tra MongoDB
echo [3/6] Kiểm tra MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if errorlevel 1 (
    echo ⚠ MongoDB chưa chạy!
    echo Đang thử khởi động MongoDB...
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        echo ❌ Không thể khởi động MongoDB
        echo Vui lòng cài MongoDB từ: https://www.mongodb.com/try/download/community
        echo Hoặc khởi động MongoDB thủ công
        pause
        exit /b 1
    )
)
echo ✓ MongoDB đang chạy

REM Setup Backend
echo [4/6] Cài đặt Backend...
cd backend

REM Tạo file .env nếu chưa có
if not exist .env (
    echo Tạo file .env...
    (
        echo # JWT Secret Key ^(keep it short, max 72 characters for bcrypt^)
        echo SECRET_KEY=techmart-secret-2024
        echo.
        echo # MongoDB Connection
        echo MONGODB_URL=mongodb://localhost:27017
        echo DATABASE_NAME=techmart
        echo.
        echo # CORS Origins
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000
        echo.
        echo # Gemini API Key ^(optional - for chat feature^)
        echo GEMINI_API_KEY=
    ) > .env
    echo ✓ Đã tạo file .env
)

REM Cài đặt dependencies Python
if not exist venv (
    echo Tạo virtual environment...
    python -m venv venv
)

echo Kích hoạt virtual environment...
call venv\Scripts\activate.bat

echo Cài đặt Python packages...
pip install -q --upgrade pip
pip install -q fastapi uvicorn pymongo python-jose passlib bcrypt python-multipart google-generativeai python-dotenv

echo ✓ Backend đã sẵn sàng
cd ..

REM Setup Frontend
echo [5/6] Cài đặt Frontend...
cd frontend

if not exist node_modules (
    echo Cài đặt npm packages...
    call npm install
) else (
    echo ✓ node_modules đã tồn tại
)

echo ✓ Frontend đã sẵn sàng
cd ..

REM Seed dữ liệu
echo [6/6] Khởi tạo dữ liệu mẫu...
cd backend
call venv\Scripts\activate.bat
python seed_data.py >nul 2>&1
echo ✓ Dữ liệu mẫu đã được tạo
cd ..

echo.
echo ====================================
echo ✓ Setup hoàn tất!
echo ====================================
echo.
echo Đang khởi động ứng dụng...
echo.

REM Chạy Backend
echo [Backend] Khởi động tại http://localhost:8000
start "TechMart Backend" cmd /k "cd backend && venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Đợi backend khởi động
timeout /t 5 /nobreak >nul

REM Chạy Frontend
echo [Frontend] Khởi động tại http://localhost:5173
start "TechMart Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo ✓ Ứng dụng đang chạy!
echo ====================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Tài khoản Admin mặc định:
echo Email:    admin@techmart.com
echo Password: admin123
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này
echo (Backend và Frontend sẽ tiếp tục chạy)
echo ====================================
pause >nul
