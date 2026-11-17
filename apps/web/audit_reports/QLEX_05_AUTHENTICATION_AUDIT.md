# QLEX_05 — AUTHENTICATION AUDIT

## 1. Supported Authentication Methods
- **Email + Password** (`loginMethod: "password"`, `LoginProvider: "email"`, `challenge: "learner.login.skew8lancasto"`).
- **Email + PIN** (`loginMethod: "pin"`, supported in types/service, though `WebLoginPage` and `LoginModal` hardcode `const loginMethod: "password" | "pin" = "password"`).
- **Social OAuth** (`google`, `apple`, `facebook`, `github`, `linkedin`, `microsoft`, `onetap`) via `redirectToSocialProvider()` (`src/lib/services/auth/socialService.ts`).

## 2. Login Request Lifecycle
1. `Login.tsx` / `auth/login/page.tsx` calls `login(credentials)` (`src/lib/services/auth/loginService.ts`).
2. `login()` generates/reads a 64-char `fingerprint` cookie and resolves public IP via `https://api.ipify.org?format=json`.
3. `POST /api/auth/login` forwards payload + `getSiteHeaders()` to `POST {backend}/api/castoline/auth/login`.
4. `api/auth/login/route.ts` extracts `user?.castoBadge` and `user?.castoLine` from backend response and returns `{ ...rest, casto_badge, casto_line }`.
5. `loginService.ts` calls `writeAuthSessionCookies(result.casto_badge, result.casto_line)`.

## 3. Verified Defects & Risks
1. **Plaintext Password Logging (`P1`):** `src/app/api/auth/login/route.ts` (line 48) logs `JSON.stringify(body)` containing plaintext `password`/`pin` to server stdout.
2. **External IP Lookup Dependency (`P3`):** Login blocks on `https://api.ipify.org?format=json` on first login if `skew_blanc_session_address` cookie is absent.
3. **Live Test Status (`UNVERIFIED`):** Live login could not be executed because controlled registration was blocked in the browser test.
