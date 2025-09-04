export interface Note {
  id: number;
  title: string;
  content: string;

  summary?: string;
  keywords?: string[];
}
