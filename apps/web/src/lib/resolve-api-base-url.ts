/**
 * Resolve browser/client API base for Demo v1.
 * NEXT_PUBLIC_API_BASE_URL is build-time for Next bundles (not runtime override).
 * Relative bases (e.g. `/backend`) keep same-origin with the reverse proxy.
 */

const LOCAL_DEV_FALLBACK = 'http://localhost:3001';

export function resolveApiBaseUrl(
  envValue: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL,
): string {
  const raw = (envValue ?? '').trim();
  if (!raw) return LOCAL_DEV_FALLBACK;
  return raw.replace(/\/+$/, '');
}

/** Join base + absolute API path (`/health`, `/v1/...`) without double slashes. */
export function joinApiUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!normalizedBase) return normalizedPath;
  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase}${normalizedPath}`;
  }
  // Relative base (`/backend`) — browser same-origin
  const basePath = normalizedBase.startsWith('/')
    ? normalizedBase
    : `/${normalizedBase}`;
  return `${basePath}${normalizedPath}`;
}
