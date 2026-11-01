/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  presentDecisionNote,
  presentDecisionType,
  presentIssueTitle,
  presentMilestoneName,
} from './ui-labels';

describe('Demo v1 presentation mapping', () => {
  it('localizes known milestone / issue / decision', () => {
    expect(presentMilestoneName('MS-PS', 'Ready for production')).toBe(
      'Готовность к производству',
    );
    expect(
      presentIssueTitle('ISS-001', 'HVAC long-lead delivery slip'),
    ).toBe('Задержка поставки HVAC с длительным сроком изготовления');
    expect(presentDecisionType('PrioritizeRecovery')).toBe(
      'Приоритизировать восстановление сроков',
    );
    expect(
      presentDecisionNote('DEC-001', 'Expedite vendor / alternate lane'),
    ).toBe(
      'Ускорить работу с поставщиком / проработать альтернативный маршрут поставки',
    );
  });

  it('falls back to API string for unknown ids (no silent invent)', () => {
    expect(presentMilestoneName('MS-OTHER', 'Other name')).toBe('Other name');
    expect(presentIssueTitle('ISS-999', 'Unknown title')).toBe('Unknown title');
    expect(presentDecisionNote('DEC-999', 'Unknown note')).toBe('Unknown note');
  });
});
