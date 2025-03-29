from app.models.base import Base
from app.models.user import User
from app.models.password import Password
from app.models.shared_password import SharedPassword

# This ensures all models are registered with Base.metadata
__all__ = ['Base', 'User', 'Password', 'SharedPassword']