from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel
from databases import Database
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Veritabanı Ayarları
DATABASE_URL = "sqlite:///./notes.db"
database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()

# Veritabanı Modeli: Notlar için tablo
class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    content = Column(Text)

# Pydantic Modelleri: Veri doğrulama için
class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class NoteInDB(BaseModel):
    id: int
    title: str
    content: str

    class Config:
        orm_mode = True
        
# Veritabanı tablolarını oluştur.
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlangıcında çalışacak kod
    await database.connect()
    yield
    # Uygulama kapanışında çalışacak kod
    await database.disconnect()

app = FastAPI(lifespan=lifespan)

# CORS ayarlarını ekle
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Uç Noktaları
# 1. Tüm notları listeleme
@app.get("/notes", response_model=list[NoteInDB])
async def read_notes():
    query = Note.__table__.select()
    return await database.fetch_all(query)

# 2. Yeni not oluşturma
@app.post("/notes", response_model=NoteInDB)
async def create_note(note: NoteCreate):
    query = Note.__table__.insert().values(title=note.title, content=note.content)
    last_record_id = await database.execute(query)
    return {**note.model_dump(), "id": last_record_id}

# 3. Tek bir notu getirme
@app.get("/notes/{note_id}", response_model=NoteInDB)
async def read_note(note_id: int):
    query = Note.__table__.select().where(Note.id == note_id)
    db_note = await database.fetch_one(query)
    if not db_note:
        raise HTTPException(status_code=404, detail="Not bulunamadı.")
    return db_note

# 4. Notu güncelleme
@app.put("/notes/{note_id}", response_model=NoteInDB)
async def update_note(note_id: int, note: NoteUpdate):
    query = Note.__table__.update().where(Note.id == note_id).values(note.model_dump(exclude_unset=True))
    await database.execute(query)
    updated_note = await database.fetch_one(Note.__table__.select().where(Note.id == note_id))
    if not updated_note:
        raise HTTPException(status_code=404, detail="Not bulunamadı.")
    return updated_note

# 5. Notu silme
@app.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    query = Note.__table__.delete().where(Note.id == note_id)
    result = await database.execute(query)
    if result == 0:
        raise HTTPException(status_code=404, detail="Not bulunamadı.")
    return {"message": "Not başarıyla silindi."}