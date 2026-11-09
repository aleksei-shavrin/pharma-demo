/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  resolveScheduleWarning,
  SCHEDULE_SHIFT_WARNING_LABEL,
  type ScheduleWarningItem,
} from './schedule-warning';

function work(
  patch: Partial<ScheduleWarningItem> & Pick<ScheduleWarningItem, 'id'>,
): ScheduleWarningItem {
  return {
    kind: 'work',
    status: 'OnSchedule',
    sourceWeeks: null,
    startDate: '2027-03-04',
    endDate: '2027-03-18',
    baselineStart: null,
    baselineEnd: null,
    ...patch,
  };
}

describe('resolveScheduleWarning', () => {
  it('даёт сдвиг, когда оба края базы заданы и интервал не совпадает с прогнозом', () => {
    expect(
      resolveScheduleWarning(
        work({
          id: '8.2.2',
          baselineStart: '2027-02-26',
          baselineEnd: '2027-03-08',
        }),
      ),
    ).toEqual({ tone: 'shift', label: SCHEDULE_SHIFT_WARNING_LABEL });
  });

  it('не считает сдвигом совпадающую базу и не смотрит на as-of', () => {
    expect(
      resolveScheduleWarning(
        work({
          id: 'WK-EQ',
          startDate: '2027-02-20',
          endDate: '2027-02-24',
          baselineStart: '2027-02-20',
          baselineEnd: '2027-02-24',
          status: 'OnSchedule',
        }),
      ),
    ).toEqual({ tone: 'none', label: '' });
  });

  it('не создаёт сдвиг, если задан только один край базы', () => {
    expect(
      resolveScheduleWarning(
        work({
          id: 'WK-HALF',
          baselineStart: '2027-02-01',
          baselineEnd: null,
        }),
      ),
    ).toEqual({ tone: 'none', label: '' });
  });

  it('сдвиг важнее Delayed и sourceWeeks на той же работе', () => {
    expect(
      resolveScheduleWarning(
        work({
          id: 'WK-BOTH',
          status: 'Delayed',
          sourceWeeks: 2,
          baselineStart: '2027-02-26',
          baselineEnd: '2027-03-08',
        }),
      ).tone,
    ).toBe('shift');
  });

  it('Delayed без недель подписывает «Отстаёт»', () => {
    expect(
      resolveScheduleWarning(
        work({ id: 'WK-LATE', status: 'Delayed', sourceWeeks: null }),
      ),
    ).toEqual({ tone: 'lag', label: 'Отстаёт' });
  });

  it('sourceWeeks alone is historical audit — no lag when not Delayed', () => {
    expect(
      resolveScheduleWarning(
        work({ id: 'WK-W', status: 'OnSchedule', sourceWeeks: 3 }),
      ),
    ).toEqual({ tone: 'none', label: '' });
    expect(
      resolveScheduleWarning(
        work({
          id: '1.2.2',
          status: 'Completed',
          sourceWeeks: 2,
          startDate: '2026-08-08',
          endDate: '2026-08-15',
          baselineStart: '2026-08-08',
          baselineEnd: '2026-08-15',
        }),
      ),
    ).toEqual({ tone: 'none', label: '' });
  });

  it('Delayed + sourceWeeks keeps weeks in lag label', () => {
    expect(
      resolveScheduleWarning(
        work({
          id: 'WK-0',
          status: 'Delayed',
          sourceWeeks: 0,
          baselineStart: '2027-02-20',
          baselineEnd: '2027-02-24',
          startDate: '2027-02-20',
          endDate: '2027-02-24',
        }),
      ),
    ).toEqual({ tone: 'lag', label: 'Отставание, 0 нед.' });
  });

  it('группа только с historical sourceWeeks без Delayed детей — none', () => {
    expect(
      resolveScheduleWarning({
        kind: 'stage_group',
        id: '8.2',
        sourceWeeks: 3,
      }),
    ).toEqual({ tone: 'none', label: '' });
  });

  it('группа с historical weeks сворачивает сдвиг потомка (не own lag)', () => {
    const stage = {
      kind: 'stage_group',
      id: '8.2',
      sourceWeeks: 3,
    } satisfies ScheduleWarningItem;
    const shifted = work({
      id: '8.2.2',
      baselineStart: '2027-02-26',
      baselineEnd: '2027-03-08',
    });
    expect(resolveScheduleWarning(stage, [shifted])).toEqual({
      tone: 'shift',
      label: SCHEDULE_SHIFT_WARNING_LABEL,
    });
  });

  it('предок без своего сигнала предпочитает сдвиг любого потомка', () => {
    const project = {
      kind: 'project_group',
      id: 'AN-08',
      sourceWeeks: null,
    } satisfies ScheduleWarningItem;
    const stage = {
      kind: 'stage_group',
      id: '8.2',
      sourceWeeks: 3,
    } satisfies ScheduleWarningItem;
    const shifted = work({
      id: '8.2.2',
      baselineStart: '2027-02-26',
      baselineEnd: '2027-03-08',
    });
    expect(resolveScheduleWarning(project, [stage, shifted])).toEqual({
      tone: 'shift',
      label: SCHEDULE_SHIFT_WARNING_LABEL,
    });
  });

  it('свёртка отставания не копирует недели потомка', () => {
    const project = {
      kind: 'project_group',
      id: 'AN-08',
      sourceWeeks: null,
    } satisfies ScheduleWarningItem;
    const delayed = work({
      id: '8.2.1',
      status: 'Delayed',
      sourceWeeks: 3,
      baselineStart: null,
      baselineEnd: null,
    });
    expect(resolveScheduleWarning(project, [delayed])).toEqual({
      tone: 'lag',
      label: 'Отстаёт',
    });
  });

  it('прогресс 100 сам по себе не создаёт предупреждение', () => {
    const completed = {
      kind: 'work',
      id: 'WK-01',
      status: 'Completed',
      sourceWeeks: null,
      startDate: '2027-02-20',
      endDate: '2027-02-24',
      baselineStart: null,
      baselineEnd: null,
      progressPct: 100,
    };
    expect(resolveScheduleWarning(completed)).toEqual({
      tone: 'none',
      label: '',
    });
  });
});
