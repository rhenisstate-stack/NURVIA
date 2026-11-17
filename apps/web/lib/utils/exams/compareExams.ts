export interface ExamSortable {
  id?: number | string | null;
  order?: string | number | null;
  createdAt?: string | Date | null;
  season?: string | null;
}

const SEASON_RANK: Record<string, number> = { fall: 0, spring: 1, summer: 2, winter: 3 };

export const parseExamOrder = (v: unknown): number | null => {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// 1) Backend "order" (ascending) when provided
// 2) No order → createdAt newest first
// 3) Tie → season (Fall, Spring, Summer, Winter) → id desc
export function compareExams<T extends ExamSortable>(
  a: T,
  b: T,
  getSeason?: (e: T) => string | null | undefined
): number {
  const oa = parseExamOrder(a.order);
  const ob = parseExamOrder(b.order);

  if (oa !== null && ob !== null && oa !== ob) return oa - ob;
  if (oa !== null && ob === null) return -1;
  if (oa === null && ob !== null) return 1;

  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  const timeA = Number.isNaN(ta) ? 0 : ta;
  const timeB = Number.isNaN(tb) ? 0 : tb;
  if (timeA !== timeB) return timeB - timeA;

  const sa = SEASON_RANK[String((getSeason ? getSeason(a) : a.season) ?? "").toLowerCase()] ?? 99;
  const sb = SEASON_RANK[String((getSeason ? getSeason(b) : b.season) ?? "").toLowerCase()] ?? 99;
  if (sa !== sb) return sa - sb;

  return (Number(b.id) || 0) - (Number(a.id) || 0);
}