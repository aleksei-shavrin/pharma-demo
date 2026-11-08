import type { AuthConfig } from './auth-config';
import { clientAddressFromHeader } from './client-address';
import { originMatchesPublicOrigin } from './origin';
import { passwordMatches } from './password';
import type { LoginFailureLimiter } from './rate-limit';
import { sanitizeReturnPath } from './return-path';
import {
  REMEMBER_TTL_MS,
  SESSION_TTL_MS,
  buildSessionSetCookie,
  safeEqualString,
  sealSession,
  type CookiePersistence,
} from './session-cookie';

export const INVALID_CREDENTIALS_MESSAGE = 'Неверный логин или пароль';
export const RATE_LIMIT_MESSAGE = 'Слишком много попыток. Повторите позже.';
export const LOGIN_ERROR_QUERY = '1';

export type LoginDecision =
  | { status: 403 }
  | { status: 429; message: typeof RATE_LIMIT_MESSAGE }
  | { status: 303; location: string; setCookie: string | null };

export type LoginFormFields = {
  username: string;
  password: string;
  returnTo: string | null;
  remember: boolean;
};

export type LoginRequestInput = {
  origin: string | null | undefined;
  realIpHeader: string | string[] | undefined;
  contentType: string | null | undefined;
  body: Record<string, unknown> | string | Buffer | undefined;
  now: number;
  config: AuthConfig;
  rateLimiter: LoginFailureLimiter;
};

export function invalidCredentialsLocation(returnTo: string): string {
  const params = new URLSearchParams();
  params.set('return', returnTo);
  params.set('error', LOGIN_ERROR_QUERY);
  return `/login?${params.toString()}`;
}

export async function evaluateLoginRequest(
  input: LoginRequestInput,
): Promise<LoginDecision> {
  if (
    !originMatchesPublicOrigin({
      origin: input.origin ?? null,
      publicOrigin: input.config.publicOrigin,
    })
  ) {
    return { status: 403 };
  }

  const clientAddress = clientAddressFromHeader(input.realIpHeader);
  if (input.rateLimiter.isLimited(clientAddress, input.now)) {
    return { status: 429, message: RATE_LIMIT_MESSAGE };
  }

  const form = readLoginForm(input.contentType, input.body);
  const returnTo = sanitizeReturnPath(form.returnTo);
  const usernameOk = safeEqualString(form.username, input.config.username);
  const passwordOk = await passwordMatches(
    form.password,
    input.config.passwordHash,
  );

  if (!usernameOk || !passwordOk) {
    input.rateLimiter.recordFailure(clientAddress, input.now);
    return {
      status: 303,
      location: invalidCredentialsLocation(returnTo),
      setCookie: null,
    };
  }

  const persistence: CookiePersistence = form.remember
    ? 'persistent'
    : 'session';
  const ttlMs = form.remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  const expiresAt = input.now + ttlMs;
  const sealed = sealSession(
    { username: input.config.username, expiresAt },
    input.config.sessionSecret,
  );

  return {
    status: 303,
    location: encodeURI(returnTo),
    setCookie: buildSessionSetCookie({
      token: sealed,
      cookieSecure: input.config.cookieSecure,
      persistence,
    }),
  };
}

export function readLoginForm(
  contentType: string | null | undefined,
  body: Record<string, unknown> | string | Buffer | undefined,
): LoginFormFields {
  const empty: LoginFormFields = {
    username: '',
    password: '',
    returnTo: null,
    remember: false,
  };

  const ct = (contentType ?? '').toLowerCase();
  if (!ct.includes('application/x-www-form-urlencoded')) {
    return empty;
  }

  let params: URLSearchParams;
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    params = new URLSearchParams(body.toString());
  } else if (body != null && typeof body === 'object') {
    params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        params.set(key, value);
      } else if (Array.isArray(value) && typeof value[0] === 'string') {
        params.set(key, value[0]);
      }
    }
  } else {
    return empty;
  }

  const out: LoginFormFields = {
    username: params.get('username') ?? '',
    password: '',
    returnTo: params.get('return'),
    remember: parseRemember(params.get('remember')),
  };
  out['password'] = params.get('password') ?? '';
  return out;
}

export function parseRemember(raw: string | null): boolean {
  if (raw == null) {
    return false;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized === '1' || normalized === 'on' || normalized === 'true';
}
