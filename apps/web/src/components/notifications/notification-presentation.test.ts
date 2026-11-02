import { describe, expect, it } from 'vitest';
import {
  SEVERITY_RU,
  TAXONOMY_RU,
} from './notification-popover';

describe('Notification RU presentation labels (R2-N1-R1)', () => {
  it('taxonomy issue is Проблема, not Issue', () => {
    expect(TAXONOMY_RU.issue).toBe('Проблема');
    expect(Object.values(TAXONOMY_RU).join(' ')).not.toMatch(/\bIssue\b/);
  });

  it('taxonomy and severity labels stay RU-facing', () => {
    expect(TAXONOMY_RU).toEqual({
      critical_risk: 'Критический риск',
      issue: 'Проблема',
      milestone: 'Веха',
      cost: 'Стоимость',
      decision: 'Решение',
      recovery: 'Восстановление',
      readiness: 'Готовность',
    });
    expect(SEVERITY_RU).toEqual({
      critical: 'Критично',
      attention: 'Внимание',
      info: 'Информация',
    });
  });
});
