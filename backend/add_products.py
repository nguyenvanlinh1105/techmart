"""
Script thêm sản phẩm bổ sung cho TechMart
Chạy: python add_products.py
"""

from datetime import datetime, timedelta
from app.database import products_collection, categories_collection, get_next_sequence
import random

def add_more_products():
    """Thêm sản phẩm bổ sung"""
    print("[INFO] Đang thêm sản phẩm bổ sung...")
    
    # Lấy categories
    categories = list(categories_collection.find())
    if not categories:
        print("[ERROR] Không tìm thấy categories! Chạy seed_data.py trước.")
        return 0
    
    # Sản phẩm bổ sung
    additional_products = [
        # Điện thoại bổ sung
        {
            "name": "iPhone 12 Pro Max",
            "category": "Điện Thoại",
            "brand": "Apple",
            "price": 25990000,
            "compare_price": 29990000,
            "description": "iPhone 12 Pro Max với camera ProRAW, màn hình Super Retina XDR 6.7 inch",
            "image": "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=800&q=80"
        },
        {
            "name": "Samsung Galaxy Note 20 Ultra",
            "category": "Điện Thoại", 
            "brand": "Samsung",
            "price": 22990000,
            "compare_price": 26990000,
            "description": "Galaxy Note 20 Ultra với bút S-Pen, camera 108MP, màn hình Dynamic AMOLED 2X",
            "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80"
        },
        
        # Laptop bổ sung
        {
            "name": "MacBook Pro 14 M3",
            "category": "Laptop",
            "brand": "Apple", 
            "price": 52990000,
            "compare_price": 59990000,
            "description": "MacBook Pro 14 inch với chip M3, 18GB RAM, 512GB SSD, màn hình Liquid Retina XDR",
            "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80"
        },
        {
            "name": "Dell Alienware m15 R7",
            "category": "Laptop",
            "brand": "Dell",
            "price": 45990000,
            "compare_price": 52990000,
            "description": "Gaming laptop Alienware với RTX 4070, Intel Core i7-12700H, màn hình 240Hz",
            "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"
        },
        
        # Tai nghe bổ sung
        {
            "name": "Bose QuietComfort Ultra",
            "category": "Tai Nghe",
            "brand": "Bose",
            "price": 9990000,
            "compare_price": 12990000,
            "description": "Bose QC Ultra với chống ồn immersive, âm thanh spatial audio, pin 24 giờ",
            "image": "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80"
        },
        {
            "name": "Audio-Technica ATH-M50xBT2",
            "category": "Tai Nghe",
            "brand": "Audio-Technica",
            "price": 4990000,
            "compare_price": 5990000,
            "description": "ATH-M50xBT2 với driver 45mm, Bluetooth 5.0, pin 50 giờ",
            "image": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80"
        },
        
        # Đồng hồ thông minh
        {
            "name": "Apple Watch Ultra 2",
            "category": "Đồng Hồ Thông Minh",
            "brand": "Apple",
            "price": 19990000,
            "compare_price": 22990000,
            "description": "Apple Watch Ultra 2 với khung Titanium, pin 36 giờ, chống nước 100m",
            "image": "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80"
        },
        
        # Thời trang
        {
            "name": "Áo Khoác Bomber Nam",
            "category": "Thời Trang Nam",
            "brand": "Zara",
            "price": 1290000,
            "compare_price": 1590000,
            "description": "Áo khoác bomber nam phong cách streetwear, chất liệu polyester cao cấp",
            "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"
        },
        {
            "name": "Đầm Cocktail Nữ",
            "category": "Thời Trang Nữ",
            "brand": "H&M",
            "price": 890000,
            "compare_price": 1190000,
            "description": "Đầm cocktail nữ tính, thiết kế thanh lịch, phù hợp dự tiệc",
            "image": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"
        },
        
        # Giày dép
        {
            "name": "Jordan Air 1 Retro High",
            "category": "Giày Dép",
            "brand": "Nike",
            "price": 4990000,
            "compare_price": 5990000,
            "description": "Jordan Air 1 Retro High OG, thiết kế cổ điển, chất liệu da cao cấp",
            "image": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"
        }
    ]
    
    # Map category names to IDs
    category_map = {cat["name"]: cat["_id"] for cat in categories}
    
    products_added = 0
    
    for product_data in additional_products:
        cat_name = product_data["category"]
        if cat_name not in category_map:
            print(f"[WARNING] Không tìm thấy danh mục: {cat_name}")
            continue
            
        product = {
            "_id": f"prod_{get_next_sequence('products')}",
            "name": product_data["name"],
            "slug": product_data["name"].lower().replace(" ", "-"),
            "description": product_data["description"],
            "short_description": product_data["description"][:100],
            "category_id": category_map[cat_name],
            "brand": product_data["brand"],
            "price": product_data["price"],
            "compare_price": product_data["compare_price"],
            "stock": random.randint(20, 100),
            "sku": f"{cat_name[:3].upper()}-{random.randint(10000, 99999)}",
            "images": [
                {"url": product_data["image"], "is_primary": True, "alt_text": product_data["name"]}
            ],
            "variants": [],
            "tags": [cat_name.lower(), product_data["brand"].lower()],
            "is_featured": random.choice([True, False, False]),
            "is_on_sale": random.choice([True, False]),
            "rating": round(random.uniform(4.0, 5.0), 1),
            "review_count": random.randint(5, 150),
            "sold_count": random.randint(10, 500),
            "view_count": random.randint(100, 5000),
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            "updated_at": datetime.utcnow()
        }
        
        try:
            products_collection.insert_one(product)
            products_added += 1
            print(f"  ✅ Đã thêm: {product_data['name']}")
        except Exception as e:
            print(f"  ❌ Lỗi thêm {product_data['name']}: {e}")
    
    print(f"[OK] Đã thêm {products_added} sản phẩm bổ sung!")
    return products_added

def main():
    """Chạy script"""
    print("\n[START] THÊM SẢN PHẨM BỔ SUNG")
    print("=" * 50)
    
    try:
        count = add_more_products()
        
        print("\n" + "=" * 50)
        print(f"[SUCCESS] Đã thêm {count} sản phẩm bổ sung!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n[ERROR] Lỗi: {e}")

if __name__ == "__main__":
    main()