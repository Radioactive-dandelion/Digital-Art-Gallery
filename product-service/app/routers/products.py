import os
import shutil
from typing import List, Optional

from fastapi import (
    APIRouter, Depends, HTTPException, Query,
    UploadFile, File, Form, status, Request
)
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, require_artist, require_admin

router = APIRouter(tags=["artworks"])

UPLOAD_DIR = "uploads/artworks"
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET", "internal-secret")


# ── helpers ───────────────────────────────────────────────────────────────────

def save_image(file: UploadFile, artwork_id: int) -> str:
    """Сохраняет файл и возвращает путь для хранения в БД."""
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{artwork_id}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return f"/uploads/artworks/{filename}"


def get_artwork_or_404(artwork_id: int, db: Session) -> models.Artwork:
    artwork = db.query(models.Artwork).filter(models.Artwork.id == artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return artwork


# ══════════════════════════════════════════════════════════════════════════════
#  PUBLIC ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/products", response_model=List[schemas.ArtworkOut])
def list_artworks(
    db:        Session          = Depends(get_db),
    category:  Optional[str]   = None,
    medium:    Optional[str]   = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    artist_id: Optional[int]   = None,
    q:         Optional[str]   = Query(None, description="Search by title or artist name"),
    skip:      int              = 0,
    limit:     int              = Query(20, le=100),
):
    """Публичный список работ с фильтрацией и поиском."""
    query = db.query(models.Artwork).filter(models.Artwork.is_active == True)

    if category:
        query = query.filter(models.Artwork.category == category)
    if medium:
        query = query.filter(models.Artwork.medium == medium)
    if min_price is not None:
        query = query.filter(models.Artwork.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Artwork.price <= max_price)
    if artist_id:
        query = query.filter(models.Artwork.artist_id == artist_id)
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                models.Artwork.title.ilike(pattern),
                models.Artwork.artist_name.ilike(pattern),
                models.Artwork.description.ilike(pattern),
            )
        )

    return query.order_by(models.Artwork.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/products/search", response_model=List[schemas.ArtworkOut])
def search_artworks(
    q:        str            = Query(...),
    category: Optional[str] = None,
    db:       Session        = Depends(get_db),
):
    """Поиск по тексту (отдельный endpoint для совместимости с фронтом)."""
    pattern = f"%{q}%"
    query = db.query(models.Artwork).filter(
        models.Artwork.is_active == True,
        or_(
            models.Artwork.title.ilike(pattern),
            models.Artwork.description.ilike(pattern),
            models.Artwork.artist_name.ilike(pattern),
        )
    )
    if category:
        query = query.filter(models.Artwork.category == category)
    return query.all()


@router.get("/products/{product_id}", response_model=schemas.ArtworkOut)
def get_artwork(product_id: int, db: Session = Depends(get_db)):
    return get_artwork_or_404(product_id, db)


# ══════════════════════════════════════════════════════════════════════════════
#  ARTIST ROUTES — создание и управление своими работами
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/artist/products", response_model=List[schemas.ArtworkOut])
def get_my_artworks(
    db:   Session = Depends(get_db),
    user: dict    = Depends(require_artist),
):
    """Список своих работ для Artist Dashboard."""
    return (
        db.query(models.Artwork)
        .filter(models.Artwork.artist_id == user["id"])
        .order_by(models.Artwork.created_at.desc())
        .all()
    )


@router.post("/products", response_model=schemas.ArtworkOut, status_code=201)
async def create_artwork(
    title:       str             = Form(...),
    description: Optional[str]  = Form(None),
    price:       float           = Form(...),
    category:    Optional[str]  = Form(None),
    medium:      Optional[str]  = Form(None),
    image:       Optional[UploadFile] = File(None),
    db:          Session         = Depends(get_db),
    user:        dict            = Depends(require_artist),
):
    """Создать новую работу. Принимает multipart/form-data."""
    artwork = models.Artwork(
        title=title,
        description=description,
        price=price,
        category=category,
        medium=medium,
        artist_id=user["id"],
        artist_name=user.get("name", ""),
    )
    db.add(artwork)
    db.commit()
    db.refresh(artwork)

    # Сохраняем изображение после получения id
    if image and image.filename:
        artwork.image = save_image(image, artwork.id)
        db.commit()
        db.refresh(artwork)

    return artwork


@router.put("/products/{product_id}", response_model=schemas.ArtworkOut)
def update_artwork(
    product_id:  int,
    artwork_in:  schemas.ArtworkUpdate,
    db:          Session = Depends(get_db),
    user:        dict    = Depends(require_artist),
):
    artwork = get_artwork_or_404(product_id, db)

    # Артист может редактировать только свои работы; admin — любые
    if user["role"] != "admin" and artwork.artist_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not your artwork")

    for field, value in artwork_in.model_dump(exclude_unset=True).items():
        setattr(artwork, field, value)

    db.commit()
    db.refresh(artwork)
    return artwork


@router.post("/products/{product_id}/image", response_model=schemas.ArtworkOut)
async def upload_artwork_image(
    product_id: int,
    image:      UploadFile = File(...),
    db:         Session    = Depends(get_db),
    user:       dict       = Depends(require_artist),
):
    """Загрузить/заменить изображение для существующей работы."""
    artwork = get_artwork_or_404(product_id, db)

    if user["role"] != "admin" and artwork.artist_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not your artwork")

    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    artwork.image = save_image(image, artwork.id)
    db.commit()
    db.refresh(artwork)
    return artwork


@router.delete("/products/{product_id}", status_code=204)
def delete_artwork(
    product_id: int,
    db:         Session = Depends(get_db),
    user:       dict    = Depends(require_artist),
):
    artwork = get_artwork_or_404(product_id, db)

    if user["role"] != "admin" and artwork.artist_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not your artwork")

    # Удаляем файл изображения если есть
    if artwork.image:
        local_path = artwork.image.lstrip("/")
        if os.path.exists(local_path):
            os.remove(local_path)

    db.delete(artwork)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
#  ADMIN ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/products", response_model=List[schemas.ArtworkOut])
def admin_list_artworks(
    db:   Session = Depends(get_db),
    user: dict    = Depends(require_admin),
):
    """Все работы включая неактивные — для Admin Panel."""
    return db.query(models.Artwork).order_by(models.Artwork.created_at.desc()).all()


@router.delete("/admin/products/{product_id}", status_code=204)
def admin_delete_artwork(
    product_id: int,
    db:         Session = Depends(get_db),
    user:       dict    = Depends(require_admin),
):
    artwork = get_artwork_or_404(product_id, db)
    if artwork.image:
        local_path = artwork.image.lstrip("/")
        if os.path.exists(local_path):
            os.remove(local_path)
    db.delete(artwork)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
#  INTERNAL ROUTE — для Order Service
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/internal/products/{product_id}")
def internal_get_product(product_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Используется Order Service для получения цены и названия товара.
    Защищён секретным заголовком X-Internal-Secret.
    """
    secret = request.headers.get("x-internal-secret")
    if secret != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    artwork = get_artwork_or_404(product_id, db)
    return {
        "id":          artwork.id,
        "title":       artwork.title,
        "price":       float(artwork.price),
        "image":       artwork.image,
        "artist_id":   artwork.artist_id,
        "artist_name": artwork.artist_name,
        "is_active":   artwork.is_active,
    }
