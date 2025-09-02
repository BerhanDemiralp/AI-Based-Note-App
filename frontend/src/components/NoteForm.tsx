import React, { useState, useEffect } from "react";
import axios from "axios";
import { Note } from "../api/notesApi";
import { addNote, editNote } from "../services/notesService";
interface NoteFormProps {
  onNoteAdded?: () => void;
  onNoteUpdated?: () => void;
  editingNote?: Note | null;
  onCancelEdit?: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
  onNoteAdded,
  onNoteUpdated,
  editingNote,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState<string>(
    editingNote ? editingNote.title : ""
  );
  const [content, setContent] = useState<string>(
    editingNote ? editingNote.content : ""
  );

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [editingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNote) {
        // update
        await editNote(editingNote.id, { title, content });
        onNoteUpdated?.();
      } else {
        // add
        await addNote({ title, content });
        onNoteAdded?.();
      }
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error while saving the note!", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note Title"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note Content"
        required
      />
      <button type="submit">{editingNote ? "Update Note" : "Add Note"}</button>
      {editingNote && (
        <button type="button" className="cancel-btn" onClick={onCancelEdit}>
          Cancel
        </button>
      )}
    </form>
  );
};
export default NoteForm;
