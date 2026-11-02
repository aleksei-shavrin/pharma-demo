/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  presentDecisionNote,
  presentDecisionType,
  presentIssueTitle,
  presentMilestoneName,
  presentOwnerRole,
  presentWorkstream,
  projectStatusLabel,
  projectStatusMeaning,
  scheduleKindLabel,
} from './ui-labels';

describe('Demo v1 presentation mapping', () => {
  it('maps schedule kinds to director-facing type labels', () => {
    expect(scheduleKindLabel('equipment_delivery')).toBe('Оборудование');
    expect(scheduleKindLabel('milestone')).toBe('Веха');
  });

  it('localizes known milestone / issue / decision / WS / owner', () => {
    expect(presentMilestoneName('MS-PS', 'Ready for production')).toBe(
      'Готовность к производству',
    );
    expect(
      presentIssueTitle('ISS-001', 'Прогноз сдвига поставки long-lead AHU'),
    ).toBe('Прогноз сдвига поставки long-lead AHU');
    expect(presentDecisionType('PrioritizeRecovery')).toBe(
      'Приоритизировать восстановление сроков',
    );
    expect(presentDecisionType('AcceptDateSlip')).toBe('Принять сдвиг даты');
    expect(
      presentDecisionNote(
        'DEC-001',
        'Утвердить ускоренную логистику AHU и резервный монтажный слот',
      ),
    ).toBe(
      'Утвердить ускоренную логистику AHU и резервный монтажный слот',
    );
    expect(presentWorkstream('WS-HVAC')).toBe('HVAC');
    expect(presentWorkstream('WS-PKG')).toBe('Упаковка');
    expect(presentOwnerRole('SH-DIR-01')).toBe('Директор проекта');
    expect(projectStatusLabel('Yellow')).toBe('Жёлтый');
  });

  it('falls back to API string for unknown ids (no silent invent)', () => {
    expect(presentMilestoneName('MS-OTHER', 'Other name')).toBe('Other name');
    expect(presentIssueTitle('ISS-999', 'Unknown title')).toBe('Unknown title');
    expect(presentDecisionNote('DEC-999', 'Unknown note')).toBe('Unknown note');
    expect(presentOwnerRole('SH-OTHER')).toBe('SH-OTHER');
  });

  it('projectStatusMeaning uses backend status + PS delta only', () => {
    expect(projectStatusMeaning('Green', 0)).toMatch(/базовом плане/);
    expect(projectStatusMeaning('Yellow', 0)).toMatch(/без сдвига/);
    expect(projectStatusMeaning('Red', 21)).toMatch(/Критический прогноз/);
    expect(projectStatusMeaning('Red', 14)).toMatch(/Остаточный критический/);
  });
});
