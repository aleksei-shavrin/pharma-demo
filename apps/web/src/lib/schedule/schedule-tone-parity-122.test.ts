/** @vitest-environment node */
/**
 * r4: Completed work 1.2.2 with historical sourceWeeks must not paint danger
 * fill/warning; bar CSS follows Completed. HVAC Delayed stays danger.
 */
import { describe, expect, it } from 'vitest';
import { resolveScheduleFillTone } from './schedule-fill-tone';
import { resolveScheduleWarning } from './schedule-warning';
import { buildVisibleScheduleRows } from './visible-rows';
import { toGanttPresentation } from './to-gantt-presentation';
import type { ScheduleItem } from '@/lib/api-client';

function snapshotALike(): ScheduleItem[] {
  return [
    {
      kind: 'project_group',
      id: 'AN-01',
      name: 'Предпроект',
      parentKey: null,
      wbs: '1',
      siblingOrder: 0,
      progressPct: 100,
      sourceWeeks: null,
    },
    {
      kind: 'stage_group',
      id: '1.2',
      name: 'URS / требования',
      parentKey: 'project_group:AN-01',
      wbs: '1.2',
      siblingOrder: 1,
      progressPct: 100,
      sourceWeeks: 2,
    },
    {
      kind: 'work',
      id: '1.2.1',
      name: 'Сбор требований',
      parentKey: 'stage_group:1.2',
      wbs: '1.2.1',
      siblingOrder: 0,
      progressPct: 100,
      sourceWeeks: null,
      status: 'Completed',
      startDate: '2026-08-01',
      endDate: '2026-08-08',
      baselineStart: '2026-08-01',
      baselineEnd: '2026-08-08',
      actualStart: '2026-08-01',
      actualEnd: '2026-08-08',
    },
    {
      kind: 'work',
      id: '1.2.2',
      name: 'Анализ требований',
      parentKey: 'stage_group:1.2',
      wbs: '1.2.2',
      siblingOrder: 1,
      progressPct: 100,
      // Historical ⚠️Nн audit — must NOT force runtime lag/danger when Completed.
      sourceWeeks: 2,
      status: 'Completed',
      startDate: '2026-08-08',
      endDate: '2026-08-15',
      baselineStart: '2026-08-08',
      baselineEnd: '2026-08-15',
      actualStart: '2026-08-08',
      actualEnd: '2026-08-15',
    },
    {
      kind: 'work',
      id: '1.2.3',
      name: 'Согласование',
      parentKey: 'stage_group:1.2',
      wbs: '1.2.3',
      siblingOrder: 2,
      progressPct: 100,
      sourceWeeks: null,
      status: 'Completed',
      startDate: '2026-08-15',
      endDate: '2026-08-15',
      baselineStart: '2026-08-15',
      baselineEnd: '2026-08-15',
      actualStart: '2026-08-15',
      actualEnd: '2026-08-15',
    },
    {
      kind: 'milestone',
      id: 'KT-1.2.4',
      name: 'КТ URS',
      parentKey: 'stage_group:1.2',
      wbs: '1.2.4',
      siblingOrder: 3,
      progressPct: 100,
      sourceWeeks: null,
      sourceStatus: 'missed',
      rag: 'Green',
      baselineDate: '2026-08-15',
      forecastDate: '2026-08-15',
    },
    {
      kind: 'work',
      id: '9.3.1',
      name: 'AHU',
      parentKey: null,
      wbs: '9.3.1',
      siblingOrder: 0,
      progressPct: 0,
      sourceWeeks: 3,
      status: 'Delayed',
      // Aligned dates → lag (not shift); active Delayed stays danger.
      startDate: '2027-05-01',
      endDate: '2027-06-01',
      baselineStart: '2027-05-01',
      baselineEnd: '2027-06-01',
    },
  ] as ScheduleItem[];
}

describe('tone parity 1.2.2 (r4)', () => {
  it('A-like: Completed 1.2.2 + parents → warning none / fill ok; bar completed CSS', () => {
    const items = snapshotALike();
    const rows = buildVisibleScheduleRows(items, {
      expandedKeys: ['project_group:AN-01', 'stage_group:1.2'],
    });
    const w122 = rows.find((r) => r.id === '1.2.2')!;
    const stage = rows.find((r) => r.id === '1.2')!;
    const project = rows.find((r) => r.id === 'AN-01')!;
    const kt = rows.find((r) => r.id === 'KT-1.2.4')!;

    expect(w122.warning.tone).toBe('none');
    expect(stage.warning.tone).toBe('none');
    expect(project.warning.tone).toBe('none');
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Completed',
        warningTone: w122.warning.tone,
      }),
    ).toBe('ok');
    expect(
      resolveScheduleFillTone({
        kind: 'stage_group',
        warningTone: stage.warning.tone,
      }),
    ).toBe('ok');
    expect(
      resolveScheduleFillTone({
        kind: 'milestone',
        rag: 'Green',
        warningTone: 'none',
      }),
    ).toBe('ok');
    expect(kt.item).toMatchObject({ rag: 'Green' });

    const work122 = items.find((i) => i.id === '1.2.2')!;
    const gantt = toGanttPresentation([work122], []);
    const task122 = gantt.data.find((t) => String(t.id).includes('1.2.2'));
    expect(task122?.css).toContain('ppc-work-completed');
    expect(task122?.css).not.toContain('ppc-work-delayed');
  });

  it('Delayed HVAC-like work keeps lag/danger (not forced green)', () => {
    const delayed = snapshotALike().find((i) => i.id === '9.3.1')!;
    const warning = resolveScheduleWarning(delayed as never);
    expect(warning.tone).toBe('lag');
    expect(
      resolveScheduleFillTone({
        kind: 'work',
        status: 'Delayed',
        warningTone: warning.tone,
      }),
    ).toBe('danger');
  });
});
