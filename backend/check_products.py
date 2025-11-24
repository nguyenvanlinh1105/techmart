from app.database import products_collection
import json

products = list(products_collection.find().limit(10))
print(f"Total products: {products_collection.count_documents({})}")
print("\nFirst 10 products:")
for p in products:
    print(f"  ID: {p['_id']}, Name: {p['name']}, Status: {p.get('approval_status', 'N/A')}")
