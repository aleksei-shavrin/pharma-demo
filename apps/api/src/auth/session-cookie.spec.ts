import {
  REMEMBER_TTL_MS,
  REMEMBER_TTL_SECONDS,
  SESSION_TTL_MS,
  buildClearSessionCookie,
  buildSessionSetCookie,
  openSession,
  sealSession,
  sessionCookieName,
} from './session-cookie';

const SECRET = 'test-session-secret-at-least-32-chars!!';

describe('session-cookie', () => {
  const now = 1_700_000_000_000;

  it('seals and opens a valid payload', () => {
    const token = sealSession(
      { username: 'demo', expiresAt: now + SESSION_TTL_MS },
      SECRET,
    );
    expect(openSession(token, SECRET, now)).toEqual({
      username: 'demo',
      expiresAt: now + SESSION_TTL_MS,
    });
  });

  it('rejects expired, tampered, and wrong-secret tokens', () => {
    const token = sealSession(
      { username: 'demo', expiresAt: now + 1000 },
      SECRET,
    );
    expect(openSession(token, SECRET, now + 2000)).toBeNull();
    expect(openSession(token + 'x', SECRET, now)).toBeNull();
    expect(
      openSession(token, 'other-secret-other-secret-other!!', now),
    ).toBeNull();
    expect(openSession('not.a.token', SECRET, now)).toBeNull();
  });

  it('session Set-Cookie omits Max-Age; remember sets 30d; clear Max-Age=0', () => {
    const sessionCookie = buildSessionSetCookie({
      token: 'abc',
      cookieSecure: false,
      persistence: 'session',
    });
    expect(sessionCookie).toContain(`${sessionCookieName(false)}=abc`);
    expect(sessionCookie).toContain('HttpOnly');
    expect(sessionCookie).toContain('SameSite=Lax');
    expect(sessionCookie).not.toMatch(/Max-Age=/i);
    expect(sessionCookie).not.toMatch(/Secure/i);

    const rememberCookie = buildSessionSetCookie({
      token: 'abc',
      cookieSecure: true,
      persistence: 'persistent',
    });
    expect(rememberCookie).toContain(`Max-Age=${REMEMBER_TTL_SECONDS}`);
    expect(rememberCookie).toContain('Secure');
    expect(rememberCookie).toContain(sessionCookieName(true));

    const clear = buildClearSessionCookie(false);
    expect(clear).toContain('Max-Age=0');
  });

  it('remember TTL constant is 30 days', () => {
    expect(REMEMBER_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
    expect(SESSION_TTL_MS).toBe(8 * 60 * 60 * 1000);
  });
});
