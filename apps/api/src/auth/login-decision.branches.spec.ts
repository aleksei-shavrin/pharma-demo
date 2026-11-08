import bcrypt from 'bcryptjs';
import type { AuthConfig } from './auth-config';
import { evaluateLoginRequest, readLoginForm } from './login-decision';
import { LoginFailureLimiter } from './rate-limit';

describe('login-decision branches', () => {
  let config: AuthConfig;

  beforeAll(async () => {
    config = {
      username: 'pharma-dev',
      passwordHash: await bcrypt.hash('ok', 4),
      sessionSecret: 'branch-session-secret-32-chars!!',
      cookieSecure: false,
      publicOrigin: 'http://localhost:3080',
    };
  });

  it('returns 429 when rate limited', async () => {
    const limiter = new LoginFailureLimiter(60_000, 1);
    limiter.recordFailure('9.9.9.9', 1000);
    const decision = await evaluateLoginRequest({
      origin: 'http://localhost:3080',
      realIpHeader: '9.9.9.9',
      contentType: 'application/x-www-form-urlencoded',
      body: { username: 'pharma-dev', password: 'ok' },
      now: 1001,
      config,
      rateLimiter: limiter,
    });
    expect(decision.status).toBe(429);
  });

  it('readLoginForm handles string body and rejects non-form content-type', () => {
    expect(readLoginForm('application/json', { username: 'a' }).username).toBe(
      '',
    );
    const form = readLoginForm(
      'application/x-www-form-urlencoded',
      'username=pharma-dev&password=secret&remember=true',
    );
    expect(form.username).toBe('pharma-dev');
    expect(form.remember).toBe(true);
    expect(form['password']).toBe('secret');
  });
});
