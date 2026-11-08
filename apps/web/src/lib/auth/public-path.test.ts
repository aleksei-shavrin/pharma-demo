import { describe, expect, it } from 'vitest';
import { isPublicPath } from './public-path';

describe('isPublicPath', () => {
  it('allows login and Next internals', () => {
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/login/')).toBe(true);
    expect(isPublicPath('/_next/static/chunk.js')).toBe(true);
    expect(isPublicPath('/favicon.ico')).toBe(true);
  });

  it('does not allow dotted app routes or schedule', () => {
    expect(isPublicPath('/schedule')).toBe(false);
    expect(isPublicPath('/schedule.backup')).toBe(false);
    expect(isPublicPath('/projects/v1.2')).toBe(false);
  });
});
