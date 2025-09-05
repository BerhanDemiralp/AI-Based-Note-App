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

from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base

from databases import Database

# Genel helper'lar
from ai_client import call_responses_api
from ai_json import parse_json_array_of_strings

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
    language: str = "tr"  # şimdilik kontrat alanı; model dil çıkarımı yapabilir
    n: int = 3

class AIResponse(BaseModel):
    response: list[str]

# ================================
# Heuristik fallback (anahtar/bağlantı yoksa)
# ================================
_STOPWORDS = set("""
ve veya ile için gibi ama fakat ancak the a an to in on of with from by as is are was were be been being
da de bu şu o ki bir birini birine mı mi mu mü
""".split())

def _fallback_titles(content: str, max_len: int = 60, n: int = 3) -> list[str]:
    text = " ".join((content or "").split())
    if not text:
        return ["Yeni Not"]

    first = re.split(r"[.!?\n]+", text, maxsplit=1)[0].strip(" -:;,.")[:max_len]

    words = re.findall(r"[A-Za-zÇĞİÖŞÜçğıöşü0-9\-]+", text.lower())
    freq = {}
    for w in words:
        if len(w) < 3 or w in _STOPWORDS:
            continue
        freq[w] = freq.get(w, 0) + 1
    top = [w.capitalize() for w in sorted(freq, key=freq.get, reverse=True)[:4]]
    kw = " ".join(top)[:max_len].strip(" -:;,.") if top else ""

    cands = [c for c in [first, kw, (first + " — " + kw)[:max_len] if first and kw and len(first) < 15 else None] if c]
    out, seen = [], set()
    for c in cands:
        c = " ".join(c.split()).strip(" -:;,.")
        if c and c not in seen:
            out.append(c); seen.add(c)
    return (out or ["Yeni Not"])[:max(n, 1)]

# ================================
# AI işlevi: metinden başlık öner
# ================================
async def _suggest_titles_from_text(content: str, max_len: int = 60, n: int = 3) -> list[str]:
    """
    Not içeriğini OpenAI Responses API'ye gönderir, yalnızca JSON dizi bekler;
    bozulursa toparlar; başarısızsa fallback'e düşer.
    """
    content = (content or "").strip()
    if not content:
        return ["Yeni Not"]

    system_prompt = (
        "You are a concise note-title generator.\n"
        f"Return ONLY a JSON array of strings with {max(1, n)} alternatives.\n"
        f"Each title must be <= {max_len} characters and in the user's language if obvious.\n"
        "No prose. No prefixes. JSON array only."
    )

    try:
        raw = await call_responses_api(
            system_prompt=system_prompt,
            content=content,
            response_format={"type": "json"}
            # extra_create_kwargs={"response_format": {"type": "json"}},
        )
    except Exception:
        return _fallback_titles(content, max_len=max_len, n=n)

    titles = parse_json_array_of_strings(raw, max_len=max_len, fallback_lines=True)
    if not titles:
        return _fallback_titles(content, max_len=max_len, n=n)

    return titles[:max(n, 1)]

# ================================
# App ömrü (DB bağlan/kopar)
# ================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.connect()
    try:
        yield
    finally:
        await database.disconnect()

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
    titles = await _suggest_titles_from_text(req.content, max_len=req.max_len, n=req.n)
    return AIResponse(suggestions=titles)

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

    try:
        values = note.model_dump(exclude_unset=True)  # Pydantic v2
    except Exception:
        values = note.dict(exclude_unset=True)        # Pydantic v1

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
