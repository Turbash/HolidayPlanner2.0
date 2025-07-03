from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv
from database import TokenData, find_user_by_email, document_to_dict
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 settings
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")  # Using "/auth/login" as token URL

def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(email):
    try:
        user_data = find_user_by_email(email)
        # No need for serialize_id, as document_to_dict already handles this
        return user_data
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None

def authenticate_user(email, password):
    try:
        user = get_user(email)
        if not user:
            logger.warning(f"Authentication failed: User {email} not found")
            return False
            
        if "hashed_password" not in user:
            logger.error(f"Authentication failed: User {email} has no hashed_password")
            return False
            
        if not verify_password(password, user["hashed_password"]):
            logger.warning(f"Authentication failed: Invalid password for {email}")
            return False
            
        return user
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise credentials_exception
        
    user = get_user(email=token_data.email)
    if user is None:
        logger.error(f"User from token not found: {token_data.email}")
        raise credentials_exception
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
