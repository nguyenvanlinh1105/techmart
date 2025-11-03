from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import secrets
import os

from .models import (
    UserCreate, UserLogin, UserResponse, Token, UserUpdate,
    PasswordReset, PasswordResetConfirm, PasswordChange, Address, UserRole,
    SellerRegistration, SellerStatus
)
from .database import (
    users_collection, addresses_collection, log_activity,
    notifications_collection, get_next_sequence, create_notification_safe
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure user is admin"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_current_seller(current_user: dict = Depends(get_current_user)):
    """Dependency to ensure user is seller and approved"""
    if current_user.get("role") != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Seller account required."
        )
    
    seller_status = current_user.get("seller_status")
    if seller_status != SellerStatus.APPROVED:
        if seller_status == SellerStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seller account is pending approval. Please wait for admin approval."
            )
        elif seller_status == SellerStatus.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seller account has been rejected. Please contact admin."
            )
        elif seller_status == SellerStatus.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seller account has been suspended. Please contact admin."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seller account is not approved."
            )
    
    return current_user

# ==================== F01: Đăng ký tài khoản ====================
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Đăng ký tài khoản mới"""
    
    # Check if email already exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password"] = hash_password(user_dict["password"])
    user_dict["_id"] = f"user_{get_next_sequence('users')}"
    user_dict["is_verified"] = False
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    user_dict["addresses"] = []
    
    users_collection.insert_one(user_dict)
    
    # Log activity
    log_activity(user_dict["_id"], "USER_REGISTERED", {"email": user_data.email})
    
    # Create welcome notification
    create_notification_safe(
        user_id=user_dict["_id"],
        type="system",
        title="Chào mừng đến với TechMart!",
        message="Cảm ơn bạn đã đăng ký. Chúc bạn có trải nghiệm mua sắm tuyệt vời!"
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_dict["_id"]})
    
    # Prepare response - user_dict["role"] from UserCreate is already enum
    user_response = UserResponse(
        id=user_dict["_id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        phone=user_dict.get("phone"),
        avatar=user_dict.get("avatar"),
        role=user_dict["role"] if isinstance(user_dict["role"], UserRole) else UserRole(user_dict["role"]),
        seller_status=None,  # Regular users don't have seller_status
        store_name=None,  # Regular users don't have store_name
        is_verified=user_dict["is_verified"],
        created_at=user_dict["created_at"],
        addresses=user_dict["addresses"]
    )
    
    return Token(access_token=access_token, user=user_response)

# ==================== Seller Registration ====================
@router.post("/register-seller", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_seller(seller_data: SellerRegistration):
    """Đăng ký tài khoản người bán hàng (cần được admin duyệt)"""
    
    try:
        # Check if email already exists
        if users_collection.find_one({"email": seller_data.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if store name already exists
        if users_collection.find_one({"store_name": seller_data.store_name, "role": UserRole.SELLER.value}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Store name already exists"
            )
        
        # Create seller user
        user_dict = {
            "_id": f"user_{get_next_sequence('users')}",
            "email": seller_data.email,
            "password": hash_password(seller_data.password),
            "full_name": seller_data.full_name,
            "phone": seller_data.phone,
            "role": UserRole.SELLER.value,  # Convert enum to string
            "seller_status": SellerStatus.PENDING.value,  # Convert enum to string - Chờ duyệt
            "store_name": seller_data.store_name,
            "store_description": seller_data.store_description,
            "tax_code": seller_data.tax_code,
            "business_license": seller_data.business_license,
            "is_verified": False,
            "avatar": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "addresses": []
        }
        
        users_collection.insert_one(user_dict)
        
        # Log activity
        try:
            log_activity(user_dict["_id"], "SELLER_REGISTERED", {
                "email": seller_data.email,
                "store_name": seller_data.store_name
            })
        except Exception as e:
            print(f"[WARNING] Failed to log activity: {e}")
        
        # Create notification for seller
        try:
            create_notification_safe(
                user_id=user_dict["_id"],
                type="system",
                title="Đăng ký thành công",
                message=f"Tài khoản người bán '{seller_data.store_name}' đã được đăng ký. Vui lòng chờ admin duyệt."
            )
        except Exception as e:
            print(f"[WARNING] Failed to create notification: {e}")
        
        # TODO: Create notification for admin about new seller registration
        
        # Create access token so user can login immediately
        access_token = create_access_token(data={"sub": user_dict["_id"]})
        
        # Prepare response (similar to regular register)
        # Convert string back to enum for Pydantic validation
        try:
            # Ensure role is converted correctly
            role_str = user_dict["role"]
            if isinstance(role_str, str):
                role_enum = UserRole(role_str)
            else:
                role_enum = role_str
            
            # Ensure seller_status is converted correctly
            seller_status_str = user_dict.get("seller_status")
            seller_status_enum = None
            if seller_status_str:
                if isinstance(seller_status_str, str):
                    seller_status_enum = SellerStatus(seller_status_str)
                else:
                    seller_status_enum = seller_status_str
            
            user_response = UserResponse(
                id=user_dict["_id"],
                email=user_dict["email"],
                full_name=user_dict["full_name"],
                phone=user_dict.get("phone"),
                avatar=user_dict.get("avatar"),
                role=role_enum,
                seller_status=seller_status_enum,
                store_name=user_dict.get("store_name"),
                is_verified=user_dict["is_verified"],
                created_at=user_dict["created_at"],
                addresses=user_dict["addresses"] or []
            )
            
            return Token(access_token=access_token, user=user_response)
        
        except Exception as e:
            print(f"[ERROR] Failed to create UserResponse: {e}")
            print(f"[DEBUG] user_dict role: {user_dict.get('role')}, type: {type(user_dict.get('role'))}")
            print(f"[DEBUG] user_dict seller_status: {user_dict.get('seller_status')}, type: {type(user_dict.get('seller_status'))}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user response: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Seller registration failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

# ==================== F02: Đăng nhập ====================
@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Đăng nhập hệ thống"""
    
    user = users_collection.find_one({"email": user_data.email})
    
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Log activity
    log_activity(user["_id"], "USER_LOGIN", {"email": user_data.email})
    
    # Create access token
    access_token = create_access_token(data={"sub": user["_id"]})
    
    # Prepare response - Convert string to enum if needed
    role_value = user["role"] if isinstance(user["role"], UserRole) else UserRole(user["role"])
    seller_status_value = None
    if user.get("seller_status"):
        seller_status_value = user["seller_status"] if isinstance(user["seller_status"], SellerStatus) else SellerStatus(user["seller_status"])
    
    user_response = UserResponse(
        id=user["_id"],
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        avatar=user.get("avatar"),
        role=role_value,
        seller_status=seller_status_value,
        store_name=user.get("store_name"),
        is_verified=user.get("is_verified", False),
        created_at=user["created_at"],
        addresses=user.get("addresses", [])
    )
    
    return Token(access_token=access_token, user=user_response)

# ==================== F03: Lấy thông tin user hiện tại ====================
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Lấy thông tin user hiện tại"""
    # Convert string to enum if needed
    role_value = current_user["role"] if isinstance(current_user["role"], UserRole) else UserRole(current_user["role"])
    seller_status_value = None
    if current_user.get("seller_status"):
        seller_status_value = current_user["seller_status"] if isinstance(current_user["seller_status"], SellerStatus) else SellerStatus(current_user["seller_status"])
    
    return UserResponse(
        id=current_user["_id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user.get("phone"),
        avatar=current_user.get("avatar"),
        role=role_value,
        seller_status=seller_status_value,
        store_name=current_user.get("store_name"),
        is_verified=current_user.get("is_verified", False),
        created_at=current_user["created_at"],
        addresses=current_user.get("addresses", [])
    )

# ==================== F04: Quên mật khẩu ====================
@router.post("/forgot-password")
async def forgot_password(data: PasswordReset):
    """Gửi email reset password"""
    user = users_collection.find_one({"email": data.email})
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "reset_token": reset_token,
                "reset_token_expires": datetime.utcnow() + timedelta(hours=1)
            }
        }
    )
    
    # TODO: Send email with reset link
    # send_email(data.email, f"Reset link: /reset-password?token={reset_token}")
    
    log_activity(user["_id"], "PASSWORD_RESET_REQUESTED")
    
    return {"message": "If email exists, reset link has been sent"}

# ==================== F05: Reset mật khẩu ====================
@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm):
    """Reset password với token"""
    user = users_collection.find_one({
        "reset_token": data.token,
        "reset_token_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Update password
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": hash_password(data.new_password),
                "updated_at": datetime.utcnow()
            },
            "$unset": {"reset_token": "", "reset_token_expires": ""}
        }
    )
    
    log_activity(user["_id"], "PASSWORD_RESET_COMPLETED")
    
    return {"message": "Password has been reset successfully"}

# ==================== F07: Đổi mật khẩu ====================
@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Đổi mật khẩu (cần mật khẩu cũ)"""
    
    # Verify old password
    if not verify_password(password_data.old_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu cũ không đúng"
        )
    
    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải có ít nhất 6 ký tự"
        )
    
    # Update password
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "password": hash_password(password_data.new_password),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    log_activity(current_user["_id"], "PASSWORD_CHANGED")
    
    return {"message": "Mật khẩu đã được đổi thành công"}

# ==================== F06: Cập nhật thông tin user ====================
@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Cập nhật thông tin cá nhân"""
    
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    log_activity(current_user["_id"], "PROFILE_UPDATED", update_data)
    
    # Get updated user
    updated_user = users_collection.find_one({"_id": current_user["_id"]})
    
    return UserResponse(
        id=updated_user["_id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        phone=updated_user.get("phone"),
        avatar=updated_user.get("avatar"),
        role=updated_user["role"],
        is_verified=updated_user.get("is_verified", False),
        created_at=updated_user["created_at"],
        addresses=updated_user.get("addresses", [])
    )

# ==================== F06: Quản lý địa chỉ ====================
@router.post("/addresses", response_model=UserResponse)
async def add_address(
    address: Address,
    current_user: dict = Depends(get_current_user)
):
    """Thêm địa chỉ giao hàng mới"""
    
    address_dict = address.dict()
    address_dict["id"] = f"addr_{get_next_sequence('addresses')}"
    
    # If this is default address, unset others
    if address_dict.get("is_default"):
        users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"addresses.$[].is_default": False}}
        )
    
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$push": {"addresses": address_dict}}
    )
    
    log_activity(current_user["_id"], "ADDRESS_ADDED")
    
    updated_user = users_collection.find_one({"_id": current_user["_id"]})
    return UserResponse(
        id=updated_user["_id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        phone=updated_user.get("phone"),
        avatar=updated_user.get("avatar"),
        role=updated_user["role"],
        is_verified=updated_user.get("is_verified", False),
        created_at=updated_user["created_at"],
        addresses=updated_user.get("addresses", [])
    )

@router.delete("/addresses/{address_id}", response_model=UserResponse)
async def delete_address(
    address_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Xóa địa chỉ giao hàng"""
    
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$pull": {"addresses": {"id": address_id}}}
    )
    
    log_activity(current_user["_id"], "ADDRESS_DELETED", {"address_id": address_id})
    
    updated_user = users_collection.find_one({"_id": current_user["_id"]})
    return UserResponse(
        id=updated_user["_id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        phone=updated_user.get("phone"),
        avatar=updated_user.get("avatar"),
        role=updated_user["role"],
        is_verified=updated_user.get("is_verified", False),
        created_at=updated_user["created_at"],
        addresses=updated_user.get("addresses", [])
    )

@router.patch("/addresses/{address_id}/default", response_model=UserResponse)
async def set_default_address(
    address_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Đặt địa chỉ mặc định"""
    
    # Unset all defaults
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"addresses.$[].is_default": False}}
    )
    
    # Set new default
    users_collection.update_one(
        {"_id": current_user["_id"], "addresses.id": address_id},
        {"$set": {"addresses.$.is_default": True}}
    )
    
    log_activity(current_user["_id"], "DEFAULT_ADDRESS_SET", {"address_id": address_id})
    
    updated_user = users_collection.find_one({"_id": current_user["_id"]})
    return UserResponse(
        id=updated_user["_id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        phone=updated_user.get("phone"),
        avatar=updated_user.get("avatar"),
        role=updated_user["role"],
        is_verified=updated_user.get("is_verified", False),
        created_at=updated_user["created_at"],
        addresses=updated_user.get("addresses", [])
    )
