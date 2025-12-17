"""
Script để tạo dữ liệu mẫu cho database
Chạy: python seed_data.py
"""

from datetime import datetime, timedelta
from app.database import (
    db, users_collection, categories_collection, products_collection,
    coupons_collection, get_next_sequence
)
from app.auth import hash_password
import random

def clear_database():
    """Xoa tat ca du lieu cu"""
    print("[INFO] Dang xoa du lieu cu...")
    db.drop_collection("users")
    db.drop_collection("categories")
    db.drop_collection("products")
    db.drop_collection("coupons")
    db.drop_collection("counters")
    print("[OK] Da xoa du lieu cu!")

def create_users():
    """Tao nguoi dung mau"""
    print("[INFO] Dang tao nguoi dung...")
    
    users = [
        {
            "_id": f"user_{get_next_sequence('users')}",
            "email": "admin@techmart.com",
            "password": hash_password("admin123"),
            "full_name": "Admin TechMart",
            "phone": "0901234567",
            "role": "admin",
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "addresses": []
        },
        {
            "_id": f"user_{get_next_sequence('users')}",
            "email": "user1@gmail.com",
            "password": hash_password("user123"),
            "full_name": "Nguyễn Văn A",
            "phone": "0912345678",
            "role": "user",
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "addresses": [
                {
                    "id": f"addr_{get_next_sequence('addresses')}",
                    "label": "Nhà riêng",
                    "full_name": "Nguyễn Văn A",
                    "phone": "0912345678",
                    "address": "123 Nguyễn Huệ",
                    "city": "Hồ Chí Minh",
                    "district": "Quận 1",
                    "ward": "Phường Bến Nghé",
                    "postal_code": "700000",
                    "is_default": True
                }
            ]
        },
        {
            "_id": f"user_{get_next_sequence('users')}",
            "email": "user2@gmail.com",
            "password": hash_password("user123"),
            "full_name": "Trần Thị B",
            "phone": "0923456789",
            "role": "user",
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "addresses": []
        }
    ]
    
    users_collection.insert_many(users)
    print(f"[OK] Da tao {len(users)} nguoi dung!")
    return users

def create_categories():
    """Tao danh muc san pham"""
    print("[INFO] Dang tao danh muc...")
    
    categories = [
        # Điện Tử
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Điện Thoại",
            "slug": "dien-thoai",
            "description": "Điện thoại thông minh các loại",
            "icon": "📱",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Laptop",
            "slug": "laptop",
            "description": "Laptop cho học tập và làm việc",
            "icon": "💻",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Tai Nghe",
            "slug": "tai-nghe",
            "description": "Tai nghe cao cấp",
            "icon": "🎧",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Đồng Hồ Thông Minh",
            "slug": "dong-ho-thong-minh",
            "description": "Smartwatch và fitness tracker",
            "icon": "⌚",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Phụ Kiện Điện Tử",
            "slug": "phu-kien-dien-tu",
            "description": "Phụ kiện điện tử đa dạng",
            "icon": "🔌",
            "created_at": datetime.utcnow()
        },
        # Thời Trang
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Thời Trang Nam",
            "slug": "thoi-trang-nam",
            "description": "Quần áo nam thời trang",
            "icon": "👔",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Thời Trang Nữ",
            "slug": "thoi-trang-nu",
            "description": "Quần áo nữ thời trang",
            "icon": "👗",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Giày Dép",
            "slug": "giay-dep",
            "description": "Giày dép nam nữ",
            "icon": "👟",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Túi Xách",
            "slug": "tui-xach",
            "description": "Túi xách, balo thời trang",
            "icon": "👜",
            "created_at": datetime.utcnow()
        },
        # Nhà Cửa
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Nội Thất",
            "slug": "noi-that",
            "description": "Đồ nội thất gia đình",
            "icon": "🛋️",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Đồ Gia Dụng",
            "slug": "do-gia-dung",
            "description": "Đồ dùng gia đình",
            "icon": "🏠",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Đèn Chiếu Sáng",
            "slug": "den-chieu-sang",
            "description": "Đèn trang trí và chiếu sáng",
            "icon": "💡",
            "created_at": datetime.utcnow()
        },
        # Thể Thao
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Thể Thao & Giải Trí",
            "slug": "the-thao",
            "description": "Đồ thể thao và giải trí",
            "icon": "⚽",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Dụng Cụ Thể Thao",
            "slug": "dung-cu-the-thao",
            "description": "Dụng cụ tập luyện thể thao",
            "icon": "🏋️",
            "created_at": datetime.utcnow()
        },
        # Sách
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Sách",
            "slug": "sach",
            "description": "Sách các loại",
            "icon": "📚",
            "created_at": datetime.utcnow()
        },
        # Làm Đẹp
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Mỹ Phẩm",
            "slug": "my-pham",
            "description": "Mỹ phẩm làm đẹp",
            "icon": "💄",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Chăm Sóc Da",
            "slug": "cham-soc-da",
            "description": "Sản phẩm chăm sóc da",
            "icon": "🧴",
            "created_at": datetime.utcnow()
        },
        # Đồ Chơi
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Đồ Chơi",
            "slug": "do-choi",
            "description": "Đồ chơi trẻ em và người lớn",
            "icon": "🧸",
            "created_at": datetime.utcnow()
        },
        # Thực Phẩm
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Thực Phẩm",
            "slug": "thuc-pham",
            "description": "Thực phẩm tươi sống và đóng gói",
            "icon": "🍔",
            "created_at": datetime.utcnow()
        },
        {
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": "Đồ Uống",
            "slug": "do-uong",
            "description": "Đồ uống các loại",
            "icon": "🥤",
            "created_at": datetime.utcnow()
        }
    ]
    
    categories_collection.insert_many(categories)
    print(f"[OK] Da tao {len(categories)} danh muc!")
    return categories

def create_products(categories):
    """Tao san pham mau"""
    print("[INFO] Dang tao san pham...")
    
    products = []
    
    # Điện thoại
    phone_cat_id = categories[0]["_id"]
    phones = [
        {
            "name": "iPhone 15 Pro Max",
            "price": 29990000,
            "compare_price": 34990000,
            "brand": "Apple",
            "description": "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, màn hình Dynamic Island",
            "stock": 50,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Samsung Galaxy S24 Ultra",
            "price": 26990000,
            "compare_price": 31990000,
            "brand": "Samsung",
            "description": "Galaxy S24 Ultra với bút S-Pen, camera zoom 100x, chip Snapdragon 8 Gen 3",
            "stock": 40,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Xiaomi 14 Pro",
            "price": 15990000,
            "compare_price": 18990000,
            "brand": "Xiaomi",
            "description": "Xiaomi 14 Pro với camera Leica, sạc nhanh 120W, màn hình AMOLED 120Hz",
            "stock": 60,
            "is_featured": False,
            "is_on_sale": True
        },
        {
            "name": "OPPO Find X7 Ultra",
            "price": 22990000,
            "compare_price": None,
            "brand": "OPPO",
            "description": "OPPO Find X7 Ultra với 2 camera tele, chip Snapdragon 8 Gen 3",
            "stock": 30,
            "is_featured": True,
            "is_on_sale": False
        }
    ]
    
    # Image URLs from Unsplash
    phone_images = {
        "iPhone 15 Pro Max": "https://images.unsplash.com/photo-1696446702365-34f9dfe3e314?w=800&q=80",
        "Samsung Galaxy S24 Ultra": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
        "Xiaomi 14 Pro": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
        "OPPO Find X7 Ultra": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"
    }
    
    for phone in phones:
        product = {
            "_id": f"prod_{get_next_sequence('products')}",
            "name": phone["name"],
            "slug": phone["name"].lower().replace(" ", "-"),
            "description": phone["description"],
            "short_description": phone["description"][:100],
            "category_id": phone_cat_id,
            "brand": phone["brand"],
            "price": phone["price"],
            "compare_price": phone.get("compare_price"),
            "stock": phone["stock"],
            "sku": f"PHONE-{random.randint(1000, 9999)}",
            "images": [
                {"url": phone_images.get(phone["name"], "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"), "is_primary": True, "alt_text": phone["name"]}
            ],
            "variants": [
                {"size": "128GB", "color": "Đen", "stock": phone["stock"] // 3, "price_adjustment": 0},
                {"size": "256GB", "color": "Trắng", "stock": phone["stock"] // 3, "price_adjustment": 2000000},
                {"size": "512GB", "color": "Xanh", "stock": phone["stock"] // 3, "price_adjustment": 4000000},
            ],
            "tags": ["smartphone", "flagship", phone["brand"].lower()],
            "is_featured": phone["is_featured"],
            "is_on_sale": phone["is_on_sale"],
            "rating": round(random.uniform(4.0, 5.0), 1),
            "review_count": random.randint(10, 100),
            "sold_count": random.randint(50, 500),
            "view_count": random.randint(1000, 5000),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            "updated_at": datetime.utcnow()
        }
        products.append(product)
    
    # Laptop
    laptop_cat_id = categories[1]["_id"]
    laptops = [
        {
            "name": "MacBook Pro 16 M3 Max",
            "price": 89990000,
            "compare_price": 99990000,
            "brand": "Apple",
            "description": "MacBook Pro 16 inch với chip M3 Max, 36GB RAM, 1TB SSD, màn hình Liquid Retina XDR",
            "stock": 20,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Dell XPS 15",
            "price": 45990000,
            "compare_price": None,
            "brand": "Dell",
            "description": "Dell XPS 15 với Intel Core i7, RTX 4060, màn hình OLED 4K",
            "stock": 25,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Asus ROG Zephyrus G14",
            "price": 35990000,
            "compare_price": 39990000,
            "brand": "Asus",
            "description": "Gaming laptop mỏng nhẹ với Ryzen 9, RTX 4070, màn hình 165Hz",
            "stock": 30,
            "is_featured": False,
            "is_on_sale": True
        }
    ]
    
    # Image URLs for laptops
    laptop_images = {
        "MacBook Pro 16 M3 Max": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "Dell XPS 15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
        "Asus ROG Zephyrus G14": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"
    }
    
    for laptop in laptops:
        product = {
            "_id": f"prod_{get_next_sequence('products')}",
            "name": laptop["name"],
            "slug": laptop["name"].lower().replace(" ", "-"),
            "description": laptop["description"],
            "short_description": laptop["description"][:100],
            "category_id": laptop_cat_id,
            "brand": laptop["brand"],
            "price": laptop["price"],
            "compare_price": laptop.get("compare_price"),
            "stock": laptop["stock"],
            "sku": f"LAPTOP-{random.randint(1000, 9999)}",
            "images": [
                {"url": laptop_images.get(laptop["name"], "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"), "is_primary": True, "alt_text": laptop["name"]}
            ],
            "variants": [],
            "tags": ["laptop", laptop["brand"].lower()],
            "is_featured": laptop["is_featured"],
            "is_on_sale": laptop["is_on_sale"],
            "rating": round(random.uniform(4.0, 5.0), 1),
            "review_count": random.randint(5, 50),
            "sold_count": random.randint(20, 200),
            "view_count": random.randint(500, 3000),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            "updated_at": datetime.utcnow()
        }
        products.append(product)
    
    # Tai nghe
    headphone_cat_id = categories[2]["_id"]
    headphones = [
        {
            "name": "AirPods Pro 2",
            "price": 5990000,
            "compare_price": 6990000,
            "brand": "Apple",
            "description": "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động, USB-C",
            "stock": 100,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Sony WH-1000XM5",
            "price": 7990000,
            "compare_price": None,
            "brand": "Sony",
            "description": "Tai nghe over-ear cao cấp với chống ồn tốt nhất, pin 30 giờ",
            "stock": 50,
            "is_featured": True,
            "is_on_sale": False
        }
    ]
    
    # Image URLs for headphones
    headphone_images = {
        "AirPods Pro 2": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80",
        "Sony WH-1000XM5": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"
    }
    
    for headphone in headphones:
        product = {
            "_id": f"prod_{get_next_sequence('products')}",
            "name": headphone["name"],
            "slug": headphone["name"].lower().replace(" ", "-"),
            "description": headphone["description"],
            "short_description": headphone["description"][:100],
            "category_id": headphone_cat_id,
            "brand": headphone["brand"],
            "price": headphone["price"],
            "compare_price": headphone.get("compare_price"),
            "stock": headphone["stock"],
            "sku": f"HEADPHONE-{random.randint(1000, 9999)}",
            "images": [
                {"url": headphone_images.get(headphone["name"], "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"), "is_primary": True, "alt_text": headphone["name"]}
            ],
            "variants": [
                {"size": None, "color": "Đen", "stock": headphone["stock"] // 2, "price_adjustment": 0},
                {"size": None, "color": "Trắng", "stock": headphone["stock"] // 2, "price_adjustment": 0},
            ],
            "tags": ["headphone", "audio", headphone["brand"].lower()],
            "is_featured": headphone["is_featured"],
            "is_on_sale": headphone["is_on_sale"],
            "rating": round(random.uniform(4.5, 5.0), 1),
            "review_count": random.randint(20, 150),
            "sold_count": random.randint(100, 1000),
            "view_count": random.randint(2000, 8000),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            "updated_at": datetime.utcnow()
        }
        products.append(product)
    
    # =========================
    # SEED THEM 5 SAN PHAM CHO MOI DANH MUC
    # =========================
    
    # Danh sách ảnh từ Unsplash
    category_images = {
        "Điện Thoại": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
        "Laptop": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "Tai Nghe": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "Đồng Hồ Thông Minh": "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
        "Phụ Kiện Điện Tử": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
        "Thời Trang Nam": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "Thời Trang Nữ": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        "Giày Dép": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
        "Túi Xách": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
        "Nội Thất": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        "Đồ Gia Dụng": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
        "Đèn Chiếu Sáng": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
        "Thể Thao & Giải Trí": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
        "Dụng Cụ Thể Thao": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        "Sách": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
        "Mỹ Phẩm": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
        "Chăm Sóc Da": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
        "Đồ Chơi": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80",
        "Thực Phẩm": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
        "Đồ Uống": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80"
    }
    
    # Brands cho từng danh mục
    category_brands = {
        "Điện Thoại": ["Apple", "Samsung", "Xiaomi", "OPPO", "Vivo"],
        "Laptop": ["Apple", "Dell", "Asus", "HP", "Lenovo"],
        "Tai Nghe": ["Apple", "Sony", "JBL", "Bose", "Sennheiser"],
        "Đồng Hồ Thông Minh": ["Apple", "Samsung", "Xiaomi", "Garmin", "Huawei"],
        "Phụ Kiện Điện Tử": ["Anker", "Belkin", "Ugreen", "Baseus", "Xiaomi"],
        "Thời Trang Nam": ["Uniqlo", "Zara", "H&M", "Nike", "Adidas"],
        "Thời Trang Nữ": ["Zara", "H&M", "Mango", "Uniqlo", "Forever 21"],
        "Giày Dép": ["Nike", "Adidas", "Converse", "Vans", "Puma"],
        "Túi Xách": ["Gucci", "LV", "Chanel", "Dior", "Hermes"],
        "Nội Thất": ["IKEA", "JYSK", "Nitori", "Muji", "Homepro"],
        "Đồ Gia Dụng": ["Lock&Lock", "Tupperware", "Sunhouse", "Philips", "Panasonic"],
        "Đèn Chiếu Sáng": ["Philips", "Panasonic", "Điện Quang", "Rạng Đông", "Xiaomi"],
        "Thể Thao & Giải Trí": ["Nike", "Adidas", "Puma", "Under Armour", "Reebok"],
        "Dụng Cụ Thể Thao": ["Adidas", "Nike", "Reebok", "Decathlon", "Gymshark"],
        "Sách": ["NXB Trẻ", "NXB Kim Đồng", "NXB Văn Học", "NXB Thế Giới", "NXB Lao Động"],
        "Mỹ Phẩm": ["Dior", "Chanel", "MAC", "Maybelline", "L'Oreal"],
        "Chăm Sóc Da": ["Cetaphil", "La Roche-Posay", "Neutrogena", "Innisfree", "The Face Shop"],
        "Đồ Chơi": ["Lego", "Hasbro", "Mattel", "Bandai", "Fisher-Price"],
        "Thực Phẩm": ["Vinamilk", "TH True Milk", "Masan", "Acecook", "Nestlé"],
        "Đồ Uống": ["Coca-Cola", "Pepsi", "Trà Xanh 0°", "Sting", "Red Bull"]
    }
    
    # Giá cơ bản cho từng danh mục
    category_base_prices = {
        "Điện Thoại": 8000000,
        "Laptop": 15000000,
        "Tai Nghe": 2000000,
        "Đồng Hồ Thông Minh": 3000000,
        "Phụ Kiện Điện Tử": 200000,
        "Thời Trang Nam": 300000,
        "Thời Trang Nữ": 400000,
        "Giày Dép": 1500000,
        "Túi Xách": 2000000,
        "Nội Thất": 5000000,
        "Đồ Gia Dụng": 500000,
        "Đèn Chiếu Sáng": 300000,
        "Thể Thao & Giải Trí": 500000,
        "Dụng Cụ Thể Thao": 800000,
        "Sách": 100000,
        "Mỹ Phẩm": 500000,
        "Chăm Sóc Da": 300000,
        "Đồ Chơi": 200000,
        "Thực Phẩm": 50000,
        "Đồ Uống": 20000
    }
    
    # Tạo 5 sản phẩm cho mỗi danh mục
    for category in categories:
        cat_name = category["name"]
        cat_id = category["_id"]
        
        # Lấy thông tin cho danh mục
        image_url = category_images.get(cat_name, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80")
        brands = category_brands.get(cat_name, ["Generic"])
        base_price = category_base_prices.get(cat_name, 500000)
        
        # Tạo 5 sản phẩm
        for i in range(1, 6):
            brand = random.choice(brands)
            price = base_price + random.randint(-base_price//3, base_price*2)
            compare_price = price + random.randint(price//10, price//3)
            
            product = {
                "_id": f"prod_{get_next_sequence('products')}",
                "name": f"{cat_name} {brand} #{i}",
                "slug": f"{cat_name.lower().replace(' ', '-')}-{brand.lower()}-{i}",
                "description": f"{cat_name} {brand} chất lượng cao, mẫu số {i}. Sản phẩm chính hãng, bảo hành đầy đủ.",
                "short_description": f"{cat_name} {brand} - Mẫu {i}",
                "category_id": cat_id,
                "brand": brand,
                "price": price,
                "compare_price": compare_price,
                "stock": random.randint(30, 150),
                "sku": f"{cat_name[:3].upper()}-{random.randint(10000, 99999)}",
                "images": [
                    {"url": image_url, "is_primary": True, "alt_text": f"{cat_name} {brand}"}
                ],
                "variants": [],
                "tags": [cat_name.lower(), brand.lower(), "auto-seed"],
                "is_featured": i == 1,  # Sản phẩm đầu tiên là featured
                "is_on_sale": i % 2 == 0,  # Sản phẩm chẵn có sale
                "rating": round(random.uniform(4.0, 5.0), 1),
                "review_count": random.randint(5, 200),
                "sold_count": random.randint(10, 1000),
                "view_count": random.randint(100, 10000),
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                "updated_at": datetime.utcnow()
            }
            products.append(product)
    
    products_collection.insert_many(products)
    print(f"[OK] Da tao {len(products)} san pham!")
    return products

def create_coupons():
    """Tao ma giam gia"""
    print("[INFO] Dang tao ma giam gia...")
    
    now = datetime.utcnow()
    
    coupons = [
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "WELCOME10",
            "description": "Giảm 10% cho đơn hàng đầu tiên",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order_value": 1000000,
            "max_discount": 500000,
            "valid_from": now,
            "valid_to": now + timedelta(days=30),
            "usage_limit": 100,
            "used_count": 0,
            "is_active": True,
            "created_at": now
        },
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "FLASH50",
            "description": "Giảm 50% tối đa 1 triệu cho Flash Sale",
            "discount_type": "percentage",
            "discount_value": 50,
            "min_order_value": 2000000,
            "max_discount": 1000000,
            "valid_from": now,
            "valid_to": now + timedelta(days=7),
            "usage_limit": 50,
            "used_count": 0,
            "is_active": True,
            "created_at": now
        },
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "FREESHIP",
            "description": "Miễn phí vận chuyển",
            "discount_type": "fixed",
            "discount_value": 30000,
            "min_order_value": 500000,
            "max_discount": None,
            "valid_from": now,
            "valid_to": now + timedelta(days=60),
            "usage_limit": 200,
            "used_count": 0,
            "is_active": True,
            "created_at": now
        },
        {
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": "TECH200K",
            "description": "Giảm 200K cho đơn từ 5 triệu",
            "discount_type": "fixed",
            "discount_value": 200000,
            "min_order_value": 5000000,
            "max_discount": None,
            "valid_from": now,
            "valid_to": now + timedelta(days=90),
            "usage_limit": None,
            "used_count": 0,
            "is_active": True,
            "created_at": now
        }
    ]
    
    coupons_collection.insert_many(coupons)
    print(f"[OK] Da tao {len(coupons)} ma giam gia!")
    return coupons

def main():
    """Chay tat ca seed functions"""
    print("\n[START] BAT DAU TAO DU LIEU MAU\n")
    print("=" * 50)
    
    # Option to clear database
    response = input("\n[?] Ban co muon xoa du lieu cu khong? (y/n): ")
    if response.lower() == 'y':
        clear_database()
        print("\n" + "=" * 50)
    else:
        print("\n[WARNING] Du lieu cu se KHONG bi xoa!")
        print("[WARNING] Co the gay loi duplicate key!")
        print("\n" + "=" * 50)
    
    try:
        # Create data
        users = create_users()
        categories = create_categories()
        products = create_products(categories)
        coupons = create_coupons()
        
        print("\n" + "=" * 50)
        print("\n[SUCCESS] HOAN TAT! Thong tin dang nhap:\n")
        print("[ADMIN]")
        print("   Email: admin@techmart.com")
        print("   Password: admin123\n")
        print("[USER]")
        print("   Email: user1@gmail.com")
        print("   Password: user123\n")
        print("=" * 50)
        print(f"\n[SUMMARY] Tong ket:")
        print(f"   - {len(users)} nguoi dung")
        print(f"   - {len(categories)} danh muc")
        print(f"   - {len(products)} san pham")
        print(f"   - {len(coupons)} ma giam gia")
        print("\n[READY] San sang chay ung dung!\n")
    except Exception as e:
        print(f"\n[ERROR] Loi khi tao du lieu: {e}")
        print("\n[TIP] Hay chay lai script va chon 'y' de xoa du lieu cu!\n")
        raise

if __name__ == "__main__":
    main()

