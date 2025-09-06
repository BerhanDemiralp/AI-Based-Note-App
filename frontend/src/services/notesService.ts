import {
  fetchAllNotesFromApi,
  deleteNoteFromApi,
  updateNoteFromApi,
  addNoteToApi,
  suggestTitleWithAIFromApi,
} from "../api/notesApi";
import { AIRequest, AIResponse, Note } from "../domain/Note";
import { normalizeContentForAI } from "../utils/normalizeText";
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
export const suggestTitleWithAI = async (
  request: AIRequest
): Promise<AIResponse> => {
  const safeContent = normalizeContentForAI(request.content);

  const payload: AIRequest = {
    ...request,
    content: safeContent,
  };

  const data = await suggestTitleWithAIFromApi(payload);
  return { response: Array.isArray(data?.response) ? data.response : [] };
};
