# Cách BUILD backend 
## 🧑‍💻 1. Linh (người tạo repo)
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn pymongo python-dotenv
pip freeze > requirements.txt

```
Commit và đẩy lên GitHub (trừ thư mục venv/):

git add .
git commit -m "Base FastAPI backend"
git push origin main
```

## 👥 2. Thành viên trong team clone repo về:
```
git clone https://github.com/yourname/ecommerce-react-python.git 

cd ecommerce-react-python/backend
```
## ⚙️ 3. Tạo môi trường ảo (venv):
```
python -m venv venv
venv\Scripts\activate  hoặc source venv/bin/activate (Linux/Mac)
```

## 📦 4. Cài đặt thư viện từ requirements.txt:
```
pip install -r requirements.txt
```

## 🚀 5. Chạy dự án:
```
uvicorn main:app --reload
```

* Sau đó truy cập vào:
👉 http://localhost:8000