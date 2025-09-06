// src/components/notes/TitleWithSuggestions.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAiTitle } from "../../hooks/useAITitle";

interface Props {
  title: string;
  content: string;
  onTitleChange: (newTitle: string) => void;
}

const TitleWithSuggestions: React.FC<Props> = ({
  title,
  content,
  onTitleChange,
}) => {
  const { titles, loading, fetchTitles, setTitles } = useAiTitle();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      fetchTitles(content);
    }
    setOpen(!open);
  };

  const handlePick = (t: string) => {
    onTitleChange(t);
    setOpen(false);
    setTitles([]); // temizle
  };

  return (
    <div ref={containerRef} className="title-with-suggestions">
      <input
        type="text"
        className="editor-title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Başlık"
      />
      <button type="button" className="suggest-btn" onClick={handleClickButton}>
        🎲
      </button>
      {open && (
        <div className="suggest-box">
          {loading && <div className="suggest-item">Yükleniyor...</div>}
          {!loading &&
            titles.map((t, i) => (
              <div
                key={i}
                className="suggest-item"
                onClick={() => handlePick(t)}
              >
                {t}
              </div>
            ))}
          {!loading && titles.length === 0 && (
            <div className="suggest-item">Öneri bulunamadı</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TitleWithSuggestions;
