from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Opium"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://opium-manager.vercel.app"
    ]
    
    # Database
    DATABASE_URL: str
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    
    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return self.DATABASE_URL
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Encryption
    ENCRYPTION_KEY: str
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [str(origin) for origin in self.BACKEND_CORS_ORIGINS]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 