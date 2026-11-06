/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type {
  ScheduleItem,
  ScheduleLink,
  ScheduleMilestoneItem,
  ScheduleWorkItem,
} from '@/lib/api-client';
import {
  GANTT_LINK_TYPE_CODE,
  computeTimelineVisibleRange,
  inclusiveDurationDays,
  forecastPresentationId,
  logicalPresentationId,
  presentationIdToSelectionKey,
  toGanttPresentation,
  type GanttTreeRow,
} from './to-gantt-presentation';

const noTree = {
  parentKey: null,
  wbs: null,
  siblingOrder: null,
  progressPct: null,
  sourceWeeks: null,
} as const;

const noWorkBaseline = {
  baselineStart: null,
  baselineEnd: null,
} as const;

const eqA: ScheduleItem = {
  ...noTree,
  kind: 'equipment_delivery',
  id: 'EQ-HVAC-01',
  name: 'Центральный AHU',
  workstream: 'WS-HVAC',
  critical: true,
  status: 'OnTrack',
  baselineDate: '2027-05-15',
  forecastDate: '2027-05-15',
  dateVariance: {
    baselineDate: '2027-05-15',
    forecastDate: '2027-05-15',
    deltaDays: 0,
  },
};

const eqB: ScheduleItem = {
  ...eqA,
  status: 'Delayed',
  forecastDate: '2027-06-05',
  dateVariance: {
    baselineDate: '2027-05-15',
    forecastDate: '2027-06-05',
    deltaDays: 21,
  },
};

const msA: ScheduleMilestoneItem = {
  ...noTree,
  kind: 'milestone',
  id: 'MS-PS',
  name: 'Ready for production',
  workstream: null,
  rag: 'Green',
  baselineDate: '2027-09-15',
  forecastDate: '2027-09-15',
  dateVariance: {
    baselineDate: '2027-09-15',
    forecastDate: '2027-09-15',
    deltaDays: 0,
  },
};

const msB: ScheduleMilestoneItem = {
  ...msA,
  rag: 'Red',
  forecastDate: '2027-10-06',
  dateVariance: {
    baselineDate: '2027-09-15',
    forecastDate: '2027-10-06',
    deltaDays: 21,
  },
};

describe('toGanttPresentation (one logical row)', () => {
  it('A: exactly 2 logical rows; duration 0; no task type', () => {
    const p = toGanttPresentation([eqA, msA]);
    expect(p.links).toEqual([]);
    expect(p.data).toHaveLength(2);
    expect(p.data.every((t) => t.type === 'milestone')).toBe(true);
    expect(p.data.every((t) => t.duration === 0)).toBe(true);
    expect(p.data.every((t) => t.showBaselineGhost === false)).toBe(true);
    expect(p.data.map((t) => [t.id, t.start_date])).toEqual([
      ['equipment_delivery:EQ-HVAC-01', '2027-05-15'],
      ['milestone:MS-PS', '2027-09-15'],
    ]);
    expect(p.data.some((t) => (t as { type: string }).type === 'task')).toBe(
      false,
    );
    expect(JSON.stringify(p)).not.toMatch(/"duration":\s*21/);
  });

  it('B: exactly 2 logical rows; each owns baseline+forecast; no duration from delta', () => {
    const p = toGanttPresentation([eqB, msB]);
    expect(p.data).toHaveLength(2);
    expect(p.data.every((t) => t.type === 'milestone')).toBe(true);
    expect(p.data.every((t) => t.duration === 0)).toBe(true);
    expect(p.data.every((t) => t.showBaselineGhost)).toBe(true);
    expect(p.data.map((t) => ({
      id: t.id,
      baseline: t.baselineDate,
      forecast: t.forecastDate,
      start: t.start_date,
    }))).toEqual([
      {
        id: 'equipment_delivery:EQ-HVAC-01',
        baseline: '2027-05-15',
        forecast: '2027-06-05',
        start: '2027-06-05',
      },
      {
        id: 'milestone:MS-PS',
        baseline: '2027-09-15',
        forecast: '2027-10-06',
        start: '2027-10-06',
      },
    ]);
    expect(p.links).toEqual([]);
    // duration is typed as literal 0; assert no delta-as-duration leaked into JSON
    expect(JSON.stringify(p)).not.toMatch(/"duration":\s*21/);
  });

  it('C: same delayed forecasts as B; no recovery heal; still 2 rows', () => {
    const p = toGanttPresentation([eqB, msB]);
    expect(p.data).toHaveLength(2);
    expect(p.data[0].forecastDate).toBe('2027-06-05');
    expect(p.data[1].forecastDate).toBe('2027-10-06');
  });

  it('logical row id maps to ScheduleSelectionKey; legacy role suffixes still parse', () => {
    const eqKey = { kind: 'equipment_delivery' as const, entityId: 'EQ-HVAC-01' };
    expect(presentationIdToSelectionKey('equipment_delivery:EQ-HVAC-01')).toEqual(
      eqKey,
    );
    expect(
      presentationIdToSelectionKey('equipment_delivery:EQ-HVAC-01:baseline'),
    ).toEqual(eqKey);
    expect(
      presentationIdToSelectionKey('equipment_delivery:EQ-HVAC-01:forecast'),
    ).toEqual(eqKey);
    expect(logicalPresentationId(eqKey)).toBe('equipment_delivery:EQ-HVAC-01');
    expect(forecastPresentationId(eqKey)).toBe('equipment_delivery:EQ-HVAC-01');
  });
});

describe('computeTimelineVisibleRange', () => {
  it('A range covers May and September with padding', () => {
    const r = computeTimelineVisibleRange([eqA, msA]);
    expect(r.coveredDates).toEqual(['2027-05-15', '2027-09-15']);
    expect(r.start <= '2027-05-15').toBe(true);
    expect(r.end > '2027-09-15').toBe(true);
    expect(r.start).toBe('2027-05-01');
    expect(r.end).toBe('2027-09-30');
  });

  it('B/C range covers May through October canonical dates', () => {
    const r = computeTimelineVisibleRange([eqB, msB]);
    for (const d of [
      '2027-05-15',
      '2027-06-05',
      '2027-09-15',
      '2027-10-06',
    ]) {
      expect(r.coveredDates).toContain(d);
      expect(r.start <= d).toBe(true);
      expect(r.end > d).toBe(true);
    }
    expect(r.start).toBe('2027-05-01');
    expect(r.end).toBe('2027-10-21');
  });

  it('selection does not alter the data range (pure function of items)', () => {
    const a = computeTimelineVisibleRange([eqB, msB]);
    const b = computeTimelineVisibleRange([eqB, msB]);
    expect(a).toEqual(b);
  });

  it('snapshot switch recomputes range atomically (A vs B)', () => {
    const a = computeTimelineVisibleRange([eqA, msA]);
    const b = computeTimelineVisibleRange([eqB, msB]);
    expect(a.end).not.toEqual(b.end);
    expect(b.coveredDates).toContain('2027-10-06');
    expect(a.coveredDates).not.toContain('2027-10-06');
  });
});

const workA: ScheduleWorkItem = {
  ...noTree,
  ...noWorkBaseline,
  kind: 'work',
  id: 'WK-01',
  name: 'Монтаж AHU',
  workstream: 'WS-HVAC',
  startDate: '2027-06-01',
  endDate: '2027-06-10',
  status: 'OnSchedule',
};

const workB: ScheduleWorkItem = {
  ...workA,
  id: 'WK-02',
  startDate: '2027-06-11',
  endDate: '2027-06-11',
  status: 'Delayed',
};

describe('inclusiveDurationDays', () => {
  it('считает календарные дни включительно', () => {
    expect(inclusiveDurationDays('2027-06-01', '2027-06-10')).toBe(10);
  });

  it('один день → длительность 1', () => {
    expect(inclusiveDurationDays('2027-06-11', '2027-06-11')).toBe(1);
  });

  it('не зависит от перехода на летнее время', () => {
    expect(inclusiveDurationDays('2027-03-27', '2027-03-29')).toBe(3);
    expect(inclusiveDurationDays('2027-10-30', '2027-11-01')).toBe(3);
  });

  it('конец раньше начала не даёт длительность меньше 1', () => {
    expect(inclusiveDurationDays('2027-06-10', '2027-06-01')).toBe(1);
  });
});

describe('toGanttPresentation: работы и связи', () => {
  it('работа — полоса task с включительной длительностью и без baseline-призрака', () => {
    const { data } = toGanttPresentation([workA]);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: 'work:WK-01',
      text: 'WK-01',
      type: 'task',
      start_date: '2027-06-01',
      duration: 10,
      showBaselineGhost: false,
      css: 'ppc-work ppc-work-onschedule',
      selectionKey: { kind: 'work', entityId: 'WK-01' },
    });
    expect(data[0].css).not.toContain('ppc-role-forecast');
    expect(data[0].forecastDate).toBeUndefined();
    expect(data[0].baselineDate).toBeUndefined();
  });

  it('работа на один день → duration 1', () => {
    expect(toGanttPresentation([workB]).data[0].duration).toBe(1);
  });

  it.each([
    ['Waiting', 'ppc-work ppc-work-waiting'],
    ['OnSchedule', 'ppc-work ppc-work-onschedule'],
    ['Delayed', 'ppc-work ppc-work-delayed'],
    ['Completed', 'ppc-work ppc-work-completed'],
  ] as const)('статус %s → css %s', (status, css) => {
    expect(toGanttPresentation([{ ...workA, status }]).data[0].css).toBe(css);
  });

  it('смешанный набор: вехи остаются milestone, работы — task', () => {
    const { data } = toGanttPresentation([eqB, workA]);
    expect(data.map((t) => t.type)).toEqual(['milestone', 'task']);
    expect(data[0].showBaselineGhost).toBe(true);
    expect(data[1].showBaselineGhost).toBe(false);
  });

  it('связи маппятся на коды DHTMLX Community (строки 0–3)', () => {
    const links: ScheduleLink[] = [
      { id: 'L1', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'FS' },
      { id: 'L2', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'SS' },
      { id: 'L3', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'FF' },
      { id: 'L4', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'SF' },
    ];
    const { links: mapped } = toGanttPresentation([workA, workB], links);
    expect(mapped).toEqual([
      { id: 'L1', source: 'work:WK-01', target: 'work:WK-02', type: '0' },
      { id: 'L2', source: 'work:WK-01', target: 'work:WK-02', type: '1' },
      { id: 'L3', source: 'work:WK-01', target: 'work:WK-02', type: '2' },
      { id: 'L4', source: 'work:WK-01', target: 'work:WK-02', type: '3' },
    ]);
    expect(GANTT_LINK_TYPE_CODE).toEqual({ FS: '0', SS: '1', FF: '2', SF: '3' });
  });

  it('связи без аргумента → []; связи на отсутствующие строки отбрасываются', () => {
    expect(toGanttPresentation([workA]).links).toEqual([]);
    const orphan: ScheduleLink = {
      id: 'L9',
      sourceRef: 'work:WK-01',
      targetRef: 'work:WK-99',
      type: 'FS',
    };
    expect(toGanttPresentation([workA], [orphan]).links).toEqual([]);
  });

  it('work:* парсится как selection key, в том числе с legacy-суффиксом', () => {
    const key = { kind: 'work' as const, entityId: 'WK-01' };
    expect(presentationIdToSelectionKey('work:WK-01')).toEqual(key);
    expect(presentationIdToSelectionKey('work:WK-01:forecast')).toEqual(key);
  });
});

describe('computeTimelineVisibleRange: работы', () => {
  it('включает даты начала и окончания работ', () => {
    const r = computeTimelineVisibleRange([eqA, workA]);
    expect(r.coveredDates).toEqual(
      expect.arrayContaining(['2027-05-15', '2027-06-01', '2027-06-10']),
    );
    expect(r.end > '2027-06-10').toBe(true);
  });

  it('горизонт расширяется до окончания работы', () => {
    const late: ScheduleWorkItem = { ...workA, endDate: '2027-12-20' };
    const r = computeTimelineVisibleRange([eqA, late]);
    expect(r.end > '2027-12-20').toBe(true);
  });

  it('даты сводки расширяют горизонт, пустые границы игнорируются', () => {
    const r = computeTimelineVisibleRange(
      [],
      ['2027-02-25', null, '2027-03-18', undefined],
    );
    expect(r.coveredDates).toEqual(['2027-02-25', '2027-03-18']);
    expect(r.start <= '2027-02-25').toBe(true);
    expect(r.end > '2027-03-18').toBe(true);
  });
});

function treeRow(
  partial: Pick<GanttTreeRow, 'key' | 'kind' | 'id'> & Partial<GanttTreeRow>,
): GanttTreeRow {
  return {
    name: partial.id,
    progressPct: null,
    summaryStart: null,
    summaryEnd: null,
    item: null,
    ...partial,
  };
}

const workZero: ScheduleWorkItem = {
  ...noTree,
  ...noWorkBaseline,
  kind: 'work',
  id: '8.2.1',
  name: 'Сэндвич-панели и герметизация',
  startDate: '2027-02-25',
  endDate: '2027-03-02',
  status: 'Delayed',
};

const workPartial: ScheduleWorkItem = {
  ...noTree,
  ...noWorkBaseline,
  kind: 'work',
  id: '8.2.2',
  name: 'Фальшполы и потолки',
  startDate: '2027-03-04',
  endDate: '2027-03-18',
  status: 'OnSchedule',
};

const workDone: ScheduleWorkItem = {
  ...workA,
  status: 'Completed',
};

describe('toGanttPresentation: иерархия и прогресс', () => {
  const project = treeRow({
    key: 'project_group:AN-08',
    kind: 'project_group',
    id: 'AN-08',
    name: 'Внутренняя отделка и чистые помещения',
    summaryStart: '2027-02-20',
    summaryEnd: '2027-03-18',
  });
  const stage = treeRow({
    key: 'stage_group:8.2',
    kind: 'stage_group',
    id: '8.2',
    name: 'Чистые помещения классов C/D',
    summaryStart: '2027-02-25',
    summaryEnd: '2027-03-18',
  });
  const stageEmpty = treeRow({
    key: 'stage_group:9.1',
    kind: 'stage_group',
    id: '9.1',
    name: 'Без интервала',
    summaryStart: '2027-04-01',
    summaryEnd: null,
  });
  const rowZero = treeRow({
    key: 'work:8.2.1',
    kind: 'work',
    id: '8.2.1',
    name: workZero.name,
    progressPct: 0,
    item: workZero,
  });
  const rowPartial = treeRow({
    key: 'work:8.2.2',
    kind: 'work',
    id: '8.2.2',
    name: workPartial.name,
    progressPct: 40,
    item: workPartial,
  });
  const rowDone = treeRow({
    key: 'work:WK-01',
    kind: 'work',
    id: 'WK-01',
    name: workDone.name,
    progressPct: 100,
    item: workDone,
  });
  const rowUnknown = treeRow({
    key: 'work:WK-02',
    kind: 'work',
    id: 'WK-02',
    name: workB.name,
    progressPct: null,
    item: workB,
  });
  const rowMilestone = treeRow({
    key: 'milestone:MS-PS',
    kind: 'milestone',
    id: 'MS-PS',
    name: msB.name,
    item: msB,
  });
  const rowGreen = treeRow({
    key: 'milestone:MS-OK',
    kind: 'milestone',
    id: 'MS-OK',
    name: msA.name,
    item: { ...msA, id: 'MS-OK' },
  });
  const rowEquipment = treeRow({
    key: 'equipment_delivery:EQ-HVAC-01',
    kind: 'equipment_delivery',
    id: 'EQ-HVAC-01',
    name: eqB.name,
    item: eqB,
  });

  it('без treeRows остаётся плоский список без прогресса и без групп', () => {
    const flat = toGanttPresentation([workA, msA]);
    expect(flat.data.map((task) => task.type)).toEqual(['task', 'milestone']);
    expect(flat.data[0].css).toBe('ppc-work ppc-work-onschedule');
    expect(flat.data[0].progress).toBeUndefined();
    expect(flat.data[1].type).toBe('milestone');
    expect(flat.data[1].duration).toBe(0);
    expect(flat.data[1].css).toContain('ppc-ms-filled');
    expect(flat.data[1].css).toContain('ppc-ms-green');
  });

  it('строки идут в переданном порядке, без повторной сортировки', () => {
    const { data } = toGanttPresentation(
      [],
      [],
      [rowDone, project, rowZero, stage],
    );
    expect(data.map((task) => task.id)).toEqual([
      'work:WK-01',
      'project_group:AN-08',
      'work:8.2.1',
      'stage_group:8.2',
    ]);
    expect(data.every((task) => !('open' in task) && !('parent' in task))).toBe(
      true,
    );
    expect(data.every((task) => !('render' in task))).toBe(true);
  });

  it('группа рисует сводную полосу по включительным границам', () => {
    const { data } = toGanttPresentation([], [], [project, stage]);
    expect(data[0]).toMatchObject({
      id: 'project_group:AN-08',
      type: 'project',
      start_date: '2027-02-20',
      duration: inclusiveDurationDays('2027-02-20', '2027-03-18'),
      css: 'ppc-summary',
      auto_scheduling: false,
      showBaselineGhost: false,
    });
    expect(data[1]).toMatchObject({
      id: 'stage_group:8.2',
      type: 'project',
      start_date: '2027-02-25',
      duration: inclusiveDurationDays('2027-02-25', '2027-03-18'),
      css: 'ppc-summary',
    });
    expect(data[0].progress).toBeUndefined();
    expect(data[1].progress).toBeUndefined();
  });

  it('группа без одной границы остаётся строкой без полосы', () => {
    const task = toGanttPresentation([], [], [stageEmpty]).data[0];
    expect(task.type).toBe('project');
    expect(task.css).toBe('ppc-summary');
    expect(task.unscheduled).toBe(true);
    expect(task.start_date).toBeUndefined();
    expect(task.duration).toBeUndefined();
  });

  it('прогресс 0 — известный ноль, null не записывается как 0, 100 заполняет полосу', () => {
    const { data } = toGanttPresentation(
      [],
      [],
      [rowZero, rowPartial, rowDone, rowUnknown],
    );
    const [zero, partial, done, unknown] = data;

    expect(zero).toMatchObject({
      type: 'task',
      start_date: '2027-02-25',
      duration: inclusiveDurationDays('2027-02-25', '2027-03-02'),
      progress: 0,
    });
    expect(zero.css).toContain('ppc-work-delayed');
    expect(zero.css).toContain('ppc-progress-zero');
    expect(zero.barCaption).toBe('');
    expect(zero.duration).toBeGreaterThan(0);

    expect(partial.progress).toBe(0.4);
    expect(partial.barCaption).toBe('');
    expect(partial.css).toContain('ppc-progress-known');
    expect(partial.css).toContain('ppc-work-onschedule');
    expect(partial.type).toBe('task');

    expect(done.progress).toBe(1);
    expect(done.barCaption).toBe('');
    expect(done.css).toContain('ppc-progress-known');
    expect(done.css).toContain('ppc-work-completed');

    expect(unknown.barCaption).toBe('');
    expect(unknown.progress).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(unknown, 'progress')).toBe(
      false,
    );
    expect(unknown.css).toContain('ppc-progress-unknown');
    expect(unknown.css).toContain('ppc-work-delayed');
    expect(unknown.type).toBe('task');
    expect(unknown.duration).toBe(1);
    expect(unknown.css).not.toContain('ppc-ms');
  });

  it('готовность 50% занимает половину полосы и подписывается числом', () => {
    const half = treeRow({
      key: 'work:WK-HALF',
      kind: 'work',
      id: 'WK-HALF',
      name: 'Ровно половина',
      progressPct: 50,
      item: { ...workPartial, id: 'WK-HALF', name: 'Ровно половина' },
    });
    const task = toGanttPresentation([], [], [half]).data[0];
    expect(task.progress).toBe(0.5);
    expect(task.barCaption).toBe('');
    expect(task.css).toContain('ppc-progress-known');
  });

  it('веха остаётся milestone, красная — контур, зелёная — заливка; поставка не полоса', () => {
    const { data } = toGanttPresentation(
      [],
      [],
      [rowMilestone, rowGreen, rowEquipment],
    );
    expect(data[0]).toMatchObject({
      id: 'milestone:MS-PS',
      type: 'milestone',
      duration: 0,
      start_date: '2027-10-06',
      showBaselineGhost: true,
    });
    expect(data[0].css).toContain('ppc-ms-red');
    expect(data[0].css).toContain('ppc-ms-outline');
    expect(data[0].css).not.toContain('ppc-work');

    expect(data[1].type).toBe('milestone');
    expect(data[1].duration).toBe(0);
    expect(data[1].css).toContain('ppc-ms-green');
    expect(data[1].css).toContain('ppc-ms-filled');

    expect(data[2]).toMatchObject({
      id: 'equipment_delivery:EQ-HVAC-01',
      type: 'milestone',
      duration: 0,
      showBaselineGhost: true,
    });
    expect(data[2].css).toContain('ppc-eq-delayed');
  });

  it('связи по-прежнему крепятся к id работ, не к группе', () => {
    const links: ScheduleLink[] = [
      { id: 'L1', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'FS' },
      { id: 'L2', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'SS' },
      { id: 'L3', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'FF' },
      { id: 'L4', sourceRef: 'work:WK-01', targetRef: 'work:WK-02', type: 'SF' },
      {
        id: 'L-group',
        sourceRef: 'project_group:AN-08',
        targetRef: 'work:WK-01',
        type: 'FS',
      },
    ];
    const { links: mapped } = toGanttPresentation(
      [],
      links,
      [project, rowDone, rowUnknown],
    );
    expect(mapped).toEqual([
      { id: 'L1', source: 'work:WK-01', target: 'work:WK-02', type: '0' },
      { id: 'L2', source: 'work:WK-01', target: 'work:WK-02', type: '1' },
      { id: 'L3', source: 'work:WK-01', target: 'work:WK-02', type: '2' },
      { id: 'L4', source: 'work:WK-01', target: 'work:WK-02', type: '3' },
    ]);
  });
});
