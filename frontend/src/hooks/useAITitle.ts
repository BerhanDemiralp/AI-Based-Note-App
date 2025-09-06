// src/hooks/useAiTitle.ts
import { useState } from "react";
import { suggestTitleWithAI } from "../services/notesService";

export function useAiTitle() {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTitles = async (content: string) => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await suggestTitleWithAI({
        content,
        max_len: 60,
        language: "tr",
        n: 3,
      });
      setTitles(res.response);
    } catch {
      setTitles([]);
    } finally {
      setLoading(false);
    }
  };

  return { titles, loading, fetchTitles, setTitles };
}
