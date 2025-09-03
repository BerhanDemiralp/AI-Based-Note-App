// frontend/src/components/NoteList.tsx
import React, { useState, useEffect } from "react";
import NoteItem from "./NoteItem";
import { getNotes } from "../services/notesService";
import { Note } from "../api/notesApi";

interface NoteListProps {
  onSelectNote: (note: Note) => void;
  refreshKey: number;
}

const NoteList: React.FC<NoteListProps> = ({ onSelectNote, refreshKey }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        setError("Notlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      }
    };
    fetchNotes();
  }, [refreshKey]);

  return (
    <div className="note-list">
      {notes.length > 0 ? (
        notes.map((note) => (
          <NoteItem key={note.id} note={note} onSelect={onSelectNote} />
        ))
      ) : (
        <p>Henüz not bulunmuyor.</p>
      )}
    </div>
  );
};

export default NoteList;
