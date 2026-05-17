import os
from fastapi import Depends, HTTPException, status, Cookie
from jose import jwt, JWTError
from typing import Optional

JWT_SECRET = os.getenv("JWT_SECRET", "jwt-secret-key")
ALGORITHM  = "HS256"


def get_current_user(token: Optional[str] = Cookie(default=None)):
    """
    Читает JWT из httpOnly cookie "token".
    Возвращает payload: { id, name, role }
    """
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
    """Только артисты и админы могут создавать/редактировать работы."""
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
