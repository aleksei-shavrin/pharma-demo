/**
 * Rate-limit bucket: only X-Real-IP from the trusted proxy.
 * Client-supplied X-Forwarded-For must not choose the bucket.
 */
export function resolveClientAddress(input: { realIp: string | null }): string {
  const realIp = firstAddress(input.realIp);
  if (realIp != null) {
    return realIp;
  }
  return 'unknown';
}

export function clientAddressFromHeader(
  realIpHeader: string | string[] | undefined,
): string {
  const raw = Array.isArray(realIpHeader) ? realIpHeader[0] : realIpHeader;
  return resolveClientAddress({ realIp: raw ?? null });
}

function firstAddress(value: string | null): string | null {
  if (value == null) {
    return null;
  }
  const first = value.split(',')[0]?.trim() ?? '';
  return first.length > 0 ? first : null;
}
