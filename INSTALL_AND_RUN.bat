@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
color 0B
cls

:: ============================================================
:: TECHMART - SETUP VÀ CHẠY HOÀN TOÀN TỰ ĐỘNG
:: File này làm MỌI THỨ: Kiểm tra, cài đặt, cấu hình, chạy
:: Dành cho người mới pull từ GitHub
:: ============================================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          🛒 TECHMART - CÀI ĐẶT TỰ ĐỘNG                    ║
echo ║          Setup và chạy hoàn toàn tự động                   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Đang bắt đầu quá trình cài đặt...
echo.

:: Lưu đường dẫn gốc
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

:: ============================================================
:: BƯỚC 1: KIỂM TRA PYTHON
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [1/9] Kiểm tra Python...                                   │
echo └────────────────────────────────────────────────────────────┘

python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo ❌ LỖI: Python chưa được cài đặt!
    echo.
    echo 📥 Vui lòng cài đặt Python trước:
    echo    1. Truy cập: https://www.python.org/downloads/
    echo    2. Tải phiên bản Python 3.8 trở lên
    echo    3. ⚠️  QUAN TRỌNG: Chọn "Add Python to PATH" khi cài đặt
    echo    4. Sau khi cài xong, chạy lại file này
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo    ✓ %PYTHON_VERSION% - OK
echo.

:: ============================================================
:: BƯỚC 2: KIỂM TRA NODE.JS
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [2/9] Kiểm tra Node.js...                                  │
echo └────────────────────────────────────────────────────────────┘

node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo ❌ LỖI: Node.js chưa được cài đặt!
    echo.
    echo 📥 Vui lòng cài đặt Node.js trước:
    echo    1. Truy cập: https://nodejs.org/
    echo    2. Tải phiên bản LTS ^(khuyến nghị^)
    echo    3. Cài đặt với các tùy chọn mặc định
    echo    4. Sau khi cài xong, chạy lại file này
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version 2^>^&1') do set NPM_VERSION=%%i
echo    ✓ Node.js %NODE_VERSION% - OK
echo    ✓ npm %NPM_VERSION% - OK
echo.

:: ============================================================
:: BƯỚC 3: KIỂM TRA VÀ KHỞI ĐỘNG MONGODB
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [3/9] Kiểm tra MongoDB...                                  │
echo └────────────────────────────────────────────────────────────┘

tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if errorlevel 1 (
    echo    ⚠  MongoDB chưa chạy, đang thử khởi động...
    
    :: Thử khởi động MongoDB service
    net start MongoDB >nul 2>&1
    if errorlevel 1 (
        color 0E
        echo.
        echo    ⚠️  CẢNH BÁO: Không thể khởi động MongoDB tự động
        echo.
        echo    📥 Nếu chưa cài MongoDB:
        echo       1. Truy cập: https://www.mongodb.com/try/download/community
        echo       2. Tải MongoDB Community Server
        echo       3. Cài đặt với các tùy chọn mặc định
        echo       4. Chạy lại file này
        echo.
        echo    🔧 Nếu đã cài MongoDB:
        echo       1. Mở MongoDB Compass
        echo       2. Hoặc chạy lệnh: net start MongoDB
        echo       3. Hoặc khởi động mongod.exe thủ công
        echo.
        echo    💡 Bạn có thể tiếp tục nếu MongoDB đã chạy bằng cách khác
        echo.
        choice /C YN /M "    Tiếp tục cài đặt? (Y=Có, N=Không)"
        if errorlevel 2 exit /b 1
        color 0B
    ) else (
        echo    ✓ MongoDB đã được khởi động
    )
) else (
    echo    ✓ MongoDB đang chạy
)
echo.

:: ============================================================
:: BƯỚC 4: TẠO FILE CẤU HÌNH .ENV
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [4/9] Tạo file cấu hình Backend...                         │
echo └────────────────────────────────────────────────────────────┘

cd /d "%BACKEND_DIR%"

if exist .env (
    echo    ✓ File .env đã tồn tại
) else (
    echo    → Đang tạo file .env...
    (
        echo # ============================================================
        echo # TECHMART BACKEND CONFIGURATION
        echo # File này được tạo tự động bởi INSTALL_AND_RUN.bat
        echo # ============================================================
        echo.
        echo # JWT Secret Key ^(PHẢI ngắn hơn 72 ký tự do giới hạn của bcrypt^)
        echo SECRET_KEY=techmart-secret-key-2024
        echo.
        echo # MongoDB Connection
        echo MONGODB_URL=mongodb://localhost:27017
        echo DATABASE_NAME=techmart
        echo.
        echo # CORS Origins ^(Frontend URLs được phép truy cập API^)
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000
        echo.
        echo # Google Gemini API Key ^(Tùy chọn - Để trống nếu không dùng chat AI^)
        echo GEMINI_API_KEY=
        echo.
        echo # ============================================================
        echo # LƯU Ý:
        echo # - SECRET_KEY phải ngắn hơn 72 ký tự
        echo # - Không chia sẻ file này lên GitHub
        echo # - Thay đổi SECRET_KEY trong môi trường production
        echo # ============================================================
    ) > .env
    
    if exist .env (
        echo    ✓ File .env đã được tạo thành công
    ) else (
        color 0C
        echo    ❌ Không thể tạo file .env
        pause
        exit /b 1
    )
)
echo.

:: ============================================================
:: BƯỚC 5: TẠO VIRTUAL ENVIRONMENT
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [5/9] Cài đặt Backend ^(Python^)...                          │
echo └────────────────────────────────────────────────────────────┘

cd /d "%BACKEND_DIR%"

if exist venv (
    echo    ✓ Virtual environment đã tồn tại
) else (
    echo    → Đang tạo Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        color 0C
        echo    ❌ Không thể tạo virtual environment
        echo.
        echo    Thử chạy lệnh sau để kiểm tra:
        echo    python -m venv --help
        echo.
        pause
        exit /b 1
    )
    echo    ✓ Virtual environment đã tạo
)

:: Kích hoạt virtual environment
echo    → Kích hoạt virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    color 0C
    echo    ❌ Không thể kích hoạt virtual environment
    pause
    exit /b 1
)

:: Cài đặt/Cập nhật pip
echo    → Cập nhật pip...
python -m pip install --upgrade pip --quiet --disable-pip-version-check
if errorlevel 1 (
    echo    ⚠  Không thể cập nhật pip, tiếp tục...
)

:: Cài đặt dependencies
echo    → Cài đặt Python packages ^(có thể mất 1-3 phút^)...
echo       Đang cài: fastapi, uvicorn, pymongo, jwt, bcrypt...

pip install -r requirements.txt --quiet --disable-pip-version-check
if errorlevel 1 (
    color 0E
    echo.
    echo    ⚠️  Có lỗi khi cài packages, đang thử lại với output đầy đủ...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        color 0C
        echo.
        echo    ❌ Không thể cài đặt Python packages
        echo.
        echo    Thử các cách sau:
        echo    1. Kiểm tra kết nối internet
        echo    2. Chạy lệnh: pip install -r requirements.txt
        echo    3. Xem lỗi cụ thể ở trên
        echo.
        pause
        exit /b 1
    )
)

echo    ✓ Backend đã sẵn sàng
echo.

:: ============================================================
:: BƯỚC 6: CÀI ĐẶT FRONTEND
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [6/9] Cài đặt Frontend ^(React^)...                          │
echo └────────────────────────────────────────────────────────────┘

cd /d "%FRONTEND_DIR%"

if exist node_modules (
    echo    ✓ node_modules đã tồn tại
    echo    → Kiểm tra cập nhật...
    call npm install --silent --no-audit --no-fund >nul 2>&1
    echo    ✓ Dependencies đã cập nhật
) else (
    echo    → Cài đặt npm packages ^(có thể mất 2-5 phút^)...
    echo       Đang cài: react, vite, tailwindcss, axios...
    
    call npm install --silent --no-audit --no-fund
    if errorlevel 1 (
        color 0E
        echo.
        echo    ⚠️  Có lỗi khi cài packages, đang thử lại...
        echo.
        call npm install
        if errorlevel 1 (
            color 0C
            echo.
            echo    ❌ Không thể cài đặt npm packages
            echo.
            echo    Thử các cách sau:
            echo    1. Kiểm tra kết nối internet
            echo    2. Xóa thư mục node_modules và thử lại
            echo    3. Chạy lệnh: npm install
            echo.
            pause
            exit /b 1
        )
    )
    echo    ✓ Frontend đã sẵn sàng
)
echo.

:: ============================================================
:: BƯỚC 7: HƯỚNG DẪN TẠO DỮ LIỆU MẪU
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [7/9] Dữ liệu mẫu ^(tùy chọn^)...                            │
echo └────────────────────────────────────────────────────────────┘

echo    ℹ  Bỏ qua bước tạo dữ liệu mẫu tự động
echo    💡 Nếu cần tạo dữ liệu mẫu, chạy lệnh sau:
echo.
echo       cd backend
echo       venv\Scripts\activate
echo       python seed_data.py
echo.
echo    ✓ Tiếp tục khởi động server
echo.

:: ============================================================
:: BƯỚC 8: KHỞI ĐỘNG BACKEND
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [8/9] Khởi động Backend Server...                          │
echo └────────────────────────────────────────────────────────────┘

cd /d "%BACKEND_DIR%"

echo    → Đang khởi động Backend tại http://localhost:8000

start "TechMart Backend Server" cmd /k "title TechMart Backend && color 0A && cd /d "%BACKEND_DIR%" && call venv\Scripts\activate.bat && cls && echo. && echo ════════════════════════════════════════════════════════════ && echo          🔧 TECHMART BACKEND SERVER && echo ════════════════════════════════════════════════════════════ && echo. && echo    Status: RUNNING && echo    URL:    http://localhost:8000 && echo    Docs:   http://localhost:8000/docs && echo. && echo    Nhấn Ctrl+C để dừng server && echo ════════════════════════════════════════════════════════════ && echo. && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Đợi Backend khởi động
echo    → Đợi Backend khởi động ^(5 giây^)...
timeout /t 5 /nobreak >nul

echo    ✓ Backend đã khởi động
echo.

:: ============================================================
:: BƯỚC 9: KHỞI ĐỘNG FRONTEND
:: ============================================================
echo ┌────────────────────────────────────────────────────────────┐
echo │ [9/9] Khởi động Frontend Server...                         │
echo └────────────────────────────────────────────────────────────┘

cd /d "%FRONTEND_DIR%"

echo    → Đang khởi động Frontend tại http://localhost:5173

start "TechMart Frontend Server" cmd /k "title TechMart Frontend && color 0B && cd /d "%FRONTEND_DIR%" && cls && echo. && echo ════════════════════════════════════════════════════════════ && echo          🎨 TECHMART FRONTEND SERVER && echo ════════════════════════════════════════════════════════════ && echo. && echo    Status: RUNNING && echo    URL:    http://localhost:5173 && echo. && echo    Nhấn Ctrl+C để dừng server && echo ════════════════════════════════════════════════════════════ && echo. && npm run dev"

:: Đợi Frontend khởi động
echo    → Đợi Frontend khởi động ^(3 giây^)...
timeout /t 3 /nobreak >nul

echo    ✓ Frontend đã khởi động
echo.

:: ============================================================
:: HOÀN TẤT
:: ============================================================
timeout /t 2 /nobreak >nul
cls
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          ✅ CÀI ĐẶT HOÀN TẤT THÀNH CÔNG!                  ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ 🌐 TRUY CẬP ỨNG DỤNG                                       │
echo └────────────────────────────────────────────────────────────┘
echo.
echo    Frontend:   http://localhost:5173
echo    Backend:    http://localhost:8000
echo    API Docs:   http://localhost:8000/docs
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ 👤 TÀI KHOẢN ĐĂNG NHẬP                                     │
echo └────────────────────────────────────────────────────────────┘
echo.
echo    ┌─ ADMIN ─────────────────────────────────────────┐
echo    │  Email:    admin@techmart.com                   │
echo    │  Password: admin123                             │
echo    │  Quyền:    Quản lý toàn bộ hệ thống             │
echo    └─────────────────────────────────────────────────┘
echo.
echo    ┌─ SELLER ────────────────────────────────────────┐
echo    │  Email:    seller@techmart.com                  │
echo    │  Password: seller123                            │
echo    │  Quyền:    Quản lý sản phẩm và đơn hàng         │
echo    └─────────────────────────────────────────────────┘
echo.
echo    ┌─ USER ──────────────────────────────────────────┐
echo    │  Email:    user@techmart.com                    │
echo    │  Password: user123                              │
echo    │  Quyền:    Mua sắm và đánh giá sản phẩm         │
echo    └─────────────────────────────────────────────────┘
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ 💡 HƯỚNG DẪN SỬ DỤNG                                       │
echo └────────────────────────────────────────────────────────────┘
echo.
echo    • Backend và Frontend đang chạy trong 2 cửa sổ riêng
echo    • Đóng cửa sổ đó hoặc nhấn Ctrl+C để dừng server
echo    • Chạy lại file này để khởi động lại ứng dụng
echo    • Lần sau chạy sẽ nhanh hơn ^(đã cài đặt rồi^)
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ 📊 TẠO DỮ LIỆU MẪU ^(TÙY CHỌN^)                              │
echo └────────────────────────────────────────────────────────────┘
echo.
echo    Nếu muốn tạo dữ liệu mẫu, mở cmd và chạy:
echo.
echo       cd backend
echo       venv\Scripts\activate
echo       python seed_data.py
echo.
echo    Dữ liệu mẫu bao gồm: Users, Products, Orders, Coupons
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ 📝 NẾU GẶP LỖI                                             │
echo └────────────────────────────────────────────────────────────┘
echo.
echo    1. Lỗi "password cannot be longer than 72 bytes"
echo       → Mở backend\.env
echo       → Rút ngắn SECRET_KEY ^(ví dụ: SECRET_KEY=techmart2024^)
echo.
echo    2. MongoDB không kết nối
echo       → Chạy: net start MongoDB
echo       → Hoặc mở MongoDB Compass
echo.
echo    3. Port đã được sử dụng
echo       → Đóng ứng dụng đang dùng port 8000 hoặc 5173
echo.
echo    4. Xem thêm: README.md
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo Nhấn phím bất kỳ để đóng cửa sổ này...
echo ^(Backend và Frontend sẽ tiếp tục chạy^)
echo.
pause >nul

endlocal
exit /b 0
