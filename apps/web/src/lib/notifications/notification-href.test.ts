import { describe, expect, it } from 'vitest';
import {
  hrefForEntityRef,
  resolveNotificationHref,
} from './notification-href';

describe('notification href soft navigation', () => {
  it('resolves routable entity types', () => {
    expect(hrefForEntityRef({ type: 'issue', id: 'ISS-001' })).toBe(
      '/issues/ISS-001',
    );
    expect(hrefForEntityRef({ type: 'risk', id: 'RISK-001' })).toBe(
      '/risks/RISK-001',
    );
    expect(hrefForEntityRef({ type: 'person', id: 'PER-08' })).toBe(
      '/people/PER-08',
    );
  });

  it('Decision refs are unroutable (no broken link)', () => {
    expect(hrefForEntityRef({ type: 'decision', id: 'DEC-001' })).toBeNull();
    expect(
      resolveNotificationHref(null, [{ type: 'decision', id: 'DEC-001' }]),
    ).toBeNull();
  });

  it('prefers server href when present', () => {
    expect(
      resolveNotificationHref('/issues/ISS-001', [
        { type: 'decision', id: 'DEC-001' },
      ]),
    ).toBe('/issues/ISS-001');
  });
});
