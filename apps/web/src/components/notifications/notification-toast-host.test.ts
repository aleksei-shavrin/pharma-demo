import { describe, expect, it } from 'vitest';
import { toastToneFor } from './notification-toast-host';

describe('notification toast semantic presentation (R2-U1-R5)', () => {
  it('maps authoritative severity (+ recovery/readiness) to toast tones', () => {
    expect(toastToneFor('critical', 'critical_risk')).toBe('danger');
    expect(toastToneFor('attention', 'issue')).toBe('warn');
    expect(toastToneFor('info', 'recovery')).toBe('ok');
    expect(toastToneFor('info', 'readiness')).toBe('ok');
    expect(toastToneFor('info', 'milestone')).toBe('neutral');
    expect(toastToneFor('info', 'decision')).toBe('neutral');
  });
});
