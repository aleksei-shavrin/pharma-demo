/**
 * POST Origin must match explicit public origin (protocol+host+port).
 * Host/X-Forwarded-Host are not used as the sole trust — browser can forge Host
 * to the API container; PUBLIC_ORIGIN/WEB_ORIGIN is the DX/prod public URL.
 *
 * DX loopback peer: when configured publicOrigin host is localhost or 127.0.0.1,
 * accept the other peer with the same protocol and port. Prod non-loopback stays
 * strict single-origin.
 */
export function originMatchesPublicOrigin(input: {
  origin: string | null | undefined;
  publicOrigin: string;
}): boolean {
  if (
    input.origin == null ||
    input.origin.trim() === '' ||
    input.origin === 'null'
  ) {
    return false;
  }

  let originUrl: URL;
  let expectedUrl: URL;
  try {
    originUrl = new URL(input.origin);
    expectedUrl = new URL(input.publicOrigin);
  } catch {
    return false;
  }

  if (originUrl.protocol !== 'http:' && originUrl.protocol !== 'https:') {
    return false;
  }

  if (originUrl.protocol !== expectedUrl.protocol) {
    return false;
  }

  const originHost = stripDefaultPort(originUrl.host, originUrl.protocol);
  const expectedHost = stripDefaultPort(expectedUrl.host, expectedUrl.protocol);

  if (originHost === expectedHost) {
    return true;
  }

  return loopbackPeersMatch({
    originHost,
    expectedHost,
    protocol: originUrl.protocol,
  });
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);

function loopbackPeersMatch(input: {
  originHost: string;
  expectedHost: string;
  protocol: string;
}): boolean {
  const originParts = splitHostPort(input.originHost, input.protocol);
  const expectedParts = splitHostPort(input.expectedHost, input.protocol);
  if (!originParts || !expectedParts) {
    return false;
  }
  if (
    !LOOPBACK_HOSTS.has(originParts.hostname) ||
    !LOOPBACK_HOSTS.has(expectedParts.hostname)
  ) {
    return false;
  }
  if (originParts.port !== expectedParts.port) {
    return false;
  }
  // Peer = different loopback hostname, same port (already checked).
  return originParts.hostname !== expectedParts.hostname;
}

function splitHostPort(
  host: string,
  protocol: string,
): { hostname: string; port: string } | null {
  const lower = host.trim().toLowerCase();
  const idx = lower.lastIndexOf(':');
  if (idx === -1) {
    const defaultPort = protocol === 'https:' ? '443' : '80';
    return { hostname: lower, port: defaultPort };
  }
  // IPv6 in brackets not used for DX loopback peers.
  if (lower.includes(']') && !lower.endsWith(']')) {
    return null;
  }
  const hostname = lower.slice(0, idx);
  const port = lower.slice(idx + 1);
  if (!hostname || !/^\d+$/.test(port)) {
    return null;
  }
  return { hostname, port };
}

function stripDefaultPort(host: string, protocol: string): string {
  const lower = host.trim().toLowerCase();
  if (protocol === 'https:' && lower.endsWith(':443')) {
    return lower.slice(0, -':443'.length);
  }
  if (protocol === 'http:' && lower.endsWith(':80')) {
    return lower.slice(0, -':80'.length);
  }
  return lower;
}
