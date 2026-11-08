/**
 * Build CORS origin allowlist for Demo API.
 * WEB_ORIGIN is the primary public UI origin; CORS_EXTRA_ORIGINS is CSV.
 */

const LOCAL_DEFAULTS = [
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:3010',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3010',
] as const;

export function resolveCorsOrigins(
  env: NodeJS.Dict<string> = process.env,
): string[] {
  const primary = (env.WEB_ORIGIN ?? 'http://localhost:3000').trim();
  const extra = (env.CORS_EXTRA_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([primary, ...LOCAL_DEFAULTS, ...extra])];
}
