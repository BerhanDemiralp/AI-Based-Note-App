// src/components/notes/TitleWithSuggestions.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAiTitle } from "../../hooks/useAITitle";

interface Props {
  noteId: number;
  title: string;
  content: string;
  onTitleChange: (newTitle: string) => void;
}

const TitleWithSuggestions: React.FC<Props> = ({
  noteId, // <<< EKLENDİ
  title,
  content,
  onTitleChange,
}) => {
  const { titles, loading, fetchTitles, setTitles } = useAiTitle();
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Bu popover hangi not için açıldı?
  const openedForId = useRef<number | null>(null); // <<< EKLENDİ

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  // Not değişince popover'u kapat + önerileri temizle
  useEffect(() => {
    setOpen(false);
    setTitles([]);
    openedForId.current = null; // <<< EKLENDİ
  }, [noteId, setTitles]);

  // Dışarıya tıklanınca kutuyu kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickButton = () => {
    if (!open) {
      openedForId.current = noteId; // <<< EKLENDİ: hangi not için açıldı
      fetchTitles(content);
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handlePick = (t: string) => {
    // Güvenlik: popover açıldığı not hâlâ bu mu?
    if (openedForId.current !== noteId) {
      // Alakasız nota yazmayalım; sadece kapat ve temizle
      setOpen(false);
      setTitles([]);
      return;
    }
    onTitleChange(t);
    setOpen(false);
    setTitles([]); // temizle
    openedForId.current = null;
  };

  return (
    <div ref={containerRef} className="title-with-suggestions">
      {/* <<< ref bağlandı */}
      {/* SOL: buton + kutu */}
      <div className="suggest-wrap">
        <button
          type="button"
          className="suggest-btn"
          onClick={handleClickButton}
          aria-expanded={open}
          aria-controls="title-suggest-box"
        >
          🎲
        </button>

        {open && (
          <div
            id="title-suggest-box"
            className="suggest-box"
            role="listbox"
            aria-label="Başlık önerileri"
          >
            {loading && <div className="suggest-item">Yükleniyor…</div>}
            {!loading &&
              titles.slice(0, 3).map((t, i) => (
                <button
                  key={i}
                  type="button"
                  className="suggest-item"
                  onClick={() => handlePick(t)}
                >
                  {t}
                </button>
              ))}
            {!loading && titles.length === 0 && (
              <div className="suggest-item">Öneri bulunamadı</div>
            )}
          </div>
        )}
      </div>

      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Başlık"
        className="editor-title"
        rows={1}
      />
    </div>
  );
};

export default TitleWithSuggestions;
