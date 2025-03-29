from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class ShareStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

class SharedPassword(Base):
    __tablename__ = "shared_passwords"

    id = Column(Integer, primary_key=True, index=True)
    password_id = Column(Integer, ForeignKey("passwords.id"), nullable=False)
    shared_with_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ShareStatus), default=ShareStatus.ACTIVE)
    expires_at = Column(DateTime(timezone=True))
    expires_in_hours = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    password = relationship("Password", back_populates="shared_with")
    shared_with = relationship("User", back_populates="shared_passwords") 