"""
Script to fix order counter if it gets out of sync
"""
from app.database import db

def fix_order_counter():
    """Set order counter to max(_id) + 1"""
    # Get all orders
    orders = list(db["orders"].find({}, {"_id": 1}))
    
    if not orders:
        # No orders, set counter to 1
        db["counters"].update_one(
            {"_id": "orders"},
            {"$set": {"seq": 1}},
            upsert=True
        )
        print("Counter set to 1 (no orders found)")
        return
    
    # Extract sequence numbers from order IDs
    seq_numbers = []
    for order in orders:
        order_id = order.get("_id", "")
        if isinstance(order_id, str) and order_id.startswith("order_"):
            try:
                seq = int(order_id.replace("order_", ""))
                seq_numbers.append(seq)
            except ValueError:
                print(f"Warning: Could not parse order_id: {order_id}")
    
    if seq_numbers:
        max_seq = max(seq_numbers)
        next_seq = max_seq + 1
    else:
        next_seq = 1
    
    # Update counter
    db["counters"].update_one(
        {"_id": "orders"},
        {"$set": {"seq": next_seq}},
        upsert=True
    )
    
    print(f"Counter fixed: max order sequence = {max(seq_numbers) if seq_numbers else 0}, next sequence = {next_seq}")

if __name__ == "__main__":
    fix_order_counter()

