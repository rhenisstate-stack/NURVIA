# QLEX_22 — ERROR HANDLING AND RECOVERY AUDIT

## 1. API & Network Error Handling
- **`apiFetch()` (`src/lib/api/api/api.ts`):** Checks `!res.ok`, attempts to parse JSON `error` / `detail`, falls back to `res.text()`, and throws `Error`.
- **Proxy Routes (`src/app/api/**`):** Catch fetch/JSON parse errors and return `{ error: "Failed to Parse Backend Response ⚓" }` with `500` or backend status.
  - **Defect (`P1`):** `api/auth/session/route.ts` forwards backend `500` verbatim when unauthenticated instead of returning `200 { logged_in: false }` or `401`.
  - **Defect (`P1`):** `api/nexus/strata/assessment/result/route.ts` returns `500` (`Failed to Parse Backend Response ⚓`) when backend returns non-JSON on unauthenticated requests.
- **Exam Engine Recovery (`useLiveExamActionContext.tsx`):**
  - Answer autosave retries up to **8 times** every **3000ms** on error, showing toast status (`saving` / `saved` / `error`).
  - `isAuthResolutionFailure()` detects backend auth errors and dispatches `exam:auth:required` to pause the exam and open `AuthRequiredModal` / `ImpelModal` without losing local reducer state.
  - **Gap (`P1`):** `handleConfirmedSubmit()` does not flush pending 800ms debounced answer timers before submitting.
