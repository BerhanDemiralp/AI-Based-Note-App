export interface Note {
  id: number;
  title: string;
  content: string;

  summary?: string;
  keywords?: string[];
}
export interface AIRequest {
  content: string;
  max_len: number;
  language: string;
  n: number;
}
export interface AIResponse {
  response: string[];
}
