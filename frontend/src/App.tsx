// frontend/src/App.tsx

import React, { useState, useEffect, useCallback } from "react";
import NoteList from "./components/notes/NoteList";
import NoteEditor from "./components/notes/NoteEditor";
import { Note } from "./domain/Note";
import "./App.css";

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Kayıt sonrası listeyi yenile ve dönen notu seç
  const handleNoteSaved = useCallback((savedNote?: Note) => {
    setRefreshKey((prev) => prev + 1);

    // Yeni notta zaten null'dı; editte de güncel veriyi anında UI'ya yansıtmak için seçimi güncelliyoruz
    if (savedNote) {
      setSelectedNote(savedNote);
    }
  }, []);

  // Not listesinden bir not seçildiğinde veya seçim kaldırıldığında çalışır
  const handleSelectNote = useCallback((note: Note | null) => {
    setSelectedNote(note);
  }, []);

  const handleNewNote = useCallback(() => {
    setSelectedNote(null);
  }, []);

  // Not silme işlemi sonrası çalışır
  const handleNoteDeleted = useCallback(() => {
    setSelectedNote(null);
    setRefreshKey((prev) => prev + 1);
  }, []);
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Notlarım</h2>
        </div>
        <NoteList
          refreshKey={refreshKey}
          onSelectNote={handleSelectNote}
          selectedNoteId={selectedNote?.id || null}
        />
      </aside>
      <main className="main-content">
        {/* Seçili not varsa edit, yoksa create modunda çalışır */}
        <NoteEditor selectedNote={selectedNote} onNoteSaved={handleNoteSaved} />
      </main>
    </div>
  );
};

export default App;
