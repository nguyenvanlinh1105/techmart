"""
Script to create .env file for backend
"""
import os

def create_env_file():
    env_content = """# MongoDB Connection
MONGO_URI=mongodb://localhost:27017

# Database Name
DB_NAME=ecommert

# JWT Secret Key (Change this to a secure random string in production!)
SECRET_KEY=your-secret-key-change-this-in-production
"""
    
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    
    if os.path.exists(env_path):
        print(f"[WARNING] File .env already exists at: {env_path}")
        response = input("Do you want to overwrite it? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
    
    try:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print(f"[OK] File .env created successfully at: {env_path}")
        print("\nContent:")
        print("-" * 50)
        print(env_content)
        print("-" * 50)
        print("\nNote: File .env is already in .gitignore (will not be committed to Git)")
    except Exception as e:
        print(f"[ERROR] Failed to create .env file: {e}")

if __name__ == "__main__":
    create_env_file()

