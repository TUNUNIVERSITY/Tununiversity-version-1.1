from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional
import os
from dotenv import load_dotenv

# Try to import passlib, use fallback if not available
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    USE_BCRYPT = True
except ImportError:
    print("WARNING: passlib not installed. Using fallback password hashing (less secure).")
    print("Please install: pip install passlib bcrypt")
    import hashlib
    import base64
    USE_BCRYPT = False

load_dotenv()

security = HTTPBearer()

# Same secret as auth-service
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt or fallback method"""
    # Debug logging
    print(f"🔐 hash_password called with type: {type(password)}, value: {repr(password)[:100]}")
    
    # Validate input type
    if not isinstance(password, str):
        raise ValueError(f"Password must be a string, got {type(password)}")
    
    # Trim whitespace
    password = password.strip()
    
    # Check if password is empty
    if not password:
        raise ValueError("Password cannot be empty")
    
    # Check byte length before encoding
    password_bytes = password.encode('utf-8')
    print(f"📏 Password byte length: {len(password_bytes)} bytes")
    
    # Ensure password doesn't exceed 72 bytes for bcrypt
    if len(password_bytes) > 72:
        print(f"⚠️  Password exceeds 72 bytes, truncating from {len(password_bytes)} bytes")
        # Truncate string to ensure encoded bytes don't exceed 72
        while len(password.encode('utf-8')) > 72:
            password = password[:-1]
        password_bytes = password.encode('utf-8')
        print(f"✂️  Truncated to {len(password_bytes)} bytes")
    
    if USE_BCRYPT:
        hashed = pwd_context.hash(password)
        print(f"✅ Password hashed successfully using bcrypt")
        return hashed
    else:
        # Fallback: PBKDF2 with SHA256
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        storage = salt + key
        hashed = base64.b64encode(storage).decode('utf-8')
        print(f"✅ Password hashed successfully using PBKDF2")
        return hashed


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    if USE_BCRYPT:
        return pwd_context.verify(plain_password, hashed_password)
    else:
        # Fallback verification
        try:
            storage = base64.b64decode(hashed_password.encode('utf-8'))
            salt = storage[:32]
            stored_key = storage[32:]
            key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
            return key == stored_key
        except:
            return False


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token and return user info
    """
    token = credentials.credentials

    try:
        # Decode token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload  # Returns { userId, email, role }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def require_role(*allowed_roles: str):
    """
    Decorator to require specific roles
    Usage: @require_role("admin", "department_head")
    """

    def role_checker(current_user: dict = Depends(verify_token)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker