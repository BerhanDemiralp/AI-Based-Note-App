import React, { useState } from "react";
import NoteList from "./components/NoteList";
import NoteForm from "./components/NoteForm";
import "./App.css"; // Varsayılan stil dosyası
import { Note } from "./api/notesApi";

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleNoteUpdate = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SmartNotes AI</h1>
      </header>
      <div className="container">
        <NoteForm
          onNoteAdded={handleNoteUpdate}
          editingNote={editingNote}
          onNoteUpdated={() => {
            setEditingNote(null);
            handleNoteUpdate();
          }}
          onCancelEdit={() => setEditingNote(null)} // ✅ Cancel butonu buradan null yapıyor
        />
        <hr />
        <NoteList
          refreshKey={refreshKey}
          onNoteDeleted={() => handleNoteUpdate()}
          onEdit={(note) => setEditingNote(note)}
        />
      </div>
    </div>
  );
};

export default App;
