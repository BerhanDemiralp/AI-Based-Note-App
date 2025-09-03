// frontend/src/App.tsx

import React, { useState } from "react";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import NoteDetail from "./components/NoteDetail";
import { Note } from "./api/notesApi";
import "./App.css";

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleNoteSaved = (savedNote?: Note) => {
    // Not kaydedildiğinde listeyi yenile
    setRefreshKey((prevKey) => prevKey + 1);

    // Eğer yeni bir not eklendiyse, onu otomatik olarak seçili not yap
    if (!selectedNote && savedNote) {
      setSelectedNote(savedNote);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Notlarım</h2>
          <button className="new-note-btn" onClick={handleNewNote}>
            + Yeni Not
          </button>
        </div>
        <NoteList refreshKey={refreshKey} onSelectNote={handleSelectNote} />
      </aside>
      <main className="main-content">
        {/*
          Burada NoteForm'u koşulsuz render ediyoruz.
          Seçili bir not varsa düzenleme modunda, yoksa yeni not oluşturma modunda çalışacak.
        */}
        <NoteEditor editingNote={selectedNote} onNoteSaved={handleNoteSaved} />
      </main>
    </div>
  );
};

export default App;
