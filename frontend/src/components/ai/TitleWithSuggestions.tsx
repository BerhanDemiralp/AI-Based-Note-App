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

  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto"; // önce sıfırla
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

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
    <div className="title-with-suggestions">
      {/* SOL: buton + kutu */}
      <div className="suggest-wrap">
        <button
          type="button"
          className="suggest-btn"
          onClick={handleClickButton}
          aria-expanded={open}
        >
          🎲
        </button>

        {open && (
          <div
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
