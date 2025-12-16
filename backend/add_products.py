"""
Script tạo dữ liệu mẫu: 80 sản phẩm chuẩn, ảnh khớp nội dung (Contextual Images)
"""

from datetime import datetime, timedelta
from app.database import (
    db, users_collection, categories_collection, products_collection,
    coupons_collection, get_next_sequence
)
from app.auth import hash_password
import random

# --- 1. XÓA DATA CŨ ---
def clear_database():
    print("[INFO] Dang xoa du lieu cu...")
    db.drop_collection("users")
    db.drop_collection("categories")
    db.drop_collection("products")
    db.drop_collection("coupons")
    db.drop_collection("counters")
    print("[OK] Da xoa!")

# --- 2. TẠO USER ---
def create_users():
    print("[INFO] Dang tao User...")
    users = [
        {
            "_id": f"user_{get_next_sequence('users')}",
            "email": "admin@techmart.com",
            "password": hash_password("admin123"),
            "full_name": "Admin TechMart",
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
            "role": "user",
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "addresses": []
        }
    ]
    users_collection.insert_many(users)
    return users

# --- 3. TẠO DANH MỤC ---
def create_categories():
    print("[INFO] Dang tao Categories...")
    categories_data = [
        ("Điện Thoại", "dien-thoai", "📱"), ("Laptop", "laptop", "💻"),
        ("Tai Nghe", "tai-nghe", "🎧"), ("Đồng Hồ", "dong-ho", "⌚"),
        ("Máy Tính Bảng", "may-tinh-bang", "📟"), ("PC & Màn Hình", "pc-man-hinh", "🖥️"),
        ("Bàn Phím & Chuột", "ban-phim-chuot", "⌨️"), ("Camera", "camera", "📷"),
        ("Loa", "loa", "🔈"), ("Phụ Kiện", "phu-kien", "🔌"),
        ("Thời Trang Nam", "thoi-trang-nam", "👔"), ("Thời Trang Nữ", "thoi-trang-nu", "👗"),
        ("Giày Dép", "giay-dep", "👟"), ("Túi Xách", "tui-xach", "👜"),
        ("Trang Sức", "trang-suc", "💍"), ("Nội Thất", "noi-that", "🛋️"),
        ("Đồ Gia Dụng", "do-gia-dung", "🏠"), ("Đèn Trang Trí", "den-trang-tri", "💡"),
        ("Sách", "sach", "📚"), ("Đồ Chơi", "do-choi", "🧸"),
    ]
    categories = []
    for name, slug, icon in categories_data:
        categories.append({
            "_id": f"cat_{get_next_sequence('categories')}",
            "name": name, "slug": slug, "icon": icon,
            "description": f"Danh mục {name}", "created_at": datetime.utcnow()
        })
    categories_collection.insert_many(categories)
    return categories

# --- 4. TẠO 80 SẢN PHẨM VỚI ẢNH KHỚP TỪ KHÓA ---
def create_products(categories):
    print("[INFO] Dang tao 80 san pham (Anh theo tu khoa)...")
    products = []
    cat_map = {c["slug"]: c["_id"] for c in categories}

    # k: keyword dùng để search ảnh
    raw_products = [
        # 1. Điện Thoại (Keyword: smartphone)
        {"n": "iPhone 15 Pro Max", "c": "dien-thoai", "p": 29990000, "b": "Apple", "k": "iphone,smartphone"},
        {"n": "Samsung Galaxy S24 Ultra", "c": "dien-thoai", "p": 26990000, "b": "Samsung", "k": "samsung,phone"},
        {"n": "Xiaomi 14 Ultra", "c": "dien-thoai", "p": 22990000, "b": "Xiaomi", "k": "xiaomi,smartphone"},
        {"n": "Google Pixel 8 Pro", "c": "dien-thoai", "p": 18990000, "b": "Google", "k": "pixel,phone"},

        # 2. Laptop (Keyword: laptop)
        {"n": "MacBook Air M3", "c": "laptop", "p": 27990000, "b": "Apple", "k": "macbook"},
        {"n": "Dell XPS 13 Plus", "c": "laptop", "p": 42990000, "b": "Dell", "k": "dell,laptop"},
        {"n": "Asus ROG Zephyrus", "c": "laptop", "p": 38990000, "b": "Asus", "k": "gaming,laptop"},
        {"n": "Lenovo ThinkPad X1", "c": "laptop", "p": 45990000, "b": "Lenovo", "k": "thinkpad"},

        # 3. Tai Nghe (Keyword: headphones)
        {"n": "AirPods Pro 2", "c": "tai-nghe", "p": 5990000, "b": "Apple", "k": "airpods"},
        {"n": "Sony WH-1000XM5", "c": "tai-nghe", "p": 7490000, "b": "Sony", "k": "headphones"},
        {"n": "Bose QuietComfort", "c": "tai-nghe", "p": 8990000, "b": "Bose", "k": "headset"},
        {"n": "Marshall Major IV", "c": "tai-nghe", "p": 3290000, "b": "Marshall", "k": "headphones"},

        # 4. Đồng Hồ (Keyword: watch)
        {"n": "Apple Watch Ultra 2", "c": "dong-ho", "p": 19990000, "b": "Apple", "k": "smartwatch"},
        {"n": "Galaxy Watch 6", "c": "dong-ho", "p": 6990000, "b": "Samsung", "k": "watch"},
        {"n": "Garmin Fenix 7X", "c": "dong-ho", "p": 22990000, "b": "Garmin", "k": "fitness,watch"},
        {"n": "Casio G-Shock", "c": "dong-ho", "p": 3500000, "b": "Casio", "k": "g-shock"},

        # 5. Máy Tính Bảng (Keyword: tablet)
        {"n": "iPad Pro M4", "c": "may-tinh-bang", "p": 23990000, "b": "Apple", "k": "ipad,tablet"},
        {"n": "Galaxy Tab S9", "c": "may-tinh-bang", "p": 19990000, "b": "Samsung", "k": "tablet,android"},
        {"n": "Xiaomi Pad 6", "c": "may-tinh-bang", "p": 8990000, "b": "Xiaomi", "k": "tablet"},
        {"n": "Surface Pro 9", "c": "may-tinh-bang", "p": 25990000, "b": "Microsoft", "k": "surface,tablet"},

        # 6. PC & Màn Hình (Keyword: computer, monitor)
        {"n": "Màn hình Dell UltraSharp", "c": "pc-man-hinh", "p": 14990000, "b": "Dell", "k": "monitor"},
        {"n": "Màn hình LG UltraGear", "c": "pc-man-hinh", "p": 21990000, "b": "LG", "k": "gaming,monitor"},
        {"n": "PC Gaming ROG Strix", "c": "pc-man-hinh", "p": 35990000, "b": "Asus", "k": "gaming,pc"},
        {"n": "iMac M3 24 inch", "c": "pc-man-hinh", "p": 32990000, "b": "Apple", "k": "imac"},

        # 7. Bàn Phím & Chuột (Keyword: keyboard, mouse)
        {"n": "Chuột Logitech MX Master", "c": "ban-phim-chuot", "p": 2490000, "b": "Logitech", "k": "computer,mouse"},
        {"n": "Bàn phím Keychron Q1", "c": "ban-phim-chuot", "p": 4290000, "b": "Keychron", "k": "mechanical,keyboard"},
        {"n": "Chuột Razer DeathAdder", "c": "ban-phim-chuot", "p": 3190000, "b": "Razer", "k": "gaming,mouse"},
        {"n": "Bàn phím Corsair K70", "c": "ban-phim-chuot", "p": 3590000, "b": "Corsair", "k": "keyboard,rgb"},

        # 8. Camera (Keyword: camera)
        {"n": "Sony Alpha A7 IV", "c": "camera", "p": 59990000, "b": "Sony", "k": "camera,sony"},
        {"n": "Fujifilm X-T5", "c": "camera", "p": 45990000, "b": "Fujifilm", "k": "camera,fujifilm"},
        {"n": "Canon EOS R6", "c": "camera", "p": 62990000, "b": "Canon", "k": "camera,canon"},
        {"n": "GoPro Hero 12", "c": "camera", "p": 9990000, "b": "GoPro", "k": "gopro,action"},

        # 9. Loa (Keyword: speaker)
        {"n": "Loa Marshall Stanmore", "c": "loa", "p": 9500000, "b": "Marshall", "k": "marshall,speaker"},
        {"n": "Loa JBL Charge 5", "c": "loa", "p": 3490000, "b": "JBL", "k": "jbl,speaker"},
        {"n": "Loa Harman Kardon", "c": "loa", "p": 6990000, "b": "Harman", "k": "speaker,glass"},
        {"n": "Loa Sony Soundbar", "c": "loa", "p": 5990000, "b": "Sony", "k": "soundbar"},

        # 10. Phụ Kiện (Keyword: tech accessory)
        {"n": "Sạc Anker Nano II", "c": "phu-kien", "p": 890000, "b": "Anker", "k": "charger"},
        {"n": "Pin dự phòng Samsung", "c": "phu-kien", "p": 1290000, "b": "Samsung", "k": "powerbank"},
        {"n": "Hub chuyển đổi Ugreen", "c": "phu-kien", "p": 1190000, "b": "Ugreen", "k": "usb,hub"},
        {"n": "Balo Tomtoc", "c": "phu-kien", "p": 1590000, "b": "Tomtoc", "k": "backpack,tech"},

        # 11. Thời Trang Nam (Keyword: men fashion)
        {"n": "Áo Polo Lacoste", "c": "thoi-trang-nam", "p": 2500000, "b": "Lacoste", "k": "polo,shirt"},
        {"n": "Quần Jean Levi's 501", "c": "thoi-trang-nam", "p": 1890000, "b": "Levi's", "k": "jeans,men"},
        {"n": "Áo Khoác Bomber Zara", "c": "thoi-trang-nam", "p": 1290000, "b": "Zara", "k": "jacket,men"},
        {"n": "Áo Thun Coolmate", "c": "thoi-trang-nam", "p": 290000, "b": "Coolmate", "k": "t-shirt,men"},

        # 12. Thời Trang Nữ (Keyword: women fashion)
        {"n": "Đầm Dự Tiệc Elise", "c": "thoi-trang-nu", "p": 1590000, "b": "Elise", "k": "dress,party"},
        {"n": "Áo Blazer H&M", "c": "thoi-trang-nu", "p": 990000, "b": "H&M", "k": "blazer,women"},
        {"n": "Chân Váy Xếp Ly", "c": "thoi-trang-nu", "p": 790000, "b": "Uniqlo", "k": "skirt,women"},
        {"n": "Áo Dài Cách Tân", "c": "thoi-trang-nu", "p": 2190000, "b": "Ivy Moda", "k": "ao,dai,vietnam"},

        # 13. Giày Dép (Keyword: shoes)
        {"n": "Nike Air Force 1", "c": "giay-dep", "p": 2990000, "b": "Nike", "k": "nike,sneakers"},
        {"n": "Adidas Ultraboost", "c": "giay-dep", "p": 4500000, "b": "Adidas", "k": "adidas,shoes"},
        {"n": "Giày Converse Chuck", "c": "giay-dep", "p": 1500000, "b": "Converse", "k": "converse,shoes"},
        {"n": "Giày Biti's Hunter", "c": "giay-dep", "p": 890000, "b": "Biti's", "k": "sneakers,running"},

        # 14. Túi Xách (Keyword: bag)
        {"n": "Túi Coach Tabby", "c": "tui-xach", "p": 12000000, "b": "Coach", "k": "handbag,luxury"},
        {"n": "Balo The North Face", "c": "tui-xach", "p": 2500000, "b": "The North Face", "k": "backpack,hiking"},
        {"n": "Ví Charles & Keith", "c": "tui-xach", "p": 1200000, "b": "Charles & Keith", "k": "wallet,women"},
        {"n": "Túi Tote Canvas", "c": "tui-xach", "p": 290000, "b": "Muji", "k": "tote,bag"},

        # 15. Trang Sức (Keyword: jewelry)
        {"n": "Nhẫn Bạc PNJ", "c": "trang-suc", "p": 850000, "b": "PNJ", "k": "ring,silver"},
        {"n": "Dây Chuyền Swarovski", "c": "trang-suc", "p": 3200000, "b": "Swarovski", "k": "necklace,crystal"},
        {"n": "Vòng Tay Pandora", "c": "trang-suc", "p": 1950000, "b": "Pandora", "k": "bracelet"},
        {"n": "Bông Tai Doji", "c": "trang-suc", "p": 4500000, "b": "Doji", "k": "earrings,gold"},

        # 16. Nội Thất (Keyword: furniture)
        {"n": "Ghế Herman Miller", "c": "noi-that", "p": 35000000, "b": "Herman Miller", "k": "office,chair"},
        {"n": "Sofa Da Thật", "c": "noi-that", "p": 15000000, "b": "Nhà Xinh", "k": "sofa,livingroom"},
        {"n": "Bàn Làm Việc IKEA", "c": "noi-that", "p": 4500000, "b": "IKEA", "k": "desk,office"},
        {"n": "Kệ Sách Gỗ", "c": "noi-that", "p": 2200000, "b": "Index", "k": "bookshelf"},

        # 17. Đồ Gia Dụng (Keyword: home appliance)
        {"n": "Robot Hút Bụi", "c": "do-gia-dung", "p": 16900000, "b": "Roborock", "k": "robot,vacuum"},
        {"n": "Nồi Chiên Không Dầu", "c": "do-gia-dung", "p": 6500000, "b": "Philips", "k": "airfryer"},
        {"n": "Máy Lọc Không Khí", "c": "do-gia-dung", "p": 4200000, "b": "Sharp", "k": "air,purifier"},
        {"n": "Máy Pha Cà Phê", "c": "do-gia-dung", "p": 19500000, "b": "Breville", "k": "coffee,machine"},

        # 18. Đèn Trang Trí (Keyword: lamp)
        {"n": "Đèn Bàn Pixar", "c": "den-trang-tri", "p": 450000, "b": "Rạng Đông", "k": "desk,lamp"},
        {"n": "Đèn Chùm Pha Lê", "c": "den-trang-tri", "p": 12000000, "b": "ArtGlass", "k": "chandelier"},
        {"n": "Đèn Ngủ Mặt Trăng", "c": "den-trang-tri", "p": 250000, "b": "OEM", "k": "moon,lamp"},
        {"n": "Đèn LED Dây", "c": "den-trang-tri", "p": 2100000, "b": "Philips Hue", "k": "led,strip"},

        # 19. Sách (Keyword: book)
        {"n": "Sách Nhà Giả Kim", "c": "sach", "p": 79000, "b": "Nhã Nam", "k": "book,novel"},
        {"n": "Bộ Harry Potter", "c": "sach", "p": 1500000, "b": "NXB Trẻ", "k": "harry,potter,book"},
        {"n": "Đắc Nhân Tâm", "c": "sach", "p": 86000, "b": "First News", "k": "book,cover"},
        {"n": "Tuổi Trẻ Đáng Giá", "c": "sach", "p": 90000, "b": "Nhã Nam", "k": "book"},

        # 20. Đồ Chơi (Keyword: toy)
        {"n": "Lego Ferrari", "c": "do-choi", "p": 9500000, "b": "Lego", "k": "lego,car"},
        {"n": "Mô Hình Gundam", "c": "do-choi", "p": 1200000, "b": "Bandai", "k": "gundam,robot"},
        {"n": "Rubik Gan 12", "c": "do-choi", "p": 1400000, "b": "Gan", "k": "rubik,cube"},
        {"n": "Board Game Mèo Nổ", "c": "do-choi", "p": 150000, "b": "Exploding Kittens", "k": "card,game"},
    ]

    for i, item in enumerate(raw_products):
        if item["c"] not in cat_map:
            continue
            
        slug = item["n"].lower().replace(" ", "-").replace("đ", "d").replace("'", "")
        
        # LOGIC TẠO ẢNH:
        # Sử dụng LoremFlickr với keyword tương ứng (ví dụ: mouse, keyboard)
        # Thêm ?lock=i để ảnh không bị thay đổi mỗi lần load trang, nhưng vẫn khác nhau giữa các sản phẩm
        keyword = item["k"].replace(" ", ",") # chuyển space thành phẩy nếu cần
        img_url = f"https://loremflickr.com/800/800/{item['k']}?lock={i}"
        img_detail = f"https://loremflickr.com/800/800/{item['k'].split(',')[0]}?lock={i+1000}"

        prod = {
            "_id": f"prod_{get_next_sequence('products')}",
            "name": item["n"],
            "slug": slug,
            "description": f"Sản phẩm {item['n']} cao cấp, chính hãng {item['b']}. Thiết kế hiện đại, độ bền cao.",
            "short_description": f"{item['n']} - {item['b']} - Best Seller 2024",
            "category_id": cat_map[item["c"]],
            "brand": item["b"],
            "price": item["p"],
            "compare_price": int(item["p"] * 1.2) if i % 3 == 0 else None,
            "stock": random.randint(5, 100),
            "sku": f"{item['b'][:3].upper()}-{random.randint(1000,9999)}",
            "images": [
                {"url": img_url, "is_primary": True, "alt_text": item["n"]},
                {"url": img_detail, "is_primary": False, "alt_text": "Detail view"}
            ],
            "variants": [],
            "tags": [item["c"], "new-arrival"],
            "is_featured": True if i % 5 == 0 else False,
            "is_on_sale": True if i % 3 == 0 else False,
            "rating": round(random.uniform(4.0, 5.0), 1),
            "review_count": random.randint(10, 200),
            "sold_count": random.randint(20, 500),
            "view_count": random.randint(1000, 10000),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            "updated_at": datetime.utcnow()
        }
        products.append(prod)

    products_collection.insert_many(products)
    print(f"[OK] Da tao {len(products)} san pham (Anh theo Context)!")
    return products

# --- 5. TẠO COUPON ---
def create_coupons():
    print("[INFO] Dang tao Coupon...")
    coupons = [
        {"c": "WELCOME10", "v": 10, "t": "percentage"},
        {"c": "FREESHIP", "v": 30000, "t": "fixed"},
        {"c": "TET2025", "v": 50000, "t": "fixed"},
        {"c": "VIP50", "v": 500000, "t": "fixed"},
        {"c": "SALE25", "v": 25, "t": "percentage"}
    ]
    docs = []
    for c in coupons:
        docs.append({
            "_id": f"coupon_{get_next_sequence('coupons')}",
            "code": c["c"],
            "discount_type": c["t"],
            "discount_value": c["v"],
            "is_active": True,
            "created_at": datetime.utcnow()
        })
    coupons_collection.insert_many(docs)
    return docs

# --- MAIN ---
def main():
    print("\n--- BAT DAU SEED DATA 80 SAN PHAM (CONTEXT IMAGE) ---\n")
    clear_database()
    create_users()
    cats = create_categories()
    create_products(cats)
    create_coupons()
    print("\n--- HOAN TAT ---")

if __name__ == "__main__":
    main()