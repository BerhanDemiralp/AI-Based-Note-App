// hooks/useNoteAutosave.ts
import { useEffect, useRef } from "react";
import { addNote, editNote } from "../services/notesService";
import { Note } from "../domain/Note";
import { areNoteFieldsEqual } from "../utils/areNoteFieldsEqual";

type OnSaved = (savedNote: Note) => void;

export function useNoteAutosave(
  selectedNote: Note | null | undefined,
  title: string,
  content: string,
  onSaved: OnSaved,
  delayMs = 600
) {
  const lastSavedRef = useRef<{
    title: string;
    content: string;
    id: number | null;
  }>({
    title: "",
    content: "",
    id: null,
  });

  // selectedNote değişince "referans"ı yenile
  useEffect(() => {
    if (selectedNote) {
      lastSavedRef.current = {
        title: selectedNote.title ?? "",
        content: selectedNote.content ?? "",
        id: (selectedNote.id as unknown as number) ?? null,
      };
    } else {
      lastSavedRef.current = { title: "", content: "", id: null };
    }
  }, [selectedNote?.id]); // sadece id değişimiyle reset

  useEffect(() => {
    // Tamamen boşsa kaydetme
    if (!title.trim() && !content.trim()) return;

    const pending = { title, content, id: selectedNote?.id ?? null };
    if (areNoteFieldsEqual(pending, lastSavedRef.current)) return;

    const t = setTimeout(async () => {
      try {
        if (selectedNote?.id != null) {
          const updated = await editNote(selectedNote.id, { title, content });
          lastSavedRef.current = { title, content, id: selectedNote.id as any };
          onSaved(updated);
        } else {
          const created = await addNote({ title, content });
          lastSavedRef.current = { title, content, id: created.id as any };
          onSaved(created);
        }
      } catch (e) {
        console.error("Autosave error:", e);
      }
    }, delayMs);

    return () => clearTimeout(t);
  }, [title, content, selectedNote?.id, onSaved, delayMs]);
}
