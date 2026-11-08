import { originMatchesPublicOrigin } from './origin';
import { buildClearSessionCookie } from './session-cookie';

export type LogoutDecision =
  | { status: 303; location: '/login'; clearCookie: string }
  | { status: 403 }
  | { status: 405 };

export function evaluateLogout(input: {
  method: string;
  origin: string | null | undefined;
  publicOrigin: string;
  cookieSecure: boolean;
}): LogoutDecision {
  if (input.method.toUpperCase() !== 'POST') {
    return { status: 405 };
  }

  if (
    !originMatchesPublicOrigin({
      origin: input.origin ?? null,
      publicOrigin: input.publicOrigin,
    })
  ) {
    return { status: 403 };
  }

  return {
    status: 303,
    location: '/login',
    clearCookie: buildClearSessionCookie(input.cookieSecure),
  };
}
