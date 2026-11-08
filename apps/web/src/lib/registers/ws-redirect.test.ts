import { describe, expect, it } from 'vitest';
import { hrefForWorkstreamTag, WS_TO_CANONICAL_HREF } from './ws-redirect';

describe('ws-redirect', () => {
  it('maps WS-QC to AN-20 not cleanrooms', () => {
    expect(hrefForWorkstreamTag('WS-QC')).toBe('/projects/AN-20');
    expect(WS_TO_CANONICAL_HREF['WS-CLN']).toBe('/projects/AN-08');
  });

  it('falls back to programs for unknown tags', () => {
    expect(hrefForWorkstreamTag('WS-NOPE')).toBe('/programs');
  });
});
