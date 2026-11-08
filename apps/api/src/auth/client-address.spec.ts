import {
  clientAddressFromHeader,
  resolveClientAddress,
} from './client-address';

describe('client-address', () => {
  it('uses first X-Real-IP value only', () => {
    expect(resolveClientAddress({ realIp: '1.2.3.4, 9.9.9.9' })).toBe(
      '1.2.3.4',
    );
    expect(clientAddressFromHeader(['10.0.0.1', 'ignored'])).toBe('10.0.0.1');
  });

  it('falls back to unknown when missing/blank', () => {
    expect(resolveClientAddress({ realIp: null })).toBe('unknown');
    expect(resolveClientAddress({ realIp: '  ' })).toBe('unknown');
    expect(clientAddressFromHeader(undefined)).toBe('unknown');
  });
});
