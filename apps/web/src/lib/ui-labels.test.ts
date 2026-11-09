/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  presentDecisionNote,
  presentDecisionType,
  presentDecisionTypeCompact,
  presentIssueTitle,
  presentMilestoneName,
  presentOwnerRole,
  presentWorkstream,
  projectStatusLabel,
  projectStatusMeaning,
  ragLabel,
  scheduleKindLabel,
  workStatusLabel,
} from './ui-labels';

describe('Demo v1 presentation mapping', () => {
  it('maps schedule kinds to director-facing type labels', () => {
    expect(scheduleKindLabel('equipment_delivery')).toBe('Оборудование');
    expect(scheduleKindLabel('milestone')).toBe('Веха');
    expect(scheduleKindLabel('work')).toBe('Работа');
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
    expect(projectStatusLabel('Green')).toBe('В норме');
    expect(projectStatusLabel('Yellow')).toBe('Требует внимания');
    expect(projectStatusLabel('Red')).toBe('Критично');
    expect(presentDecisionTypeCompact('PrioritizeRecovery')).toBe(
      'Приоритизация сроков',
    );
    expect(presentDecisionTypeCompact('AcceptDateSlip')).toBe(
      'Принять сдвиг даты',
    );
  });

  it('projectStatusLabel unknown/null is Нет оценки (never false Critical)', () => {
    expect(projectStatusLabel(null)).toBe('Нет оценки');
    expect(projectStatusLabel(undefined)).toBe('Нет оценки');
    expect(projectStatusLabel('')).toBe('Нет оценки');
    expect(projectStatusLabel('Purple')).toBe('Нет оценки');
    expect(projectStatusLabel('unknown')).toBe('Нет оценки');
  });

  it('ragLabel is assessment meaning; null/unknown/Amber handled', () => {
    expect(ragLabel('risk', 'Green')).toBe('Риск в норме');
    expect(ragLabel('risk', 'Red')).toBe('Риск критичен');
    expect(ragLabel('milestone', 'Green')).toBe('Веха в норме');
    expect(ragLabel('milestone', 'Red')).toBe('Веха критична');
    expect(ragLabel('risk', 'Yellow')).toBe('Риск требует внимания');
    expect(ragLabel('risk', 'Amber')).toBe('Риск требует внимания');
    expect(ragLabel('milestone', 'Amber')).toBe('Веха требует внимания');
    expect(ragLabel('risk', null)).toBe('Нет оценки');
    expect(ragLabel('milestone', undefined)).toBe('Нет оценки');
    expect(ragLabel('risk', 'Purple')).toBe('Нет оценки');
    expect(ragLabel('milestone', '')).toBe('Нет оценки');
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
    expect(projectStatusMeaning(null, 0)).toMatch(/отсутствует/);
    expect(projectStatusMeaning('weird', 5)).toMatch(/отсутствует/);
  });
});

describe('workStatusLabel', () => {
  it('русские подписи статусов работ', () => {
    expect(workStatusLabel('Waiting')).toBe('Ожидание');
    expect(workStatusLabel('OnSchedule')).toBe('По графику');
    expect(workStatusLabel('Delayed')).toBe('Отстаёт');
    expect(workStatusLabel('Completed')).toBe('Выполнено');
  });
});
