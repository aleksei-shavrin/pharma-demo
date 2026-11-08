import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readAuthConfig } from './auth-config';

describe('readAuthConfig branches', () => {
  const hashFile = join(tmpdir(), `pharma-auth-hash-b-${process.pid}.txt`);

  afterEach(() => {
    try {
      unlinkSync(hashFile);
    } catch {
      /* ignore */
    }
  });

  it('accepts inline LOGIN_PASSWORD_HASH and COOKIE_SECURE true', () => {
    const cfg = readAuthConfig({
      LOGIN_USERNAME: 'u',
      SESSION_SECRET: 'secret-secret-secret-secret-secret',
      COOKIE_SECURE: 'true',
      PUBLIC_ORIGIN: 'https://demo.example.com',
      LOGIN_PASSWORD_HASH: '$2a$04$abcdefghijklmnopqrstuv',
    });
    expect(cfg?.cookieSecure).toBe(true);
    expect(cfg?.publicOrigin).toBe('https://demo.example.com');
  });

  it('rejects missing username/secret/origin and bad PUBLIC_ORIGIN', () => {
    expect(
      readAuthConfig({
        LOGIN_PASSWORD_HASH: 'x',
        SESSION_SECRET: 'secret-secret-secret-secret-secret',
        COOKIE_SECURE: 'false',
        PUBLIC_ORIGIN: 'http://localhost:3080',
      }),
    ).toBeNull();
    expect(
      readAuthConfig({
        LOGIN_USERNAME: 'u',
        LOGIN_PASSWORD_HASH: 'x',
        COOKIE_SECURE: 'false',
        PUBLIC_ORIGIN: 'http://localhost:3080',
      }),
    ).toBeNull();
    expect(
      readAuthConfig({
        LOGIN_USERNAME: 'u',
        LOGIN_PASSWORD_HASH: 'x',
        SESSION_SECRET: 'secret-secret-secret-secret-secret',
        COOKIE_SECURE: 'false',
        PUBLIC_ORIGIN: 'not a url',
      }),
    ).toBeNull();
  });

  it('returns null when hash file is missing', () => {
    expect(
      readAuthConfig({
        LOGIN_USERNAME: 'u',
        SESSION_SECRET: 'secret-secret-secret-secret-secret',
        COOKIE_SECURE: 'false',
        PUBLIC_ORIGIN: 'http://localhost:3080',
        LOGIN_PASSWORD_HASH_FILE: join(tmpdir(), 'no-such-hash-file'),
      }),
    ).toBeNull();
  });

  it('returns null for empty hash file', () => {
    writeFileSync(hashFile, '   \n');
    expect(
      readAuthConfig({
        LOGIN_USERNAME: 'u',
        SESSION_SECRET: 'secret-secret-secret-secret-secret',
        COOKIE_SECURE: 'false',
        PUBLIC_ORIGIN: 'http://localhost:3080',
        LOGIN_PASSWORD_HASH_FILE: hashFile,
      }),
    ).toBeNull();
  });
});
