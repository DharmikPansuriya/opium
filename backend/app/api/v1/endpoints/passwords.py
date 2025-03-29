from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.password import Password
from app.models.shared_password import SharedPassword, ShareStatus
from app.schemas.password import PasswordCreate, PasswordUpdate, PasswordResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=PasswordResponse)
def create_password(
    *,
    db: Session = Depends(get_db),
    password_in: PasswordCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new password.
    """
    encrypted_password = security.encrypt_password(password_in.password)
    password = Password(
        title=password_in.title,
        username=password_in.username,
        encrypted_password=encrypted_password,
        description=password_in.description,
        owner_id=current_user.id,
    )
    db.add(password)
    db.commit()
    db.refresh(password)
    return password

@router.get("/", response_model=List[PasswordResponse])
def read_passwords(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve passwords.
    """
    passwords = db.query(Password).filter(Password.owner_id == current_user.id).offset(skip).limit(limit).all()
    return passwords

@router.get("/{password_id}", response_model=PasswordResponse)
def read_password(
    *,
    db: Session = Depends(get_db),
    password_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get password by ID.
    """
    password = db.query(Password).filter(Password.id == password_id, Password.owner_id == current_user.id).first()
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    return password

@router.get("/{password_id}/decrypt")
def decrypt_password(
    *,
    db: Session = Depends(get_db),
    password_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Decrypt password by ID. Available for password owner or users with shared access.
    """
    # First check if user owns the password
    password = db.query(Password).filter(
        Password.id == password_id,
        Password.owner_id == current_user.id
    ).first()

    # If user doesn't own the password, check if it's shared with them
    if not password:
        shared_password = db.query(SharedPassword).filter(
            SharedPassword.password_id == password_id,
            SharedPassword.shared_with_id == current_user.id,
            SharedPassword.status == ShareStatus.ACTIVE,
            SharedPassword.expires_at > datetime.now().astimezone()
        ).first()
        
        if not shared_password:
            raise HTTPException(status_code=404, detail="Password not found or access denied")
        
        password = db.query(Password).filter(Password.id == password_id).first()
        if not password:
            raise HTTPException(status_code=404, detail="Password not found")
    
    decrypted_password = security.decrypt_password(password.encrypted_password)
    return {"password": decrypted_password}

@router.put("/{password_id}", response_model=PasswordResponse)
def update_password(
    *,
    db: Session = Depends(get_db),
    password_id: int,
    password_in: PasswordUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update password.
    """
    password = db.query(Password).filter(Password.id == password_id, Password.owner_id == current_user.id).first()
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    
    if password_in.password:
        password.encrypted_password = security.encrypt_password(password_in.password)
    if password_in.title:
        password.title = password_in.title
    if password_in.description:
        password.description = password_in.description
    
    db.add(password)
    db.commit()
    db.refresh(password)
    return password

@router.delete("/{password_id}")
def delete_password(
    *,
    db: Session = Depends(get_db),
    password_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete password.
    """
    password = db.query(Password).filter(Password.id == password_id, Password.owner_id == current_user.id).first()
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    
    db.delete(password)
    db.commit()
    return {"status": "success"} 