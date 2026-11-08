import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;
export const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const REMEMBER_TTL_SECONDS = REMEMBER_TTL_MS / 1000;

export type CookiePersistence = 'session' | 'persistent';

const KEY_SALT = 'pharma-demo-login-session-v1';
const keyCache = new Map<string, Buffer>();

export type SessionPayload = {
  username: string;
  expiresAt: number;
};

export function sessionCookieName(cookieSecure: boolean): string {
  return cookieSecure ? '__Host-pharma_session' : 'pharma_session';
}

export function sealSession(
  payload: SessionPayload,
  sessionSecret: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    'aes-256-gcm',
    keyFromSecret(sessionSecret),
    iv,
  );
  const plaintext = JSON.stringify({
    username: payload.username,
    expiresAt: payload.expiresAt,
  });
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, ciphertext, tag]
    .map((part) => part.toString('base64url'))
    .join('.');
}

export function openSession(
  token: string,
  sessionSecret: string,
  now: number,
): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [ivPart, ciphertextPart, tagPart] = parts;
  if (ivPart == null || ciphertextPart == null || tagPart == null) {
    return null;
  }

  let iv: Buffer;
  let ciphertext: Buffer;
  let tag: Buffer;
  try {
    iv = Buffer.from(ivPart, 'base64url');
    ciphertext = Buffer.from(ciphertextPart, 'base64url');
    tag = Buffer.from(tagPart, 'base64url');
  } catch {
    return null;
  }

  if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) {
    return null;
  }

  let plaintext: string;
  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      keyFromSecret(sessionSecret),
      iv,
    );
    decipher.setAuthTag(tag);
    plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(plaintext) as unknown;
  } catch {
    return null;
  }

  if (!isSessionPayload(parsed)) {
    return null;
  }

  if (parsed.expiresAt <= now) {
    return null;
  }

  return parsed;
}

export function buildSessionSetCookie(input: {
  token: string;
  cookieSecure: boolean;
  persistence: CookiePersistence;
}): string {
  return serializeCookie(sessionCookieName(input.cookieSecure), input.token, {
    cookieSecure: input.cookieSecure,
    maxAgeSeconds:
      input.persistence === 'persistent' ? REMEMBER_TTL_SECONDS : null,
  });
}

export function buildClearSessionCookie(cookieSecure: boolean): string {
  return serializeCookie(sessionCookieName(cookieSecure), '', {
    cookieSecure,
    maxAgeSeconds: 0,
  });
}

export function readCookie(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (cookieHeader == null || cookieHeader.length === 0) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return null;
}

export function safeEqualString(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function serializeCookie(
  name: string,
  value: string,
  options: { cookieSecure: boolean; maxAgeSeconds: number | null },
): string {
  const parts = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (options.maxAgeSeconds != null) {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }
  if (options.cookieSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function keyFromSecret(sessionSecret: string): Buffer {
  const cached = keyCache.get(sessionSecret);
  if (cached) {
    return cached;
  }
  const derived = scryptSync(sessionSecret, KEY_SALT, 32);
  keyCache.set(sessionSecret, derived);
  return derived;
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.username === 'string' &&
    record.username.length > 0 &&
    typeof record.expiresAt === 'number' &&
    Number.isFinite(record.expiresAt) &&
    Object.keys(record).every(
      (key) => key === 'username' || key === 'expiresAt',
    )
  );
}
