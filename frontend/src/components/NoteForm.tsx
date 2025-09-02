import React, { useState } from "react";
import axios from "axios";

interface NoteFormProps {
  onNoteAdded: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteAdded }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/notes", {
        title,
        content,
      });
      setTitle("");
      setContent("");
      onNoteAdded();
    } catch (error) {
      console.error("There was an error creating the note!", error);
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
      <button type="submit">Add Note</button>
    </form>
  );
};

export default NoteForm;
