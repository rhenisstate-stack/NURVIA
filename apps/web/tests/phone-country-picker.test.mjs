import assert from 'node:assert/strict';
import {
  countryCodeToFlag,
  DEFAULT_PHONE_COUNTRY,
  filterCountries,
  getCountryOptions,
  normalizePhoneNumber,
} from '../lib/phone.ts';

function run() {
  console.log('--- NURVIA PHONE & COUNTRY CODE PICKER UNIT TESTS ---');

  assert.equal(DEFAULT_PHONE_COUNTRY, 'KE');
  const options = getCountryOptions();
  assert.ok(options.length >= 200, `Expected full country dataset, got ${options.length}`);

  // Flags & required countries
  assert.equal(countryCodeToFlag('KE'), '🇰🇪');
  assert.equal(countryCodeToFlag('US'), '🇺🇸');
  assert.ok(options.some((c) => c.code === 'KE' && c.callingCode === '+254'));
  assert.ok(options.some((c) => c.code === 'US' && c.callingCode === '+1'));
  assert.ok(options.some((c) => c.code === 'CA' && c.callingCode === '+1'));
  assert.ok(options.some((c) => c.code === 'GB' && c.callingCode === '+44'));
  assert.ok(options.some((c) => c.code === 'IN' && c.callingCode === '+91'));
  assert.ok(options.some((c) => c.code === 'NG' && c.callingCode === '+234'));

  // Search by name, ISO, and dialing code (including shared +1)
  assert.ok(filterCountries('kenya', options).some((c) => c.code === 'KE'));
  assert.ok(filterCountries('254', options).some((c) => c.code === 'KE'));
  assert.ok(filterCountries('+234', options).some((c) => c.code === 'NG'));
  const plusOneMatches = filterCountries('+1', options);
  assert.ok(plusOneMatches.some((c) => c.code === 'US'));
  assert.ok(plusOneMatches.some((c) => c.code === 'CA'));

  // E.164 normalization across target countries & leading-zero rules
  const ke = normalizePhoneNumber('0712345678', 'KE');
  assert.equal(ke.valid, true);
  assert.equal(ke.e164, '+254712345678');

  const us = normalizePhoneNumber('4155552671', 'US');
  assert.equal(us.valid, true);
  assert.equal(us.e164, '+14155552671');

  const ca = normalizePhoneNumber('4165550199', 'CA');
  assert.equal(ca.valid, true);
  assert.equal(ca.e164, '+14165550199');

  const gb = normalizePhoneNumber('07911123456', 'GB');
  assert.equal(gb.valid, true);
  assert.equal(gb.e164, '+447911123456');

  const ind = normalizePhoneNumber('09876543210', 'IN');
  assert.equal(ind.valid, true);
  assert.equal(ind.e164, '+919876543210');

  const ng = normalizePhoneNumber('08031234567', 'NG');
  assert.equal(ng.valid, true);
  assert.equal(ng.e164, '+2348031234567');

  // Country changed after number entry
  const keAsUs = normalizePhoneNumber('0712345678', 'US');
  assert.equal(keAsUs.valid, false);

  // Empty and invalid national numbers
  const empty = normalizePhoneNumber('   ', 'KE');
  assert.equal(empty.valid, false);
  assert.match(empty.error || '', /required/i);

  const tooShort = normalizePhoneNumber('123', 'KE');
  assert.equal(tooShort.valid, false);

  const nonNumeric = normalizePhoneNumber('abc-def', 'KE');
  assert.equal(nonNumeric.valid, false);

  console.log('All 10 phone & country-code picker unit tests PASSED!');
}

run();
