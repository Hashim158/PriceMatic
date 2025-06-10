from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import items, predict

app = FastAPI(
    title="FastAPI Supabase API",
    description="API with FastAPI and Supabase",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router, prefix="/api")
app.include_router(predict.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI with Supabase"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
