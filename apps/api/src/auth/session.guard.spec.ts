import { UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import type { AuthService } from './auth.service';

function ctx(path: string, method = 'GET', cookie?: string) {
  const headers: Record<string, string> = {};
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        path,
        url: path,
        method,
        headers: { cookie },
      }),
      getResponse: () => ({
        setHeader: (name: string, value: string) => {
          headers[name.toLowerCase()] = value;
        },
        headers,
      }),
    }),
  } as never;
}

describe('SessionGuard', () => {
  const auth = {
    sessionFromCookie: jest.fn(),
  } as unknown as AuthService;
  const guard = new SessionGuard(auth);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows public auth/health/openapi without session', () => {
    expect(guard.canActivate(ctx('/health'))).toBe(true);
    expect(guard.canActivate(ctx('/api'))).toBe(true);
    expect(guard.canActivate(ctx('/api-json'))).toBe(true);
    expect(guard.canActivate(ctx('/v1/auth/login', 'POST'))).toBe(true);
    expect(guard.canActivate(ctx('/v1/auth/logout', 'POST'))).toBe(true);
    expect(guard.canActivate(ctx('/v1/auth/session'))).toBe(true);

    expect(
      (auth.sessionFromCookie as unknown as jest.Mock).mock.calls,
    ).toHaveLength(0);
  });

  it('returns 401 for anonymous protected /v1', () => {
    (auth.sessionFromCookie as jest.Mock).mockReturnValue(null);
    expect(() =>
      guard.canActivate(ctx('/v1/projects/PRT-01/dashboard')),
    ).toThrow(UnauthorizedException);
  });

  it('allows authed protected /v1', () => {
    (auth.sessionFromCookie as jest.Mock).mockReturnValue({
      username: 'pharma-dev',
      expiresAt: Date.now() + 1000,
    });
    expect(guard.canActivate(ctx('/v1/projects/PRT-01/schedule'))).toBe(true);
  });
});
