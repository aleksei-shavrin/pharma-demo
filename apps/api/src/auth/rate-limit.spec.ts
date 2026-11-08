import { LoginFailureLimiter } from './rate-limit';

describe('LoginFailureLimiter', () => {
  it('allows five failures then blocks the sixth in the window', () => {
    const limiter = new LoginFailureLimiter(60_000, 5);
    const now = 1_000;
    for (let i = 0; i < 5; i += 1) {
      expect(limiter.isLimited('1.2.3.4', now)).toBe(false);
      limiter.recordFailure('1.2.3.4', now + i);
    }
    expect(limiter.isLimited('1.2.3.4', now + 10)).toBe(true);
    expect(limiter.isLimited('9.9.9.9', now + 10)).toBe(false);
  });
});
