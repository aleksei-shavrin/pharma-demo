import { readFileSync } from 'node:fs';

export type AuthConfig = {
  username: string;
  passwordHash: string;
  sessionSecret: string;
  cookieSecure: boolean;
  publicOrigin: string;
};

export type AuthEnv = NodeJS.Dict<string>;

export function readAuthConfig(env: AuthEnv = process.env): AuthConfig | null {
  const username = env.LOGIN_USERNAME;
  const sessionSecret = env.SESSION_SECRET;
  const cookieSecure = env.COOKIE_SECURE;
  const publicOrigin = (env.PUBLIC_ORIGIN ?? env.WEB_ORIGIN ?? '').trim();

  const passwordHash = resolvePasswordHash(env);

  if (
    username == null ||
    username.length === 0 ||
    passwordHash == null ||
    passwordHash.length === 0 ||
    sessionSecret == null ||
    sessionSecret.length === 0 ||
    publicOrigin.length === 0
  ) {
    return null;
  }

  if (cookieSecure !== 'true' && cookieSecure !== 'false') {
    return null;
  }

  try {
    // Validate origin parse early (fail closed at boot if misconfigured).
    new URL(publicOrigin);
  } catch {
    return null;
  }

  return {
    username,
    passwordHash,
    sessionSecret,
    cookieSecure: cookieSecure === 'true',
    publicOrigin,
  };
}

function resolvePasswordHash(env: AuthEnv): string | null {
  const filePath = env.LOGIN_PASSWORD_HASH_FILE;
  if (filePath != null && filePath.length > 0) {
    try {
      const raw = readFileSync(filePath, 'utf8').trim();
      return raw.length > 0 ? raw : null;
    } catch {
      return null;
    }
  }
  const inline = env.LOGIN_PASSWORD_HASH;
  if (inline == null || inline.length === 0) {
    return null;
  }
  return inline;
}
