from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from .database import Base


class Artwork(Base):
    """
    Основная модель — произведение искусства.
    artist_id ссылается на users.id в User Service (межсервисная связь).
    """
    __tablename__ = "artworks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price       = Column(Numeric(10, 2), nullable=False)

    # Категория: painting, digital, photography, illustration, sculpture
    category    = Column(String(100), nullable=True, index=True)

    # Техника исполнения: oil, watercolor, digital, charcoal и т.д.
    medium      = Column(String(100), nullable=True)

    # Главное изображение (путь к файлу, напр. /uploads/artworks/1-img.jpg)
    image       = Column(String(500), nullable=True)

    # Дополнительные изображения (массив URL)
    images      = Column(JSONB, nullable=True)

    # artist_id — id пользователя с ролью "artist" из User Service
    artist_id   = Column(Integer, nullable=False, index=True)

    # Имя артиста — денормализованное поле, чтобы не ходить в User Service
    # при каждом запросе списка работ
    artist_name = Column(String(255), nullable=True)

    is_active   = Column(Boolean, default=True, nullable=False)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
