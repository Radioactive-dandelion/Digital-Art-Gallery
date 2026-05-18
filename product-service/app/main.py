from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import Base, engine
from . import models
from .routers import products, artists

# Создаём таблицы при старте (SQLAlchemy)
Base.metadata.create_all(bind=engine)

# Папка для загружаемых изображений
os.makedirs("uploads/artworks", exist_ok=True)

app = FastAPI(title="Product Service — Digital Art Gallery")

# CORS — разрешаем фронтенду обращаться к сервису
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Раздача статики (изображения работ)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Роуты
app.include_router(products.router)
app.include_router(artists.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "product-service"}
