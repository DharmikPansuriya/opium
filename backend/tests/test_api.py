import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base
from main import app
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.db.session import get_db

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="module")
def test_user(db):
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        role=UserRole.USER
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="module")
def test_admin(db):
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword"),
        full_name="Admin User",
        role=UserRole.ADMIN
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

@pytest.fixture(scope="module")
def test_user_token(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "testpassword"}
    )
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def test_admin_token(client, test_admin):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_admin.email, "password": "adminpassword"}
    )
    return response.json()["access_token"]

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "newpassword",
            "full_name": "New User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"

def test_login_user(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_current_user(client, test_user_token):
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

def test_create_password(client, test_user_token):
    response = client.post(
        "/api/v1/passwords/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "title": "Test Password",
            "password": "testpass123",
            "description": "Test password description"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Password"
    assert data["description"] == "Test password description"

def test_get_passwords(client, test_user_token):
    response = client.get(
        "/api/v1/passwords/",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_share_password(client, test_user_token, test_admin):
    # First create a password
    create_response = client.post(
        "/api/v1/passwords/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "title": "Shared Password",
            "password": "sharedpass123",
            "description": "Password to share"
        }
    )
    password_id = create_response.json()["id"]

    # Share the password
    share_response = client.post(
        "/api/v1/shared-passwords/",
        headers={"Authorization": f"Bearer {test_user_token}"},
        json={
            "password_id": password_id,
            "shared_with_id": test_admin.id,
            "expires_in_hours": 24
        }
    )
    assert share_response.status_code == 200
    data = share_response.json()
    assert data["password_id"] == password_id
    assert data["shared_with_id"] == test_admin.id

def test_get_shared_passwords(client, test_admin_token):
    response = client.get(
        "/api/v1/shared-passwords/received",
        headers={"Authorization": f"Bearer {test_admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_admin_get_users(client, test_admin_token):
    response = client.get(
        "/api/v1/users/",
        headers={"Authorization": f"Bearer {test_admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_user_cannot_get_users(client, test_user_token):
    response = client.get(
        "/api/v1/users/",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 403 