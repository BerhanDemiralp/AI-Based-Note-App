import React, { useState } from "react";
import NoteList from "./components/NoteList";
import NoteForm from "./components/NoteForm";
import "./App.css"; // Varsayılan stil dosyası

const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleNoteUpdate = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SmartNotes-AI</h1>
      </header>
      <div className="container">
        <NoteForm onNoteAdded={handleNoteUpdate} />
        <hr />
        <NoteList refreshKey={refreshKey} onNoteDeleted={handleNoteUpdate} />
      </div>
    </div>
  );
};

export default App;
