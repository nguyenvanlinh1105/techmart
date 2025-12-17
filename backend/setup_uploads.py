#!/usr/bin/env python3
"""
Setup uploads directory for image uploads
"""

import os

def setup_uploads_directory():
    """Create uploads directory structure"""
    
    # Create main uploads directory
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print(f"✅ Created {uploads_dir} directory")
    else:
        print(f"✅ {uploads_dir} directory already exists")
    
    # Create products subdirectory
    products_dir = os.path.join(uploads_dir, "products")
    if not os.path.exists(products_dir):
        os.makedirs(products_dir)
        print(f"✅ Created {products_dir} directory")
    else:
        print(f"✅ {products_dir} directory already exists")
    
    # Create chat subdirectory (if not exists)
    chat_dir = os.path.join(uploads_dir, "chat")
    if not os.path.exists(chat_dir):
        os.makedirs(chat_dir)
        print(f"✅ Created {chat_dir} directory")
    else:
        print(f"✅ {chat_dir} directory already exists")
    
    # List directory contents
    print("\n📁 Uploads directory structure:")
    for root, dirs, files in os.walk(uploads_dir):
        level = root.replace(uploads_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            print(f"{subindent}{file}")
    
    print("\n🎉 Upload directories setup complete!")

if __name__ == "__main__":
    setup_uploads_directory()