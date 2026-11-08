export const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_FAILURE_LIMIT = 5;

export class LoginFailureLimiter {
  private readonly failures = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly limit: number;

  constructor(windowMs = LOGIN_FAILURE_WINDOW_MS, limit = LOGIN_FAILURE_LIMIT) {
    this.windowMs = windowMs;
    this.limit = limit;
  }

  isLimited(clientAddress: string, now: number): boolean {
    return this.recent(clientAddress, now).length >= this.limit;
  }

  recordFailure(clientAddress: string, now: number): void {
    const recent = this.recent(clientAddress, now);
    recent.push(now);
    this.failures.set(clientAddress, recent);
  }

  private recent(clientAddress: string, now: number): number[] {
    const existing = this.failures.get(clientAddress) ?? [];
    const fresh = existing.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
    this.failures.set(clientAddress, fresh);
    return fresh;
  }
}

const SHARED_LIMITER_KEY = '__pharmaDemoLoginFailureLimiter';

type GlobalWithLimiter = typeof globalThis & {
  [SHARED_LIMITER_KEY]?: LoginFailureLimiter;
};

export function sharedLoginFailureLimiter(): LoginFailureLimiter {
  const store = globalThis as GlobalWithLimiter;
  const existing = store[SHARED_LIMITER_KEY];
  if (existing) {
    return existing;
  }
  const created = new LoginFailureLimiter();
  store[SHARED_LIMITER_KEY] = created;
  return created;
}
