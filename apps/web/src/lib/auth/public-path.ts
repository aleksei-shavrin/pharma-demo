/** Exact public static files under apps/web/public (no blanket "has a dot" rule). */
const PUBLIC_EXACT = new Set([
  '/favicon.ico',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg',
]);

export function isPublicPath(pathname: string): boolean {
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return true;
  }
  if (pathname === '/_next' || pathname.startsWith('/_next/')) {
    return true;
  }
  return PUBLIC_EXACT.has(pathname);
}
