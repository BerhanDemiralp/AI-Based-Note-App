// frontend/src/components/NoteEditor.tsx
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

  // Not değişince local state'i doldur
  useEffect(() => {
    if (!selectedNote) {
      setTitle("");
      setContent("");
      return;
    }
    setTitle((prev) =>
      prev === selectedNote.title ? prev : selectedNote.title
    );
    setContent((prev) =>
      prev === selectedNote.content ? prev : selectedNote.content
    );
  }, [selectedNote]);

  useNoteAutosave(
    selectedNote ?? null,
    title,
    content,
    (saved) => {
      onNoteSaved(saved);
    },
    600
  );

  // Not yoksa boş ekran
  if (!selectedNote) {
    return (
      <div className="note-editor">
        <div className="editor-container">
          <input className="editor-title" placeholder="Başlık" disabled />
          <textarea
            className="editor-content"
            placeholder="İçerik..."
            disabled
          />
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      {/* editor state sızıntılarını kesmek için container'a key */}
      <div className="editor-container" key={selectedNote.id}>
        <TitleWithSuggestions
          key={selectedNote.id} // remount et, eski state silinsin
          noteId={selectedNote.id} // hangi nota ait olduğunu bildir
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
    </div>
  );
};

export default NoteEditor;
