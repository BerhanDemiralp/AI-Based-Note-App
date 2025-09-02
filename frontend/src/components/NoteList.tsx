// frontend/src/components/NoteList.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import NoteItem from "./NoteItem"; // NoteItem komponentini içe aktar
import { getNotes, removeNote } from "../services/notesService";
import { Note } from "../api/notesApi";

interface NoteListProps {
  refreshKey: number;
  //onEdit: (note: Note) => void;
  onNoteDeleted: () => void;
}

const NoteList: React.FC<NoteListProps> = ({
  refreshKey,
  //onEdit,
  onNoteDeleted,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        // Servisten gelen hatayı yakala
        console.error(err);
        setError("Notlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      }
    };
    fetchNotes();
  }, [refreshKey]);

  const handleDelete = async (noteId: number) => {
    try {
      await removeNote(noteId);
      // Not silindiğinde parent'ı bilgilendirerek listeyi yenile
      onNoteDeleted();
    } catch (error) {
      console.error("There was an error deleting the note!", error);
    }
  };

  return (
    <div>
      <h2>My Notes</h2>
      <ul>
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onDelete={handleDelete}
            // onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
