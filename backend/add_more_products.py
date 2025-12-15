"""
Script để thêm nhiều sản phẩm cho test phân trang
Chạy: python add_more_products.py
"""

from datetime import datetime, timedelta
from app.database import (
    db, categories_collection, products_collection, get_next_sequence
)
import random

def get_categories():
    """Lấy danh sách categories hiện có"""
    categories = list(categories_collection.find())
    if not categories:
        print("[ERROR] Không tìm thấy categories! Hãy chạy seed_data.py trước.")
        return None
    return categories

def create_additional_products():
    """Tạo thêm nhiều sản phẩm để test phân trang"""
    print("[INFO] Đang tạo thêm sản phẩm...")
    
    categories = get_categories()
    if not categories:
        return
    
    products = []
    
    # Danh sách sản phẩm mẫu cho từng danh mục
    product_templates = {
        "Điện Thoại": [
            {"name": "iPhone 14", "brand": "Apple", "price": 22990000, "compare_price": 25990000},
            {"name": "iPhone 13", "brand": "Apple", "price": 18990000, "compare_price": 21990000},
            {"name": "iPhone 12", "brand": "Apple", "price": 15990000, "compare_price": 18990000},
            {"name": "Samsung Galaxy S23", "brand": "Samsung", "price": 20990000, "compare_price": 24990000},
            {"name": "Samsung Galaxy A54", "brand": "Samsung", "price": 9990000, "compare_price": 11990000},
            {"name": "Samsung Galaxy A34", "brand": "Samsung", "price": 7990000, "compare_price": 9990000},
            {"name": "Xiaomi 13", "brand": "Xiaomi", "price": 12990000, "compare_price": 15990000},
            {"name": "Xiaomi Redmi Note 12", "brand": "Xiaomi", "price": 5990000, "compare_price": 7990000},
            {"name": "OPPO Reno10", "brand": "OPPO", "price": 11990000, "compare_price": 13990000},
            {"name": "Vivo V29", "brand": "Vivo", "price": 10990000, "compare_price": 12990000},
            {"name": "Realme 11 Pro", "brand": "Realme", "price": 8990000, "compare_price": 10990000},
            {"name": "Honor 90", "brand": "Honor", "price": 9990000, "compare_price": 11990000},
        ],
        "Laptop": [
            {"name": "MacBook Air M2", "brand": "Apple", "price": 28990000, "compare_price": 32990000},
            {"name": "MacBook Air M1", "brand": "Apple", "price": 22990000, "compare_price": 25990000},
            {"name": "Dell Inspiron 15", "brand": "Dell", "price": 15990000, "compare_price": 18990000},
            {"name": "HP Pavilion 15", "brand": "HP", "price": 14990000, "compare_price": 17990000},
            {"name": "Asus VivoBook 15", "brand": "Asus", "price": 12990000, "compare_price": 15990000},
            {"name": "Lenovo ThinkPad E14", "brand": "Lenovo", "price": 18990000, "compare_price": 21990000},
            {"name": "Acer Aspire 5", "brand": "Acer", "price": 11990000, "compare_price": 14990000},
            {"name": "MSI Gaming GF63", "brand": "MSI", "price": 19990000, "compare_price": 23990000},
            {"name": "Asus TUF Gaming A15", "brand": "Asus", "price": 22990000, "compare_price": 26990000},
            {"name": "HP Envy 13", "brand": "HP", "price": 24990000, "compare_price": 28990000},
        ],
        "Tai Nghe": [
            {"name": "AirPods 3", "brand": "Apple", "price": 4490000, "compare_price": 5490000},
            {"name": "AirPods 2", "brand": "Apple", "price": 3290000, "compare_price": 4290000},
            {"name": "Sony WF-1000XM4", "brand": "Sony", "price": 5990000, "compare_price": 7990000},
            {"name": "Sony WH-CH720N", "brand": "Sony", "price": 3990000, "compare_price": 4990000},
            {"name": "JBL Tune 770NC", "brand": "JBL", "price": 2990000, "compare_price": 3990000},
            {"name": "Sennheiser HD 450BT", "brand": "Sennheiser", "price": 3490000, "compare_price": 4490000},
            {"name": "Bose QuietComfort 45", "brand": "Bose", "price": 8990000, "compare_price": 10990000},
            {"name": "Audio-Technica ATH-M50xBT2", "brand": "Audio-Technica", "price": 4990000, "compare_price": 5990000},
        ],
        "Đồng Hồ Thông Minh": [
            {"name": "Apple Watch Series 9", "brand": "Apple", "price": 9990000, "compare_price": 11990000},
            {"name": "Apple Watch SE", "brand": "Apple", "price": 6990000, "compare_price": 8990000},
            {"name": "Samsung Galaxy Watch 6", "brand": "Samsung", "price": 7990000, "compare_price": 9990000},
            {"name": "Xiaomi Watch S1", "brand": "Xiaomi", "price": 3990000, "compare_price": 4990000},
            {"name": "Huawei Watch GT 4", "brand": "Huawei", "price": 5990000, "compare_price": 7990000},
            {"name": "Garmin Venu 3", "brand": "Garmin", "price": 11990000, "compare_price": 13990000},
        ],
        "Thời Trang Nam": [
            {"name": "Áo Polo Nam", "brand": "Uniqlo", "price": 390000, "compare_price": 490000},
            {"name": "Áo Sơ Mi Nam", "brand": "Zara", "price": 590000, "compare_price": 790000},
            {"name": "Quần Jeans Nam", "brand": "Levi's", "price": 1290000, "compare_price": 1590000},
            {"name": "Áo Thun Nam", "brand": "H&M", "price": 290000, "compare_price": 390000},
            {"name": "Quần Kaki Nam", "brand": "Uniqlo", "price": 690000, "compare_price": 890000},
            {"name": "Áo Hoodie Nam", "brand": "Nike", "price": 1590000, "compare_price": 1990000},
        ],
        "Thời Trang Nữ": [
            {"name": "Váy Maxi Nữ", "brand": "Zara", "price": 890000, "compare_price": 1190000},
            {"name": "Áo Blouse Nữ", "brand": "H&M", "price": 490000, "compare_price": 690000},
            {"name": "Quần Jeans Nữ", "brand": "Levi's", "price": 1190000, "compare_price": 1490000},
            {"name": "Đầm Công Sở", "brand": "Mango", "price": 1290000, "compare_price": 1590000},
            {"name": "Áo Thun Nữ", "brand": "Uniqlo", "price": 290000, "compare_price": 390000},
        ],
        "Giày Dép": [
            {"name": "Nike Air Force 1", "brand": "Nike", "price": 2990000, "compare_price": 3490000},
            {"name": "Adidas Stan Smith", "brand": "Adidas", "price": 2490000, "compare_price": 2990000},
            {"name": "Converse Chuck Taylor", "brand": "Converse", "price": 1690000, "compare_price": 1990000},
            {"name": "Vans Old Skool", "brand": "Vans", "price": 1890000, "compare_price": 2290000},
            {"name": "Puma Suede Classic", "brand": "Puma", "price": 1990000, "compare_price": 2490000},
        ],
        "Nội Thất": [
            {"name": "Ghế Sofa 3 Chỗ", "brand": "IKEA", "price": 8990000, "compare_price": 10990000},
            {"name": "Bàn Làm Việc", "brand": "IKEA", "price": 2990000, "compare_price": 3990000},
            {"name": "Tủ Quần Áo", "brand": "JYSK", "price": 5990000, "compare_price": 7990000},
            {"name": "Giường Ngủ 1m8", "brand": "JYSK", "price": 4990000, "compare_price": 6990000},
        ],
        "Sách": [
            {"name": "Đắc Nhân Tâm", "brand": "NXB Tổng Hợp", "price": 89000, "compare_price": 120000},
            {"name": "Sapiens", "brand": "NXB Thế Giới", "price": 189000, "compare_price": 250000},
            {"name": "Atomic Habits", "brand": "NXB Thế Giới", "price": 169000, "compare_price": 220000},
            {"name": "Rich Dad Poor Dad", "brand": "NXB Lao Động", "price": 149000, "compare_price": 200000},
        ],
        "Mỹ Phẩm": [
            {"name": "Son Môi Dior", "brand": "Dior", "price": 1290000, "compare_price": 1590000},
            {"name": "Kem Nền MAC", "brand": "MAC", "price": 990000, "compare_price": 1290000},
            {"name": "Mascara Maybelline", "brand": "Maybelline", "price": 290000, "compare_price": 390000},
            {"name": "Phấn Phủ L'Oreal", "brand": "L'Oreal", "price": 390000, "compare_price": 490000},
        ]
    }
    
    # Tạo sản phẩm cho từng danh mục
    for category in categories:
        cat_name = category["name"]
        cat_id = category["_id"]
        
        if cat_name in product_templates:
            templates = product_templates[cat_name]
            
            for template in templates:
                # Tạo nhiều biến thể cho mỗi template
                colors = ["Đen", "Trắng", "Xanh", "Đỏ", "Vàng", "Hồng", "Xám", "Nâu"]
                sizes = ["S", "M", "L", "XL"] if "Thời Trang" in cat_name else ["128GB", "256GB", "512GB"] if cat_name == "Điện Thoại" else [None]
                
                # Tạo 2-3 sản phẩm từ mỗi template với màu sắc khác nhau
                for i in range(random.randint(2, 4)):
                    color = random.choice(colors)
                    
                    product_name = f"{template['name']}"
                    if color and cat_name in ["Thời Trang Nam", "Thời Trang Nữ", "Giày Dép"]:
                        product_name += f" - {color}"
                    
                    # Random giá với biến động nhỏ
                    base_price = template["price"]
                    price_variation = random.uniform(0.9, 1.1)
                    final_price = int(base_price * price_variation)
                    
                    compare_price = template.get("compare_price")
                    if compare_price:
                        compare_price = int(compare_price * price_variation)
                    
                    # Tạo variants
                    variants = []
                    if sizes[0] is not None:
                        for size in sizes[:3]:  # Chỉ lấy 3 size đầu
                            variants.append({
                                "size": size,
                                "color": color,
                                "stock": random.randint(10, 50),
                                "price_adjustment": random.randint(0, 500000) if size != sizes[0] else 0
                            })
                    else:
                        variants.append({
                            "size": None,
                            "color": color,
                            "stock": random.randint(20, 100),
                            "price_adjustment": 0
                        })
                    
                    # Tạo description
                    descriptions = {
                        "Điện Thoại": f"{product_name} với màn hình sắc nét, camera chất lượng cao, pin bền bỉ. Thiết kế sang trọng, hiệu năng mạnh mẽ.",
                        "Laptop": f"{product_name} với bộ vi xử lý mạnh mẽ, RAM lớn, SSD nhanh. Phù hợp cho công việc và giải trí.",
                        "Tai Nghe": f"{product_name} với chất lượng âm thanh tuyệt vời, thiết kế thoải mái, pin lâu.",
                        "Đồng Hồ Thông Minh": f"{product_name} theo dõi sức khỏe, thông báo thông minh, thiết kế thời trang.",
                        "Thời Trang Nam": f"{product_name} chất liệu cao cấp, thiết kế hiện đại, phù hợp nhiều dịp.",
                        "Thời Trang Nữ": f"{product_name} thiết kế nữ tính, chất liệu mềm mại, form dáng đẹp.",
                        "Giày Dép": f"{product_name} thiết kế thời trang, chất liệu bền đẹp, thoải mái khi di chuyển.",
                        "Nội Thất": f"{product_name} thiết kế hiện đại, chất liệu cao cấp, phù hợp không gian sống.",
                        "Sách": f"{product_name} nội dung hay, kiến thức bổ ích, phù hợp mọi lứa tuổi.",
                        "Mỹ Phẩm": f"{product_name} chất lượng cao, an toàn cho da, màu sắc tự nhiên."
                    }
                    
                    description = descriptions.get(cat_name, f"{product_name} chất lượng cao, giá tốt.")
                    
                    # Random image từ Unsplash
                    image_keywords = {
                        "Điện Thoại": "smartphone",
                        "Laptop": "laptop",
                        "Tai Nghe": "headphones",
                        "Đồng Hồ Thông Minh": "smartwatch",
                        "Thời Trang Nam": "mens-fashion",
                        "Thời Trang Nữ": "womens-fashion",
                        "Giày Dép": "shoes",
                        "Nội Thất": "furniture",
                        "Sách": "books",
                        "Mỹ Phẩm": "cosmetics"
                    }
                    
                    keyword = image_keywords.get(cat_name, "product")
                    image_url = f"https://images.unsplash.com/photo-{random.randint(1500000000, 1700000000)}-{random.randint(100000, 999999)}?w=800&q=80&auto=format&fit=crop&ixlib=rb-4.0.3"
                    
                    product = {
                        "_id": f"prod_{get_next_sequence('products')}",
                        "name": product_name,
                        "slug": product_name.lower().replace(" ", "-").replace("--", "-"),
                        "description": description,
                        "short_description": description[:100],
                        "category_id": cat_id,
                        "brand": template["brand"],
                        "price": final_price,
                        "compare_price": compare_price,
                        "stock": sum([v["stock"] for v in variants]),
                        "sku": f"{cat_name.upper().replace(' ', '')}-{random.randint(1000, 9999)}",
                        "images": [
                            {"url": image_url, "is_primary": True, "alt_text": product_name}
                        ],
                        "variants": variants,
                        "tags": [keyword, template["brand"].lower(), cat_name.lower()],
                        "is_featured": random.choice([True, False, False, False]),  # 25% chance
                        "is_on_sale": random.choice([True, False, False]),  # 33% chance
                        "rating": round(random.uniform(3.5, 5.0), 1),
                        "review_count": random.randint(0, 200),
                        "sold_count": random.randint(0, 1000),
                        "view_count": random.randint(100, 10000),
                        "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 90)),
                        "updated_at": datetime.utcnow()
                    }
                    
                    products.append(product)
    
    # Insert products in batches
    batch_size = 50
    total_inserted = 0
    
    for i in range(0, len(products), batch_size):
        batch = products[i:i + batch_size]
        try:
            products_collection.insert_many(batch)
            total_inserted += len(batch)
            print(f"[INFO] Đã thêm {len(batch)} sản phẩm (Tổng: {total_inserted}/{len(products)})")
        except Exception as e:
            print(f"[ERROR] Lỗi khi thêm batch {i//batch_size + 1}: {e}")
    
    print(f"[OK] Đã thêm tổng cộng {total_inserted} sản phẩm!")
    return total_inserted

def main():
    """Chạy script thêm sản phẩm"""
    print("\n[START] BẮT ĐẦU THÊM SẢN PHẨM CHO TEST PHÂN TRANG\n")
    print("=" * 60)
    
    try:
        # Kiểm tra số sản phẩm hiện tại
        current_count = products_collection.count_documents({})
        print(f"[INFO] Số sản phẩm hiện tại: {current_count}")
        
        if current_count == 0:
            print("[WARNING] Chưa có sản phẩm nào! Hãy chạy seed_data.py trước.")
            return
        
        # Thêm sản phẩm
        added_count = create_additional_products()
        
        # Thống kê cuối
        new_count = products_collection.count_documents({})
        
        print("\n" + "=" * 60)
        print(f"\n[SUCCESS] HOÀN TẤT!\n")
        print(f"[SUMMARY] Thống kê:")
        print(f"   - Sản phẩm trước: {current_count}")
        print(f"   - Sản phẩm thêm: {added_count}")
        print(f"   - Tổng sản phẩm: {new_count}")
        print(f"\n[READY] Sẵn sàng test phân trang với {new_count} sản phẩm!\n")
        
    except Exception as e:
        print(f"\n[ERROR] Lỗi khi thêm sản phẩm: {e}")
        raise

if __name__ == "__main__":
    main()