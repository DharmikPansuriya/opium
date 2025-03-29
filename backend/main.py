from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.security import setup_security

app = FastAPI(
    title="PVC - Password Vault for Companies",
    description="Secure password sharing platform for teams",
    version="1.0.0",
)

# Set up CORS with specific origins
origins = [
    "https://opium-manager.vercel.app",  # Production
    "http://localhost:3000",             # Local development
    "http://localhost:5173",             # Vite development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Set up security middleware
setup_security(app)

@app.get("/")
async def root():
    return {"message": "Welcome to PVC - Password Vault for Companies"} 