# NURVIA Phase 3.6 — International Country Code Picker Report

**Date:** 2026-11-16  
**Phase:** D — International Country Code Picker  
**Status:** COMPLETE

---

## 1. Implementation Summary

- **Maintained Dataset & Parsing Library:** Added `libphonenumber-js` to `apps/web/package.json`.
- **Shared Phone Utility (`apps/web/lib/phone.ts`):**
  - `getCountryOptions()`: Generates all 245+ ISO 3166-1 alpha-2 regions supported by `libphonenumber-js`, with localized English region names via `Intl.DisplayNames(['en'], { type: 'region' })`, Unicode flag emojis (`countryCodeToFlag`), and dialing codes.
  - `filterCountries(query)`: Supports searching by country name, ISO code, or dialing code (with or without `+`), including shared calling codes (`+1` matches both United States and Canada).
  - `normalizePhoneNumber(rawInput, selectedCountry, { allowPossible })`: Normalizes local national numbers (including leading-zero rules) and international numbers into E.164 format (`+254712345678`, `+447911123456`, `+14155552671`, etc.) without silently truncating user input.
  - `DEFAULT_PHONE_COUNTRY`: `'KE'` (`+254`), easily configurable without invasive IP geolocation.
- **UI Component (`apps/web/components/auth/phone-country-input.tsx`):**
  - Visually separated `[Country selector: Flag +254] [Phone number input]` working as one logical field.
  - Searchable dropdown with keyboard navigation (`ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Escape`), ARIA `listbox`/`option` semantics, selected check indicator, and viewport-constrained width (`max-w-[calc(100vw-2rem)] sm:w-80`) for mobile safety.
- **Backend Compatibility (`apps/web/app/api/auth/register/route.ts`):**
  - Validates and normalizes `phone` to E.164 server-side before forwarding through the existing single `phone` field in `LexmaCastoRegisterPayload`.

---

## 2. Verification

- `apps/web/tests/phone-country-picker.test.mjs`: **10/10 passed** (Kenya, US, Canada shared `+1`, UK, India, Nigeria, leading-zero normalization, country change after entry, empty/invalid numbers, search by name/ISO/code).
- `apps/web/tests/auth-handlers-integration.test.mjs` (Test 10): Verified `POST /api/auth/register` normalizes `0712345678` -> `+254712345678` and rejects `"abc-12"` with HTTP `400`.
- `apps/web/tests/e2e/auth-route-remediation.spec.ts` (Test 7): Verified country-code search (`United Kingdom` -> `+44`), selection, and live E.164 preview (`+447911123456`) on a `375x812` mobile viewport.
