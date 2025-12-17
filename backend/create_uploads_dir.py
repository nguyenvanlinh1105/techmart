import os

# Create uploads/products directory
uploads_dir = "uploads/products"
os.makedirs(uploads_dir, exist_ok=True)
print(f"Created directory: {uploads_dir}")

# List contents
print("Uploads directory contents:")
for item in os.listdir("uploads"):
    print(f"  - {item}")