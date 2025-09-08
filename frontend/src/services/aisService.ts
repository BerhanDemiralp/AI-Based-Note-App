import { suggestTitleWithAIFromApi } from "../api/aisApi";
import { AIRequest, AIResponse } from "../domain/ai";
import { normalizeContentForAI } from "../utils/normalizeText";

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
