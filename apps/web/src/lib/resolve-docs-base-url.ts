/**
 * Same-origin docs portal path for the shell «Документация» link.
 * NEXT_PUBLIC_DOCS_BASE_URL is build-time (Compose `/docs/`, cluster `/portal/`).
 */

const DEFAULT_DOCS_BASE = '/docs/';

export function resolveDocsBaseUrl(
  envValue: string | undefined = process.env.NEXT_PUBLIC_DOCS_BASE_URL,
): string {
  const raw = (envValue ?? '').trim();
  if (!raw) return DEFAULT_DOCS_BASE;
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}
