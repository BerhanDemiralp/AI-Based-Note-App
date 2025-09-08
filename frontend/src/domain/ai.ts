export interface AIRequest {
  content: string;
  max_len: number;
  n: number;
}
export interface AIResponse {
  response: string[];
}
