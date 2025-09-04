// frontend/src/components/NoteEditor.tsx
// components/NoteEditor/NoteEditor.tsx
import React, { useEffect, useState } from "react";
import { Note } from "../../api/notesApi";
import { useNoteAutosave } from "../../hooks/useNoteAutosave";

interface NoteFormProps {
  selectedNote?: Note | null;
  onNoteSaved: (savedNote?: Note) => void;
  onNoteDeleted: () => void; // Silme işlemi için yeni prop
}

const NoteEditor: React.FC<NoteFormProps> = ({
  selectedNote,
  onNoteSaved,
  onNoteDeleted,
}) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    setTitle(selectedNote?.title ?? "");
    setContent(selectedNote?.content ?? "");
  }, [selectedNote?.id]);

  useNoteAutosave(
    selectedNote ?? null,
    title,
    content,
    (saved) => {
      onNoteSaved(saved);
    },
    600
  );

  return (
    <div className="note-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Başlık"
        className="editor-title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="İçerik..."
        className="editor-content"
      />
    </div>
  );
};

export default NoteEditor;
