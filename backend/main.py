from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as product_router

app = FastAPI(title="E-commerce API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product_router, prefix="/api/products", tags=["Products"])

@app.get("/")
def root():
    return {"message": "E-commerce API is running 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)