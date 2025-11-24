from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import all routers
from app.auth import router as auth_router
from app.products import router as products_router
from app.cart import router as cart_router
from app.orders import router as orders_router
from app.features import router as features_router
from app.admin import router as admin_router
from app.seller import router as seller_router
from app.analytics import router as analytics_router
from app.coupons import router as coupons_router
from app.reviews import router as reviews_router
from app.chat import router as chat_router

app = FastAPI(
    title="TechMart E-Commerce API",
    description="Complete E-Commerce API with 45 features",
    version="1.0.0"
)

# CORS configuration
# Development: Allow localhost on common ports
# Production: Replace with specific frontend domain
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,  # Enable cookies and auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Add global exception handler to ensure CORS headers are always present
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to ensure CORS headers are always present"""
    import traceback
    import sys
    
    # Get error detail safely, handling encoding issues
    try:
        error_detail = str(exc)
        # Try to print traceback, but catch encoding errors
        try:
            traceback.print_exc()
        except (UnicodeEncodeError, UnicodeDecodeError):
            # If encoding fails, use ASCII-safe error message
            print(f"[ERROR] Exception occurred: {type(exc).__name__}")
            error_detail = f"{type(exc).__name__}: {str(exc)}"
    except Exception:
        error_detail = "Internal server error (encoding issue prevented detailed message)"
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal server error: {error_detail}"
        },
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

# Mount static files for uploads
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    os.makedirs(os.path.join(uploads_dir, "chat"), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include all routers
app.include_router(auth_router)  # /api/auth/*
app.include_router(products_router)  # /api/products/*, /api/categories/*
app.include_router(cart_router)  # /api/cart/*
app.include_router(orders_router)  # /api/orders/*
app.include_router(features_router)  # /api/wishlist/*, /api/notifications/*
app.include_router(reviews_router)  # /api/reviews/*
app.include_router(admin_router)  # /api/admin/*
app.include_router(seller_router)  # /api/seller/*
app.include_router(analytics_router)  # /api/analytics/*
app.include_router(coupons_router)  # /api/coupons/*
app.include_router(chat_router)  # /api/chat/*

@app.get("/")
def root():
    return {
        "message": "TechMart E-Commerce API is running! 🚀✨",
        "version": "1.0.0",
        "docs": "/docs",
        "features": 45
    }

if __name__ == "__main__":
    import uvicorn
    import sys
    import io
    
    # Set UTF-8 encoding for stdout/stderr on Windows
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except:
            pass
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)