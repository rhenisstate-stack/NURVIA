/**
 * TEMPORARY — REMOVE WHEN OFFICIAL DESLIZAR INTEGRATION IS AVAILABLE
 *
 * Server-side temporary challenge compatibility module for LexmaCasto (`website 11`).
 * Centralizes the hardcoded challenge strings observed in the Qlex reference application
 * until the backend owner provisions the official Deslizar challenge issuance & verification contract.
 *
 * SECURITY RULES:
 * - Never import this module in `'use client'` components or browser-bundled code.
 * - Never return challenge values in API responses or error messages.
 * - Never log challenge values.
 * - Never store challenge values in cookies, localStorage, sessionStorage, or NEXT_PUBLIC_* env vars.
 */

export type TemporaryChallengeOperation = 'register' | 'standard_login' | 'custom_login';

const TEMPORARY_CHALLENGE_MAP: Readonly<Record<TemporaryChallengeOperation, string>> = Object.freeze({
  register: 'register-skew8@lancasto',
  standard_login: 'learner.login.skew8lancasto',
  custom_login: 'custom.login.skew8lancasto',
});

/**
 * Returns the temporary Qlex-compatible challenge string for a specific server-side auth operation.
 * Prevents accidental cross-operation reuse.
 */
export function getTemporaryChallenge(operation: TemporaryChallengeOperation): string {
  const value = TEMPORARY_CHALLENGE_MAP[operation];
  if (!value) {
    throw new Error(`Unsupported temporary challenge operation: ${String(operation)}`);
  }
  return value;
}

/**
 * Replacement contract for the future official Deslizar integration.
 * Replace `getTemporaryChallenge()` calls with verified Deslizar token verification once provisioned.
 */
export interface OfficialDeslizarChallengeContract {
  issuanceEndpoint: string;
  verificationEndpoint?: string;
  challengeId: string;
  challengeToken: string;
  expiresAtIso: string;
  operation: TemporaryChallengeOperation;
}
