const FALLBACK_PATH = '/';
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export function sanitizeReturnPath(value: string | null | undefined): string {
  if (value == null) {
    return FALLBACK_PATH;
  }

  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    !isSingleLeadingSlash(trimmed) ||
    CONTROL_CHARS.test(trimmed)
  ) {
    return FALLBACK_PATH;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return FALLBACK_PATH;
  }

  if (!isAcceptableReturnPath(decoded)) {
    return FALLBACK_PATH;
  }

  return decoded;
}

function isSingleLeadingSlash(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
}

function isAcceptableReturnPath(path: string): boolean {
  if (!isSingleLeadingSlash(path)) {
    return false;
  }

  if (path.includes('//') || path.includes('://') || /%2f%2f/i.test(path)) {
    return false;
  }

  if (CONTROL_CHARS.test(path)) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) {
    return false;
  }

  const pathname = pathnameOf(path);
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return false;
  }

  return true;
}

function pathnameOf(path: string): string {
  const withoutHash = path.split('#')[0] ?? '';
  return withoutHash.split('?')[0] ?? '';
}
