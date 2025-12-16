from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommert"]  # Sử dụng database có sẵn

# ==================== COLLECTIONS ====================
users_collection = db["users"]
products_collection = db["products"]
categories_collection = db["categories"]
orders_collection = db["orders"]
reviews_collection = db["reviews"]
carts_collection = db["carts"]
wishlists_collection = db["wishlists"]
coupons_collection = db["coupons"]
notifications_collection = db["notifications"]
addresses_collection = db["addresses"]
activity_logs_collection = db["activity_logs"]
conversations_collection = db["conversations"]  # For live chat
messages_collection = db["messages"]  # For live chat

# ==================== INDEXES ====================
def create_indexes():
    """Tạo indexes để tối ưu query performance"""
    
    # Users indexes
    users_collection.create_index([("email", ASCENDING)], unique=True)
    users_collection.create_index([("phone", ASCENDING)])
    users_collection.create_index([("role", ASCENDING)])
    
    # Products indexes
    products_collection.create_index([("name", "text"), ("description", "text")])  # Full-text search
    products_collection.create_index([("category_id", ASCENDING)])
    products_collection.create_index([("price", ASCENDING)])
    products_collection.create_index([("rating", DESCENDING)])
    products_collection.create_index([("created_at", DESCENDING)])
    products_collection.create_index([("is_featured", DESCENDING)])
    products_collection.create_index([("is_on_sale", DESCENDING)])
    
    # Categories indexes
    categories_collection.create_index([("slug", ASCENDING)], unique=True)
    categories_collection.create_index([("parent_id", ASCENDING)])
    
    # Orders indexes
    orders_collection.create_index([("user_id", ASCENDING)])
    orders_collection.create_index([("order_number", ASCENDING)], unique=True)
    orders_collection.create_index([("status", ASCENDING)])
    orders_collection.create_index([("created_at", DESCENDING)])
    orders_collection.create_index([("payment_status", ASCENDING)])
    
    # Reviews indexes
    reviews_collection.create_index([("product_id", ASCENDING)])
    reviews_collection.create_index([("user_id", ASCENDING)])
    reviews_collection.create_index([("rating", DESCENDING)])
    reviews_collection.create_index([("created_at", DESCENDING)])
    
    # Carts indexes
    carts_collection.create_index([("user_id", ASCENDING)], unique=True)
    carts_collection.create_index([("session_id", ASCENDING)])
    
    # Wishlists indexes
    wishlists_collection.create_index([("user_id", ASCENDING)])
    wishlists_collection.create_index([("product_id", ASCENDING)])
    
    # Coupons indexes
    coupons_collection.create_index([("code", ASCENDING)], unique=True)
    coupons_collection.create_index([("valid_from", ASCENDING)])
    coupons_collection.create_index([("valid_to", ASCENDING)])
    coupons_collection.create_index([("is_active", ASCENDING)])
    
    # Notifications indexes
    notifications_collection.create_index([("user_id", ASCENDING)])
    notifications_collection.create_index([("is_read", ASCENDING)])
    notifications_collection.create_index([("created_at", DESCENDING)])
    
    # Activity Logs indexes
    activity_logs_collection.create_index([("user_id", ASCENDING)])
    activity_logs_collection.create_index([("action", ASCENDING)])
    activity_logs_collection.create_index([("timestamp", DESCENDING)])
    
    # Chat indexes
    conversations_collection.create_index([("user_id", ASCENDING)])
    conversations_collection.create_index([("status", ASCENDING)])
    messages_collection.create_index([("conversation_id", ASCENDING)])
    messages_collection.create_index([("created_at", ASCENDING)])
    
    print("[OK] All indexes created successfully!")

# ==================== INITIAL SETUP ====================
def create_default_collections():
    """Tự động tạo collection nếu chưa tồn tại khi backend khởi động"""
    collections_should_have = [
        "users", "products", "categories", "orders", "reviews",
        "carts", "wishlists", "coupons", "notifications", "addresses",
        "activity_logs", "conversations", "messages"
    ]
    
    existing_collections = db.list_collection_names()
    
    for name in collections_should_have:
        if name not in existing_collections:
            db.create_collection(name)
            print(f"[OK] Created collection: {name}")
    
    # Create indexes
    create_indexes()

# Run setup
create_default_collections()

# ==================== HELPER FUNCTIONS ====================
def get_next_sequence(collection_name: str) -> int:
    """Generate auto-increment ID for collections"""
    counter = db["counters"].find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return counter["seq"]

def log_activity(user_id: str, action: str, details: dict = None):
    """Log user activities"""
    activity_logs_collection.insert_one({
        "user_id": user_id,
        "action": action,
        "details": details or {},
        "timestamp": datetime.utcnow(),
        "ip_address": None,  # Can be added from request
        "user_agent": None   # Can be added from request
    })

def create_notification_safe(user_id: str, type: str, title: str, message: str, link: str = None, max_retries: int = 5) -> bool:
    """Tạo notification an toàn với retry logic để tránh duplicate key errors"""
    for attempt in range(max_retries):
        try:
            notif_id = f"notif_{get_next_sequence('notifications')}"
            # Check if ID already exists
            if notifications_collection.find_one({"_id": notif_id}):
                if attempt < max_retries - 1:
                    continue
                else:
                    print(f"[WARNING] Could not create unique notification ID after {max_retries} attempts")
                    return False
            vn_now = datetime.utcnow() + timedelta(hours=7)

            notification_data = {
                "_id": notif_id,
                "user_id": user_id,
                "type": type,
                "title": title,
                "message": message,
                "is_read": False,
                "created_at": vn_now
            }
            if link:
                notification_data["link"] = link
            
            result = notifications_collection.insert_one(notification_data)
            if result.inserted_id:
                return True
            else:
                if attempt < max_retries - 1:
                    continue
        except Exception as e:
            error_str = str(e)
            if "duplicate key" in error_str.lower() or "E11000" in error_str:
                if attempt < max_retries - 1:
                    continue
                else:
                    print(f"[WARNING] Failed to create notification after {max_retries} attempts: {e}")
                    return False
            else:
                print(f"[WARNING] Error creating notification: {e}")
                return False
    return False