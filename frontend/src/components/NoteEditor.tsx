// frontend/src/components/NoteEditor.tsx

import React, { useEffect, useRef, useState } from "react";
import { Note } from "../api/notesApi";
import { addNote, editNote, removeNote } from "../services/notesService"; // removeNote eklendi

interface NoteFormProps {
  editingNote?: Note | null;
  onNoteSaved: (savedNote?: Note) => void;
  onNoteDeleted: () => void; // Silme işlemi için yeni prop
}

const NoteEditor: React.FC<NoteFormProps> = ({
  editingNote,
  onNoteSaved,
  onNoteDeleted,
}) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // En son KAYDEDİLEN değerler ve not id'si burada tutulur
  const lastSavedRef = useRef<{
    title: string;
    content: string;
    noteId: number | string | null;
  }>({ title: "", content: "", noteId: null });

  // editingNote değiştiğinde formu doldur ve "son kaydedilen"i güncelle
  useEffect(() => {
    if (editingNote) {
      const safeTitle = editingNote.title || "";
      const safeContent = editingNote.content || "";
      setTitle(safeTitle);
      setContent(safeContent);
      lastSavedRef.current = {
        title: safeTitle,
        content: safeContent,
        noteId: editingNote.id as unknown as number | string,
      };
    } else {
      setTitle("");
      setContent("");
      lastSavedRef.current = { title: "", content: "", noteId: null };
    }
  }, [editingNote]);

  // Debounce + değişiklik kontrolü
  useEffect(() => {
    // tamamen boşsa kaydetme
    if (!title.trim() && !content.trim()) return;

    const hasChanges =
      title !== lastSavedRef.current.title ||
      content !== lastSavedRef.current.content ||
      (editingNote?.id ?? null) !== lastSavedRef.current.noteId;

    if (!hasChanges) return; // DEĞİŞİKLİK YOKSA API'YE GİTME

    const timer = setTimeout(async () => {
      try {
        if (editingNote) {
          const updated = await editNote(editingNote.id, { title, content });
          // başarılı kayıttan sonra referansı güncelle
          lastSavedRef.current = {
            title,
            content,
            noteId: editingNote.id as unknown as number | string,
          };
          onNoteSaved(updated);
        } else {
          const created = await addNote({ title, content });
          // yeni not artık referans noktamız
          lastSavedRef.current = {
            title,
            content,
            noteId: created.id as unknown as number | string,
          };
          onNoteSaved(created);
        }
      } catch (error) {
        console.error("Not kaydedilirken bir hata oluştu:", error);
      }
    }, 600); // 1 sn debounce

    return () => clearTimeout(timer);
  }, [title, content, editingNote?.id, onNoteSaved]);

  // Silme işlemini yöneten fonksiyon
  const handleDelete = async () => {
    if (editingNote) {
      const isConfirmed = window.confirm(
        "Bu notu silmek istediğinizden emin misiniz?"
      );
      if (isConfirmed) {
        try {
          await removeNote(editingNote.id);
          onNoteDeleted(); // App.tsx'teki state'i güncelle
        } catch (error) {
          console.error("Not silinirken bir hata oluştu:", error);
        }
      }
    }
  };

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
