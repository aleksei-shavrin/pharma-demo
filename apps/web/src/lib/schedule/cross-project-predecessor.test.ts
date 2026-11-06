/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import type { ScheduleMilestoneItem, ScheduleWorkItem } from '@/lib/api-client';
import {
  CROSS_PROJECT_PREDECESSOR_CAPTION,
  toGanttPresentation,
} from './to-gantt-presentation';

const tree = {
  parentKey: null,
  wbs: null,
  siblingOrder: null,
  progressPct: null,
  sourceWeeks: null,
} as const;

const milestone: ScheduleMilestoneItem = {
  ...tree,
  kind: 'milestone',
  id: 'MS-UTL-PWR',
  name: 'Энергоснабжение обеспечено',
  workstream: null,
  rag: 'Red',
  baselineDate: '2027-02-18',
  forecastDate: '2027-04-15',
  dateVariance: {
    baselineDate: '2027-02-18',
    forecastDate: '2027-04-15',
    deltaDays: 56,
  },
};

function connect(extra: Partial<ScheduleWorkItem> = {}): ScheduleWorkItem {
  return {
    ...tree,
    kind: 'work',
    id: '9.3.2',
    name: 'Подключение к сетям',
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

const link = {
  id: 'LNK-X-PWR-HVAC',
  kind: 'cross_project_predecessor' as const,
  sourceRef: 'milestone:MS-UTL-PWR',
  targetRef: 'work:9.3.2',
};

describe('межпроектное предшествование', () => {
  it('без факта крепится к прогнозу и в режиме факта, без кода типа', () => {
    for (const comparison of ['forecast', 'actual'] as const) {
      const view = toGanttPresentation([milestone, connect()], [link], undefined, {
        comparison,
      });
      expect(view.links).toEqual([
        {
          id: 'LNK-X-PWR-HVAC',
          source: 'milestone:MS-UTL-PWR',
          target: 'work:9.3.2',
          accessibleName: CROSS_PROJECT_PREDECESSOR_CAPTION,
        },
      ]);
      expect(view.links[0]).not.toHaveProperty('type');
    }
  });

  it('закрытый факт убирает линию только в режиме факта', () => {
    const closed = connect({
      actualStart: '2027-04-16',
      actualEnd: '2027-04-20',
    });
    const forecast = toGanttPresentation([milestone, closed], [link], undefined, {
      comparison: 'forecast',
    });
    const actual = toGanttPresentation([milestone, closed], [link], undefined, {
      comparison: 'actual',
    });
    expect(forecast.links).toHaveLength(1);
    expect(actual.links).toEqual([]);
  });

  it('открытый факт оставляет прогнозную полосу и линию', () => {
    const open = connect({ actualStart: '2027-04-16', actualEnd: null });
    const view = toGanttPresentation([milestone, open], [link], undefined, {
      comparison: 'actual',
    });
    expect(view.links).toHaveLength(1);
  });

  it('скрытый конец убирает линию', () => {
    const view = toGanttPresentation([connect()], [link]);
    expect(view.links).toEqual([]);
  });
});
