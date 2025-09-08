// frontend/src/components/NoteList.tsx
import React, { useState, useEffect } from "react";
import NoteItem from "./NoteItem";
import { getNotes, removeNote } from "../../services/notesService";
import { Note } from "../../domain/Note";
import { createConfirmMessage } from "../../services/confirmService";
interface NoteListProps {
  onSelectNote: (note: Note | null) => void;
  handleDeleteNote?: (noteId: number) => void;
  selectedNoteId: number | null;
  refreshKey: number;
}

const NoteList: React.FC<NoteListProps> = ({
  onSelectNote,
  handleDeleteNote,
  selectedNoteId,
  refreshKey,
}) => {
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

  const onDeleteNote = async (noteId: number) => {
    const isConfirmed = await createConfirmMessage(
      "Bu notu silmek istediğinizden emin misiniz?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await removeNote(noteId);
      // Not başarıyla silindiğinde listeyi yeniden yükle
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

      handleDeleteNote?.(noteId);
    } catch (error) {
      console.error("Not silinirken bir hata oluştu:", error);
      setError("Not silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="note-list">
      {notes.length > 0 ? (
        notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onSelect={onSelectNote}
            onDelete={onDeleteNote}
            isSelected={note.id === selectedNoteId}
          />
        ))
      ) : (
        <p>Henüz not bulunmuyor.</p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default NoteList;
