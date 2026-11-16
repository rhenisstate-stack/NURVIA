import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

export type { CountryCode };

export interface CountryOption {
  code: CountryCode;
  name: string;
  callingCode: string; // e.g. "+254"
  flag: string;
}

export interface NormalizedPhoneResult {
  valid: boolean;
  e164?: string;
  national?: string;
  country?: CountryCode;
  error?: string;
}

export const DEFAULT_PHONE_COUNTRY: CountryCode = 'KE';

const regionDisplayNames =
  typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

/**
 * Converts a 2-letter ISO 3166-1 alpha-2 country code into a Unicode flag emoji.
 */
export function countryCodeToFlag(countryCode: CountryCode): string {
  const upper = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return '🌐';
  const first = 0x1f1e6 + (upper.charCodeAt(0) - 65);
  const second = 0x1f1e6 + (upper.charCodeAt(1) - 65);
  return String.fromCodePoint(first, second);
}

let cachedCountryOptions: CountryOption[] | null = null;

/**
 * Returns the full maintained list of international calling-code options from libphonenumber-js.
 */
export function getCountryOptions(): CountryOption[] {
  if (cachedCountryOptions) return cachedCountryOptions;

  const list: CountryOption[] = getCountries().map((code) => {
    const name = regionDisplayNames?.of(code) || code;
    const callingCode = `+${getCountryCallingCode(code)}`;
    return {
      code,
      name,
      callingCode,
      flag: countryCodeToFlag(code),
    };
  });

  list.sort((a, b) => a.name.localeCompare(b.name));
  cachedCountryOptions = list;
  return list;
}

/**
 * Filters country options by country name, ISO code, or dialing code (with or without '+').
 */
export function filterCountries(query: string, options = getCountryOptions()): CountryOption[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return options;
  const digitsOnly = trimmed.replace(/[^\d]/g, '');

  return options.filter((opt) => {
    if (opt.name.toLowerCase().includes(trimmed)) return true;
    if (opt.code.toLowerCase() === trimmed) return true;
    if (opt.callingCode.toLowerCase().includes(trimmed)) return true;
    if (digitsOnly && opt.callingCode.slice(1).startsWith(digitsOnly)) return true;
    return false;
  });
}

/**
 * Normalizes and validates a national or international phone number into E.164 format.
 * Handles leading zeros according to the selected country's numbering rules.
 */
export function normalizePhoneNumber(
  rawInput: string,
  selectedCountry: CountryCode = DEFAULT_PHONE_COUNTRY,
  options: { allowPossible?: boolean } = {}
): NormalizedPhoneResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { valid: false, error: 'Phone number is required.' };
  }

  // Strip common formatting characters while preserving a leading '+' if present.
  const cleaned = trimmed.replace(/[\s().-]/g, '');
  if (!/^\+?\d{4,16}$/.test(cleaned)) {
    return { valid: false, error: 'Enter a valid phone number.' };
  }

  const parsed = parsePhoneNumberFromString(cleaned, selectedCountry);
  if (!parsed) {
    return { valid: false, error: 'Enter a valid phone number for the selected country.' };
  }

  const isAcceptable = options.allowPossible
    ? parsed.isValid() || (parsed.isPossible() && /^\+\d{7,15}$/.test(parsed.number))
    : parsed.isValid();

  if (!isAcceptable) {
    return { valid: false, error: 'Enter a valid phone number for the selected country.' };
  }

  return {
    valid: true,
    e164: parsed.number,
    national: parsed.formatNational(),
    country: parsed.country ?? selectedCountry,
  };
}
