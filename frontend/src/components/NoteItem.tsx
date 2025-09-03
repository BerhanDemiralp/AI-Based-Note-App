// frontend/src/components/NoteItem.tsx
import React from "react";
import { Note } from "../api/notesApi";

interface NoteItemProps {
  note: Note;
  onSelect: (note: Note | null) => void;
  onDelete: (noteId: number) => void;
  isSelected: boolean;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onSelect,
  onDelete,
  isSelected,
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Parent div'in onClick olayını durdurur
    onDelete(note.id);
  };

  return (
    <div
      className={`note-item-simple ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(note)}
    >
      <h3>{note.title}</h3>
      <button className="delete-btn" onClick={handleDeleteClick}>
        Sil
      </button>
    </div>
  );
};

export default NoteItem;
