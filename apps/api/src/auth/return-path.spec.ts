import { sanitizeReturnPath } from './return-path';

describe('sanitizeReturnPath', () => {
  it('allows internal path and query including Cyrillic when encoded', () => {
    expect(sanitizeReturnPath('/schedule')).toBe('/schedule');
    expect(sanitizeReturnPath('/schedule?tab=раб')).toBe('/schedule?tab=раб');
    expect(
      sanitizeReturnPath(
        '/%D1%80%D0%B0%D1%81%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5',
      ),
    ).toBe('/расписание');
  });

  it('rejects open redirects and login loop', () => {
    expect(sanitizeReturnPath('https://evil.example/')).toBe('/');
    expect(sanitizeReturnPath('//evil.example')).toBe('/');
    expect(sanitizeReturnPath('/\\evil')).toBe('/');
    expect(sanitizeReturnPath('/login')).toBe('/');
    expect(sanitizeReturnPath('/login/next')).toBe('/');
    expect(sanitizeReturnPath('javascript:alert(1)')).toBe('/');
    expect(sanitizeReturnPath('/%2f%2fevil')).toBe('/');
  });
});
