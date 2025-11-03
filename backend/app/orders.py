from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
import random
import string

from .models import (
    OrderCreate, OrderUpdate, OrderResponse,
    OrderStatus, PaymentStatus
)
from .database import (
    orders_collection, products_collection, carts_collection,
    coupons_collection, notifications_collection,
    get_next_sequence, log_activity, create_notification_safe
)
from .auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.digits, k=6))
    return f"ORD{timestamp}{random_str}"

# ==================== ORDER ROUTES (F18-F22) ====================

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Tạo đơn hàng mới
    F18: Thanh toán (Checkout)
    F19: Tạo đơn hàng
    """
    
    # Safe print function that handles encoding errors
    def safe_print(msg):
        try:
            print(msg)
        except UnicodeEncodeError:
            try:
                print(msg.encode('ascii', 'ignore').decode('ascii'))
            except:
                print("[LOG] (encoding error - message omitted)")
    
    try:
        # DEBUG: Log received data
        safe_print(f"\n{'='*60}")
        safe_print(f"[CREATE ORDER] User: {current_user.get('email')}")
        safe_print(f"{'='*60}")
        try:
            order_dump = order_data.model_dump()
            safe_print(f"Order Data: {order_dump}")
        except:
            safe_print(f"Order Data: (unable to dump)")
        safe_print(f"{'='*60}\n")
    except Exception as e:
        safe_print(f"[WARNING] Error logging order data: {e}")
    
    # Validate products and stock
    try:
        for item in order_data.items:
            product = products_collection.find_one({"_id": item.product_id})
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found"
                )
            
            # Get stock from product or default to 0
            product_stock = product.get("stock", 0)
            if product_stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock for {product.get('name', 'Product')}. Available: {product_stock}, Requested: {item.quantity}"
                )
    except HTTPException:
        raise
    except Exception as e:
        try:
            print(f"[ERROR] Error validating products: {e}")
        except UnicodeEncodeError:
            print("[ERROR] Error validating products (encoding error)")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating products: {str(e)}"
        )
    
    # Validate coupon if provided
    if order_data.coupon_code:
        coupon = coupons_collection.find_one({"code": order_data.coupon_code.upper()})
        
        if coupon:
            # Increment usage count
            coupons_collection.update_one(
                {"_id": coupon["_id"]},
                {"$inc": {"used_count": 1}}
            )
    
    # Create order
    try:
        order_dict = order_data.model_dump(exclude_none=True)  # Use model_dump() for Pydantic v2, exclude None values
    except AttributeError:
        order_dict = order_data.dict(exclude_none=True)  # Fallback for Pydantic v1
    
    # Clean up None values in items (variant should be omitted if None)
    for item in order_dict.get("items", []):
        if item.get("variant") is None:
            item.pop("variant", None)
    
    # Ensure we don't have 'id' field before inserting (only use _id)
    if "id" in order_dict:
        order_dict.pop("id", None)
    
    order_dict["_id"] = f"order_{get_next_sequence('orders')}"
    order_dict["user_id"] = current_user["_id"]  # Set user_id from current_user
    order_dict["order_number"] = generate_order_number()
    order_dict["status"] = OrderStatus.PENDING.value if hasattr(OrderStatus.PENDING, 'value') else OrderStatus.PENDING
    order_dict["payment_status"] = PaymentStatus.PENDING.value if hasattr(PaymentStatus.PENDING, 'value') else PaymentStatus.PENDING
    
    # Handle payment_method enum
    if isinstance(order_data.payment_method, str):
        order_dict["payment_method"] = order_data.payment_method
    else:
        order_dict["payment_method"] = order_data.payment_method.value if hasattr(order_data.payment_method, 'value') else str(order_data.payment_method)
    
    order_dict["created_at"] = datetime.utcnow()
    order_dict["updated_at"] = datetime.utcnow()
    order_dict["status_history"] = [{
        "status": order_dict["status"],
        "timestamp": datetime.utcnow(),
        "note": "Order created"
    }]
    
    # Ensure no 'id' field is saved to database (only _id)
    if "id" in order_dict:
        order_dict.pop("id", None)
    
    # Generate unique _id with retry logic to avoid duplicates
    max_retries = 5
    order_id = None
    for attempt in range(max_retries):
        try:
            sequence_num = get_next_sequence('orders')
            order_id = f"order_{sequence_num}"
            
            # Check if this _id already exists
            existing_order = orders_collection.find_one({"_id": order_id})
            if existing_order:
                # If exists, try next sequence (this shouldn't happen but handle it)
                safe_print(f"[WARNING] Order {order_id} already exists, retrying...")
                continue
            
            order_dict["_id"] = order_id
            orders_collection.insert_one(order_dict)
            break  # Success, exit retry loop
            
        except Exception as e:
            error_str = str(e)
            # Check if it's a duplicate key error
            if "E11000" in error_str or "duplicate key" in error_str.lower():
                if attempt < max_retries - 1:
                    safe_print(f"[WARNING] Duplicate key error for {order_id}, retrying... (attempt {attempt + 1}/{max_retries})")
                    continue  # Retry with new sequence
                else:
                    # Last attempt failed
                    try:
                        print(f"[ERROR] Failed to create unique order ID after {max_retries} attempts: {e}")
                    except UnicodeEncodeError:
                        print("[ERROR] Failed to create unique order ID (encoding error)")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to create order: Duplicate key error after retries"
                    )
            else:
                # Other errors
                try:
                    print(f"[ERROR] Error inserting order: {e}")
                except UnicodeEncodeError:
                    print("[ERROR] Error inserting order (encoding error)")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create order: {error_str}"
                )
    else:
        # All retries exhausted
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order: Unable to generate unique order ID"
        )
    
    # Update product stock and sold count
    for item in order_data.items:
        products_collection.update_one(
            {"_id": item.product_id},
            {
                "$inc": {
                    "stock": -item.quantity,
                    "sold_count": item.quantity
                }
            }
        )
    
    # Clear user's cart
    carts_collection.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"items": []}}
    )
    
    # Create notification (safe function handles retries)
    create_notification_safe(
        user_id=current_user["_id"],
        type="order",
        title="Đơn hàng đã được tạo",
        message=f"Đơn hàng #{order_dict['order_number']} đã được tạo thành công. Tổng tiền: {order_data.total:,} VNĐ",
        link=f"/orders/{order_dict['_id']}"
    )
    
    log_activity(current_user["_id"], "ORDER_CREATED", {
        "order_id": order_dict["_id"],
        "order_number": order_dict["order_number"],
        "total": order_data.total
    })
    
    # Map _id to id for Pydantic response model
    order_dict["id"] = order_dict["_id"]
    
    # Ensure all required fields are present for OrderResponse
    try:
        # Get the created order from DB to ensure all fields are correct
        created_order = orders_collection.find_one({"_id": order_dict["_id"]})
        if not created_order:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created order"
            )
        
        # Convert MongoDB ObjectId to string if needed
        created_order["id"] = str(created_order["_id"])
        
        # Ensure datetime fields are proper datetime objects
        if isinstance(created_order.get("created_at"), str):
            try:
                created_order["created_at"] = datetime.fromisoformat(created_order["created_at"].replace("Z", "+00:00"))
            except:
                created_order["created_at"] = datetime.utcnow()
        if isinstance(created_order.get("updated_at"), str):
            try:
                created_order["updated_at"] = datetime.fromisoformat(created_order["updated_at"].replace("Z", "+00:00"))
            except:
                created_order["updated_at"] = datetime.utcnow()
        
        # Ensure status_history items have proper datetime
        if created_order.get("status_history"):
            for hist_item in created_order["status_history"]:
                if isinstance(hist_item.get("timestamp"), str):
                    try:
                        hist_item["timestamp"] = datetime.fromisoformat(hist_item["timestamp"].replace("Z", "+00:00"))
                    except:
                        hist_item["timestamp"] = datetime.utcnow()
        
        # Ensure all required fields are present
        if "tracking_number" not in created_order:
            created_order["tracking_number"] = None
        if "status_history" not in created_order:
            created_order["status_history"] = []
        
        # Ensure all fields required by OrderResponse are present
        response_order = OrderResponse(**created_order)
        return response_order
        
    except Exception as e:
        try:
            print(f"[ERROR] Error creating OrderResponse: {e}")
            print(f"Order dict keys: {list(order_dict.keys())}")
        except UnicodeEncodeError:
            print("[ERROR] Error creating OrderResponse (encoding error)")
        
        import traceback
        try:
            traceback.print_exc()
        except (UnicodeEncodeError, UnicodeDecodeError):
            # If encoding fails, just print the error message
            try:
                print(f"[ERROR] Exception type: {type(e).__name__}")
            except:
                print("[ERROR] Exception (encoding error)")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order response: {str(e)}"
        )

@router.get("", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[OrderStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Lấy danh sách đơn hàng của user
    F20: Xem lịch sử đơn hàng
    """
    
    query = {"user_id": current_user["_id"]}
    
    if status_filter:
        query["status"] = status_filter
    
    skip = (page - 1) * limit
    
    orders = list(
        orders_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    # Map _id to id for each order (for response only, not saved to DB)
    result = []
    for order in orders:
        # Ensure _id exists
        if "_id" not in order:
            continue
        # Create a copy for response (don't modify original)
        order_response = order.copy()
        order_response["id"] = str(order_response["_id"])
        # Ensure datetime fields are proper
        if isinstance(order_response.get("created_at"), str):
            try:
                order_response["created_at"] = datetime.fromisoformat(order_response["created_at"].replace("Z", "+00:00"))
            except:
                order_response["created_at"] = datetime.utcnow()
        if isinstance(order_response.get("updated_at"), str):
            try:
                order_response["updated_at"] = datetime.fromisoformat(order_response["updated_at"].replace("Z", "+00:00"))
            except:
                order_response["updated_at"] = datetime.utcnow()
        result.append(OrderResponse(**order_response))
    
    return result

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Lấy chi tiết đơn hàng
    F22: Theo dõi trạng thái đơn hàng
    """
    
    order = orders_collection.find_one({
        "_id": order_id,
        "user_id": current_user["_id"]
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Create a copy for response (don't modify original)
    order_response = order.copy()
    order_response["id"] = str(order_response["_id"])
    
    # Ensure datetime fields are proper
    if isinstance(order_response.get("created_at"), str):
        try:
            order_response["created_at"] = datetime.fromisoformat(order_response["created_at"].replace("Z", "+00:00"))
        except:
            order_response["created_at"] = datetime.utcnow()
    if isinstance(order_response.get("updated_at"), str):
        try:
            order_response["updated_at"] = datetime.fromisoformat(order_response["updated_at"].replace("Z", "+00:00"))
        except:
            order_response["updated_at"] = datetime.utcnow()
    
    return OrderResponse(**order_response)

@router.patch("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Hủy đơn hàng
    F21: Hủy đơn hàng
    """
    
    order = orders_collection.find_one({
        "_id": order_id,
        "user_id": current_user["_id"]
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow cancel if order is pending or confirmed
    if order["status"] not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel order in current status"
        )
    
    # Update order status
    status_history = order.get("status_history", [])
    status_history.append({
        "status": OrderStatus.CANCELLED,
        "timestamp": datetime.utcnow(),
        "note": "Cancelled by customer"
    })
    
    orders_collection.update_one(
        {"_id": order_id},
        {
            "$set": {
                "status": OrderStatus.CANCELLED,
                "status_history": status_history,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Restore product stock
    for item in order["items"]:
        products_collection.update_one(
            {"_id": item["product_id"]},
            {
                "$inc": {
                    "stock": item["quantity"],
                    "sold_count": -item["quantity"]
                }
            }
        )
    
    # Create notification
    create_notification_safe(
        user_id=current_user["_id"],
        type="order",
        title="Đơn hàng đã bị hủy",
        message=f"Đơn hàng #{order['order_number']} đã được hủy",
        link=f"/orders/{order_id}"
    )
    
    log_activity(current_user["_id"], "ORDER_CANCELLED", {
        "order_id": order_id,
        "order_number": order["order_number"]
    })
    
    # Get updated order and map _id to id (for response only)
    updated_order = orders_collection.find_one({"_id": order_id})
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Create a copy for response
    order_response = updated_order.copy()
    order_response["id"] = str(order_response["_id"])
    
    # Ensure datetime fields are proper
    if isinstance(order_response.get("created_at"), str):
        try:
            order_response["created_at"] = datetime.fromisoformat(order_response["created_at"].replace("Z", "+00:00"))
        except:
            order_response["created_at"] = datetime.utcnow()
    if isinstance(order_response.get("updated_at"), str):
        try:
            order_response["updated_at"] = datetime.fromisoformat(order_response["updated_at"].replace("Z", "+00:00"))
        except:
            order_response["updated_at"] = datetime.utcnow()
    
    return {"message": "Order cancelled successfully", "order": OrderResponse(**order_response)}

# ==================== ADMIN ORDER ROUTES (F34) ====================

@router.get("/admin/all", response_model=List[OrderResponse])
async def get_all_orders(
    current_user: dict = Depends(get_current_admin),
    status_filter: Optional[OrderStatus] = None,
    payment_status: Optional[PaymentStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """Lấy tất cả đơn hàng (Admin only)"""
    
    query = {}
    
    if status_filter:
        query["status"] = status_filter
    
    if payment_status:
        query["payment_status"] = payment_status
    
    skip = (page - 1) * limit
    
    orders = list(
        orders_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    # Map _id to id for each order (for response only, not saved to DB)
    result = []
    for order in orders:
        # Ensure _id exists
        if "_id" not in order:
            continue
        # Create a copy for response (don't modify original)
        order_response = order.copy()
        order_response["id"] = str(order_response["_id"])
        # Ensure datetime fields are proper
        if isinstance(order_response.get("created_at"), str):
            try:
                order_response["created_at"] = datetime.fromisoformat(order_response["created_at"].replace("Z", "+00:00"))
            except:
                order_response["created_at"] = datetime.utcnow()
        if isinstance(order_response.get("updated_at"), str):
            try:
                order_response["updated_at"] = datetime.fromisoformat(order_response["updated_at"].replace("Z", "+00:00"))
            except:
                order_response["updated_at"] = datetime.utcnow()
        result.append(OrderResponse(**order_response))
    
    return result

@router.patch("/admin/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    order_update: OrderUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Cập nhật trạng thái đơn hàng (Admin only) - F34"""
    
    order = orders_collection.find_one({"_id": order_id})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    update_data = {}
    status_history = order.get("status_history", [])
    
    if order_update.status:
        update_data["status"] = order_update.status
        status_history.append({
            "status": order_update.status,
            "timestamp": datetime.utcnow(),
            "note": order_update.note or f"Status updated to {order_update.status}",
            "updated_by": current_user["_id"]
        })
    
    if order_update.payment_status:
        update_data["payment_status"] = order_update.payment_status
    
    if order_update.tracking_number:
        update_data["tracking_number"] = order_update.tracking_number
    
    update_data["status_history"] = status_history
    update_data["updated_at"] = datetime.utcnow()
    
    orders_collection.update_one(
        {"_id": order_id},
        {"$set": update_data}
    )
    
    # Create notification for user
    if order_update.status:
        status_messages = {
            OrderStatus.CONFIRMED: "da duoc xac nhan",
            OrderStatus.PROCESSING: "dang duoc xu ly",
            OrderStatus.SHIPPING: "dang duoc giao",
            OrderStatus.DELIVERED: "da duoc giao thanh cong",
            OrderStatus.CANCELLED: "da bi huy"
        }
        
        message = status_messages.get(order_update.status, "da duoc cap nhat")
        
        create_notification_safe(
            user_id=order["user_id"],
            type="order",
            title=f"Cập nhật đơn hàng #{order['order_number']}",
            message=f"Đơn hàng của bạn {message}",
            link=f"/orders/{order_id}"
        )
    
    log_activity(current_user["_id"], "ORDER_UPDATED", {
        "order_id": order_id,
        "updates": update_data
    })
    
    updated_order = orders_collection.find_one({"_id": order_id})
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Create a copy for response (don't modify original)
    order_response = updated_order.copy()
    order_response["id"] = str(order_response["_id"])
    
    # Ensure datetime fields are proper
    if isinstance(order_response.get("created_at"), str):
        try:
            order_response["created_at"] = datetime.fromisoformat(order_response["created_at"].replace("Z", "+00:00"))
        except:
            order_response["created_at"] = datetime.utcnow()
    if isinstance(order_response.get("updated_at"), str):
        try:
            order_response["updated_at"] = datetime.fromisoformat(order_response["updated_at"].replace("Z", "+00:00"))
        except:
            order_response["updated_at"] = datetime.utcnow()
    
    return OrderResponse(**order_response)

@router.get("/admin/stats")
async def get_order_stats(current_user: dict = Depends(get_current_admin)):
    """Thống kê đơn hàng (Admin only) - F36"""
    
    # Count orders by status
    total_orders = orders_collection.count_documents({})
    pending_orders = orders_collection.count_documents({"status": OrderStatus.PENDING})
    confirmed_orders = orders_collection.count_documents({"status": OrderStatus.CONFIRMED})
    shipping_orders = orders_collection.count_documents({"status": OrderStatus.SHIPPING})
    delivered_orders = orders_collection.count_documents({"status": OrderStatus.DELIVERED})
    cancelled_orders = orders_collection.count_documents({"status": OrderStatus.CANCELLED})
    
    # Calculate revenue
    pipeline = [
        {"$match": {"status": OrderStatus.DELIVERED}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
    ]
    
    revenue_result = list(orders_collection.aggregate(pipeline))
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "confirmed_orders": confirmed_orders,
        "shipping_orders": shipping_orders,
        "delivered_orders": delivered_orders,
        "cancelled_orders": cancelled_orders,
        "total_revenue": total_revenue,
        "average_order_value": total_revenue / delivered_orders if delivered_orders > 0 else 0
    }

