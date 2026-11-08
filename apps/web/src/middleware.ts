import { NextResponse, type NextRequest } from 'next/server';
import { isPublicPath } from '@/lib/auth/public-path';
import { sanitizeReturnPath } from '@/lib/auth/return-path';

function withNoStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === '/login' || pathname.startsWith('/login/')) {
      return withNoStore(NextResponse.next());
    }
    return NextResponse.next();
  }

  const internalBase = (
    process.env.API_INTERNAL_URL ?? 'http://api:3000'
  ).replace(/\/+$/, '');

  let ok = false;
  try {
    const verify = await fetch(`${internalBase}/v1/auth/session`, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        'Cache-Control': 'no-store',
      },
      cache: 'no-store',
    });
    ok = verify.status === 204;
  } catch {
    ok = false;
  }

  if (ok) {
    return withNoStore(NextResponse.next());
  }

  const returnTo = sanitizeReturnPath(`${pathname}${search}`);
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('return', returnTo);
  return withNoStore(NextResponse.redirect(loginUrl));
}

/**
 * Do not exclude "any path with a dot" — that would skip auth for `/schedule.backup`.
 * Next static chunks stay public via `/_next` allowlist in `isPublicPath`.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
