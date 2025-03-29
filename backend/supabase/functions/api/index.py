from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

# Import your existing application code
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.security import setup_security

# Create FastAPI app
app = FastAPI(
    title="PVC - Password Vault for Companies",
    description="Secure password sharing platform for teams",
    version="1.0.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Set up security middleware
setup_security(app)

@app.get("/")
async def root():
    return {"message": "Welcome to PVC - Password Vault for Companies"} 