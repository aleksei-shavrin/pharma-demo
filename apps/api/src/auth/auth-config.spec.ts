import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readAuthConfig } from './auth-config';

describe('readAuthConfig', () => {
  const hashFile = join(tmpdir(), `pharma-auth-hash-${process.pid}.txt`);

  afterEach(() => {
    try {
      unlinkSync(hashFile);
    } catch {
      /* ignore */
    }
  });

  it('reads hash from file and requires COOKIE_SECURE true|false', () => {
    writeFileSync(hashFile, '$2a$04$abcdefghijklmnopqrstuv\n');
    const cfg = readAuthConfig({
      LOGIN_USERNAME: 'pharma-dev',
      SESSION_SECRET: 'secret-secret-secret-secret-secret',
      COOKIE_SECURE: 'false',
      PUBLIC_ORIGIN: 'http://localhost:3080',
      LOGIN_PASSWORD_HASH_FILE: hashFile,
    });
    expect(cfg?.username).toBe('pharma-dev');
    expect(cfg?.cookieSecure).toBe(false);
    expect(cfg?.passwordHash.startsWith('$2a$')).toBe(true);

    expect(
      readAuthConfig({
        LOGIN_USERNAME: 'pharma-dev',
        SESSION_SECRET: 'secret-secret-secret-secret-secret',
        COOKIE_SECURE: 'maybe',
        PUBLIC_ORIGIN: 'http://localhost:3080',
        LOGIN_PASSWORD_HASH_FILE: hashFile,
      }),
    ).toBeNull();
  });
});
