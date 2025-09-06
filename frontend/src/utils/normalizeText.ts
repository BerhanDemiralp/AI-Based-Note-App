// src/utils/normalizeText.ts
export function normalizeContentForAI(raw: string | null | undefined): string {
  if (!raw) return "";

  let t = String(raw);

  // 1) Basit HTML -> düz metin (eğer bir yerden rich/HTML geliyorsa)
  // <br>, <div>, <p> gibi blokları newline'a çevir
  t = t
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n")
    .replace(/<\/\s*div\s*>/gi, "\n")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<\/\s*h[1-6]\s*>/gi, "\n");

  // Kalan tag'ları sil
  t = t.replace(/<[^>]+>/g, "");

  // 2) HTML entity’lerini en azından en sık olanları çöz
  t = t
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // 3) Newline standardizasyonu
  t = t.replace(/\r\n?/g, "\n"); // \r\n, \r -> \n

  // 4) Çoklu boşluk ve çoklu boş satırları sadeleştir
  //   (AI tarafında daha stabil çalışır; ama istersen bu adımı yorumlayabilirsin)
  t = t
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trimEnd())
    .join("\n")
    .trim();

  return t;
}
