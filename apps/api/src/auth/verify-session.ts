import {
  openSession,
  readCookie,
  sessionCookieName,
  type SessionPayload,
} from './session-cookie';

export function evaluateSessionCookie(input: {
  cookieHeader: string | null | undefined;
  sessionSecret: string;
  cookieSecure: boolean;
  now: number;
}): SessionPayload | null {
  const name = sessionCookieName(input.cookieSecure);
  const token = readCookie(input.cookieHeader ?? null, name);
  if (token == null || token.length === 0) {
    return null;
  }
  return openSession(token, input.sessionSecret, input.now);
}
