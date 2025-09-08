import axios from "axios";
import { Note } from "../domain/Note";

// domain

const NOTES_API_URL =
  process.env.REACT_APP_NOTES_API_URL || "http://localhost:8000/notes";

/**
 * API'den notları getiren fonksiyon.
 * Sadece veri çekme sorumluluğuna sahiptir.
 */
export const fetchAllNotesFromApi = async (): Promise<Note[]> => {
  try {
    const response = await axios.get<Note[]>(NOTES_API_URL);
    return response.data;
  } catch (error) {
    // Hatanın çağrıcıya iletilmesi için fırlatılması daha doğru bir yaklaşımdır.
    throw new Error("Notları getirirken bir hata oluştu.");
  }
};
export const addNoteToApi = async (note: Omit<Note, "id">): Promise<Note> => {
  try {
    const response = await axios.post<Note>(NOTES_API_URL, note);
    return response.data;
  } catch (error) {
    // Hatanın çağrıcıya iletilmesi için fırlatılması daha doğru bir yaklaşımdır.
    throw new Error("Notları getirirken bir hata oluştu.");
  }
};

export const deleteNoteFromApi = async (noteId: number): Promise<void> => {
  try {
    await axios.delete(`${NOTES_API_URL}/${noteId}`);
  } catch (error) {
    throw new Error(`Not silinirken bir hata oluştu: ${noteId}`);
  }
};
export const updateNoteFromApi = async (
  noteId: number,
  note: Omit<Note, "id">
): Promise<Note> => {
  try {
    const response = await axios.put<Note>(`${NOTES_API_URL}/${noteId}`, note);
    return response.data;
  } catch (error) {
    throw new Error(`Not silinirken bir hata oluştu: ${noteId}`);
  }
};
