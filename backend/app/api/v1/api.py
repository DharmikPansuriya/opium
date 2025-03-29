from fastapi import APIRouter
from app.api.v1.endpoints import auth, passwords, users, shared_passwords

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(passwords.router, prefix="/passwords", tags=["passwords"])
api_router.include_router(shared_passwords.router, prefix="/shared-passwords", tags=["shared-passwords"]) 