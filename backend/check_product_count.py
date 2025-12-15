"""
Script để kiểm tra số lượng sản phẩm trong database
"""

from app.database import products_collection

def check_product_count():
    """Kiểm tra số lượng sản phẩm"""
    
    total_products = products_collection.count_documents({})
    print(f"[INFO] Tổng số sản phẩm trong database: {total_products}")
    
    # Kiểm tra sản phẩm theo approval_status
    approved_products = products_collection.count_documents({"approval_status": "approved"})
    legacy_products = products_collection.count_documents({"approval_status": {"$exists": False}})
    none_status = products_collection.count_documents({"approval_status": None})
    
    print(f"[INFO] Sản phẩm đã duyệt: {approved_products}")
    print(f"[INFO] Sản phẩm legacy (không có approval_status): {legacy_products}")
    print(f"[INFO] Sản phẩm có approval_status = None: {none_status}")
    
    # Tổng sản phẩm hiển thị được (approved + legacy + None)
    visible_products = approved_products + legacy_products + none_status
    print(f"[INFO] Tổng sản phẩm hiển thị được: {visible_products}")
    
    # Kiểm tra một vài sản phẩm mẫu
    sample_products = list(products_collection.find({}).limit(5))
    print(f"\n[INFO] Một vài sản phẩm mẫu:")
    for i, product in enumerate(sample_products, 1):
        print(f"  {i}. {product.get('name', 'N/A')} - Status: {product.get('approval_status', 'None')}")
    
    return total_products, visible_products

if __name__ == "__main__":
    print("\n[START] KIỂM TRA SỐ LƯỢNG SẢN PHẨM\n")
    print("=" * 50)
    
    try:
        total, visible = check_product_count()
        
        print("\n" + "=" * 50)
        if visible > 20:
            print(f"[OK] Có {visible} sản phẩm - Phân trang sẽ hiển thị!")
        else:
            print(f"[WARNING] Chỉ có {visible} sản phẩm - Cần ít nhất 21 để hiển thị phân trang!")
            print("[TIP] Chạy add_more_products.py để thêm sản phẩm!")
        
    except Exception as e:
        print(f"[ERROR] Lỗi: {e}")