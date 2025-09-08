import { AIRequest, AIResponse } from "../domain/ai";
import axios from "axios";

const AI_API_URL =
  process.env.REACT_APP_AI_API_URL || "http://localhost:8000/ai";

export const suggestTitleWithAIFromApi = async (
  request: AIRequest
): Promise<AIResponse> => {
  try {
    const response = await axios.post<AIResponse>(
      `${AI_API_URL}/${"suggest-title"}`,
      request
    );
    return response.data;
  } catch (error) {
    throw new Error("Başlık önerisi alınırken bir hata oluştu.");
  }
};
