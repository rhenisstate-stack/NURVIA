# 12. CONTENT SOURCE COMPLIANCE

## Approved Local-Content Exceptions (Verified in NURVIA)
1. **Mark K Resources / NURVIA Lecture Notes** (`apps/web/lib/lectures/nurvia-lectures-data.ts`): 12 lectures; Lectures 1–3 public, Lectures 4–12 authenticated; `ownership: 'NURVIA-authored'`, explicit non-affiliation attribution preserved.
2. **Nursing Care Plans** (`apps/web/lib/content/care-plans-data.ts`, `care-plans-service.ts`): 16 care plans + 4 writing guides; ADPIE structure, clinical review metadata, lifecycle status preserved.

## Server-Driven Modules (LexmaCasto Authoritative)
- **Study Guides** (`apps/web/lib/content/study-guides-data.ts`): Server-driven (`source: 'Verified Remote Backend'`, returns typed `not_provisioned` / `unauthorized` states when unavailable).
- **Exams, Attempts, Results, Questions, Taxonomy, Subscriptions, Community, Flashcards, Planner**: Must remain server-driven via LexmaCasto; no localStorage or static mock fallbacks permitted.
