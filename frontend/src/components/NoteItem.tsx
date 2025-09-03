// frontend/src/components/NoteItem.tsx
import React from "react";
import { Note } from "../api/notesApi";

interface NoteItemProps {
  note: Note;
  onSelect: (note: Note) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onSelect }) => {
  return (
    <div className="note-item-simple" onClick={() => onSelect(note)}>
      <h3>{note.title}</h3>
    </div>
  );
};

export default NoteItem;
