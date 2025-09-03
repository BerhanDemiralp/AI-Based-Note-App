// frontend/src/components/NoteForm.tsx

import React, { useState, useEffect } from "react";
import { Note } from "../api/notesApi";
import { addNote, editNote } from "../services/notesService";

interface NoteFormProps {
  editingNote?: Note | null;
  onNoteSaved: (savedNote?: Note) => void;
}

const NoteEditor: React.FC<NoteFormProps> = ({ editingNote, onNoteSaved }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isNewNote, setIsNewNote] = useState<boolean>(true);

  // Başlangıçta gelen not verisini state'e yükler
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setIsNewNote(false);
    } else {
      setTitle("");
      setContent("");
      setIsNewNote(true);
    }
  }, [editingNote]);

  // Debounce mekanizması için useEffect
  useEffect(() => {
    // Eğer yeni bir not oluşturuluyorsa ve içerik boşsa kaydetme
    if (isNewNote && !title && !content) {
      return;
    }

    // Kullanıcı yazmayı bıraktığında kaydetmek için bir timer ayarla
    const timer = setTimeout(async () => {
      // Sadece başlık veya içerik doluysa kaydetme işlemi yap
      if (title || content) {
        try {
          if (editingNote) {
            // Var olan notu güncelle
            const updatedNote = await editNote(editingNote.id, {
              title,
              content,
            });
            onNoteSaved(updatedNote);
          } else {
            // Yeni not oluştur
            const newNote = await addNote({ title, content });
            onNoteSaved(newNote); // Yeni notu üst component'e ilet
            // Yeni not oluşturulduktan sonra formu sıfırla
            setTitle("");
            setContent("");
          }
        } catch (error) {
          console.error("Not kaydedilirken bir hata oluştu:", error);
        }
      }
    }, 1500); // 1.5 saniye bekleme süresi

    // useEffect temizleme fonksiyonu: Yeni bir tuşa basıldığında önceki timer'ı iptal et
    return () => clearTimeout(timer);
  }, [title, content, editingNote, isNewNote, onNoteSaved]);

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
