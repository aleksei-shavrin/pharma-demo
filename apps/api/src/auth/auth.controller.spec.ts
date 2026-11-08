import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

function mockRes() {
  const res: {
    statusCode: number;
    headers: Record<string, string>;
    body: unknown;
    status: (code: number) => typeof res;
    json: (body: unknown) => typeof res;
    setHeader: (k: string, v: string) => void;
    redirect: (code: number, loc: string) => void;
    end: () => typeof res;
  } = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    setHeader(k: string, v: string) {
      res.headers[k.toLowerCase()] = v;
    },
    redirect(code: number, loc: string) {
      res.statusCode = code;
      res.headers.location = loc;
    },
    end() {
      return res;
    },
  };
  return res;
}

describe('AuthController', () => {
  const auth = {
    login: jest.fn(),
    logout: jest.fn(),
    sessionFromCookie: jest.fn(),
  } as unknown as AuthService;
  const controller = new AuthController(auth);

  beforeEach(() => jest.clearAllMocks());

  it('login applies Set-Cookie and 303', async () => {
    (auth.login as jest.Mock).mockResolvedValue({
      status: 303,
      location: '/schedule',
      setCookie: 'pharma_session=x; Path=/; HttpOnly; SameSite=Lax',
    });
    const res = mockRes();
    await controller.login(
      {
        headers: {
          origin: 'http://localhost:3080',
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: {},
      } as never,
      res as never,
    );
    expect(res.statusCode).toBe(303);
    expect(res.headers['set-cookie']).toContain('pharma_session=');
    expect(res.headers.location).toBe('/schedule');
    expect(res.headers['cache-control']).toMatch(/no-store/i);
  });

  it('login returns 403/429 JSON', async () => {
    (auth.login as jest.Mock).mockResolvedValue({ status: 403 });
    const forbidden = mockRes();
    await controller.login(
      { headers: {}, body: {} } as never,
      forbidden as never,
    );
    expect(forbidden.statusCode).toBe(403);

    (auth.login as jest.Mock).mockResolvedValue({
      status: 429,
      message: 'Слишком много попыток. Повторите позже.',
    });
    const limited = mockRes();
    await controller.login(
      { headers: {}, body: {} } as never,
      limited as never,
    );
    expect(limited.statusCode).toBe(429);
  });

  it('logout clears cookie; session 204/401', () => {
    (auth.logout as jest.Mock).mockReturnValue({
      status: 303,
      location: '/login',
      clearCookie: 'pharma_session=; Max-Age=0',
    });
    const res = mockRes();
    controller.logout(
      { method: 'POST', headers: { origin: 'http://localhost:3080' } } as never,
      res as never,
    );
    expect(res.statusCode).toBe(303);
    expect(res.headers['set-cookie']).toContain('Max-Age=0');

    (auth.logout as jest.Mock).mockReturnValue({ status: 405 });
    const method = mockRes();
    controller.logout({ method: 'GET', headers: {} } as never, method as never);
    expect(method.statusCode).toBe(405);

    (auth.logout as jest.Mock).mockReturnValue({ status: 403 });
    const forbidden = mockRes();
    controller.logout(
      { method: 'POST', headers: {} } as never,
      forbidden as never,
    );
    expect(forbidden.statusCode).toBe(403);

    (auth.sessionFromCookie as jest.Mock).mockReturnValue({
      username: 'u',
      expiresAt: 1,
    });
    const ok = mockRes();
    controller.session({ headers: { cookie: 'x' } } as never, ok as never);
    expect(ok.statusCode).toBe(204);

    (auth.sessionFromCookie as jest.Mock).mockReturnValue(null);
    const denied = mockRes();
    controller.session({ headers: {} } as never, denied as never);
    expect(denied.statusCode).toBe(401);
  });
});
