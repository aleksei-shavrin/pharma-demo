import bcrypt from 'bcryptjs';
import type { AuthConfig } from './auth-config';
import {
  evaluateLoginRequest,
  invalidCredentialsLocation,
  parseRemember,
} from './login-decision';
import { LoginFailureLimiter } from './rate-limit';
import { openSession, readCookie, sessionCookieName } from './session-cookie';

describe('evaluateLoginRequest', () => {
  const password = 'correct-horse';
  let config: AuthConfig;
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash(password, 4);
    config = {
      username: 'pharma-dev',
      passwordHash: hash,
      sessionSecret: 'unit-test-session-secret-32bytes!!',
      cookieSecure: false,
      publicOrigin: 'http://localhost:3080',
    };
  });

  it('parseRemember defaults false', () => {
    expect(parseRemember(null)).toBe(false);
    expect(parseRemember('1')).toBe(true);
    expect(parseRemember('on')).toBe(true);
  });

  it('rejects bad origin with 403', async () => {
    const decision = await evaluateLoginRequest({
      origin: 'http://evil:3080',
      realIpHeader: '10.0.0.1',
      contentType: 'application/x-www-form-urlencoded',
      body: { username: 'pharma-dev', password, return: '/schedule' },
      now: Date.now(),
      config,
      rateLimiter: new LoginFailureLimiter(),
    });
    expect(decision.status).toBe(403);
  });

  it('wrong password redirects with error query and no cookie', async () => {
    const decision = await evaluateLoginRequest({
      origin: 'http://localhost:3080',
      realIpHeader: '10.0.0.1',
      contentType: 'application/x-www-form-urlencoded',
      body: { username: 'pharma-dev', password: 'nope', return: '/schedule' },
      now: Date.now(),
      config,
      rateLimiter: new LoginFailureLimiter(),
    });
    expect(decision.status).toBe(303);
    if (decision.status !== 303) return;
    expect(decision.setCookie).toBeNull();
    expect(decision.location).toBe(invalidCredentialsLocation('/schedule'));
  });

  it('correct password sets session cookie without Max-Age', async () => {
    const now = 2_000_000_000_000;
    const decision = await evaluateLoginRequest({
      origin: 'http://localhost:3080',
      realIpHeader: '10.0.0.1',
      contentType: 'application/x-www-form-urlencoded',
      body: { username: 'pharma-dev', password, return: '/schedule?x=1' },
      now,
      config,
      rateLimiter: new LoginFailureLimiter(),
    });
    expect(decision.status).toBe(303);
    if (decision.status !== 303) return;
    expect(decision.location).toBe('/schedule?x=1');
    expect(decision.setCookie).toBeTruthy();
    expect(decision.setCookie).not.toMatch(/Max-Age=/i);
    const token = readCookie(decision.setCookie, sessionCookieName(false));
    expect(token).toBeTruthy();
    expect(openSession(token!, config.sessionSecret, now)?.username).toBe(
      'pharma-dev',
    );
  });

  it('remember sets Max-Age 2592000', async () => {
    const decision = await evaluateLoginRequest({
      origin: 'http://localhost:3080',
      realIpHeader: '10.0.0.1',
      contentType: 'application/x-www-form-urlencoded',
      body: {
        username: 'pharma-dev',
        password,
        return: '/',
        remember: '1',
      },
      now: Date.now(),
      config,
      rateLimiter: new LoginFailureLimiter(),
    });
    expect(decision.status).toBe(303);
    if (decision.status !== 303) return;
    expect(decision.setCookie).toContain('Max-Age=2592000');
  });
});
