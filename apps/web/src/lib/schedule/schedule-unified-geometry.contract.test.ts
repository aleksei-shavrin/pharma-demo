/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type {
  ScheduleLink,
  ScheduleMilestoneItem,
  ScheduleWorkItem,
} from '@/lib/api-client';
import {
  SCHEDULE_HEADER_HEIGHT_PX,
  SCHEDULE_ROW_HEIGHT_PX,
  rowPitchFitsStackedBars,
} from './schedule-geometry';
import { clampScroll, isoFromDate } from './schedule-scroll-anchor';
import {
  CROSS_PROJECT_PREDECESSOR_CAPTION,
  toGanttPresentation,
  type GanttTreeRow,
} from './to-gantt-presentation';

const tree = {
  parentKey: null,
  wbs: null,
  siblingOrder: null,
  progressPct: null,
  sourceWeeks: null,
} as const;

describe('schedule-unified-geometry: контракт геометрии календаря', () => {
  it('константы высоты строки и шапки — текущие значения из schedule-geometry', () => {
    expect(SCHEDULE_ROW_HEIGHT_PX).toBe(32);
    expect(SCHEDULE_HEADER_HEIGHT_PX).toBe(40);
  });

  it('rowPitchFitsStackedBars — граничные случаи 32/8/2 и 32/26/2', () => {
    expect(rowPitchFitsStackedBars(32, 8, 2)).toBe(true);
    expect(rowPitchFitsStackedBars(32, 26, 2)).toBe(false);
  });

  it('clampScroll: отрицательное значение и NaN приводятся к 0', () => {
    expect(clampScroll(-1, 100)).toBe(0);
    expect(clampScroll(-1000, 50)).toBe(0);
    expect(clampScroll(Number.NaN, 100)).toBe(0);
  });

  it('clampScroll: значение больше max ограничивается max', () => {
    expect(clampScroll(200, 100)).toBe(100);
  });

  it('isoFromDate: локальная дата 2027-03-01', () => {
    const d = new Date(2027, 2, 1);
    expect(isoFromDate(d)).toBe('2027-03-01');
  });
});

const workLinkA: ScheduleWorkItem = {
  ...tree,
  kind: 'work',
  id: 'WK-LNK-A',
  name: 'Связь A',
  workstream: null,
  startDate: '2027-06-01',
  endDate: '2027-06-10',
  status: 'OnSchedule',
  baselineStart: null,
  baselineEnd: null,
};

const workLinkB: ScheduleWorkItem = {
  ...workLinkA,
  id: 'WK-LNK-B',
  name: 'Связь B',
  startDate: '2027-06-11',
  endDate: '2027-06-11',
  status: 'Delayed',
};

const milestoneXpm: ScheduleMilestoneItem = {
  ...tree,
  kind: 'milestone',
  id: 'MS-XPM',
  name: 'Веха XPM',
  workstream: null,
  rag: 'Green',
  baselineDate: '2027-02-18',
  forecastDate: '2027-04-15',
  dateVariance: {
    baselineDate: '2027-02-18',
    forecastDate: '2027-04-15',
    deltaDays: 56,
  },
};

function workForCrossProject(
  extra: Partial<ScheduleWorkItem> = {},
): ScheduleWorkItem {
  return {
    ...tree,
    kind: 'work',
    id: '9.3.2',
    name: 'Подключение к сетям',
    workstream: null,
    startDate: '2027-04-16',
    endDate: '2027-04-30',
    status: 'Waiting',
    baselineStart: null,
    baselineEnd: null,
    actualStart: null,
    actualEnd: null,
    ...extra,
  };
}

const crossProjectLink: ScheduleLink = {
  id: 'LNK-CONTRACT-XPM',
  kind: 'cross_project_predecessor',
  sourceRef: 'milestone:MS-XPM',
  targetRef: 'work:9.3.2',
};

describe('schedule-unified-geometry: toGanttPresentation (контракт)', () => {
  it('типы связей FS/SS/FF/SF маппятся на коды DHTMLX (0–3)', () => {
    const links: ScheduleLink[] = [
      {
        id: 'L-FS',
        kind: 'scheduling',
        sourceRef: 'work:WK-LNK-A',
        targetRef: 'work:WK-LNK-B',
        type: 'FS',
      },
      {
        id: 'L-SS',
        kind: 'scheduling',
        sourceRef: 'work:WK-LNK-A',
        targetRef: 'work:WK-LNK-B',
        type: 'SS',
      },
      {
        id: 'L-FF',
        kind: 'scheduling',
        sourceRef: 'work:WK-LNK-A',
        targetRef: 'work:WK-LNK-B',
        type: 'FF',
      },
      {
        id: 'L-SF',
        kind: 'scheduling',
        sourceRef: 'work:WK-LNK-A',
        targetRef: 'work:WK-LNK-B',
        type: 'SF',
      },
    ];
    const { links: out } = toGanttPresentation([workLinkA, workLinkB], links);
    expect(out).toEqual([
      {
        id: 'L-FS',
        source: 'work:WK-LNK-A',
        target: 'work:WK-LNK-B',
        type: '0',
      },
      {
        id: 'L-SS',
        source: 'work:WK-LNK-A',
        target: 'work:WK-LNK-B',
        type: '1',
      },
      {
        id: 'L-FF',
        source: 'work:WK-LNK-A',
        target: 'work:WK-LNK-B',
        type: '2',
      },
      {
        id: 'L-SF',
        source: 'work:WK-LNK-A',
        target: 'work:WK-LNK-B',
        type: '3',
      },
    ]);
  });

  it('межпроектное предшествование есть в прогнозе и скрывается в actual при закрытом факте', () => {
    const closed = workForCrossProject({
      actualStart: '2027-04-16',
      actualEnd: '2027-04-20',
    });
    const forecast = toGanttPresentation(
      [milestoneXpm, closed],
      [crossProjectLink],
      undefined,
      { comparison: 'forecast' },
    );
    const actual = toGanttPresentation(
      [milestoneXpm, closed],
      [crossProjectLink],
      undefined,
      { comparison: 'actual' },
    );
    expect(forecast.links).toEqual([
      {
        id: 'LNK-CONTRACT-XPM',
        source: 'milestone:MS-XPM',
        target: 'work:9.3.2',
        accessibleName: CROSS_PROJECT_PREDECESSOR_CAPTION,
      },
    ]);
    expect(forecast.links[0]).not.toHaveProperty('type');
    expect(actual.links).toEqual([]);
  });

  it('progress null и 0 различимы по css и полю progress (без подписи на полосе)', () => {
    const workItem: ScheduleWorkItem = {
      ...tree,
      kind: 'work',
      id: 'PROG-ROW',
      name: 'Прогресс',
      workstream: null,
      startDate: '2027-05-01',
      endDate: '2027-05-05',
      status: 'OnSchedule',
      baselineStart: null,
      baselineEnd: null,
    };
    const rowNull: GanttTreeRow = {
      key: 'work:PROG-ROW',
      kind: 'work',
      id: 'PROG-ROW',
      name: 'Прогресс',
      progressPct: null,
      summaryStart: null,
      summaryEnd: null,
      item: workItem,
    };
    const rowZero: GanttTreeRow = {
      ...rowNull,
      progressPct: 0,
    };
    const { data } = toGanttPresentation([workItem], [], [rowNull, rowZero]);
    expect(data).toHaveLength(2);
    expect(data[0].css).toContain('ppc-progress-unknown');
    expect(data[0]).not.toHaveProperty('progress');
    expect(data[1].css).toContain('ppc-progress-zero');
    expect(data[1].progress).toBe(0);
  });
});
