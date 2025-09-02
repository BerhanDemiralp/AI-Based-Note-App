import axios from "axios";

export interface Note {
  id: number;
  title: string;
  content: string;
}
const API_URL = "http://localhost:8000/notes";

/**
 * API'den notları getiren fonksiyon.
 * Sadece veri çekme sorumluluğuna sahiptir.
 */
export const fetchAllNotesFromApi = async (): Promise<Note[]> => {
  try {
    const response = await axios.get<Note[]>(API_URL);
    return response.data;
  } catch (error) {
    // Hatanın çağrıcıya iletilmesi için fırlatılması daha doğru bir yaklaşımdır.
    throw new Error("Notları getirirken bir hata oluştu.");
  }
};

export const deleteNoteFromApi = async (noteId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${noteId}`);
  } catch (error) {
    throw new Error(`Not silinirken bir hata oluştu: ${noteId}`);
  }
};
