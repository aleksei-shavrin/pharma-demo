import { evaluateLogout } from './logout-decision';

describe('evaluateLogout', () => {
  it('clears cookie on POST with matching origin (idempotent)', () => {
    const decision = evaluateLogout({
      method: 'POST',
      origin: 'http://localhost:3080',
      publicOrigin: 'http://localhost:3080',
      cookieSecure: false,
    });
    expect(decision.status).toBe(303);
    if (decision.status !== 303) return;
    expect(decision.location).toBe('/login');
    expect(decision.clearCookie).toContain('Max-Age=0');
  });

  it('rejects GET and bad origin', () => {
    expect(
      evaluateLogout({
        method: 'GET',
        origin: 'http://localhost:3080',
        publicOrigin: 'http://localhost:3080',
        cookieSecure: false,
      }).status,
    ).toBe(405);
    expect(
      evaluateLogout({
        method: 'POST',
        origin: 'http://evil',
        publicOrigin: 'http://localhost:3080',
        cookieSecure: false,
      }).status,
    ).toBe(403);
  });
});
