"""Script nhanh để tạo nhiều sản phẩm"""
from datetime import datetime, timedelta
from app.database import products_collection, categories_collection, get_next_sequence
import random

# Dữ liệu sản phẩm theo danh mục
PRODUCTS = {
    "Điện Thoại": [
        ("iPhone 15 Pro Max", "Apple", 29990000, 34990000, "https://images.unsplash.com/photo-1696446702228-09d1e8b5a72e?w=800"),
        ("iPhone 14 Pro", "Apple", 24990000, 27990000, "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800"),
        ("iPhone 13", "Apple", 17990000, 20990000, "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800"),
        ("Samsung S24 Ultra", "Samsung", 26990000, 31990000, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"),
        ("Samsung S23 FE", "Samsung", 12990000, 14990000, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"),
        ("Samsung A54 5G", "Samsung", 9990000, 11990000, "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800"),
        ("Xiaomi 14 Pro", "Xiaomi", 15990000, 18990000, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"),
        ("Xiaomi Redmi Note 13", "Xiaomi", 7990000, 9990000, "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"),
        ("OPPO Find X7", "OPPO", 22990000, 25990000, "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800"),
        ("Vivo V29 5G", "Vivo", 10990000, 12990000, "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800"),
    ],
    "Laptop": [
        ("MacBook Pro 16 M3", "Apple", 89990000, 99990000, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"),
        ("MacBook Air M2", "Apple", 28990000, 32990000, "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"),
        ("MacBook Air M1", "Apple", 22990000, 25990000, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800"),
        ("Dell XPS 15", "Dell", 45990000, 52990000, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"),
        ("Dell Inspiron 15", "Dell", 15990000, 18990000, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"),
        ("Asus ROG Zephyrus", "Asus", 35990000, 39990000, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"),
        ("Asus VivoBook 15", "Asus", 12990000, 15990000, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"),
        ("HP Pavilion 15", "HP", 14990000, 17990000, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"),
        ("Lenovo ThinkPad E14", "Lenovo", 18990000, 21990000, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"),
        ("Acer Aspire 5", "Acer", 11990000, 14990000, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"),
    ],
    "Tai Nghe": [
        ("AirPods Pro 2", "Apple", 5990000, 6990000, "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800"),
        ("AirPods 3", "Apple", 4490000, 5490000, "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800"),
        ("Sony WH-1000XM5", "Sony", 7990000, 9990000, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"),
        ("Sony WF-1000XM4", "Sony", 5990000, 7990000, "https://images.unsplash.com/photo-1590658165737-15a047b7a0b8?w=800"),
        ("JBL Tune 770NC", "JBL", 2990000, 3990000, "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"),
        ("Bose QC45", "Bose", 8990000, 10990000, "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800"),
        ("Sennheiser HD 450BT", "Sennheiser", 3490000, 4490000, "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800"),
    ],
    "Đồng Hồ Thông Minh": [
        ("Apple Watch Series 9", "Apple", 9990000, 11990000, "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800"),
        ("Apple Watch SE", "Apple", 6990000, 8990000, "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"),
        ("Samsung Galaxy Watch 6", "Samsung", 7990000, 9990000, "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"),
        ("Xiaomi Watch S1", "Xiaomi", 3990000, 4990000, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"),
        ("Garmin Venu 3", "Garmin", 11990000, 13990000, "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=800"),
    ],
    "Thời Trang Nam": [
        ("Áo Polo Nam", "Uniqlo", 390000, 490000, "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800"),
        ("Áo Sơ Mi Nam", "Zara", 590000, 790000, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"),
        ("Quần Jeans Nam", "Levi's", 1290000, 1590000, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"),
        ("Áo Thun Nam", "H&M", 290000, 390000, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),
        ("Quần Kaki Nam", "Uniqlo", 690000, 890000, "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"),
        ("Áo Hoodie Nam", "Nike", 1590000, 1990000, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"),
    ],
    "Thời Trang Nữ": [
        ("Váy Maxi Nữ", "Zara", 890000, 1190000, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"),
        ("Áo Blouse Nữ", "H&M", 490000, 690000, "https://images.unsplash.com/photo-1564257577-8a5e6d6e1f7f?w=800"),
        ("Quần Jeans Nữ", "Levi's", 1190000, 1490000, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800"),
        ("Đầm Công Sở", "Mango", 1290000, 1590000, "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800"),
        ("Áo Thun Nữ", "Uniqlo", 290000, 390000, "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"),
    ],
    "Giày Dép": [
        ("Nike Air Force 1", "Nike", 2990000, 3490000, "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"),
        ("Adidas Stan Smith", "Adidas", 2490000, 2990000, "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800"),
        ("Converse Chuck Taylor", "Converse", 1690000, 1990000, "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800"),
        ("Vans Old Skool", "Vans", 1890000, 2290000, "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800"),
        ("Puma Suede Classic", "Puma", 1990000, 2490000, "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800"),
    ],
}

def create_all():
    categories = {c["name"]: c["_id"] for c in categories_collection.find()}
    count = 0
    for cat_name, items in PRODUCTS.items():
        if cat_name not in categories:
            continue
        cat_id = categories[cat_name]
        for name, brand, price, compare, img in items:
            products_collection.insert_one({
                "_id": f"prod_{get_next_sequence('products')}",
                "name": name,
                "slug": name.lower().replace(" ", "-"),
                "description": f"{name} chất lượng cao, {brand} chính hãng",
                "short_description": f"{name} - {brand}",
                "category_id": cat_id,
                "brand": brand,
                "price": price,
                "compare_price": compare,
                "stock": random.randint(30, 100),
                "sku": f"{cat_name[:3].upper()}-{random.randint(1000,9999)}",
                "images": [{"url": img, "is_primary": True, "alt_text": name}],
                "variants": [],
                "tags": [cat_name.lower(), brand.lower()],
                "is_featured": random.choice([True, False, False]),
                "is_on_sale": random.choice([True, False]),
                "rating": round(random.uniform(4.0, 5.0), 1),
                "review_count": random.randint(10, 200),
                "sold_count": random.randint(50, 1000),
                "view_count": random.randint(500, 10000),
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                "updated_at": datetime.utcnow()
            })
            count += 1
    print(f"✅ Đã tạo {count} sản phẩm!")

if __name__ == "__main__":
    create_all()