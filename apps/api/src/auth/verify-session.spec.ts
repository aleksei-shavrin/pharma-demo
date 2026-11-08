import {
  SESSION_TTL_MS,
  sealSession,
  sessionCookieName,
} from './session-cookie';
import { evaluateSessionCookie } from './verify-session';

const SECRET = 'verify-session-secret-32-chars-ok!';

describe('evaluateSessionCookie', () => {
  it('opens valid cookie and rejects missing', () => {
    const now = Date.now();
    const token = sealSession(
      { username: 'pharma-dev', expiresAt: now + SESSION_TTL_MS },
      SECRET,
    );
    const header = `${sessionCookieName(false)}=${token}`;
    expect(
      evaluateSessionCookie({
        cookieHeader: header,
        sessionSecret: SECRET,
        cookieSecure: false,
        now,
      })?.username,
    ).toBe('pharma-dev');
    expect(
      evaluateSessionCookie({
        cookieHeader: null,
        sessionSecret: SECRET,
        cookieSecure: false,
        now,
      }),
    ).toBeNull();
  });
});
