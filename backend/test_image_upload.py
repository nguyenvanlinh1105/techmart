#!/usr/bin/env python3
"""
Test script for image upload functionality
"""

import requests
import os
import sys

def test_image_upload():
    """Test the image upload endpoint"""
    
    # Create a simple test image file
    test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    # Save test image
    test_image_path = "test_image.png"
    with open(test_image_path, "wb") as f:
        f.write(test_image_content)
    
    try:
        # Test upload without authentication (should fail)
        print("Testing upload without authentication...")
        with open(test_image_path, "rb") as f:
            files = {"file": ("test.png", f, "image/png")}
            response = requests.post("http://localhost:8000/api/admin/upload/image", files=files)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ Authentication check working correctly")
        else:
            print("❌ Authentication check failed")
        
        # Test general upload endpoint
        print("\nTesting general upload endpoint...")
        with open(test_image_path, "rb") as f:
            files = {"file": ("test.png", f, "image/png")}
            response = requests.post("http://localhost:8000/api/upload/image", files=files)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ General upload authentication check working correctly")
        else:
            print("❌ General upload authentication check failed")
        
        # Check if uploads/products directory exists
        uploads_dir = "uploads/products"
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir, exist_ok=True)
            print(f"✅ Created {uploads_dir} directory")
        else:
            print(f"✅ {uploads_dir} directory already exists")
        
    finally:
        # Clean up
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            print("🧹 Cleaned up test image")

if __name__ == "__main__":
    test_image_upload()