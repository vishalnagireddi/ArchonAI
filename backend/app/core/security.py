import os
import hmac
import hashlib
import json
import base64
import time
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.database import get_db
from app.models.user import User

# Secret key for JWT signing
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "archon_secret_key_change_me_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

# Authentication schemes
api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

def base64url_encode(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).replace(b'=', b'').decode('utf-8')

def base64url_decode(payload: str) -> bytes:
    padding = '=' * (4 - len(payload) % 4)
    return base64.urlsafe_b64decode(payload + padding)

# Password hashing using PBKDF2 with SHA-256 (no external library required)
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_hex, key_hex = hashed_password.split(':')
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(key, new_key)
    except Exception:
        return False

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})
    
    header = {"alg": ALGORITHM, "typ": "JWT"}
    header_bytes = json.dumps(header).encode('utf-8')
    payload_bytes = json.dumps(to_encode).encode('utf-8')
    
    unsigned_token = f"{base64url_encode(header_bytes)}.{base64url_encode(payload_bytes)}"
    signature = hmac.new(SECRET_KEY.encode('utf-8'), unsigned_token.encode('utf-8'), hashlib.sha256).digest()
    
    return f"{unsigned_token}.{base64url_encode(signature)}"

def decode_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        unsigned_token = f"{parts[0]}.{parts[1]}"
        expected_signature = hmac.new(SECRET_KEY.encode('utf-8'), unsigned_token.encode('utf-8'), hashlib.sha256).digest()
        actual_signature = base64url_decode(parts[2])
        
        if not hmac.compare_digest(expected_signature, actual_signature):
            return None
        
        payload = json.loads(base64url_decode(parts[1]).decode('utf-8'))
        if payload.get("exp") and payload["exp"] < time.time():
            return None
            
        return payload
    except Exception:
        return None

# Dependency to fetch optional authenticated user
async def get_current_user_optional(
    authorization: Optional[str] = Depends(api_key_header),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    
    username: str = payload.get("sub")
    if not username:
        return None
        
    query = select(User).where(User.username == username)
    result = await db.execute(query)
    return result.scalar_one_or_none()

# Dependency to fetch strictly required authenticated user
async def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
