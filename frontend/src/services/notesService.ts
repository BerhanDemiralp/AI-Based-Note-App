import {
  fetchAllNotesFromApi,
  deleteNoteFromApi,
  updateNoteFromApi,
  addNoteToApi,
} from "../api/notesApi";
import { Note } from "../domain/Note";
/**
 * Notlarla ilgili iş mantığını yöneten servis.
 * Şu an için basit bir çağrıya sahiptir.
 */
export const getNotes = async (): Promise<Note[]> => {
  return fetchAllNotesFromApi();
};
export const addNote = async (note: Omit<Note, "id">): Promise<Note> => {
  return addNoteToApi(note);
};
export const removeNote = async (noteId: number): Promise<void> => {
  return deleteNoteFromApi(noteId);
};
export const editNote = async (
  noteId: number,
  note: Omit<Note, "id">
): Promise<Note> => {
  return updateNoteFromApi(noteId, note);
};
