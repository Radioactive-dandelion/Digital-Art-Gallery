from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class ArtworkBase(BaseModel):
    title:       str
    description: Optional[str]   = None
    price:       float
    category:    Optional[str]   = None
    medium:      Optional[str]   = None
    images:      Optional[List[str]] = None
    is_active:   Optional[bool]  = True


class ArtworkCreate(ArtworkBase):
    # artist_id и artist_name заполняются на бэкенде из JWT,
    # поэтому фронтенд их не отправляет
    pass


class ArtworkUpdate(BaseModel):
    """Все поля опциональны — поддержка частичного обновления (PATCH-style PUT)."""
    title:       Optional[str]   = None
    description: Optional[str]   = None
    price:       Optional[float] = None
    category:    Optional[str]   = None
    medium:      Optional[str]   = None
    is_active:   Optional[bool]  = None


class ArtworkOut(ArtworkBase):
    id:          int
    image:       Optional[str]   = None
    artist_id:   int
    artist_name: Optional[str]   = None
    created_at:  datetime

    model_config = ConfigDict(from_attributes=True)


# ── Artist schemas (для роутов /artists) ──────────────────────────────────────

class ArtistOut(BaseModel):
    """Публичная карточка артиста — собирается из данных User Service."""
    id:          int
    name:        str
    bio:         Optional[str]   = None
    avatar:      Optional[str]   = None
    works_count: int             = 0
