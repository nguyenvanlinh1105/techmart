from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from .auth import get_current_admin
from .database import (
    orders_collection, products_collection, users_collection,
    categories_collection
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

# Múi giờ Việt Nam (UTC+7)
VIETNAM_TZ = timezone(timedelta(hours=7))

def get_vietnam_now():
    """Lấy thời gian hiện tại theo múi giờ Việt Nam"""
    return datetime.now(VIETNAM_TZ)

def to_vietnam_time(dt):
    """Chuyển đổi datetime sang múi giờ Việt Nam"""
    if dt.tzinfo is None:
        # Nếu datetime không có timezone, giả định là UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(VIETNAM_TZ)

# ==================== DASHBOARD STATISTICS ====================

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=1, le=365)
):
    """
    Thống kê tổng quan cho dashboard
    - Doanh thu theo thời gian
    - Số đơn hàng
    - Sản phẩm bán chạy
    - Khách hàng mới
    """
    
    # Calculate date range (Vietnam timezone)
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days)
    
    # Get all orders in date range
    orders = list(orders_collection.find({
        "created_at": {"$gte": start_date, "$lte": end_date}
    }))
    
    # Calculate total revenue
    total_revenue = sum(float(order.get("total", 0)) for order in orders)
    
    # Calculate revenue by status
    revenue_by_status = defaultdict(float)
    for order in orders:
        status = order.get("status", "pending")
        revenue_by_status[status] += float(order.get("total", 0))
    
    # Count orders by status
    orders_by_status = defaultdict(int)
    for order in orders:
        status = order.get("status", "pending")
        orders_by_status[status] += 1
    
    # Revenue by day (for chart)
    revenue_by_day = defaultdict(float)
    orders_by_day = defaultdict(int)
    for order in orders:
        date_key = order["created_at"].strftime("%Y-%m-%d")
        revenue_by_day[date_key] += float(order.get("total", 0))
        orders_by_day[date_key] += 1
    
    # Sort by date
    revenue_chart = [
        {"date": date, "revenue": revenue, "orders": orders_by_day[date]}
        for date, revenue in sorted(revenue_by_day.items())
    ]
    
    # Get new users in period
    new_users = users_collection.count_documents({
        "created_at": {"$gte": start_date, "$lte": end_date}
    })
    
    # Total users
    total_users = users_collection.count_documents({})
    
    # Total products
    total_products = products_collection.count_documents({})
    
    # Products low stock (< 10)
    low_stock_products = products_collection.count_documents({
        "stock": {"$lt": 10, "$gt": 0}
    })
    
    # Out of stock products
    out_of_stock = products_collection.count_documents({
        "stock": 0
    })
    
    # Average order value
    avg_order_value = total_revenue / len(orders) if orders else 0
    
    # Compare with previous period
    prev_start = start_date - timedelta(days=days)
    prev_orders = list(orders_collection.find({
        "created_at": {"$gte": prev_start, "$lt": start_date}
    }))
    prev_revenue = sum(float(order.get("total", 0)) for order in prev_orders)
    
    revenue_growth = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
    orders_growth = ((len(orders) - len(prev_orders)) / len(prev_orders) * 100) if prev_orders else 0
    
    return {
        "overview": {
            "total_revenue": total_revenue,
            "total_orders": len(orders),
            "total_users": total_users,
            "new_users": new_users,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
            "out_of_stock": out_of_stock,
            "avg_order_value": avg_order_value,
            "revenue_growth": revenue_growth,
            "orders_growth": orders_growth
        },
        "revenue_by_status": dict(revenue_by_status),
        "orders_by_status": dict(orders_by_status),
        "revenue_chart": revenue_chart,
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        }
    }

@router.get("/top-products")
async def get_top_products(
    current_user: dict = Depends(get_current_admin),
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(30, ge=1, le=365)
):
    """
    Sản phẩm bán chạy nhất
    """
    
    # Get products sorted by sold_count
    products = list(
        products_collection
        .find({})
        .sort("sold_count", -1)
        .limit(limit)
    )
    
    result = []
    for product in products:
        result.append({
            "id": product["_id"],
            "name": product["name"],
            "sold_count": product.get("sold_count", 0),
            "revenue": product.get("sold_count", 0) * product["price"],
            "stock": product.get("stock", 0),
            "price": product["price"],
            "image": product.get("images", [{}])[0].get("url") if product.get("images") else None
        })
    
    return result

@router.get("/top-categories")
async def get_top_categories(
    current_user: dict = Depends(get_current_admin),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Danh mục bán chạy nhất
    """
    
    # Get all products with sold_count
    products = list(products_collection.find({}))
    
    # Group by category
    category_stats = defaultdict(lambda: {"sold_count": 0, "revenue": 0, "product_count": 0})
    
    for product in products:
        cat_id = product.get("category_id")
        if cat_id:
            category_stats[cat_id]["sold_count"] += product.get("sold_count", 0)
            category_stats[cat_id]["revenue"] += product.get("sold_count", 0) * product["price"]
            category_stats[cat_id]["product_count"] += 1
    
    # Get category names
    result = []
    for cat_id, stats in category_stats.items():
        category = categories_collection.find_one({"_id": cat_id})
        if category:
            result.append({
                "id": cat_id,
                "name": category["name"],
                "icon": category.get("icon"),
                "sold_count": stats["sold_count"],
                "revenue": stats["revenue"],
                "product_count": stats["product_count"]
            })
    
    # Sort by revenue
    result.sort(key=lambda x: x["revenue"], reverse=True)
    
    return result[:limit]

@router.get("/revenue-by-category")
async def get_revenue_by_category(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=1, le=365)
):
    """
    Doanh thu theo danh mục (cho pie chart)
    """
    
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days)
    
    # Get orders in period
    orders = list(orders_collection.find({
        "created_at": {"$gte": start_date.replace(tzinfo=None), "$lte": end_date.replace(tzinfo=None)}
    }))
    
    # Calculate revenue by category
    category_revenue = defaultdict(float)
    
    for order in orders:
        for item in order.get("items", []):
            product = products_collection.find_one({"_id": item["product_id"]})
            if product:
                cat_id = product.get("category_id")
                if cat_id:
                    category_revenue[cat_id] += float(item.get("subtotal", 0))
    
    # Get category names
    result = []
    for cat_id, revenue in category_revenue.items():
        category = categories_collection.find_one({"_id": cat_id})
        if category:
            result.append({
                "category": category["name"],
                "revenue": revenue,
                "icon": category.get("icon")
            })
    
    # Sort by revenue
    result.sort(key=lambda x: x["revenue"], reverse=True)
    
    return result

@router.get("/customer-stats")
async def get_customer_stats(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=1, le=365)
):
    """
    Thống kê khách hàng
    """
    
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days)
    
    # Get orders in period
    orders = list(orders_collection.find({
        "created_at": {"$gte": start_date, "$lte": end_date}
    }))
    
    # Calculate customer stats
    customer_orders = defaultdict(lambda: {"count": 0, "total": 0})
    
    for order in orders:
        user_id = order.get("user_id")
        customer_orders[user_id]["count"] += 1
        customer_orders[user_id]["total"] += float(order.get("total", 0))
    
    # Get top customers
    top_customers = []
    for user_id, stats in customer_orders.items():
        user = users_collection.find_one({"_id": user_id})
        if user:
            top_customers.append({
                "id": user_id,
                "name": user.get("full_name", "Unknown"),
                "email": user.get("email"),
                "order_count": stats["count"],
                "total_spent": stats["total"],
                "avg_order_value": stats["total"] / stats["count"]
            })
    
    # Sort by total spent
    top_customers.sort(key=lambda x: x["total_spent"], reverse=True)
    
    # Customer segments
    total_customers = len(customer_orders)
    new_customers = sum(1 for stats in customer_orders.values() if stats["count"] == 1)
    returning_customers = total_customers - new_customers
    vip_customers = sum(1 for stats in customer_orders.values() if stats["total"] > 50000000)
    
    return {
        "total_customers": total_customers,
        "new_customers": new_customers,
        "returning_customers": returning_customers,
        "vip_customers": vip_customers,
        "top_customers": top_customers[:10]
    }

@router.get("/sales-forecast")
async def get_sales_forecast(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=7, le=90)
):
    """
    Dự đoán doanh thu (simple moving average)
    """
    
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days * 2)  # Get 2x data for better forecast
    
    # Get orders
    orders = list(orders_collection.find({
        "created_at": {"$gte": start_date, "$lte": end_date}
    }))
    
    # Revenue by day
    daily_revenue = defaultdict(float)
    for order in orders:
        date_key = order["created_at"].strftime("%Y-%m-%d")
        daily_revenue[date_key] += float(order.get("total", 0))
    
    # Calculate moving average
    sorted_dates = sorted(daily_revenue.keys())
    revenues = [daily_revenue[date] for date in sorted_dates]
    
    # Simple moving average for next 7 days
    if len(revenues) >= 7:
        avg_revenue = sum(revenues[-7:]) / 7
    else:
        avg_revenue = sum(revenues) / len(revenues) if revenues else 0
    
    # Forecast next 7 days
    forecast = []
    for i in range(1, 8):
        forecast_date = end_date + timedelta(days=i)
        forecast.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_revenue": avg_revenue,
            "confidence": "medium"
        })
    
    return {
        "historical_avg": avg_revenue,
        "forecast": forecast,
        "method": "simple_moving_average"
    }

# ==================== ADVANCED ANALYTICS ====================

@router.get("/revenue-analysis")
async def get_revenue_analysis(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=1, le=365)
):
    """
    Phân tích doanh thu đa chiều
    """
    
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days)
    
    orders = list(orders_collection.find({
        "created_at": {"$gte": start_date, "$lte": end_date}
    }))
    
    # Revenue by hour of day
    revenue_by_hour = defaultdict(float)
    orders_by_hour = defaultdict(int)
    
    # Revenue by day of week
    revenue_by_dow = defaultdict(float)
    orders_by_dow = defaultdict(int)
    
    # Revenue by payment method
    revenue_by_payment = defaultdict(float)
    
    # Revenue by status
    revenue_by_status = defaultdict(float)
    
    for order in orders:
        # Chuyển đổi sang múi giờ Việt Nam
        order_time = to_vietnam_time(order["created_at"]) if order["created_at"].tzinfo else order["created_at"].replace(tzinfo=timezone.utc)
        order_time_vn = order_time.astimezone(VIETNAM_TZ)
        hour = order_time_vn.hour
        dow = order_time_vn.strftime("%A")
        total = float(order.get("total", 0))
        
        revenue_by_hour[hour] += total
        orders_by_hour[hour] += 1
        
        revenue_by_dow[dow] += total
        orders_by_dow[dow] += 1
        
        payment_method = order.get("payment_method", "unknown")
        revenue_by_payment[payment_method] += total
        
        status = order.get("status", "pending")
        revenue_by_status[status] += total
    
    # Calculate peak hours
    peak_hour = max(revenue_by_hour.items(), key=lambda x: x[1])[0] if revenue_by_hour else 0
    peak_day = max(revenue_by_dow.items(), key=lambda x: x[1])[0] if revenue_by_dow else "Unknown"
    
    return {
        "by_hour": [
            {
                "hour": hour,
                "revenue": revenue,
                "orders": orders_by_hour[hour],
                "avg_order_value": revenue / orders_by_hour[hour] if orders_by_hour[hour] > 0 else 0
            }
            for hour, revenue in sorted(revenue_by_hour.items())
        ],
        "by_day_of_week": [
            {
                "day": day,
                "revenue": revenue,
                "orders": orders_by_dow[day],
                "avg_order_value": revenue / orders_by_dow[day] if orders_by_dow[day] > 0 else 0
            }
            for day, revenue in sorted(revenue_by_dow.items())
        ],
        "by_payment_method": dict(revenue_by_payment),
        "by_status": dict(revenue_by_status),
        "insights": {
            "peak_hour": peak_hour,
            "peak_day": peak_day,
            "most_used_payment": max(revenue_by_payment.items(), key=lambda x: x[1])[0] if revenue_by_payment else "unknown"
        }
    }

@router.get("/customer-rfm")
async def get_customer_rfm_analysis(
    current_user: dict = Depends(get_current_admin)
):
    """
    Phân tích RFM (Recency, Frequency, Monetary) khách hàng
    """
    
    now = get_vietnam_now()
    
    # Get all orders
    orders = list(orders_collection.find({}))
    
    # Calculate RFM for each customer
    customer_rfm = defaultdict(lambda: {
        "recency": 999,  # Days since last order
        "frequency": 0,  # Number of orders
        "monetary": 0,  # Total spent
        "last_order": None,
        "first_order": None
    })
    
    for order in orders:
        user_id = order.get("user_id")
        order_date = order["created_at"]
        # Chuyển đổi sang múi giờ Việt Nam để tính toán
        if order_date.tzinfo is None:
            order_date = order_date.replace(tzinfo=timezone.utc)
        order_date_vn = order_date.astimezone(VIETNAM_TZ)
        total = float(order.get("total", 0))
        
        # Recency (tính theo múi giờ Việt Nam)
        days_since = (now - order_date_vn).days
        if days_since < customer_rfm[user_id]["recency"]:
            customer_rfm[user_id]["recency"] = days_since
            customer_rfm[user_id]["last_order"] = order_date_vn
        
        # Frequency
        customer_rfm[user_id]["frequency"] += 1
        
        # Monetary
        customer_rfm[user_id]["monetary"] += total
        
        # First order
        if not customer_rfm[user_id]["first_order"] or order_date_vn < customer_rfm[user_id]["first_order"]:
            customer_rfm[user_id]["first_order"] = order_date_vn
    
    # Score RFM (1-5 scale)
    rfm_list = []
    for user_id, rfm in customer_rfm.items():
        user = users_collection.find_one({"_id": user_id})
        if not user:
            continue
        
        # Simple scoring
        r_score = 5 if rfm["recency"] <= 30 else (4 if rfm["recency"] <= 60 else (3 if rfm["recency"] <= 90 else (2 if rfm["recency"] <= 180 else 1)))
        f_score = 5 if rfm["frequency"] >= 10 else (4 if rfm["frequency"] >= 5 else (3 if rfm["frequency"] >= 3 else (2 if rfm["frequency"] >= 2 else 1)))
        m_score = 5 if rfm["monetary"] >= 50000000 else (4 if rfm["monetary"] >= 20000000 else (3 if rfm["monetary"] >= 10000000 else (2 if rfm["monetary"] >= 5000000 else 1)))
        
        rfm_score = f"{r_score}{f_score}{m_score}"
        
        # Segment
        if r_score >= 4 and f_score >= 4 and m_score >= 4:
            segment = "Champions"
        elif r_score >= 3 and f_score >= 3:
            segment = "Loyal Customers"
        elif r_score >= 4:
            segment = "Potential Loyalists"
        elif r_score <= 2 and f_score >= 3:
            segment = "At Risk"
        elif r_score <= 2:
            segment = "Lost"
        else:
            segment = "Regular"
        
        rfm_list.append({
            "user_id": user_id,
            "name": user.get("full_name", "Unknown"),
            "email": user.get("email"),
            "recency": rfm["recency"],
            "frequency": rfm["frequency"],
            "monetary": rfm["monetary"],
            "r_score": r_score,
            "f_score": f_score,
            "m_score": m_score,
            "rfm_score": rfm_score,
            "segment": segment,
            "avg_order_value": rfm["monetary"] / rfm["frequency"],
            "customer_lifetime": (now - rfm["first_order"]).days if rfm["first_order"] else 0
        })
    
    # Sort by monetary value
    rfm_list.sort(key=lambda x: x["monetary"], reverse=True)
    
    # Segment distribution
    segment_dist = defaultdict(int)
    for customer in rfm_list:
        segment_dist[customer["segment"]] += 1
    
    return {
        "customers": rfm_list[:50],  # Top 50
        "segment_distribution": dict(segment_dist),
        "total_customers": len(rfm_list)
    }

@router.get("/product-performance")
async def get_product_performance(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Phân tích hiệu suất sản phẩm chi tiết
    """
    
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days)
    
    # Get orders in period
    orders = list(orders_collection.find({
        "created_at": {"$gte": start_date, "$lte": end_date}
    }))
    
    # Calculate product metrics
    product_metrics = defaultdict(lambda: {
        "sold_count": 0,
        "revenue": 0,
        "orders": 0,
        "returns": 0,
        "views": 0
    })
    
    for order in orders:
        for item in order.get("items", []):
            product_id = item["product_id"]
            product_metrics[product_id]["sold_count"] += item["quantity"]
            product_metrics[product_id]["revenue"] += float(item.get("subtotal", 0))
            product_metrics[product_id]["orders"] += 1
            
            if order.get("status") == "returned":
                product_metrics[product_id]["returns"] += item["quantity"]
    
    # Get product details and calculate additional metrics
    result = []
    for product_id, metrics in product_metrics.items():
        product = products_collection.find_one({"_id": product_id})
        if not product:
            continue
        
        # Calculate profit (if cost_price available)
        cost_price = product.get("cost_price", 0)
        profit = (product["price"] - cost_price) * metrics["sold_count"]
        profit_margin = ((product["price"] - cost_price) / product["price"] * 100) if product["price"] > 0 else 0
        
        # Return rate
        return_rate = (metrics["returns"] / metrics["sold_count"] * 100) if metrics["sold_count"] > 0 else 0
        
        # Stock turnover
        stock_turnover = metrics["sold_count"] / product.get("stock", 1) if product.get("stock", 0) > 0 else 0
        
        result.append({
            "id": product_id,
            "name": product["name"],
            "category_id": product.get("category_id"),
            "price": product["price"],
            "cost_price": cost_price,
            "stock": product.get("stock", 0),
            "sold_count": metrics["sold_count"],
            "revenue": metrics["revenue"],
            "profit": profit,
            "profit_margin": profit_margin,
            "orders": metrics["orders"],
            "returns": metrics["returns"],
            "return_rate": return_rate,
            "avg_order_quantity": metrics["sold_count"] / metrics["orders"] if metrics["orders"] > 0 else 0,
            "stock_turnover": stock_turnover,
            "rating": product.get("rating", 0),
            "review_count": product.get("review_count", 0)
        })
    
    # Sort by revenue
    result.sort(key=lambda x: x["revenue"], reverse=True)
    
    return {
        "products": result[:limit],
        "summary": {
            "total_products": len(result),
            "total_revenue": sum(p["revenue"] for p in result),
            "total_profit": sum(p["profit"] for p in result),
            "avg_profit_margin": sum(p["profit_margin"] for p in result) / len(result) if result else 0
        }
    }

@router.get("/seller-performance")
async def get_seller_performance(
    current_user: dict = Depends(get_current_admin),
    days: int = Query(30, ge=1, le=365)
):
    """
    Thống kê hiệu suất người bán
    """
    
    end_date = get_vietnam_now()
    start_date = end_date - timedelta(days=days)
    
    # Get all sellers
    sellers = list(users_collection.find({"role": "seller", "seller_status": "approved"}))
    
    result = []
    for seller in sellers:
        seller_id = seller["_id"]
        
        # Get seller's products
        products = list(products_collection.find({"seller_id": seller_id}))
        
        # Get orders containing seller's products
        seller_revenue = 0
        seller_orders = 0
        seller_products_sold = 0
        
        orders = list(orders_collection.find({
            "created_at": {"$gte": start_date, "$lte": end_date}
        }))
        
        for order in orders:
            for item in order.get("items", []):
                if any(p["_id"] == item["product_id"] for p in products):
                    seller_revenue += float(item.get("subtotal", 0))
                    seller_orders += 1
                    seller_products_sold += item["quantity"]
        
        result.append({
            "seller_id": seller_id,
            "store_name": seller.get("store_name", "Unknown"),
            "email": seller.get("email"),
            "total_products": len(products),
            "active_products": len([p for p in products if p.get("stock", 0) > 0]),
            "revenue": seller_revenue,
            "orders": seller_orders,
            "products_sold": seller_products_sold,
            "avg_order_value": seller_revenue / seller_orders if seller_orders > 0 else 0
        })
    
    # Sort by revenue
    result.sort(key=lambda x: x["revenue"], reverse=True)
    
    return {
        "sellers": result,
        "summary": {
            "total_sellers": len(result),
            "total_revenue": sum(s["revenue"] for s in result),
            "total_orders": sum(s["orders"] for s in result)
        }
    }

@router.get("/comparison")
async def get_comparison_analysis(
    current_user: dict = Depends(get_current_admin),
    period1_days: int = Query(30, ge=1, le=365),
    period2_days: int = Query(30, ge=1, le=365)
):
    """
    So sánh hiệu suất giữa 2 kỳ
    """
    
    end_date = get_vietnam_now()
    
    # Period 1 (most recent)
    period1_start = end_date - timedelta(days=period1_days)
    period1_orders = list(orders_collection.find({
        "created_at": {"$gte": period1_start, "$lte": end_date}
    }))
    
    # Period 2 (previous)
    period2_end = period1_start
    period2_start = period2_end - timedelta(days=period2_days)
    period2_orders = list(orders_collection.find({
        "created_at": {"$gte": period2_start, "$lt": period2_end}
    }))
    
    def calculate_metrics(orders):
        return {
            "total_orders": len(orders),
            "total_revenue": sum(float(o.get("total", 0)) for o in orders),
            "avg_order_value": sum(float(o.get("total", 0)) for o in orders) / len(orders) if orders else 0,
            "total_items": sum(sum(item["quantity"] for item in o.get("items", [])) for o in orders)
        }
    
    period1_metrics = calculate_metrics(period1_orders)
    period2_metrics = calculate_metrics(period2_orders)
    
    # Calculate growth
    def calc_growth(current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        return ((current - previous) / previous) * 100
    
    return {
        "period1": {
            "start": period1_start.isoformat(),
            "end": end_date.isoformat(),
            "metrics": period1_metrics
        },
        "period2": {
            "start": period2_start.isoformat(),
            "end": period2_end.isoformat(),
            "metrics": period2_metrics
        },
        "growth": {
            "orders": calc_growth(period1_metrics["total_orders"], period2_metrics["total_orders"]),
            "revenue": calc_growth(period1_metrics["total_revenue"], period2_metrics["total_revenue"]),
            "avg_order_value": calc_growth(period1_metrics["avg_order_value"], period2_metrics["avg_order_value"]),
            "items": calc_growth(period1_metrics["total_items"], period2_metrics["total_items"])
        }
    }
