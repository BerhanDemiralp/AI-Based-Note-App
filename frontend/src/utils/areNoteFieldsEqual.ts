// utils/areNoteFieldsEqual.ts
export function areNoteFieldsEqual(
  a: { title: string; content: string; id?: number | string | null },
  b: { title: string; content: string; id?: number | string | null }
) {
  return (
    (a.title ?? "") === (b.title ?? "") &&
    (a.content ?? "") === (b.content ?? "") &&
    (a.id ?? null) === (b.id ?? null)
  );
}
