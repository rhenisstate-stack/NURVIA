import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// ───────────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────────

export type SeekMode = "absolute" | "distinct" | "core";
export type SeekSort = "relevance" | "name" | "newest" | "rating";

export type SeekScope =
  | "program" | "course" | "subject" | "unit" | "topic" | "lesson" | "concept" | "fact"
  | "exam" | "assessment" | "section" | "question" | "diy_exam"
  | "content" | "category" | "subcategory" | "domain"
  | "institution" | "school" | "department" | "division" | "cohort" | "class"
  | "chat" | "event" | "media" | "space" | "forum_user";

export interface SeekGroup {
  /** property name on the backend response; null = lives in response.groups[scope] */
  key: string | null;
  scope: SeekScope;
  label: string;
  icon: string;
}

export const SEEK_GROUPS: SeekGroup[] = [
  { key: "items", scope: "program", label: "Programs", icon: "🎓" },
  { key: "courses", scope: "course", label: "Courses", icon: "📚" },
  { key: "subjects", scope: "subject", label: "Subjects", icon: "📖" },
  { key: "units", scope: "unit", label: "Units", icon: "🧩" },
  { key: "topics", scope: "topic", label: "Topics", icon: "🏷️" },
  { key: "lessons", scope: "lesson", label: "Lessons", icon: "🎬" },
  { key: "concepts", scope: "concept", label: "Concepts", icon: "💡" },
  { key: "facts", scope: "fact", label: "Facts", icon: "📌" },
  { key: "exams", scope: "exam", label: "Exams", icon: "📝" },
  { key: "assessments", scope: "assessment", label: "Assessments", icon: "🧪" },
  { key: "sections", scope: "section", label: "Sections", icon: "🗂️" },
  { key: "questions", scope: "question", label: "Questions", icon: "❓" },
  { key: null, scope: "diy_exam", label: "DIY Exams", icon: "🛠️" },
  { key: null, scope: "content", label: "Content", icon: "📄" },
  { key: null, scope: "category", label: "Categories", icon: "🗃️" },
  { key: null, scope: "subcategory", label: "Subcategories", icon: "📂" },
  { key: null, scope: "domain", label: "Domains", icon: "🌍" },
  { key: null, scope: "institution", label: "Institutions", icon: "🏛️" },
  { key: null, scope: "school", label: "Schools", icon: "🏫" },
  { key: null, scope: "department", label: "Departments", icon: "🏢" },
  { key: null, scope: "division", label: "Divisions", icon: "🧭" },
  { key: null, scope: "cohort", label: "Cohorts", icon: "👥" },
  { key: null, scope: "class", label: "Classes", icon: "🧑‍🏫" },
  { key: null, scope: "chat", label: "Chats", icon: "💬" },
  { key: null, scope: "event", label: "Events", icon: "📅" },
  { key: null, scope: "media", label: "Media", icon: "🖼️" },
  { key: null, scope: "space", label: "Spaces", icon: "🪐" },
  { key: null, scope: "forum_user", label: "People", icon: "🙋" },
];

export interface SeekProgramDetail {
  isFeatured?: boolean;
  hasCertificate?: boolean;
  price?: number | null;
  discount?: number | null;
  isFree?: boolean;
  currency?: string | null;
}

export interface SeekItem {
  guidId: string;
  name: string;
  description?: string | null;
  code?: string | null;
  tag?: string | null;
  type?: string | null;
  level?: string | null;
  status?: string | null;
  segment?: string | null;
  fragment?: string | null;
  season?: string | null;
  difficulty?: string | null;
  duration?: string | number | null;
  year?: number | null;
  rating?: number | null;
  isFeatured?: boolean;
  examTitle?: string | null;
  examGuidId?: string | null;
  score?: number;
  matchKind?: string | null;
  matchedOn?: string[] | null;
  scope?: string | null;
  details?: SeekProgramDetail | null;
  createdAt?: string | null;
  programName?: string | null;
  courseName?: string | null;
  subjectName?: string | null;
  totalQuestions?: number | null;
}

export interface SeekSuggestion {
  text: string;
  kind: "popular" | "name";
  scope?: string | null;
  guidId?: string | null;
}

export interface SeekResponse {
  seekType?: string;
  query?: string;
  skewTotal?: number;
  skewPage?: number;
  skewPerPage?: number;
  tookMs?: number;
  totals?: Record<string, number>;
  didYouMean?: string[] | null;
  suggestions?: SeekSuggestion[] | null;
  groups?: Record<string, SeekItem[]> | null;

  items?: SeekItem[];
  courses?: SeekItem[];
  subjects?: SeekItem[];
  units?: SeekItem[];
  topics?: SeekItem[];
  lessons?: SeekItem[];
  concepts?: SeekItem[];
  facts?: SeekItem[];
  exams?: SeekItem[];
  assessments?: SeekItem[];
  sections?: SeekItem[];
  questions?: SeekItem[];
}

export function rowsOf(d: SeekResponse | null | undefined, g: SeekGroup): SeekItem[] {
  if (!d) return [];
  if (g.key) return (d as unknown as Record<string, SeekItem[] | undefined>)[g.key] ?? [];
  return d.groups?.[g.scope] ?? [];
}

export interface SeekHistoryEntry {
  query: string;
  seekType: SeekMode;
  scope?: SeekScope | null;
  at: string;
}

export interface SeekFilters {
  sort: SeekSort;
  featured: boolean;
  free: boolean;
  status: string;
  type: string;
  level: string;
  difficulty: string;
}

export const DEFAULT_FILTERS: SeekFilters = {
  sort: "relevance", featured: false, free: false, status: "", type: "", level: "", difficulty: "",
};

export interface SeekParams {
  query: string;
  mode: SeekMode;
  scope?: SeekScope;
  page?: number;
  perPage?: number;
  record?: boolean;
  filters?: Partial<SeekFilters>;
}

export interface SeekResult<T> {
  data?: T;
  error?: string;
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────
// SMALL IN-MEMORY CACHE (instant repeat searches / back-spacing)
// ───────────────────────────────────────────────────────────────────────────────

const CACHE_TTL = 60_000;
const CACHE_MAX = 120;
const cache = new Map<string, { t: number; v: unknown }>();

function cacheGet<T>(k: string): T | undefined {
  const e = cache.get(k);
  if (!e) return undefined;
  if (Date.now() - e.t > CACHE_TTL) { cache.delete(k); return undefined; }
  return e.v as T;
}
function cacheSet(k: string, v: unknown) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(k, { t: Date.now(), v });
}

// ───────────────────────────────────────────────────────────────────────────────
// TRANSPORT
// ───────────────────────────────────────────────────────────────────────────────

const INTERNAL_BASE_URL = "/api/seek";

type Params = Record<string, string | number | boolean | undefined>;

async function call<T>(method: "GET" | "DELETE", params: Params): Promise<SeekResult<T>> {
  try {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => [k, String(v)])
    ).toString();

    const res = await apiFetch<Envelope<T>>(`${INTERNAL_BASE_URL}?${qs}`, {
      method,
      headers: { ...renderSystemSessionHeaders() },
      credentials: "include",
    });

    if (res?.error || res?.success === false) {
      return { error: res.error ?? res.message ?? "Search failed ⚓" };
    }
    return { data: res?.data };
  } catch (err: unknown) {
    console.error(`❌ [seekService] ${method} failed:`, err);
    return { error: err instanceof Error ? err.message : "Unknown seek service error" };
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// SERVICE SURFACE
// ───────────────────────────────────────────────────────────────────────────────

export const seekService = {
  async search(p: SeekParams): Promise<SeekResult<SeekResponse>> {
    const f = p.filters ?? {};
    const params: Params = {
      fetchtype: p.mode === "core" ? "absolute" : p.mode,
      Query: p.query.trim(),
      Scope: p.mode === "distinct" ? p.scope ?? "program" : p.mode === "core" ? "core" : undefined,
      SkewPage: p.page ?? 1,
      SkewPerPage: p.perPage ?? 20,
      SortBy: f.sort && f.sort !== "relevance" ? f.sort : undefined,
      Status: f.status?.trim() || undefined,
      Type: f.type?.trim() || undefined,
      Level: f.level?.trim() || undefined,
      Difficulty: f.difficulty?.trim() || undefined,
      IsFeatured: f.featured ? true : undefined,
      IsFree: f.free ? true : undefined,
    };

    const key = "s:" + JSON.stringify(params);
    const hit = cacheGet<SeekResponse>(key);
    if (hit) {
      // show instantly, still log the search in the background
      if (p.record) void call<SeekResponse>("GET", { ...params, record: "true" });
      return { data: hit };
    }

    const res = await call<SeekResponse>("GET", { ...params, record: p.record ? "true" : undefined });
    if (res.data) cacheSet(key, res.data);
    return res;
  },

  async suggest(q: string, limit = 8): Promise<SeekResult<SeekResponse>> {
    const params: Params = { fetchtype: "suggest", q: q.trim(), limit };
    const key = "g:" + JSON.stringify(params);
    const hit = cacheGet<SeekResponse>(key);
    if (hit) return { data: hit };
    const res = await call<SeekResponse>("GET", params);
    if (res.data) cacheSet(key, res.data);
    return res;
  },

  history() {
    return call<SeekHistoryEntry[]>("GET", { fetchtype: "history" });
  },

  clearHistory() {
    return call<unknown>("DELETE", { fetchtype: "history" });
  },
};