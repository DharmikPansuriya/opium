from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse

class PasswordBase(BaseModel):
    title: str
    username: str
    description: Optional[str] = None

class PasswordCreate(PasswordBase):
    password: str

class PasswordUpdate(BaseModel):
    title: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    description: Optional[str] = None

class PasswordInDBBase(PasswordBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

class Password(PasswordInDBBase):
    pass

class PasswordResponse(PasswordInDBBase):
    owner: UserResponse 