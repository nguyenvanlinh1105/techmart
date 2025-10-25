from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

# Tự động tạo collection nếu chưa tồn tại khi backend khởi động
def create_default_collections():
    collections_should_have = ["products"]
    for name in collections_should_have:
        if name not in db.list_collection_names():
            db.create_collection(name)

create_default_collections()