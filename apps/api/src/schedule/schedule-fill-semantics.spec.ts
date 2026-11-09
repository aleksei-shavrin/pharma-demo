import {
  fillToneForProgramProjects,
  fillToneForProjectGroup,
  resolveScheduleFillTone,
  resolveScheduleWarning,
  type ScheduleWarningItem,
} from './schedule-fill-semantics';

describe('schedule-fill-semantics (Nest port)', () => {
  it('prefers shift over lag on own work', () => {
    const work: ScheduleWarningItem = {
      kind: 'work',
      id: 'W1',
      status: 'Delayed',
      sourceWeeks: 2,
      baselineStart: '2026-01-01',
      baselineEnd: '2026-01-10',
      startDate: '2026-01-02',
      endDate: '2026-01-12',
    };
    expect(resolveScheduleWarning(work).tone).toBe('shift');
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Delayed',
        warningTone: 'shift',
      }),
    ).toBe('warn');
  });

  it('folds descendant lag into group danger fill', () => {
    const group: ScheduleWarningItem = {
      kind: 'project_group',
      id: 'AN-01',
      parentKey: null,
    };
    const leaf: ScheduleWarningItem = {
      kind: 'work',
      id: '1.1.1',
      parentKey: 'project_group:AN-01',
      status: 'Delayed',
      sourceWeeks: 3,
      baselineStart: '2026-01-01',
      baselineEnd: '2026-01-10',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      progressPct: 40,
    };
    const items = [
      { ...group, progressPct: 47 } as ScheduleWarningItem & {
        progressPct: number;
      },
      leaf,
    ];
    const result = fillToneForProjectGroup(items, 'AN-01');
    expect(result.progressFillTone).toBe('danger');
    expect(result.progressPct).toBe(47);
  });

  it('Completed + historical sourceWeeks → none warning / ok fill', () => {
    const completed: ScheduleWarningItem = {
      kind: 'work',
      id: '1.2.2',
      status: 'Completed',
      sourceWeeks: 2,
      baselineStart: '2026-08-08',
      baselineEnd: '2026-08-15',
      startDate: '2026-08-08',
      endDate: '2026-08-15',
      progressPct: 100,
    };
    expect(resolveScheduleWarning(completed).tone).toBe('none');
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Completed',
        warningTone: 'none',
      }),
    ).toBe('ok');
  });

  it('does not map RAG into work/group fill when warning none', () => {
    expect(
      resolveScheduleFillTone({
        kind: 'project_group',
        status: null,
        rag: 'Yellow',
        warningTone: 'none',
      }),
    ).toBe('ok');
  });

  it('program fold uses leaf warnings across member projects', () => {
    const items: ScheduleWarningItem[] = [
      { kind: 'project_group', id: 'AN-A', parentKey: null },
      { kind: 'project_group', id: 'AN-B', parentKey: null },
      {
        kind: 'work',
        id: 'wa',
        parentKey: 'project_group:AN-A',
        status: 'OnSchedule',
        baselineStart: '2026-01-01',
        baselineEnd: '2026-01-02',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
      },
      {
        kind: 'work',
        id: 'wb',
        parentKey: 'project_group:AN-B',
        status: 'Delayed',
        sourceWeeks: 1,
        baselineStart: '2026-01-01',
        baselineEnd: '2026-01-02',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
      },
    ];
    expect(fillToneForProgramProjects(items, ['AN-A', 'AN-B'])).toBe('danger');
  });
});
