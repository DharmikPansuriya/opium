from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.shared_password import ShareStatus
from app.schemas.password import PasswordResponse
from app.schemas.user import UserResponse

class SharedPasswordBase(BaseModel):
    password_id: int
    shared_with_id: int
    expires_in_hours: int

class SharedPasswordCreate(SharedPasswordBase):
    pass

class SharedPasswordInDBBase(SharedPasswordBase):
    id: int
    status: ShareStatus
    expires_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SharedPassword(SharedPasswordInDBBase):
    pass

class SharedPasswordResponse(SharedPasswordInDBBase):
    password: PasswordResponse
    shared_with: UserResponse 