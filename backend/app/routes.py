from fastapi import APIRouter
from app.database import db

router = APIRouter()

@router.get("/")
def get_products():
    products = list(db.products.find({}, {"_id": 0}))
    return {"products": products}
