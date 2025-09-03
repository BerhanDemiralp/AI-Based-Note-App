// frontend/src/components/NoteDetail.tsx
import React from "react";
import { Note } from "../api/notesApi";
import { removeNote } from "../services/notesService";

interface NoteDetailProps {
  note: Note | null;
  onEdit: (note: Note) => void;
  onNoteDeleted: () => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onEdit,
  onNoteDeleted,
}) => {
  const handleDelete = async () => {
    if (note) {
      const isConfirmed = window.confirm(
        "Bu notu silmek istediğinizden emin misiniz?"
      );
      if (isConfirmed) {
        try {
          await removeNote(note.id);
          onNoteDeleted();
        } catch (error) {
          console.error("Not silinirken bir hata oluştu:", error);
        }
      }
    }
  };

  if (!note) {
    return (
      <div className="note-detail-placeholder">
        <p>Lütfen sol panelden bir not seçin veya yeni bir not oluşturun.</p>
      </div>
    );
  }

  return (
    <div className="note-detail">
      <div className="note-detail-header">
        <h1>{note.title}</h1>
        <div className="note-actions">
          <button className="edit-btn" onClick={() => onEdit(note)}>
            Düzenle
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            Sil
          </button>
        </div>
      </div>
      <p className="note-content">{note.content}</p>
    </div>
  );
};

export default NoteDetail;
