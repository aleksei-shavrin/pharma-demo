import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const hashFile = join(tmpdir(), `pharma-svc-hash-${process.pid}.txt`);
  let previous: NodeJS.ProcessEnv;

  beforeAll(async () => {
    previous = { ...process.env };
    const hash = await bcrypt.hash('svc-pass', 4);
    writeFileSync(hashFile, `${hash}\n`);
    process.env.LOGIN_USERNAME = 'pharma-dev';
    process.env.SESSION_SECRET = 'svc-session-secret-32-characters!';
    process.env.COOKIE_SECURE = 'false';
    process.env.PUBLIC_ORIGIN = 'http://localhost:3080';
    process.env.LOGIN_PASSWORD_HASH_FILE = hashFile;
  });

  afterAll(() => {
    process.env = previous;
    try {
      unlinkSync(hashFile);
    } catch {
      /* ignore */
    }
  });

  it('boots config and issues session on login', async () => {
    const svc = new AuthService();
    svc.onModuleInit();
    expect(svc.getConfig()?.username).toBe('pharma-dev');
    expect(svc.requireConfig().username).toBe('pharma-dev');

    const decision = await svc.login({
      origin: 'http://localhost:3080',
      realIpHeader: '127.0.0.1',
      contentType: 'application/x-www-form-urlencoded',
      body: {
        username: 'pharma-dev',
        password: 'svc-pass',
        return: '/schedule',
      },
    });
    expect(decision.status).toBe(303);
    if (decision.status !== 303) return;
    expect(decision.setCookie).toContain('pharma_session=');
    const token = decision.setCookie!.split(';')[0].split('=')[1];
    expect(svc.sessionFromCookie(`pharma_session=${token}`)?.username).toBe(
      'pharma-dev',
    );

    const logout = svc.logout({
      method: 'POST',
      origin: 'http://localhost:3080',
    });
    expect(logout.status).toBe(303);

    const forbidden = await svc.login({
      origin: 'http://evil',
      realIpHeader: '127.0.0.1',
      contentType: 'application/x-www-form-urlencoded',
      body: { username: 'pharma-dev', password: 'svc-pass' },
    });
    expect(forbidden.status).toBe(403);
  });

  it('fails closed when env config missing', () => {
    const saved = { ...process.env };
    delete process.env.LOGIN_USERNAME;
    delete process.env.SESSION_SECRET;
    delete process.env.LOGIN_PASSWORD_HASH_FILE;
    delete process.env.LOGIN_PASSWORD_HASH;
    const svc = new AuthService();
    svc.onModuleInit();
    expect(svc.getConfig()).toBeNull();
    expect(() => svc.requireConfig()).toThrow(/AUTH_CONFIG_UNAVAILABLE/);
    process.env = saved;
  });
});
