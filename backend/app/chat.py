"""
Chat API - Realtime messaging system
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from .database import messages_collection, conversations_collection, get_next_sequence
from .auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# ==================== MODELS ====================

class Message:
    def __init__(self, conversation_id, sender_id, sender_name, content, message_type="text", image_url=None):
        self.conversation_id = conversation_id
        self.sender_id = sender_id
        self.sender_name = sender_name
        self.content = content
        self.message_type = message_type
        self.image_url = image_url
        self.created_at = datetime.utcnow()
        self.is_read = False

# ==================== USER ENDPOINTS ====================

@router.get("/conversations/my")
async def get_my_conversation(current_user: dict = Depends(get_current_user)):
    """Get or create conversation for current user"""
    
    # Find existing conversation
    conversation = conversations_collection.find_one({
        "user_id": current_user["_id"]
    })
    
    if not conversation:
        # Create new conversation
        conversation = {
            "_id": f"conv_{get_next_sequence('conversations')}",
            "user_id": current_user["_id"],
            "user_name": current_user.get("full_name") or current_user.get("name") or current_user["email"],
            "user_email": current_user["email"],
            "admin_id": None,
            "status": "open",
            "unread_count_user": 0,
            "unread_count_admin": 0,
            "last_message": None,
            "last_message_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        conversations_collection.insert_one(conversation)
    
    conversation["id"] = conversation["_id"]
    return conversation

@router.get("/messages/{conversation_id}")
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    before: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get messages in a conversation"""
    
    # Verify user owns this conversation
    conversation = conversations_collection.find_one({"_id": conversation_id})
    if not conversation or conversation["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Build query
    query = {"conversation_id": conversation_id}
    if before:
        query["created_at"] = {"$lt": datetime.fromisoformat(before)}
    
    # Get messages
    messages = list(
        messages_collection
        .find(query)
        .sort("created_at", -1)
        .limit(limit)
    )
    
    # Mark as read
    messages_collection.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": current_user["_id"]},
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    # Reset unread count
    conversations_collection.update_one(
        {"_id": conversation_id},
        {"$set": {"unread_count_user": 0}}
    )
    
    # Format response
    for msg in messages:
        msg["id"] = msg["_id"]
    
    return list(reversed(messages))

@router.post("/messages")
async def send_message(
    conversation_id: str = Form(...),
    content: str = Form(...),
    message_type: str = Form("text"),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Send a message"""
    
    # Verify conversation
    conversation = conversations_collection.find_one({"_id": conversation_id})
    if not conversation or conversation["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Handle image upload
    image_url = None
    if image:
        # Save image (simplified - in production use cloud storage)
        import os
        upload_dir = "uploads/chat"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{datetime.utcnow().timestamp()}_{image.filename}"
        file_path = f"{upload_dir}/{filename}"
        with open(file_path, "wb") as f:
            f.write(await image.read())
        
        # Return URL that can be accessed via static files
        image_url = f"http://localhost:8000/uploads/chat/{filename}"
    
    # Create message
    message = {
        "_id": f"msg_{get_next_sequence('messages')}",
        "conversation_id": conversation_id,
        "sender_id": current_user["_id"],
        "sender_name": current_user.get("full_name") or current_user.get("name") or current_user["email"],
        "sender_role": "user",
        "content": content,
        "message_type": message_type,
        "image_url": image_url,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    messages_collection.insert_one(message)
    
    # Update conversation
    conversations_collection.update_one(
        {"_id": conversation_id},
        {
            "$set": {
                "last_message": content[:100],
                "last_message_at": datetime.utcnow()
            },
            "$inc": {"unread_count_admin": 1}
        }
    )
    
    message["id"] = message["_id"]
    return message

# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/conversations")
async def get_all_conversations(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_admin)
):
    """Get all conversations (Admin only)"""
    
    query = {}
    if status:
        query["status"] = status
    
    conversations = list(
        conversations_collection
        .find(query)
        .sort("last_message_at", -1)
    )
    
    for conv in conversations:
        conv["id"] = conv["_id"]
    
    return conversations

@router.get("/admin/messages/{conversation_id}")
async def admin_get_messages(
    conversation_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_admin)
):
    """Get messages (Admin)"""
    
    messages = list(
        messages_collection
        .find({"conversation_id": conversation_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    
    # Mark as read
    messages_collection.update_many(
        {
            "conversation_id": conversation_id,
            "sender_role": "user",
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    # Reset unread count
    conversations_collection.update_one(
        {"_id": conversation_id},
        {"$set": {"unread_count_admin": 0}}
    )
    
    for msg in messages:
        msg["id"] = msg["_id"]
    
    return list(reversed(messages))

@router.post("/admin/messages")
async def admin_send_message(
    conversation_id: str = Form(...),
    content: str = Form(...),
    message_type: str = Form("text"),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_admin)
):
    """Send message as admin"""
    
    # Handle image
    image_url = None
    if image:
        import os
        upload_dir = "uploads/chat"
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{datetime.utcnow().timestamp()}_{image.filename}"
        file_path = f"{upload_dir}/{filename}"
        with open(file_path, "wb") as f:
            f.write(await image.read())
        
        # Return URL that can be accessed via static files
        image_url = f"http://localhost:8000/uploads/chat/{filename}"
    
    # Create message
    message = {
        "_id": f"msg_{get_next_sequence('messages')}",
        "conversation_id": conversation_id,
        "sender_id": current_user["_id"],
        "sender_name": "Admin",
        "sender_role": "admin",
        "content": content,
        "message_type": message_type,
        "image_url": image_url,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    
    messages_collection.insert_one(message)
    
    # Update conversation
    conversations_collection.update_one(
        {"_id": conversation_id},
        {
            "$set": {
                "last_message": content[:100],
                "last_message_at": datetime.utcnow(),
                "admin_id": current_user["_id"]
            },
            "$inc": {"unread_count_user": 1}
        }
    )
    
    message["id"] = message["_id"]
    return message

@router.put("/admin/conversations/{conversation_id}/status")
async def update_conversation_status(
    conversation_id: str,
    status: str,
    current_user: dict = Depends(get_current_admin)
):
    """Update conversation status"""
    
    conversations_collection.update_one(
        {"_id": conversation_id},
        {"$set": {"status": status}}
    )
    
    return {"message": "Status updated"}
