// frontend/src/components/NoteEditor.tsx
// components/NoteEditor/NoteEditor.tsx
import { Note } from "../../domain/Note";
import React, { useEffect, useState } from "react";
import { useNoteAutosave } from "../../hooks/useNoteAutosave";
import TitleWithSuggestions from "../ai/TitleWithSuggestions";
interface NoteFormProps {
  selectedNote?: Note | null;
  onNoteSaved: (savedNote?: Note) => void;
}

const NoteEditor: React.FC<NoteFormProps> = ({ selectedNote, onNoteSaved }) => {
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
      <TitleWithSuggestions
        title={title}
        content={content}
        onTitleChange={setTitle}
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
