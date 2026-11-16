import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(__dirname, '..');

const MOCK_PORT = 4199;
const WEB_PORT = 4198;
const WEB_ORIGIN = `http://localhost:${WEB_PORT}`;

let mockMode = 'ok';
const recordedBackendRequests = [];

const mockBackend = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');
  let body = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  recordedBackendRequests.push({
    method: req.method,
    url: req.url,
    headers: { ...req.headers },
    body,
  });

  if (mockMode === '401') {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Invalid credentials or session.' }));
    return;
  }
  if (mockMode === '403') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Forbidden by backend.' }));
    return;
  }
  if (mockMode === '429') {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Rate limited.' }));
    return;
  }
  if (mockMode === '500') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Internal error at 108.61.9.189' }));
    return;
  }
  if (mockMode === 'plain-text') {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway plain text');
    return;
  }
  if (mockMode === 'invalid-json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{not valid json');
    return;
  }
  if (mockMode === 'problem-400') {
    res.writeHead(400, { 'Content-Type': 'application/problem+json; charset=utf-8' });
    res.end(
      JSON.stringify({
        type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: {
          Challenge: ['The Challenge field is required.'],
        },
        traceId: '00-test-trace-00',
      })
    );
    return;
  }
  if (mockMode === 'html-400') {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>400 Bad Request</h1></body></html>');
    return;
  }
  if (mockMode === 'malformed-400') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end('{broken json');
    return;
  }
  if (mockMode === 'leak-400') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Sql exception at 108.61.9.189 using SKEW_LINE_APP_KEY and explicitbackend.com',
      })
    );
    return;
  }

  if (mockMode === 'login-no-creds') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        message: 'Login successful.',
        user: {
          id: 'usr-101',
          name: 'Test Nurse',
          email: body?.email || 'nurse@example.com',
          role: 'Learner',
        },
      })
    );
    return;
  }

  if (mockMode === 'register-with-creds') {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        message: 'Registered.',
        user: {
          id: 'usr-102',
          name: body?.username || 'New Nurse',
          email: body?.email || 'newnurse@example.com',
          role: 'Learner',
          dashboardName: body?.dashboardName || 'learner',
          castoLine: 'reg-casto-line-token',
          castoBadge: 'reg-casto-badge-token',
        },
      })
    );
    return;
  }

  if (req.url === '/api/castoline/auth/login' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        message: 'Login successful.',
        user: {
          id: 'usr-101',
          name: 'Test Nurse',
          email: body?.email || 'nurse@example.com',
          role: 'Learner',
          dashboardName: 'learner',
          castoLine: 'mock-casto-line-token',
          castoBadge: 'mock-casto-badge-token',
        },
        redirect_url: '/learner',
      })
    );
    return;
  }

  if (req.url === '/api/castoline/system/user/list/current?fetchtype=current' && req.method === 'GET') {
    if (!req.headers['x-casto-line'] || !req.headers['x-casto-badge']) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing Casto authentication headers' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'usr-101',
            name: 'Test Nurse',
            email: 'nurse@example.com',
            role: 'Learner',
            dashboardName: 'learner',
            castoLine: 'mock-casto-line-token',
            castoBadge: 'mock-casto-badge-token',
          },
        },
      })
    );
    return;
  }

  if (req.url === '/api/castoline/auth/register' && req.method === 'POST') {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Registered.' }));
    return;
  }

  if (req.url === '/api/castoline/auth/logout/sessions/distinct' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Logged out.' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Not found' }));
});

async function waitForServer(url, timeoutMs = 45_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

let nextProc;
try {
  await new Promise((resolve) => mockBackend.listen(MOCK_PORT, '127.0.0.1', resolve));

  const nextBin = path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  nextProc = spawn(process.execPath, [nextBin, 'dev', '-p', String(WEB_PORT)], {
    cwd: webDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      SKEW_LINE_ACTIVE_BACKEND: 'dotnet',
      SKEW_LINE_DOTNET_BASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
      SKEW_LINE_APP_KEY: 'test website key',
      SKEW_LINE_APP_DOMAIN: 'https://nurvia-black.vercel.app',
    },
    stdio: 'pipe',
  });

  await waitForServer(`${WEB_ORIGIN}/api/auth/config-status`);

  let passed = 0;
  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err);
      process.exitCode = 1;
    }
  }

  console.log('--- NURVIA PHASE 3.1 AUTH ROUTE HANDLER INTEGRATION TESTS ---');

  await test('1. GET /api/auth/config-status returns safe flags without leaking app key', async () => {
    const res = await fetch(`${WEB_ORIGIN}/api/auth/config-status`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const text = await res.text();
    assert.equal(text.includes('test website key'), false);
    const json = JSON.parse(text);
    assert.equal(json.success, true);
    assert.equal(json.data.appKeyConfigured, true);
    assert.equal(json.data.appDomainConfigured, true);
  });

  await test('2. GET /api/auth/me without session returns 401 and no-store', async () => {
    const res = await fetch(`${WEB_ORIGIN}/api/auth/me`);
    assert.equal(res.status, 401);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const json = await res.json();
    assert.equal(json.success, false);
  });

  await test('3. GET /api/backend/auth/me and /api/backend/auth/csrf are blocked (404)', async () => {
    const r1 = await fetch(`${WEB_ORIGIN}/api/backend/auth/me`);
    assert.equal(r1.status, 404);
    const r2 = await fetch(`${WEB_ORIGIN}/api/backend/auth/csrf`);
    assert.equal(r2.status, 404);
  });

  await test('4. POST /api/auth/login rejects foreign Origin, missing Origin/Referer, and cross-site Sec-Fetch-Site (CSRF)', async () => {
    const foreign = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
    });
    assert.equal(foreign.status, 403);

    const missing = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
    });
    assert.equal(missing.status, 403);

    const crossSite = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: WEB_ORIGIN,
        'Sec-Fetch-Site': 'cross-site',
      },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
    });
    assert.equal(crossSite.status, 403);
  });

  let sessionCookies = '';
  await test('5. POST /api/auth/login sets HttpOnly cookies, strips Casto tokens, and sends server site headers', async () => {
    recordedBackendRequests.length = 0;
    const res = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const setCookies = res.headers.getSetCookie();
    assert.equal(setCookies.some((c) => c.startsWith('nurvia_casto_line=') && /httponly/i.test(c)), true);
    assert.equal(setCookies.some((c) => c.startsWith('nurvia_casto_badge=') && /httponly/i.test(c)), true);
    sessionCookies = setCookies.map((c) => c.split(';')[0]).join('; ');

    const bodyText = await res.text();
    assert.equal(bodyText.includes('mock-casto-line-token'), false);
    assert.equal(bodyText.includes('mock-casto-badge-token'), false);
    const json = JSON.parse(bodyText);
    assert.equal(json.success, true);
    assert.equal(json.data.email, 'nurse@example.com');

    assert.equal(recordedBackendRequests.length, 1);
    assert.equal(recordedBackendRequests[0].url, '/api/castoline/auth/login');
    assert.equal(recordedBackendRequests[0].body.loginMethod, 'password');
    assert.equal(recordedBackendRequests[0].body.LoginProvider, 'email');
    assert.equal(recordedBackendRequests[0].headers['x-site-key'], 'test website key');
    assert.equal(recordedBackendRequests[0].headers['x-site-domain'], 'https://nurvia-black.vercel.app');
  });

  await test('5a. POST /api/auth/login rejects unsupported loginMethod and unsupported Content-Type', async () => {
    recordedBackendRequests.length = 0;
    const res = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!', loginMethod: 'magic' }),
    });
    assert.equal(res.status, 400);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(recordedBackendRequests.length, 0);

    const wrongCt = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: WEB_ORIGIN },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
    });
    assert.equal(wrongCt.status, 415);
    assert.equal(wrongCt.headers.get('cache-control'), 'no-store');
    assert.equal(recordedBackendRequests.length, 0);
  });

  await test('5b. POST /api/auth/login supports PIN login, server-enforced role/dashboardName, rememberMe, and rejects missing session credentials', async () => {
    recordedBackendRequests.length = 0;
    const pinRes = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({
        email: 'nurse@example.com',
        pin: '123456',
        loginMethod: 'pin',
        LoginProvider: 'email',
        dashboardName: 'custom',
        role: 'Superadmin',
        fingerprint: 'fp-test-1234',
        rememberMe: false,
      }),
    });
    assert.equal(pinRes.status, 200);
    assert.equal(pinRes.headers.get('cache-control'), 'no-store');
    assert.equal(recordedBackendRequests[0].body.loginMethod, 'pin');
    assert.equal(recordedBackendRequests[0].body.pin, '123456');
    assert.equal(recordedBackendRequests[0].body.password, undefined);
    assert.equal(recordedBackendRequests[0].body.role, 'Learner');
    assert.equal(recordedBackendRequests[0].body.dashboardName, 'web');
    assert.equal(recordedBackendRequests[0].body.fingerprint, 'fp-test-1234');
    const pinCookies = pinRes.headers.getSetCookie();
    assert.equal(pinCookies.some((c) => c.startsWith('nurvia_casto_line=') && /httponly/i.test(c) && /samesite=lax/i.test(c) && !/max-age=/i.test(c)), true);

    mockMode = 'login-no-creds';
    const noCredsRes = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
    });
    assert.equal(noCredsRes.status, 502);
    assert.equal(noCredsRes.headers.get('cache-control'), 'no-store');
    assert.equal(noCredsRes.headers.getSetCookie().length, 0);

    for (const [mode, expectedStatus] of [
      ['401', 401],
      ['problem-400', 400],
      ['invalid-json', 502],
      ['malformed-400', 400],
    ]) {
      mockMode = mode;
      const errRes = await fetch(`${WEB_ORIGIN}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
        body: JSON.stringify({ email: 'nurse@example.com', password: 'Password123!' }),
      });
      assert.equal(errRes.status, expectedStatus, `Expected ${expectedStatus} for login mode ${mode}`);
      assert.equal(errRes.headers.get('cache-control'), 'no-store');
      assert.equal(errRes.headers.getSetCookie().length, 0);
    }
    mockMode = 'ok';
  });

  await test('6. GET /api/auth/me with session forwards Casto headers to verified current-user endpoint', async () => {
    recordedBackendRequests.length = 0;
    const res = await fetch(`${WEB_ORIGIN}/api/auth/me`, {
      headers: { Cookie: sessionCookies },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.email, 'nurse@example.com');
    assert.equal(recordedBackendRequests[0].url, '/api/castoline/system/user/list/current?fetchtype=current');
    assert.equal(recordedBackendRequests[0].headers['x-casto-line'], 'mock-casto-line-token');
    assert.equal(recordedBackendRequests[0].headers['x-casto-badge'], 'mock-casto-badge-token');
  });

  await test('7. POST /api/auth/register forwards Learner registration payload and enforces no-store', async () => {
    recordedBackendRequests.length = 0;
    const res = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({
        username: 'New Nurse',
        email: 'newnurse@example.com',
        phone: '+15550109988',
        password: 'StrongPassword123!',
        passwordConfirmation: 'StrongPassword123!',
        agree: true,
        role: 'Superadmin',
      }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(recordedBackendRequests[0].url, '/api/castoline/auth/register');
    assert.equal(recordedBackendRequests[0].body.role, 'Learner');
    assert.equal(recordedBackendRequests[0].body.phone, '+15550109988');
    assert.equal(recordedBackendRequests[0].body.agree, true);
    assert.equal(recordedBackendRequests[0].body.provider, 'email');
    assert.equal(recordedBackendRequests[0].body.challenge, undefined);
    assert.equal(recordedBackendRequests[0].headers['x-site-key'], 'test website key');
    assert.equal(recordedBackendRequests[0].headers['x-site-domain'], 'https://nurvia-black.vercel.app');
  });

  await test('7a. POST /api/auth/register enforces consent, email, password match/length, loginMethod, and required phone', async () => {
    const cases = [
      {
        name: 'consent false',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', password: 'StrongPassword123!', passwordConfirmation: 'StrongPassword123!', agree: false },
      },
      {
        name: 'invalid email',
        body: { username: 'New Nurse', email: 'not-an-email', phone: '+15550109988', password: 'StrongPassword123!', passwordConfirmation: 'StrongPassword123!', agree: true },
      },
      {
        name: 'password mismatch',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', password: 'StrongPassword123!', passwordConfirmation: 'DifferentPass123!', agree: true },
      },
      {
        name: 'short password',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', password: 'short', passwordConfirmation: 'short', agree: true },
      },
      {
        name: 'missing phone',
        body: { username: 'New Nurse', email: 'nurse@example.com', password: 'StrongPassword123!', passwordConfirmation: 'StrongPassword123!', agree: true },
      },
      {
        name: 'invalid loginMethod',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', password: 'StrongPassword123!', passwordConfirmation: 'StrongPassword123!', loginMethod: 'biometric', agree: true },
      },
      {
        name: 'both loginMethod missing pin',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', password: 'StrongPassword123!', passwordConfirmation: 'StrongPassword123!', loginMethod: 'both', agree: true },
      },
      {
        name: 'pin mismatch',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', pin: '1234', pinConfirmation: '9999', loginMethod: 'pin', agree: true },
      },
      {
        name: 'invalid non-numeric pin',
        body: { username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', pin: 'abcd', pinConfirmation: 'abcd', loginMethod: 'pin', agree: true },
      },
    ];
    for (const c of cases) {
      recordedBackendRequests.length = 0;
      const res = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
        body: JSON.stringify(c.body),
      });
      assert.equal(res.status, 400, `Expected 400 for ${c.name}`);
      assert.equal(res.headers.get('cache-control'), 'no-store');
      assert.equal(recordedBackendRequests.length, 0, `Should not call backend for invalid ${c.name}`);
      assert.equal(res.headers.getSetCookie().length, 0, `Should not set cookies on failure for ${c.name}`);
    }

    // Unsupported Content-Type -> 415
    const wrongCt = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: WEB_ORIGIN },
      body: JSON.stringify({ username: 'New Nurse', email: 'nurse@example.com', phone: '+15550109988', pin: '1234', pinConfirmation: '1234', loginMethod: 'pin', agree: true }),
    });
    assert.equal(wrongCt.status, 415);
    assert.equal(wrongCt.headers.get('cache-control'), 'no-store');
  });

  await test('7c. POST /api/auth/register supports PIN and combined (both) registration and sets cookies only when valid credentials returned', async () => {
    recordedBackendRequests.length = 0;
    const pinRes = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({
        username: 'PIN Nurse',
        email: 'pinnurse@example.com',
        phone: '+15550109988',
        pin: '123456',
        pinConfirmation: '123456',
        loginMethod: 'pin',
        dashboardName: 'learner',
        agree: true,
      }),
    });
    assert.equal(pinRes.status, 201);
    assert.equal(pinRes.headers.get('cache-control'), 'no-store');
    assert.equal(pinRes.headers.getSetCookie().length, 0);
    assert.equal(recordedBackendRequests[0].body.loginMethod, 'pin');
    assert.equal(recordedBackendRequests[0].body.pin, '123456');
    assert.equal(recordedBackendRequests[0].body.pinConfirmation, '123456');
    assert.equal(recordedBackendRequests[0].body.password, undefined);
    assert.equal(recordedBackendRequests[0].body.role, 'Learner');
    assert.equal(recordedBackendRequests[0].body.dashboardName, 'web');

    recordedBackendRequests.length = 0;
    mockMode = 'register-with-creds';
    const bothRes = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify({
        username: 'Both Nurse',
        email: 'bothnurse@example.com',
        phone: '+15550109988',
        password: 'StrongPassword123!',
        passwordConfirmation: 'StrongPassword123!',
        pin: '123456',
        pinConfirmation: '123456',
        loginMethod: 'both',
        provider: 'google',
        providerPayload: 'oauth-token-123',
        agree: true,
      }),
    });
    mockMode = 'ok';
    assert.equal(bothRes.status, 201);
    assert.equal(bothRes.headers.get('cache-control'), 'no-store');
    assert.equal(recordedBackendRequests[0].body.loginMethod, 'both');
    assert.equal(recordedBackendRequests[0].body.provider, 'google');
    assert.equal(recordedBackendRequests[0].body.providerPayload, 'oauth-token-123');
    const bothText = await bothRes.text();
    assert.equal(bothText.includes('reg-casto-line-token'), false);
    assert.equal(bothText.includes('reg-casto-badge-token'), false);
    const bothCookies = bothRes.headers.getSetCookie();
    assert.equal(bothCookies.some((c) => c.startsWith('nurvia_casto_line=') && /httponly/i.test(c)), true);
  });

  await test('7b. POST /api/auth/register preserves ValidationProblemDetails and sanitizes HTML/malformed/leaky 400s', async () => {
    const validPayload = {
      username: 'New Nurse',
      email: 'nurse@example.com',
      phone: '+15550109988',
      password: 'StrongPassword123!',
      passwordConfirmation: 'StrongPassword123!',
      agree: true,
    };

    mockMode = 'problem-400';
    let res = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
      body: JSON.stringify(validPayload),
    });
    assert.equal(res.status, 400);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.getSetCookie().length, 0);
    let json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.errorCode, 'VALIDATION_ERROR');
    assert.match(json.message, /Challenge/i);
    assert.equal(Array.isArray(json.errors), true);
    assert.match(json.errors[0], /The Challenge field is required/i);

    for (const mode of ['html-400', 'malformed-400', 'leak-400']) {
      mockMode = mode;
      res = await fetch(`${WEB_ORIGIN}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN },
        body: JSON.stringify(validPayload),
      });
      assert.equal(res.status, 400, `Expected 400 for ${mode}`);
      assert.equal(res.headers.get('cache-control'), 'no-store');
      assert.equal(res.headers.getSetCookie().length, 0);
      const text = await res.text();
      assert.equal(text.includes('108.61.9.189'), false);
      assert.equal(text.includes('explicitbackend.com'), false);
      assert.equal(text.includes('SKEW_LINE_APP_KEY'), false);
      assert.equal(text.includes('StrongPassword123!'), false);
      assert.equal(text.includes('<html>'), false);
    }
    mockMode = 'ok';
  });

  await test('8. POST /api/auth/logout calls backend distinct logout with target_dashboard and clears cookies', async () => {
    recordedBackendRequests.length = 0;
    const res = await fetch(`${WEB_ORIGIN}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: WEB_ORIGIN, Cookie: sessionCookies },
      body: JSON.stringify({ scope: 'distinct', target_dashboard: 'learner' }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(recordedBackendRequests[0].url, '/api/castoline/auth/logout/sessions/distinct');
    assert.deepEqual(recordedBackendRequests[0].body, { target_dashboard: 'learner' });
    const setCookies = res.headers.getSetCookie();
    assert.equal(setCookies.some((c) => c.startsWith('nurvia_casto_line=;') && /max-age=0/i.test(c)), true);
  });

  await test('9. Backend negative cases (401, 403, 429, 500, plain-text, invalid JSON) are safely handled and redacted', async () => {
    for (const [mode, expectedStatus] of [
      ['401', 401],
      ['403', 403],
      ['429', 429],
      ['500', 500],
      ['plain-text', 502],
      ['invalid-json', 502],
    ]) {
      mockMode = mode;
      const res = await fetch(`${WEB_ORIGIN}/api/auth/me`, {
        headers: { Cookie: sessionCookies },
      });
      assert.equal(res.status, expectedStatus, `Expected ${expectedStatus} for mode ${mode}`);
      assert.equal(res.headers.get('cache-control'), 'no-store');
      const text = await res.text();
      assert.equal(text.includes('108.61.9.189'), false);
      const json = JSON.parse(text);
      assert.equal(json.success, false);
    }
    mockMode = 'ok';
  });

  console.log(`\nAuth Route Handler Integration Tests: ${passed} passed.`);
} finally {
  if (nextProc) nextProc.kill();
  mockBackend.close();
}
