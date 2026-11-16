/**
 * Strict route & method allowlist for NURVIA's `/api/backend/[...path]` proxy.
 * Eliminates open-proxy behavior: unknown routes, disallowed methods, traversal
 * encodings, and unauthorized access fail closed.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ProxyAuthLevel = 'public' | 'authenticated' | 'staff';

export interface ProxyRouteRule {
  id: string;
  pattern: RegExp;
  methods: readonly HttpMethod[];
  auth: ProxyAuthLevel;
  maxBodyBytes: number;
  allowMultipart?: boolean;
}

const DEFAULT_JSON_MAX_BYTES = 1_048_576; // 1 MB
const AVATAR_MAX_BYTES = 5_242_880; // 5 MB

export const STAFF_ROLES = new Set([
  'author',
  'reviewer',
  'publisher',
  'administrator',
  'superadmin',
]);

export const PROXY_ROUTE_RULES: readonly ProxyRouteRule[] = [
  // Public / Recovery Auth
  { id: 'auth-forgot-password', pattern: /^auth\/forgot-password$/, methods: ['POST'], auth: 'public', maxBodyBytes: 16_384 },
  { id: 'auth-reset-password', pattern: /^auth\/reset-password$/, methods: ['POST'], auth: 'public', maxBodyBytes: 16_384 },
  { id: 'auth-invitations-accept', pattern: /^auth\/invitations\/accept$/, methods: ['POST'], auth: 'public', maxBodyBytes: 16_384 },

  // Authenticated User & Profile
  { id: 'auth-profile', pattern: /^auth\/profile$/, methods: ['PUT'], auth: 'authenticated', maxBodyBytes: 32_768 },
  { id: 'profile', pattern: /^profile$/, methods: ['GET', 'PUT'], auth: 'authenticated', maxBodyBytes: 65_536 },
  { id: 'avatar', pattern: /^avatar$/, methods: ['GET', 'POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: AVATAR_MAX_BYTES, allowMultipart: true },

  // Staff / Admin Auth & RBAC
  { id: 'auth-users', pattern: /^auth\/users$/, methods: ['GET'], auth: 'staff', maxBodyBytes: 0 },
  { id: 'auth-assign-role', pattern: /^auth\/assign-role$/, methods: ['POST'], auth: 'staff', maxBodyBytes: 16_384 },
  { id: 'auth-invitations', pattern: /^auth\/invitations$/, methods: ['GET', 'POST'], auth: 'staff', maxBodyBytes: 32_768 },
  { id: 'auth-invitations-id', pattern: /^auth\/invitations\/[a-zA-Z0-9_-]+$/, methods: ['DELETE'], auth: 'staff', maxBodyBytes: 0 },

  // Study Library (Public catalog + Authenticated saved/reviews)
  { id: 'study-library-list', pattern: /^study-library$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'study-library-filters', pattern: /^study-library\/filters$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'study-library-summary', pattern: /^study-library\/summary$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'study-library-saved', pattern: /^study-library\/saved$/, methods: ['GET'], auth: 'authenticated', maxBodyBytes: 0 },
  { id: 'study-library-saved-id', pattern: /^study-library\/saved\/[a-zA-Z0-9_-]+$/, methods: ['POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: 16_384 },
  { id: 'study-library-reviews', pattern: /^study-library\/[a-zA-Z0-9_-]+\/reviews$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'study-library-reviews-post', pattern: /^study-library\/[a-zA-Z0-9_-]+\/reviews$/, methods: ['POST'], auth: 'authenticated', maxBodyBytes: 32_768 },
  { id: 'study-library-detail', pattern: /^study-library\/[a-zA-Z0-9_-]+$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },

  // Lectures
  { id: 'lectures-list', pattern: /^lectures$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'lectures-management', pattern: /^lectures\/management(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET'], auth: 'staff', maxBodyBytes: 0 },
  { id: 'lectures-create', pattern: /^lectures$/, methods: ['POST'], auth: 'staff', maxBodyBytes: DEFAULT_JSON_MAX_BYTES },
  { id: 'lectures-update', pattern: /^lectures\/[a-zA-Z0-9_-]+$/, methods: ['PUT'], auth: 'staff', maxBodyBytes: DEFAULT_JSON_MAX_BYTES },
  { id: 'lectures-workflow', pattern: /^lectures\/[a-zA-Z0-9_-]+\/(?:submit-for-review|review|publish|archive)$/, methods: ['POST'], auth: 'staff', maxBodyBytes: 65_536 },
  { id: 'lectures-slug', pattern: /^lectures\/[a-zA-Z0-9._-]+$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },

  // Questions
  { id: 'questions-read', pattern: /^questions(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET'], auth: 'authenticated', maxBodyBytes: 0 },
  { id: 'questions-versions', pattern: /^questions\/[a-zA-Z0-9_-]+\/versions$/, methods: ['GET'], auth: 'staff', maxBodyBytes: 0 },
  { id: 'questions-write', pattern: /^questions(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['POST', 'PUT'], auth: 'staff', maxBodyBytes: DEFAULT_JSON_MAX_BYTES },
  { id: 'questions-workflow', pattern: /^questions\/[a-zA-Z0-9_-]+\/(?:validate|submit|review|publish|archive)$/, methods: ['POST'], auth: 'staff', maxBodyBytes: 65_536 },

  // Exams
  { id: 'exams-read', pattern: /^exams(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET'], auth: 'authenticated', maxBodyBytes: 0 },
  { id: 'exams-preview-review', pattern: /^exams\/[a-zA-Z0-9_-]+\/(?:review-content|preview)$/, methods: ['GET'], auth: 'authenticated', maxBodyBytes: 0 },
  { id: 'exams-versions', pattern: /^exams\/[a-zA-Z0-9_-]+\/versions$/, methods: ['GET'], auth: 'staff', maxBodyBytes: 0 },
  { id: 'exams-write', pattern: /^exams(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['POST', 'PUT'], auth: 'staff', maxBodyBytes: DEFAULT_JSON_MAX_BYTES },
  { id: 'exams-workflow', pattern: /^exams\/[a-zA-Z0-9_-]+\/(?:validate|submit|approve|publish|archive|release-review)$/, methods: ['POST'], auth: 'staff', maxBodyBytes: 65_536 },

  // Attempts & Tutor Mode
  { id: 'attempts-history', pattern: /^attempts\/history$/, methods: ['GET'], auth: 'authenticated', maxBodyBytes: 0 },
  { id: 'attempts-start', pattern: /^attempts\/start\/[a-zA-Z0-9_-]+$/, methods: ['POST'], auth: 'authenticated', maxBodyBytes: 16_384 },
  { id: 'attempts-get', pattern: /^attempts\/[a-zA-Z0-9_-]+$/, methods: ['GET'], auth: 'authenticated', maxBodyBytes: 0 },
  { id: 'attempts-actions', pattern: /^attempts\/[a-zA-Z0-9_-]+\/(?:responses|submit|review)$/, methods: ['GET', 'PUT', 'POST'], auth: 'authenticated', maxBodyBytes: DEFAULT_JSON_MAX_BYTES },
  { id: 'attempts-tutor', pattern: /^attempts\/[a-zA-Z0-9_-]+\/tutor\/(?:hint|evaluate|session)$/, methods: ['GET', 'POST'], auth: 'authenticated', maxBodyBytes: DEFAULT_JSON_MAX_BYTES },

  // Learner Workspace
  { id: 'learner-saved-questions', pattern: /^learner\/saved-questions(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET', 'POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: 32_768 },
  { id: 'learner-planner', pattern: /^learner\/planner(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET', 'POST', 'PUT', 'DELETE'], auth: 'authenticated', maxBodyBytes: 65_536 },
  { id: 'flashcards', pattern: /^flashcards(?:\/[a-zA-Z0-9_-]+(?:\/review)?)?$/, methods: ['GET', 'POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: 65_536 },
  { id: 'care-plans', pattern: /^care-plans(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET', 'POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: 131_072 },
  { id: 'study-guides', pattern: /^study-guides(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET', 'POST'], auth: 'authenticated', maxBodyBytes: 131_072 },
  { id: 'tutor-sessions', pattern: /^tutor\/sessions(?:\/[a-zA-Z0-9_-]+(?:\/messages)?)?$/, methods: ['GET', 'POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: 131_072 },

  // Community
  { id: 'community-read', pattern: /^community\/posts(?:\/[a-zA-Z0-9_-]+)?$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'community-write', pattern: /^community\/posts(?:\/[a-zA-Z0-9_-]+(?:\/(?:replies|like))?)?$/, methods: ['POST', 'DELETE'], auth: 'authenticated', maxBodyBytes: 65_536 },

  // Subscriptions
  { id: 'subscriptions-plans', pattern: /^subscriptions\/plans$/, methods: ['GET'], auth: 'public', maxBodyBytes: 0 },
  { id: 'subscriptions-me', pattern: /^subscriptions\/(?:me|activate-free|checkout)$/, methods: ['GET', 'POST'], auth: 'authenticated', maxBodyBytes: 32_768 },

  // Admin & Audit
  { id: 'audit-logs', pattern: /^audit-logs$/, methods: ['GET'], auth: 'staff', maxBodyBytes: 0 },
  { id: 'admin-read', pattern: /^admin\/(?:overview|learners|question-types|analytics|taxonomy|system-status|subscriptions)$/, methods: ['GET'], auth: 'staff', maxBodyBytes: 0 },
  { id: 'admin-plans', pattern: /^admin\/plans$/, methods: ['POST'], auth: 'staff', maxBodyBytes: 65_536 },
  { id: 'admin-subscriptions', pattern: /^admin\/subscriptions\/(?:grant|[a-zA-Z0-9_-]+\/revoke)$/, methods: ['POST'], auth: 'staff', maxBodyBytes: 32_768 },
];

export type ProxyMatchResult =
  | { allowed: true; normalizedPath: string; rule: ProxyRouteRule }
  | { allowed: false; status: 400 | 404 | 405; reason: string };

/**
 * Validates path segments against traversal, double-encoding, backslashes, and
 * matches against the explicit allowlist + HTTP method matrix.
 */
export function matchProxyRoute(method: HttpMethod, rawSegments: string[]): ProxyMatchResult {
  if (!Array.isArray(rawSegments) || rawSegments.length === 0) {
    return { allowed: false, status: 400, reason: 'Invalid backend path.' };
  }

  const decodedSegments: string[] = [];
  for (const seg of rawSegments) {
    if (typeof seg !== 'string' || !seg) {
      return { allowed: false, status: 400, reason: 'Empty path segment.' };
    }
    // Reject encoded traversal, encoded slashes, backslashes, or control chars before decoding
    if (/%2e|%2f|%5c|%25|\\\\|\\|[\r\n\0]/i.test(seg)) {
      return { allowed: false, status: 400, reason: 'Blocked unsafe path encoding.' };
    }
    let decoded: string;
    try {
      decoded = decodeURIComponent(seg);
    } catch {
      return { allowed: false, status: 400, reason: 'Malformed path encoding.' };
    }
    if (
      decoded === '.' ||
      decoded === '..' ||
      decoded.includes('..') ||
      decoded.includes('/') ||
      decoded.includes('\\') ||
      /[\r\n\0]/.test(decoded)
    ) {
      return { allowed: false, status: 400, reason: 'Blocked path traversal.' };
    }
    decodedSegments.push(decoded);
  }

  const normalizedPath = decodedSegments.join('/');
  let pathMatched = false;

  for (const rule of PROXY_ROUTE_RULES) {
    if (rule.pattern.test(normalizedPath)) {
      pathMatched = true;
      if (rule.methods.includes(method)) {
        return { allowed: true, normalizedPath, rule };
      }
    }
  }

  if (pathMatched) {
    return { allowed: false, status: 405, reason: `Method ${method} is not allowed for this route.` };
  }

  return { allowed: false, status: 404, reason: 'Backend route is not allowlisted.' };
}
