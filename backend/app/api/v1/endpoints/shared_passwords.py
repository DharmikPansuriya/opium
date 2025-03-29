from typing import Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.password import Password
from app.models.shared_password import SharedPassword, ShareStatus
from app.schemas.shared_password import SharedPasswordCreate, SharedPasswordResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=SharedPasswordResponse)
def share_password(
    *,
    db: Session = Depends(get_db),
    shared_password_in: SharedPasswordCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Share password with another user.
    """
    print(f"Attempting to share password {shared_password_in.password_id} with user {shared_password_in.shared_with_id}")  # Debug log
    
    # Check if password exists and belongs to current user
    password = db.query(Password).filter(
        Password.id == shared_password_in.password_id,
        Password.owner_id == current_user.id
    ).first()
    if not password:
        print(f"Password {shared_password_in.password_id} not found or not owned by user {current_user.id}")  # Debug log
        raise HTTPException(status_code=404, detail="Password not found")

    # Check if user exists
    shared_with_user = db.query(User).filter(User.id == shared_password_in.shared_with_id).first()
    if not shared_with_user:
        print(f"User {shared_password_in.shared_with_id} not found")  # Debug log
        raise HTTPException(status_code=404, detail="User not found")

    print(f"Found user {shared_with_user.email} to share with")  # Debug log

    # Create shared password with timezone-aware datetime
    expires_at = datetime.now().astimezone() + timedelta(hours=shared_password_in.expires_in_hours)
    shared_password = SharedPassword(
        password_id=shared_password_in.password_id,
        shared_with_id=shared_password_in.shared_with_id,
        expires_at=expires_at,
        status=ShareStatus.ACTIVE,
        expires_in_hours=shared_password_in.expires_in_hours
    )
    db.add(shared_password)
    db.commit()
    db.refresh(shared_password)
    
    print(f"Successfully shared password {password.title} with {shared_with_user.email}")  # Debug log
    return shared_password

@router.get("/received", response_model=List[SharedPasswordResponse])
def read_received_passwords(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve passwords shared with the current user.
    """
    # Get all active shares for the current user
    shared_passwords = (
        db.query(SharedPassword)
        .join(Password, SharedPassword.password_id == Password.id)
        .join(User, Password.owner_id == User.id)  # Join with User table to get sender info
        .filter(
            SharedPassword.shared_with_id == current_user.id,
            SharedPassword.status == ShareStatus.ACTIVE,
            SharedPassword.expires_at > datetime.now().astimezone()
        )
        .order_by(SharedPassword.created_at.desc())  # Order by most recent first
        .all()
    )
    
    # Create a dictionary to store the most recent share for each password
    latest_shares = {}
    for sp in shared_passwords:
        if sp.password_id not in latest_shares or sp.created_at > latest_shares[sp.password_id].created_at:
            latest_shares[sp.password_id] = sp
    
    # Convert back to list
    unique_shares = list(latest_shares.values())
    
    # Debug logging
    for sp in unique_shares:
        print(f"Found shared password: {sp.password.title} shared by {sp.password.owner.full_name}")
        print(f"Password owner details: {sp.password.owner.__dict__}")  # Debug log for owner details
    
    return unique_shares

@router.get("/shared", response_model=List[SharedPasswordResponse])
def read_shared_passwords(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve passwords shared by current user.
    """
    shared_passwords = db.query(SharedPassword).join(Password).filter(
        Password.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return shared_passwords

@router.post("/{shared_password_id}/revoke")
def revoke_shared_password(
    *,
    db: Session = Depends(get_db),
    shared_password_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Revoke shared password access.
    """
    shared_password = db.query(SharedPassword).join(Password).filter(
        SharedPassword.id == shared_password_id,
        Password.owner_id == current_user.id
    ).first()
    if not shared_password:
        raise HTTPException(status_code=404, detail="Shared password not found")
    
    shared_password.status = ShareStatus.REVOKED
    db.add(shared_password)
    db.commit()
    return {"status": "success"} 