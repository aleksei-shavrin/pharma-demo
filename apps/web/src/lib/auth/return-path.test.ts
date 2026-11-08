import { describe, expect, it } from 'vitest';
import { sanitizeReturnPath } from './return-path';

describe('sanitizeReturnPath (web)', () => {
  it('keeps safe paths and rejects open redirects', () => {
    expect(sanitizeReturnPath('/schedule?x=1')).toBe('/schedule?x=1');
    expect(sanitizeReturnPath('//evil')).toBe('/');
    expect(sanitizeReturnPath('/login')).toBe('/');
    expect(sanitizeReturnPath(null)).toBe('/');
    expect(sanitizeReturnPath('')).toBe('/');
    expect(sanitizeReturnPath('https://evil.example/x')).toBe('/');
    expect(sanitizeReturnPath('/login/next')).toBe('/');
    expect(sanitizeReturnPath('/%2f%2fevil')).toBe('/');
    expect(sanitizeReturnPath('/ok#frag')).toBe('/ok#frag');
  });
});

