import os
from fastapi import Depends, HTTPException, status, Cookie, Request
from jose import jwt, JWTError
from typing import Optional

JWT_SECRET = os.getenv("JWT_SECRET", "jwt-secret-key")
ALGORITHM  = "HS256"


def get_current_user(request: Request, token: Optional[str] = Cookie(default=None)):
    """
    Read JWT from:
    1. Authorization: Bearer <token>  (for axios with localStorage)
    2. httpOnly cookie 'token'        (fallback)
    """
    # Пробуем Authorization header сначала
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def require_artist(user: dict = Depends(get_current_user)):
    if user.get("role") not in ("artist", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Artists only",
        )
    return user


def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only",
        )
    return user
