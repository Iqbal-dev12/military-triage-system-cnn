from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from app.database import get_db
from app.models import User
import hashlib
from dotenv import load_dotenv

load_dotenv()

# ================= CONFIG =================


SECRET_KEY = os.getenv("SECRET_KEY", "military_triage_super_secret_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# ================= PASSWORD =================

# Using pbkdf2_sha256 to avoid bcrypt version conflicts on Windows
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


import hashlib

def hash_password(password: str):
    password = password.strip()
    return pwd_context.hash(password)

def verify_password(password, hashed):
    password = password.strip()
    return pwd_context.verify(password, hashed)




# ================= JWT =================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ================= AUTH GUARD =================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User)\
        .filter(User.username == username)\
        .first()

    if user is None:
        raise credentials_exception

    return user
