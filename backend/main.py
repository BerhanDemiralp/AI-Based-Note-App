# main.py
# FastAPI + SQLAlchemy + databases + OpenAI Responses API ile başlık önerisi

import os
import json
import re
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from redisCache import cache_init, cache_close, cache_get_json, cache_set_json, title_key, normalize_text

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base

from databases import Database

# Genel helper'lar
from ai_client import call_responses_api
from ai_json import parse_json_array_of_strings

from dotenv import load_dotenv
load_dotenv()
# ================================
# Veritabanı kurulumu
# ================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./notes.db")
database = Database(DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

Base = declarative_base()

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    content = Column(Text)

# Geliştirme için pratik şema (prod: Alembic)
Base.metadata.create_all(bind=engine)

# ================================
# Pydantic şemaları
# ================================
class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteInDB(BaseModel):
    id: int
    title: str
    content: str

# --- AI: Başlık önerisi istek/yanıt şemaları ---
class AIRequest(BaseModel):
    content: str
    max_len: int = 60
    n: int = 3

class AIResponse(BaseModel):
    response: list[str]

# ================================
# Heuristik fallback (anahtar/bağlantı yoksa)
# ================================
async def _suggest_titles_from_text(content: str, max_len: int = 120, n: int = 4) -> list[str]:
    content = (content or "").strip()
    if not content:
        return []

    system_prompt = (
        "You are a concise note-title generator.\n"
        f"Return ONLY a JSON array of exactly {n} strings.\n"
        f"Do not return fewer or more. Each string must be <= {max_len} characters.\n"
        "No prose. No prefixes. JSON array only."
    )

    print("[AI DEBUG] === Gemini çağrısı başlıyor ===")
    print("[AI DEBUG] Prompt:\n", system_prompt)
    print("[AI DEBUG] Content:\n", content[:200], "..." if len(content) > 200 else "")

    raw = None
    try:
        raw = await call_responses_api(
            system_prompt=system_prompt,
            content=content,
        )
        print("[AI DEBUG] Raw response:", repr(raw[:500]), "..." if raw and len(raw) > 500 else "")
    except Exception as e:
        print("[AI ERROR] Gemini çağrısı başarısız:", e)
        return []

    titles = parse_json_array_of_strings(raw, max_len=max_len, fallback_lines=True)
    print("[AI DEBUG] Parsed titles:", titles)

    if not titles:
        print("[AI WARN] Modelden geçerli başlık çıkmadı.")
        return []

    print("[AI DEBUG] Final titles:", titles)
    return titles[:n]



# ================================
# App ömrü (DB bağlan/kopar)
# ================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    await cache_init()          
    try:
        yield
    finally:
        await database.disconnect()
        await cache_close()

app = FastAPI(lifespan=lifespan)

# ================================
# CORS
# ================================
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# AI Endpoint
# ================================
@app.post("/ai/suggest-title", response_model=AIResponse)
async def suggest_title(req: AIRequest):
    # 1) Key
    key = title_key(req.content, req.n, req.max_len)

    # 2) Cache GET
    hit = await cache_get_json(key)
    if hit:
        # hit = ["title1", "title2", ...]
        return AIResponse(response=hit)

    # 3) Üret (mevcut fonksiyonun)
    titles = await _suggest_titles_from_text(
        normalize_text(req.content),  # küçük normalize
        max_len=req.max_len,
        n=req.n
    )

    # 4) Cache SETEX
    if titles:
        await cache_set_json(key, titles)

    return AIResponse(response=titles)

# ================================
# Note CRUD Endpoints
# ================================
@app.get("/notes", response_model=list[NoteInDB])
async def list_notes():
    query = Note.__table__.select().order_by(Note.id.desc())
    rows = await database.fetch_all(query)
    return [NoteInDB(id=r["id"], title=r["title"], content=r["content"]) for r in rows]

@app.post("/notes", response_model=NoteInDB, status_code=201)
async def create_note(note: NoteCreate):
    query = Note.__table__.insert().values(title=note.title, content=note.content)
    new_id = await database.execute(query)
    return NoteInDB(id=new_id, title=note.title, content=note.content)

@app.get("/notes/{note_id}", response_model=NoteInDB)
async def get_note(note_id: int):
    query = Note.__table__.select().where(Note.id == note_id)
    row = await database.fetch_one(query)
    if not row:
        raise HTTPException(status_code=404, detail="Not bulunamadı.")
    return NoteInDB(id=row["id"], title=row["title"], content=row["content"])

@app.put("/notes/{note_id}", response_model=NoteInDB)
async def update_note(note_id: int, note: NoteUpdate):
    sel = Note.__table__.select().where(Note.id == note_id)
    existing = await database.fetch_one(sel)
    if not existing:
        raise HTTPException(status_code=404, detail="Not bulunamadı.")

    values = note.model_dump(exclude_unset=True)

    if not values:
        return NoteInDB(id=existing["id"], title=existing["title"], content=existing["content"])

    upd = Note.__table__.update().where(Note.id == note_id).values(**values)
    await database.execute(upd)

    row = await database.fetch_one(sel)
    return NoteInDB(id=row["id"], title=row["title"], content=row["content"])

@app.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    sel = Note.__table__.select().where(Note.id == note_id)
    row = await database.fetch_one(sel)
    if not row:
        raise HTTPException(status_code=404, detail="Not bulunamadı.")
    dele = Note.__table__.delete().where(Note.id == note_id)
    await database.execute(dele)
    return {"message": "Not başarıyla silindi."}
