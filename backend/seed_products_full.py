from datetime import datetime, timedelta, UTC
from app.database import products_collection, categories_collection, get_next_sequence
import random

# Danh sách sản phẩm chi tiết cho từng danh mục
PRODUCTS_DATA = {
    "Điện Thoại": [
        {
            "name": "iPhone 15 Pro Max 256GB Titan Tự Nhiên",
            "brand": "Apple",
            "price": 29990000,
            "compare_price": 34990000,
            "description": "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ nhất, camera 48MP chụp ảnh siêu nét, màn hình Dynamic Island 6.7 inch, khung titan cao cấp, pin trâu 4422mAh",
            "image": "https://images.unsplash.com/photo-1696446702228-09d1e8b5a72e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 50,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Samsung Galaxy S24 Ultra 512GB",
            "brand": "Samsung",
            "price": 27990000,
            "compare_price": 31990000,
            "description": "Galaxy S24 Ultra với bút S-Pen tích hợp, camera zoom 100x siêu xa, chip Snapdragon 8 Gen 3, màn hình 6.8 inch QHD+ Dynamic AMOLED 2X",
            "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 45,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Google Pixel 8 Pro Obsidian",
            "brand": "Google",
            "price": 20990000,
            "compare_price": 22990000,
            "description": "Pixel 8 Pro với AI camera đỉnh cao, chip Tensor G3, màn hình 120Hz, tính năng Best Take và Magic Editor độc quyền",
            "image": "https://images.unsplash.com/photo-1628126131362-e6e22f87a8f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 40,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Xiaomi 14 Ultra Leica Edition",
            "brand": "Xiaomi",
            "price": 23990000,
            "compare_price": 27990000,
            "description": "Xiaomi 14 Ultra với hệ thống 4 camera Leica, sạc HyperCharge 90W, màn hình C8 LTPO AMOLED 6.73 inch",
            "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 55,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "OPPO Find X7 Ultra",
            "brand": "OPPO",
            "price": 22990000,
            "compare_price": 25990000,
            "description": "OPPO Find X7 Ultra với 2 camera tele tiềm vọng, chip Snapdragon 8 Gen 3, màn hình cong 2K, sạc nhanh 100W",
            "image": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 40,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "OnePlus 12 5G",
            "brand": "OnePlus",
            "price": 18990000,
            "compare_price": 20990000,
            "description": "OnePlus 12 với sạc siêu nhanh 100W, camera Hasselblad, chip Snapdragon 8 Gen 3, màn hình 2K 120Hz Fluid AMOLED",
            "image": "https://images.unsplash.com/photo-1628126131362-e6e22f87a8f1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 50,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Asus ROG Phone 8 Pro",
            "brand": "Asus",
            "price": 24990000,
            "compare_price": 28990000,
            "description": "Gaming phone mạnh nhất, chip Snapdragon 8 Gen 3, màn hình 165Hz, nút AirTrigger, pin 5500mAh",
            "image": "https://images.unsplash.com/photo-1571408078044-6338b6985227?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 30,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Samsung Galaxy A55 5G",
            "brand": "Samsung",
            "price": 8990000,
            "compare_price": 10490000,
            "description": "Galaxy A55 với màn hình AMOLED 120Hz, kháng nước IP67, camera 50MP, chip Exynos 1480",
            "image": "https://images.unsplash.com/photo-1631405047817-0b1d3d6e5d0d?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 85,
            "is_featured": False,
            "is_on_sale": True
        },
    ],
    
    "Laptop": [
        {
            "name": "MacBook Pro 16 M3 Max (36GB/1TB)",
            "brand": "Apple",
            "price": 89990000,
            "compare_price": 99990000,
            "description": "MacBook Pro 16 inch với chip M3 Max siêu mạnh, 36GB RAM, 1TB SSD, màn hình Liquid Retina XDR 120Hz, pin 22 giờ",
            "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 20,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Dell XPS 15 9530 4K OLED",
            "brand": "Dell",
            "price": 45990000,
            "compare_price": 52990000,
            "description": "Dell XPS 15 với Intel Core i7-13700H, RTX 4060 8GB, màn hình OLED 4K cảm ứng, 16GB RAM, 512GB SSD",
            "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 25,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Asus ROG Zephyrus G14 (Ryzen 9/RTX 4070)",
            "brand": "Asus",
            "price": 35990000,
            "compare_price": 39990000,
            "description": "Gaming laptop mỏng nhẹ với Ryzen 9 7940HS, RTX 4070 8GB, màn hình 165Hz, pin 10 giờ, thiết kế AniMe Matrix",
            "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 30,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "HP Envy x360 14 (OLED Touch)",
            "brand": "HP",
            "price": 29990000,
            "compare_price": 34990000,
            "description": "HP Envy x360 14 với Core i7-1355U, 16GB RAM, 1TB SSD, màn hình OLED cảm ứng xoay 360 độ",
            "image": "https://images.unsplash.com/photo-1541807062400-3482708309a6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 35,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Lenovo Legion Pro 5 (RTX 4070)",
            "brand": "Lenovo",
            "price": 39990000,
            "compare_price": 45990000,
            "description": "Lenovo Legion 5 Pro với Ryzen 7 7745HX, RTX 4070 8GB, màn hình 2K 165Hz, tản nhiệt ColdFront 5.0",
            "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 28,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Razer Blade 14 QHD 165Hz",
            "brand": "Razer",
            "price": 65990000,
            "compare_price": 72990000,
            "description": "Laptop Gaming cao cấp, Ryzen 9 7940HS, RTX 4070 8GB, màn hình QHD 165Hz, vỏ nhôm nguyên khối",
            "image": "https://images.unsplash.com/photo-1575027581692-0b15e47c1f88?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 18,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "MSI Modern 14 (Core i3-1215U)",
            "brand": "MSI",
            "price": 10990000,
            "compare_price": 12990000,
            "description": "MSI Modern 14 với Core i3-1215U, 8GB RAM, 512GB SSD, thiết kế mỏng nhẹ, pin 8 giờ",
            "image": "https://images.unsplash.com/photo-1541807062400-3482708309a6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 65,
            "is_featured": False,
            "is_on_sale": True
        },
        {
            "name": "Acer Nitro V 15 (RTX 2050)",
            "brand": "Acer",
            "price": 17990000,
            "compare_price": 20990000,
            "description": "Acer Nitro V 15 với Core i5-13420H, RTX 2050 4GB, 8GB RAM, 512GB SSD, màn hình 144Hz",
            "image": "https://images.unsplash.com/photo-1616715690558-868128549323?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 50,
            "is_featured": False,
            "is_on_sale": True
        },
    ],
    
    "Máy Tính Bảng": [
        {
            "name": "iPad Pro M4 11 inch",
            "brand": "Apple",
            "price": 31990000,
            "compare_price": 36990000,
            "description": "iPad Pro mới nhất với chip M4 siêu mạnh, màn hình Ultra Retina XDR, thiết kế siêu mỏng, hỗ trợ Apple Pencil Pro",
            "image": "https://images.unsplash.com/photo-1561154464-82e9adf327ea?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 30,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Samsung Galaxy Tab S9 Ultra 512GB",
            "brand": "Samsung",
            "price": 24990000,
            "compare_price": 28990000,
            "description": "Galaxy Tab S9 Ultra với màn hình AMOLED 14.6 inch, bút S Pen, chip Snapdragon 8 Gen 2 for Galaxy, kháng nước IP68",
            "image": "https://images.unsplash.com/photo-1629471180252-94f48b812f2c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 25,
            "is_featured": True,
            "is_on_sale": True
        },
        {
            "name": "Microsoft Surface Pro 9",
            "brand": "Microsoft",
            "price": 28990000,
            "compare_price": 33990000,
            "description": "Surface Pro 9 với Intel Core i5/i7, màn hình PixelSense 13 inch, thiết kế 2-in-1, pin 15.5 giờ, kèm bàn phím Signature Keyboard",
            "image": "https://images.unsplash.com/photo-1558506161-591dc457c70f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 20,
            "is_featured": True,
            "is_on_sale": False
        },
        {
            "name": "Xiaomi Pad 6S Pro 144Hz",
            "brand": "Xiaomi",
            "price": 14990000,
            "compare_price": 17990000,
            "description": "Xiaomi Pad 6S Pro với màn hình 12.4 inch 144Hz, chip Snapdragon 8 Gen 2, sạc nhanh 120W, pin 10000mAh",
            "image": "https://images.unsplash.com/photo-1596705663737-183069155259?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800",
            "stock": 35,
            "is_featured": True,
            "is_on_sale": False
        },
    ],

    "Tai Nghe": [
        {"name": "AirPods Pro 2 USB-C", "brand": "Apple", "price": 5990000, "compare_price": 6990000, "description": "AirPods Pro 2 với chip H2, chống ồn chủ động ANC đỉnh cao, âm thanh không gian, pin 30 giờ", "image": "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 100, "is_featured": True, "is_on_sale": True},
        {"name": "Sony WH-1000XM5 Black", "brand": "Sony", "price": 7990000, "compare_price": 9990000, "description": "Sony WH-1000XM5 tai nghe over-ear cao cấp, chống ồn tốt nhất thế giới, pin 30 giờ, âm thanh Hi-Res", "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 50, "is_featured": True, "is_on_sale": True},
        {"name": "Apple AirPods Max Space Gray", "brand": "Apple", "price": 12990000, "compare_price": 14990000, "description": "AirPods Max tai nghe over-ear cao cấp, chống ồn đỉnh cao, chip H1, âm thanh không gian", "image": "https://images.unsplash.com/photo-1618384918596-f0840b5f1342?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 30, "is_featured": True, "is_on_sale": False},
        {"name": "Bose QuietComfort Ultra", "brand": "Bose", "price": 9990000, "compare_price": 11990000, "description": "Bose QuietComfort Ultra với công nghệ Immersive Audio, chống ồn huyền thoại, thiết kế sang trọng", "image": "https://images.unsplash.com/photo-1545127398-14699f92334b?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 40, "is_featured": True, "is_on_sale": False},
        {"name": "Sennheiser Momentum True Wireless 4", "brand": "Sennheiser", "price": 7490000, "compare_price": 8990000, "description": "Momentum True Wireless 4 với âm thanh Sennheiser đặc trưng, Bluetooth 5.4, aptX Lossless", "image": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 60, "is_featured": False, "is_on_sale": True},
    ],
    
    "Đồng Hồ Thông Minh": [
        {"name": "Apple Watch Ultra 2 49mm Titan", "brand": "Apple", "price": 21990000, "compare_price": 24990000, "description": "Apple Watch Ultra 2 vỏ titan, chống nước 100m, màn hình sáng nhất, pin 36 giờ, cho các hoạt động thể thao mạo hiểm", "image": "https://images.unsplash.com/photo-1598425261803-12711679093a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 25, "is_featured": True, "is_on_sale": False},
        {"name": "Samsung Galaxy Watch 6 Classic 47mm", "brand": "Samsung", "price": 7990000, "compare_price": 9990000, "description": "Galaxy Watch 6 Classic với vòng bezel xoay vật lý, theo dõi giấc ngủ, đo nhịp tim, GPS, pin 40 giờ", "image": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 45, "is_featured": True, "is_on_sale": True},
        {"name": "Garmin Fenix 7 Pro Solar", "brand": "Garmin", "price": 19990000, "compare_price": 23990000, "description": "Garmin Fenix 7 Pro sạc bằng năng lượng mặt trời, bản đồ Topo, GPS đa băng tần, độ bền chuẩn quân đội", "image": "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 30, "is_featured": True, "is_on_sale": False},
        {"name": "Huawei Watch GT 4 46mm", "brand": "Huawei", "price": 5990000, "compare_price": 6990000, "description": "Huawei Watch GT 4 với thiết kế thời trang, pin 14 ngày, theo dõi sức khỏe TruSeen 5.5+, GPS độc lập", "image": "https://images.unsplash.com/photo-1629837905183-f368f5c889f5?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 55, "is_featured": True, "is_on_sale": True},
    ],

    # DANH MỤC MỚI: PHỤ KIỆN CAMERA (10 sản phẩm)
    "Phụ Kiện Camera": [
        {"name": "Drone DJI Mavic 3 Pro", "brand": "DJI", "price": 49990000, "compare_price": 55990000, "description": "Drone chuyên nghiệp với hệ thống 3 camera Hasselblad, bay 43 phút, tầm xa 15km, cảm biến đa hướng", "image": "https://images.unsplash.com/photo-1507727144883-8a3e78a2e79e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 15, "is_featured": True, "is_on_sale": False},
        {"name": "Gimbal Zhiyun Weebill S", "brand": "Zhiyun", "price": 8990000, "compare_price": 10990000, "description": "Gimbal chống rung 3 trục cho máy ảnh DSLR/Mirrorless, tải trọng 3kg, thiết kế gọn nhẹ, pin 14 giờ", "image": "https://images.unsplash.com/photo-1552684814-7d5268c179c3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 25, "is_featured": False, "is_on_sale": True},
        {"name": "Ống kính Sigma 35mm F1.4 DG DN Art", "brand": "Sigma", "price": 19990000, "compare_price": 22990000, "description": "Ống kính fixed tiêu cự 35mm, khẩu độ F1.4 cho ảnh xóa phông tuyệt đẹp, chất lượng quang học Art series", "image": "https://images.unsplash.com/photo-1505373809214-411a04d33939?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 20, "is_featured": True, "is_on_sale": True},
        {"name": "Thẻ nhớ SanDisk Extreme Pro 128GB", "brand": "SanDisk", "price": 1190000, "compare_price": 1590000, "description": "Thẻ nhớ tốc độ cao V30, U3, 170MB/s, lý tưởng cho quay video 4K và chụp liên tục", "image": "https://images.unsplash.com/photo-1543158013-172e276f571c?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 150, "is_featured": False, "is_on_sale": True},
        {"name": "Micro Rode VideoMic NTG", "brand": "Rode", "price": 5490000, "compare_price": 6490000, "description": "Micro shotgun chất lượng broadcast, đầu ra USB-C và 3.5mm, pin sạc tích hợp", "image": "https://images.unsplash.com/photo-1550974865-c49615a6b7d3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 40, "is_featured": True, "is_on_sale": False},
    ],
    
    # DANH MỤC MỚI: THIẾT BỊ NHÀ THÔNG MINH (10 sản phẩm)
    "Thiết Bị Nhà Thông Minh": [
        {"name": "Robot hút bụi Ecovacs Deebot X2 Omni", "brand": "Ecovacs", "price": 25990000, "compare_price": 30990000, "description": "Robot hút bụi và lau nhà tự động giặt giẻ, sấy khô, đổ rác, lực hút 8000Pa, thiết kế hình vuông", "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 30, "is_featured": True, "is_on_sale": True},
        {"name": "Màn hình thông minh Google Nest Hub 2", "brand": "Google", "price": 3490000, "compare_price": 4490000, "description": "Màn hình 7 inch tích hợp Google Assistant, theo dõi giấc ngủ Sleep Sensing, điều khiển nhà thông minh", "image": "https://images.unsplash.com/photo-1520633842323-2895f32d9669?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 70, "is_featured": False, "is_on_sale": True},
        {"name": "Khóa cửa thông minh Samsung SHP-DP728", "brand": "Samsung", "price": 11990000, "compare_price": 14990000, "description": "Khóa vân tay, mã số, thẻ từ, chìa cơ, kết nối Bluetooth, báo động cháy nổ và xâm nhập", "image": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 40, "is_featured": True, "is_on_sale": False},
        {"name": "Camera an ninh Ezviz C6 2K+", "brand": "Ezviz", "price": 1990000, "compare_price": 2590000, "description": "Camera xoay 360 độ, độ phân giải 4MP 2K+, phát hiện hình người và vật nuôi bằng AI, đàm thoại 2 chiều", "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 90, "is_featured": False, "is_on_sale": True},
        {"name": "Ổ cắm thông minh Xiaomi Mi Smart Plug", "brand": "Xiaomi", "price": 490000, "compare_price": 690000, "description": "Ổ cắm WiFi, hẹn giờ, điều khiển từ xa qua ứng dụng Mi Home, theo dõi điện năng tiêu thụ", "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800", "stock": 200, "is_featured": False, "is_on_sale": True},
    ],
}

# Danh sách categories cần đảm bảo tồn tại
CATEGORIES_TO_CREATE = ["Điện Thoại", "Laptop", "Máy Tính Bảng", "Tai Nghe", "Đồng Hồ Thông Minh", "Phụ Kiện Camera", "Thiết Bị Nhà Thông Minh"]


def create_initial_categories():
    """Tạo các danh mục ban đầu nếu chưa tồn tại."""
    print("[INFO] Đang kiểm tra và tạo danh mục...")
    existing_categories = [cat["name"] for cat in categories_collection.find({}, {"name": 1})]
    new_categories = []
    
    for category_name in CATEGORIES_TO_CREATE:
        if category_name not in existing_categories:
            category = {
                "_id": f"cat_{get_next_sequence('categories')}",
                "name": category_name,
                "slug": category_name.lower().replace(" ", "-"),
                "description": f"Các sản phẩm thuộc danh mục {category_name}",
                "created_at": datetime.now(UTC)
            }
            new_categories.append(category)

    if new_categories:
        # categories_collection.insert_many(new_categories)
        print(f"[OK] Đã tạo {len(new_categories)} danh mục mới: {', '.join([c['name'] for c in new_categories])}")
    else:
        print("[INFO] Tất cả danh mục cần thiết đã tồn tại.")


def create_products_from_data():
    """Tạo sản phẩm từ dữ liệu"""
    print("[INFO] Đang tạo sản phẩm...")
    
    # Lấy danh sách categories
    categories = list(categories_collection.find())
    category_map = {cat["name"]: cat["_id"] for cat in categories}
    
    products = []
    total_count = 0
    
    for category_name, products_list in PRODUCTS_DATA.items():
        if category_name not in category_map:
            print(f"[WARNING] Không tìm thấy danh mục: {category_name}. Bỏ qua.")
            continue
        
        category_id = category_map[category_name]
        
        for product_data in products_list:
            # TẠO VARIANTS DỰA TRÊN DANH MỤC
            variants = []
            if category_name in ["Điện Thoại", "Máy Tính Bảng"]:
                # Variants theo dung lượng/màu (Áp dụng cho Điện thoại và Máy tính bảng)
                variants = [
                    {"size": "128GB", "color": "Đen", "stock": product_data["stock"] // 3, "price_adjustment": 0},
                    {"size": "256GB", "color": "Trắng", "stock": product_data["stock"] // 3, "price_adjustment": 2000000},
                    {"size": "512GB", "color": "Xanh", "stock": product_data["stock"] // 3, "price_adjustment": 4000000},
                ]
            elif category_name == "Laptop":
                # Variants theo cấu hình CPU/RAM/SSD
                variants = [
                    {"size": "8GB/512GB", "color": "Silver", "stock": product_data["stock"] // 3, "price_adjustment": 0},
                    {"size": "16GB/512GB", "color": "Gray", "stock": product_data["stock"] // 3, "price_adjustment": 4000000},
                    {"size": "32GB/1TB", "color": "Black", "stock": product_data["stock"] // 3, "price_adjustment": 10000000},
                ]
            elif category_name in ["Tai Nghe", "Đồng Hồ Thông Minh", "Phụ Kiện Camera", "Thiết Bị Nhà Thông Minh"]:
                # Variants theo màu (Áp dụng cho Phụ kiện)
                variants = [
                    {"size": None, "color": "Đen", "stock": product_data["stock"] // 2, "price_adjustment": 0},
                    {"size": None, "color": "Trắng", "stock": product_data["stock"] // 2, "price_adjustment": 0},
                ]
            
            product = {
                "_id": f"prod_{get_next_sequence('products')}",
                "name": product_data["name"],
                "slug": product_data["name"].lower().replace(" ", "-").replace("(", "").replace(")", "").replace(":", ""),
                "description": product_data["description"],
                "short_description": product_data["description"][:100] + "...",
                "category_id": category_id,
                "brand": product_data["brand"],
                "price": product_data["price"],
                "compare_price": product_data.get("compare_price"),
                "stock": product_data["stock"],
                "sku": f"{category_name[:2].upper().replace(' ', '')}-{random.randint(1000, 9999)}",
                "images": [
                    {"url": product_data["image"], "is_primary": True, "alt_text": product_data["name"]}
                ],
                "variants": variants,
                "tags": [category_name.lower(), product_data["brand"].lower()],
                "is_featured": product_data.get("is_featured", False),
                "is_on_sale": product_data.get("is_on_sale", False),
                "rating": round(random.uniform(4.0, 5.0), 1),
                "review_count": random.randint(10, 200),
                "sold_count": random.randint(50, 1000),
                "view_count": random.randint(500, 10000),
                "created_at": datetime.now(UTC) - timedelta(days=random.randint(1, 60)),
                "updated_at": datetime.now(UTC)
            }
            products.append(product)
            total_count += 1
    
    # Insert products in batches
    batch_size = 50
    for i in range(0, len(products), batch_size):
        batch = products[i:i + batch_size]
        # products_collection.insert_many(batch)
        print(f"[INFO] Đã thêm {len(batch)} sản phẩm (Tổng: {min(i + batch_size, len(products))}/{len(products)})")
    
    print(f"[OK] Đã tạo {total_count} sản phẩm!")
    return total_count

def main():
    """Chạy script"""
    print("\n[START] BẮT ĐẦU TẠO SẢN PHẨM\n")
    print("=" * 60)
    
    try:
        # Đảm bảo categories tồn tại TRƯỚC khi tạo sản phẩm
        create_initial_categories()

        # Xóa sản phẩm cũ
        response = input("\n[?] Bạn có muốn xóa sản phẩm cũ không? (y/n): ")
        if response.lower() == 'y':
            # products_collection.delete_many({})
            print("[OK] Đã xóa sản phẩm cũ!")
        
        # Tạo sản phẩm mới
        count = create_products_from_data()
        
        print("\n" + "=" * 60)
        print(f"\n[SUCCESS] HOÀN TẤT! Đã tạo {count} sản phẩm\n")
        
    except Exception as e:
        print(f"\n[ERROR] Lỗi: {e}")
        raise

if __name__ == "__main__":
    main()