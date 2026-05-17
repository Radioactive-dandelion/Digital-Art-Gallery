import os
import httpx
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from .. import models, schemas

router = APIRouter(tags=["artists"])

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8081")
INTERNAL_SECRET  = os.getenv("INTERNAL_SECRET", "internal-secret")


def fetch_artist_from_user_service(artist_id: int) -> dict:
    """
    Получает данные артиста из User Service через internal endpoint.
    Возвращает {} если сервис недоступен (graceful degradation).
    """
    try:
        url = f"{USER_SERVICE_URL}/internal/users/{artist_id}"
        res = httpx.get(url, headers={"x-internal-secret": INTERNAL_SECRET}, timeout=3.0)
        if res.status_code == 200:
            return res.json()
    except Exception as e:
        print(f"⚠️ Could not reach user-service: {e}")
    return {}


@router.get("/artists", response_model=List[schemas.ArtistOut])
def list_artists(db: Session = Depends(get_db)):
    """
    Список артистов — берём уникальные artist_id из artworks,
    для каждого запрашиваем данные из User Service.
    """
    # Получаем уникальных артистов у которых есть хотя бы 1 активная работа
    rows = (
        db.query(
            models.Artwork.artist_id,
            models.Artwork.artist_name,
            func.count(models.Artwork.id).label("works_count"),
        )
        .filter(models.Artwork.is_active == True)
        .group_by(models.Artwork.artist_id, models.Artwork.artist_name)
        .all()
    )

    result = []
    for row in rows:
        user_data = fetch_artist_from_user_service(row.artist_id)
        result.append(schemas.ArtistOut(
            id=row.artist_id,
            name=user_data.get("name", row.artist_name or "Unknown"),
            bio=user_data.get("bio"),
            avatar=user_data.get("avatar"),
            works_count=row.works_count,
        ))

    return result


@router.get("/artists/{artist_id}", response_model=schemas.ArtistOut)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    """Публичная страница артиста."""
    works_count = (
        db.query(func.count(models.Artwork.id))
        .filter(models.Artwork.artist_id == artist_id, models.Artwork.is_active == True)
        .scalar()
    )

    if works_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")

    user_data = fetch_artist_from_user_service(artist_id)

    # Берём имя из User Service или из денормализованного поля
    fallback_name = (
        db.query(models.Artwork.artist_name)
        .filter(models.Artwork.artist_id == artist_id)
        .scalar() or "Unknown"
    )

    return schemas.ArtistOut(
        id=artist_id,
        name=user_data.get("name", fallback_name),
        bio=user_data.get("bio"),
        avatar=user_data.get("avatar"),
        works_count=works_count,
    )


@router.get("/artists/{artist_id}/products", response_model=List[schemas.ArtworkOut])
def get_artist_artworks(artist_id: int, db: Session = Depends(get_db)):
    """Все активные работы конкретного артиста — для публичной страницы."""
    return (
        db.query(models.Artwork)
        .filter(models.Artwork.artist_id == artist_id, models.Artwork.is_active == True)
        .order_by(models.Artwork.created_at.desc())
        .all()
    )
