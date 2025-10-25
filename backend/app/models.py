from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    # thêm các trường khác nếu cần

class ProductCreate(Product):
    pass  # Nếu bạn chưa cần validate gì đặc biệt khi tạo mới