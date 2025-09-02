import { fetchAllNotesFromApi, deleteNoteFromApi, Note } from "../api/notesApi";

/**
 * Notlarla ilgili iş mantığını yöneten servis.
 * Şu an için basit bir çağrıya sahiptir.
 */
export const getNotes = async (): Promise<Note[]> => {
  return fetchAllNotesFromApi();
};
export const removeNote = async (noteId: number): Promise<void> => {
  return deleteNoteFromApi(noteId);
};
