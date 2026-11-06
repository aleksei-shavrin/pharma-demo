import { describe, expect, it } from 'vitest';
import type { ScheduleLink, ScheduleWorkItem } from '@/lib/api-client';
import { toGanttPresentation } from './to-gantt-presentation';
import {
  displayedEdge,
  displayedWorkBounds,
  factCaption,
  linkEdgeRole,
} from './schedule-comparison';

const tree = {
  parentKey: null,
  wbs: null,
  siblingOrder: null,
  progressPct: null,
  sourceWeeks: null,
};

function work(
  id: string,
  startDate: string,
  endDate: string,
  extra: Partial<ScheduleWorkItem> = {},
): ScheduleWorkItem {
  return {
    ...tree,
    kind: 'work',
    id,
    name: id,
    startDate,
    endDate,
    status: 'Waiting',
    baselineStart: null,
    baselineEnd: null,
    actualStart: null,
    actualEnd: null,
    ...extra,
  };
}

const wk01 = work('WK-01', '2027-02-20', '2027-02-24', {
  status: 'Completed',
  baselineStart: '2027-02-20',
  baselineEnd: '2027-02-24',
  actualStart: '2027-02-18',
  actualEnd: '2027-02-23',
});

const openWork = work('8.2.2', '2027-03-04', '2027-03-18', {
  baselineStart: '2027-02-26',
  baselineEnd: '2027-03-08',
  progressPct: 40,
  actualStart: '2027-03-01',
  actualEnd: null,
});

const noFact = work('8.2.1', '2027-02-25', '2027-03-02');
const completedWithoutFact = work('WK-02', '2027-02-24', '2027-02-26', {
  status: 'Completed',
});

describe('factCaption', () => {
  it('закрытый факт', () => {
    expect(factCaption('2027-02-18', '2027-02-23')).toBe('Факт');
  });

  it('открытый факт не называется просто прогнозом', () => {
    expect(factCaption('2027-03-01', null)).toBe('Прогноз — факт не завершён');
  });

  it('пустые даты и Completed без дат — факта нет', () => {
    expect(factCaption(null, null)).toBe('Прогноз — факта нет');
    expect(factCaption(undefined, undefined)).toBe('Прогноз — факта нет');
  });
});

describe('displayedWorkBounds', () => {
  it('по умолчанию WK-01 остаётся на прогнозе, даже если база совпадает', () => {
    expect(displayedWorkBounds(wk01, 'forecast')).toEqual({
      start: '2027-02-20',
      end: '2027-02-24',
    });
  });

  it('в режиме факта закрытый WK-01 занимает нижнюю полосу', () => {
    expect(displayedWorkBounds(wk01, 'actual')).toEqual({
      start: '2027-02-18',
      end: '2027-02-23',
    });
  });

  it('открытый 8.2.2 не заменяет прогноз ни в одном режиме', () => {
    expect(displayedWorkBounds(openWork, 'forecast')).toEqual({
      start: '2027-03-04',
      end: '2027-03-18',
    });
    expect(displayedWorkBounds(openWork, 'actual')).toEqual({
      start: '2027-03-04',
      end: '2027-03-18',
    });
  });

  it('8.2.1 и Completed WK-02 без дат остаются на прогнозе', () => {
    expect(displayedWorkBounds(noFact, 'actual')).toEqual({
      start: '2027-02-25',
      end: '2027-03-02',
    });
    expect(displayedWorkBounds(completedWithoutFact, 'actual')).toEqual({
      start: '2027-02-24',
      end: '2027-02-26',
    });
  });
});

describe('края связей снимка C', () => {
  const wk02 = work('WK-02', '2027-02-20', '2027-02-22', { status: 'Completed' });
  const wk03 = work('WK-03', '2027-02-27', '2027-03-10', { status: 'Delayed' });
  const wk04 = work('WK-04', '2027-03-06', '2027-03-10', { status: 'OnSchedule' });
  const wk05 = work('WK-05', '2027-03-13', '2027-03-13');

  function edge(
    type: 'SS' | 'FS' | 'FF' | 'SF',
    source: ScheduleWorkItem,
    target: ScheduleWorkItem,
    mode: 'forecast' | 'actual',
  ) {
    return {
      source: displayedEdge(source, mode, linkEdgeRole(type, 'source')),
      target: displayedEdge(target, mode, linkEdgeRole(type, 'target')),
    };
  }

  it('в режиме факта SS и FS стоят на закрытом факте WK-01, FF и SF — на прогнозе', () => {
    expect(edge('SS', wk01, wk02, 'actual')).toEqual({
      source: '2027-02-18',
      target: '2027-02-20',
    });
    expect(edge('FS', wk01, wk03, 'actual')).toEqual({
      source: '2027-02-23',
      target: '2027-02-27',
    });
    expect(edge('FF', wk03, wk04, 'actual')).toEqual({
      source: '2027-03-10',
      target: '2027-03-10',
    });
    expect(edge('SF', wk04, wk05, 'actual')).toEqual({
      source: '2027-03-06',
      target: '2027-03-13',
    });
  });

  it('при смене режима двигаются только края WK-01 у SS и FS', () => {
    const forecast = {
      ss: edge('SS', wk01, wk02, 'forecast'),
      fs: edge('FS', wk01, wk03, 'forecast'),
      ff: edge('FF', wk03, wk04, 'forecast'),
      sf: edge('SF', wk04, wk05, 'forecast'),
    };
    const actual = {
      ss: edge('SS', wk01, wk02, 'actual'),
      fs: edge('FS', wk01, wk03, 'actual'),
      ff: edge('FF', wk03, wk04, 'actual'),
      sf: edge('SF', wk04, wk05, 'actual'),
    };
    expect(forecast.ss).toEqual({ source: '2027-02-20', target: '2027-02-20' });
    expect(forecast.fs).toEqual({ source: '2027-02-24', target: '2027-02-27' });
    expect(actual.ss.source).toBe('2027-02-18');
    expect(actual.fs.source).toBe('2027-02-23');
    expect(actual.ss.target).toBe(forecast.ss.target);
    expect(actual.fs.target).toBe(forecast.fs.target);
    expect(actual.ff).toEqual(forecast.ff);
    expect(actual.sf).toEqual(forecast.sf);
  });
});

describe('toGanttPresentation comparison', () => {
  const links: ScheduleLink[] = [
    {
      id: 'LNK-SS-01',
      sourceRef: 'work:WK-01',
      targetRef: 'work:WK-02',
      type: 'SS',
    },
  ];

  it('режим прогноза не пишет подпись и не сдвигает нижнюю полосу WK-01', () => {
    const view = toGanttPresentation([wk01, completedWithoutFact, openWork, noFact], links, undefined, {
      comparison: 'forecast',
    });
    const row = view.data.find((task) => task.id === 'work:WK-01');
    expect(row).toMatchObject({
      start_date: '2027-02-20',
      duration: 5,
      baselineStart: '2027-02-20',
      baselineEnd: '2027-02-24',
    });
    expect(row?.factCaption).toBeUndefined();
    expect(view.links).toEqual([
      expect.objectContaining({ id: 'LNK-SS-01', source: 'work:WK-01', type: '1' }),
    ]);
  });

  it('режим факта: закрытый факт, открытая подпись и подпись без факта', () => {
    const view = toGanttPresentation(
      [wk01, openWork, noFact, completedWithoutFact],
      [],
      undefined,
      { comparison: 'actual' },
    );
    const byId = Object.fromEntries(view.data.map((task) => [task.id, task]));
    expect(byId['work:WK-01']).toMatchObject({
      start_date: '2027-02-18',
      duration: 6,
      baselineStart: '2027-02-20',
      baselineEnd: '2027-02-24',
      factCaption: 'Факт',
    });
    expect(byId['work:8.2.2']).toMatchObject({
      start_date: '2027-03-04',
      duration: 15,
      factCaption: 'Прогноз — факт не завершён',
    });
    expect(byId['work:8.2.1']?.factCaption).toBe('Прогноз — факта нет');
    expect(byId['work:WK-02']).toMatchObject({
      start_date: '2027-02-24',
      factCaption: 'Прогноз — факта нет',
    });
  });
});
