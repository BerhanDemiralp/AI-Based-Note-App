// frontend/src/components/NoteItem.tsx
import React from "react";
import { Note } from "../api/notesApi";

interface NoteItemProps {
  note: Note;
  onDelete: (id: number) => void;
  onEdit: (note: Note) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete, onEdit }) => {
  return (
    <li>
      <div>
        <h3>{note.title}</h3>
        <p>{note.content}</p>
      </div>
      <div className="note-actions">
        {
          <button className="edit-btn" onClick={() => onEdit(note)}>
            Edit
          </button>
        }
        <button className="delete-btn" onClick={() => onDelete(note.id)}>
          Delete
        </button>
      </div>
    </li>
  );
};

export default NoteItem;
