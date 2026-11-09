/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  allScheduleGroupKeys,
  buildVisibleScheduleRows,
  type ScheduleHierarchyItem,
} from './visible-rows';

const CURATED = ['project_group:AN-08', 'stage_group:8.2'] as const;

function frozenSnapshotC(): ScheduleHierarchyItem[] {
  return [
    {
      kind: 'work',
      id: 'WK-05',
      name: 'Приёмка',
      parentKey: null,
      wbs: null,
      progressPct: null,
      sourceWeeks: null,
      startDate: '2027-04-01',
      endDate: '2027-04-02',
      status: 'Waiting',
    },
    {
      kind: 'project_group',
      id: 'AN-08',
      name: 'Внутренняя отделка и чистые помещения',
      parentKey: null,
      wbs: '8',
      siblingOrder: 0,
      progressPct: 0,
      sourceWeeks: null,
    },
    {
      kind: 'stage_group',
      id: '8.2',
      name: 'Чистые помещения классов C/D',
      parentKey: 'project_group:AN-08',
      wbs: '8.2',
      siblingOrder: 0,
      progressPct: 100,
      sourceWeeks: 3,
    },
    {
      kind: 'work',
      id: '8.2.2',
      name: 'Фальшполы и потолки',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.2',
      siblingOrder: 1,
      progressPct: 40,
      sourceWeeks: null,
      startDate: '2027-03-04',
      endDate: '2027-03-18',
      baselineStart: '2027-02-26',
      baselineEnd: '2027-03-08',
      status: 'OnSchedule',
    },
    {
      kind: 'work',
      id: '8.2.1',
      name: 'Сэндвич-панели и герметизация',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.1',
      siblingOrder: 0,
      progressPct: 0,
      sourceWeeks: 3,
      startDate: '2027-02-25',
      endDate: '2027-03-02',
      status: 'Delayed',
    },
    {
      kind: 'milestone',
      id: 'MS-CLN-PANEL',
      name: 'Панели чистых помещений',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.3',
      siblingOrder: 2,
      progressPct: null,
      sourceWeeks: null,
      forecastDate: '2027-03-09',
    },
    {
      kind: 'work',
      id: 'WK-01',
      name: 'Монтаж AHU',
      parentKey: null,
      wbs: null,
      progressPct: 100,
      sourceWeeks: null,
      startDate: '2027-02-20',
      endDate: '2027-02-24',
      status: 'Completed',
    },
  ];
}

describe('buildVisibleScheduleRows', () => {
  it('allScheduleGroupKeys собирает все группы payload', () => {
    const keys = allScheduleGroupKeys(frozenSnapshotC());
    expect(keys).toEqual(
      expect.arrayContaining(['project_group:AN-08', 'stage_group:8.2']),
    );
    expect(keys.every((k) => k.startsWith('project_group:') || k.startsWith('stage_group:'))).toBe(
      true,
    );
  });

  it('ставит группы проекта первыми, детей по siblingOrder, остальные корни во входящем порядке', () => {
    const rows = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: CURATED,
    });

    expect(rows.map((row) => row.id)).toEqual([
      'AN-08',
      '8.2',
      '8.2.1',
      '8.2.2',
      'MS-CLN-PANEL',
      'WK-05',
      'WK-01',
    ]);
    expect(rows.map((row) => row.key)).toEqual([
      'project_group:AN-08',
      'stage_group:8.2',
      'work:8.2.1',
      'work:8.2.2',
      'milestone:MS-CLN-PANEL',
      'work:WK-05',
      'work:WK-01',
    ]);
    expect(rows.map((row) => row.depth)).toEqual([0, 1, 2, 2, 2, 0, 0]);
    expect(rows.map((row) => row.visibleOrdinal)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(rows.filter((row) => row.id === 'MS-CLN-PANEL')).toHaveLength(1);
    expect(rows.find((row) => row.id === 'WK-01')?.parentKey).toBeNull();
    expect(rows.find((row) => row.id === '8.2.1')?.wbs).toBe('8.2.1');
    expect(rows.find((row) => row.id === 'AN-08')).toMatchObject({
      hasChildren: true,
      expanded: true,
    });
  });

  it('по умолчанию оставляет AN-24 и AN-09 свёрнутыми', () => {
    const rows = buildVisibleScheduleRows(
      [
        ...frozenSnapshotC(),
        {
          kind: 'project_group',
          id: 'AN-24',
          name: 'Внешние сети и энергоснабжение',
          parentKey: null,
          wbs: '24',
          siblingOrder: 1,
          progressPct: null,
          sourceWeeks: null,
        },
        {
          kind: 'stage_group',
          id: '24.1',
          name: 'Электроснабжение',
          parentKey: 'project_group:AN-24',
          wbs: '24.1',
          siblingOrder: 0,
          progressPct: null,
          sourceWeeks: 8,
        },
        {
          kind: 'work',
          id: '24.1.1',
          name: 'Два ввода от сети',
          parentKey: 'stage_group:24.1',
          wbs: '24.1.1',
          siblingOrder: 0,
          progressPct: null,
          sourceWeeks: 8,
          startDate: '2027-02-08',
          endDate: '2027-03-19',
          status: 'Delayed',
        },
        {
          kind: 'project_group',
          id: 'AN-09',
          name: 'HVAC и системы подготовки воздуха',
          parentKey: null,
          wbs: '9',
          siblingOrder: 2,
          progressPct: null,
          sourceWeeks: null,
        },
        {
          kind: 'work',
          id: '9.3.2',
          name: 'Подключение к сетям',
          parentKey: 'project_group:AN-09',
          wbs: '9.3.2',
          siblingOrder: 1,
          progressPct: null,
          sourceWeeks: null,
          startDate: '2027-04-16',
          endDate: '2027-04-30',
          status: 'Waiting',
        },
      ],
      { expandedKeys: CURATED },
    );

    expect(rows.map((row) => row.id)).toEqual([
      'AN-08',
      '8.2',
      '8.2.1',
      '8.2.2',
      'MS-CLN-PANEL',
      'AN-24',
      'AN-09',
      'WK-05',
      'WK-01',
    ]);
    expect(rows.find((row) => row.id === 'AN-24')).toMatchObject({
      expanded: false,
      hasChildren: true,
    });
    expect(rows.find((row) => row.id === 'AN-09')).toMatchObject({
      expanded: false,
      hasChildren: true,
    });
    expect(rows.some((row) => row.id === '24.1' || row.id === '9.3.2')).toBe(
      false,
    );
  });

  it('сворачивание AN-08 прячет 8.2 и детей и перенумеровывает видимые строки', () => {
    const rows = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: ['stage_group:8.2'],
    });

    expect(rows.map((row) => row.id)).toEqual(['AN-08', 'WK-05', 'WK-01']);
    expect(rows.map((row) => row.visibleOrdinal)).toEqual([1, 2, 3]);
    expect(rows.find((row) => row.id === 'AN-08')?.expanded).toBe(false);
    expect(
      rows.some((row) =>
        ['8.2', '8.2.1', '8.2.2', 'MS-CLN-PANEL'].includes(row.id),
      ),
    ).toBe(false);
  });

  it('оставляет прогресс 0 числом и прокидывает rollup группы с API', () => {
    const base = frozenSnapshotC();
    const withRollup = base.map((item) =>
      item.id === '8.2' || item.id === 'AN-08'
        ? { ...item, progressPct: item.id === '8.2' ? 37 : 41 }
        : item,
    );
    const rows = buildVisibleScheduleRows(withRollup, {
      expandedKeys: CURATED,
    });

    expect(rows.find((row) => row.id === '8.2.1')?.progressPct).toBe(0);
    expect(rows.find((row) => row.id === '8.2')?.progressPct).toBe(37);
    expect(rows.find((row) => row.id === 'AN-08')?.progressPct).toBe(41);
    expect(rows.find((row) => row.id === 'WK-01')?.progressPct).toBe(100);
  });

  it('сводит 8.2 по прогнозу детей 2027-02-25..2027-03-18, включая точку вехи 2027-03-09', () => {
    const rows = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: CURATED,
    });
    const stage = rows.find((row) => row.id === '8.2');

    expect(stage?.summaryStart).toBe('2027-02-25');
    expect(stage?.summaryEnd).toBe('2027-03-18');
  });

  it('в baseline сводит 8.2 только по baseline детей (не forecast)', () => {
    const items = frozenSnapshotC().map((item) => {
      if (item.id === '8.2.1') {
        return {
          ...item,
          baselineStart: '2027-02-20',
          baselineEnd: '2027-02-28',
        };
      }
      if (item.id === 'MS-CLN-PANEL') {
        return { ...item, baselineDate: '2027-03-01' };
      }
      return item;
    });
    const rows = buildVisibleScheduleRows(items, {
      expandedKeys: CURATED,
      comparison: 'baseline',
    });
    const stage = rows.find((row) => row.id === '8.2');
    expect(stage?.summaryStart).toBe('2027-02-20');
    expect(stage?.summaryEnd).toBe('2027-03-08');
  });

  it('в baseline игнорирует работу с только baselineStart (оба конца обязательны)', () => {
    const items = frozenSnapshotC().map((item) => {
      if (item.id === '8.2.1') {
        return { ...item, baselineStart: '2027-01-01', baselineEnd: null };
      }
      if (item.id === 'MS-CLN-PANEL') {
        return { ...item, baselineDate: null };
      }
      return item;
    });
    const rows = buildVisibleScheduleRows(items, {
      expandedKeys: CURATED,
      comparison: 'baseline',
    });
    const stage = rows.find((row) => row.id === '8.2');
    // Only 8.2.2 full baseline pair remains.
    expect(stage?.summaryStart).toBe('2027-02-26');
    expect(stage?.summaryEnd).toBe('2027-03-08');
  });

  it('не сжимает сводку 8.2, когда этап свёрнут и дети не видны', () => {
    const rows = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: ['project_group:AN-08'],
    });
    const stage = rows.find((row) => row.id === '8.2');

    expect(rows.some((row) => row.id === '8.2.1')).toBe(false);
    expect(stage?.summaryStart).toBe('2027-02-25');
    expect(stage?.summaryEnd).toBe('2027-03-18');
  });

  it('8.2 сворачивает сдвиг ребёнка; historical weeks группы не дают own lag', () => {
    const rows = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: CURATED,
    });

    expect(rows.find((row) => row.id === 'AN-08')?.warning.tone).toBe('shift');
    // Stage has sourceWeeks=3 (historical) but also Delayed 8.2.1 + shifted 8.2.2;
    // shift preferred over lag when folding descendants.
    expect(rows.find((row) => row.id === '8.2')?.warning).toEqual({
      tone: 'shift',
      label: 'Прогноз отличается от базового плана',
    });
    expect(rows.find((row) => row.id === '8.2.2')?.warning).toEqual({
      tone: 'shift',
      label: 'Прогноз отличается от базового плана',
    });
    expect(rows.find((row) => row.id === '8.2.1')?.warning.tone).toBe('lag');
    expect(rows.find((row) => row.id === 'WK-01')?.warning).toEqual({
      tone: 'none',
      label: '',
    });
  });

  it('фильтр листа оставляет предков, а совпадение группы не тянет чужие листья', () => {
    const leaves = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: CURATED,
      includeItem: (item) => item.id === '8.2.1',
    });
    expect(leaves.map((row) => row.id)).toEqual(['AN-08', '8.2', '8.2.1']);

    const groupHit = buildVisibleScheduleRows(frozenSnapshotC(), {
      expandedKeys: CURATED,
      includeItem: (item) => item.kind === 'stage_group' && item.id === '8.2',
    });
    expect(groupHit.map((row) => row.id)).toEqual(['AN-08', '8.2']);
  });

  it('пустой предикат группы не удерживает группу без совпавшего потомка', () => {
    const rows = buildVisibleScheduleRows(
      [
        {
          kind: 'project_group',
          id: 'EMPTY',
          name: 'Пусто',
          parentKey: null,
          siblingOrder: 0,
        },
        {
          kind: 'work',
          id: 'WK-01',
          name: 'Монтаж',
          parentKey: null,
          progressPct: 100,
          status: 'Completed',
          startDate: '2027-02-20',
          endDate: '2027-02-24',
        },
      ],
      {
        expandedKeys: [],
        includeItem: (item) => !item.kind.endsWith('_group'),
      },
    );

    expect(rows.map((row) => row.id)).toEqual(['WK-01']);
  });

  it('точка поставки оборудования расширяет сводку группы', () => {
    const rows = buildVisibleScheduleRows(
      [
        {
          kind: 'stage_group',
          id: 'S',
          name: 'Этап',
          parentKey: null,
          siblingOrder: 0,
        },
        {
          kind: 'work',
          id: 'W',
          name: 'Работа',
          parentKey: 'stage_group:S',
          siblingOrder: 0,
          startDate: '2027-04-01',
          endDate: '2027-04-02',
          status: 'OnSchedule',
        },
        {
          kind: 'equipment_delivery',
          id: 'EQ',
          name: 'Поставка',
          parentKey: 'stage_group:S',
          siblingOrder: 1,
          forecastDate: '2027-05-01',
        },
      ],
      { expandedKeys: ['stage_group:S'] },
    );
    const stage = rows.find((row) => row.id === 'S');

    expect(stage?.summaryStart).toBe('2027-04-01');
    expect(stage?.summaryEnd).toBe('2027-05-01');
  });

  it('без прогнозных границ сводка группы пустая', () => {
    const rows = buildVisibleScheduleRows(
      [
        {
          kind: 'project_group',
          id: 'G',
          name: 'Проект',
          parentKey: null,
          siblingOrder: 0,
        },
        {
          kind: 'work',
          id: 'W',
          name: 'Без дат',
          parentKey: 'project_group:G',
          startDate: null,
          endDate: null,
          status: 'Waiting',
        },
      ],
      { expandedKeys: ['project_group:G'] },
    );

    expect(rows[0]).toMatchObject({
      summaryStart: null,
      summaryEnd: null,
      progressPct: null,
    });
  });

  it('корни-проекты сортируются по siblingOrder и идут раньше прочих корней', () => {
    const rows = buildVisibleScheduleRows(
      [
        {
          kind: 'work',
          id: 'WK-01',
          name: 'Работа',
          parentKey: null,
          startDate: '2027-01-01',
          endDate: '2027-01-02',
          status: 'Waiting',
        },
        {
          kind: 'project_group',
          id: 'B',
          name: 'Второй',
          parentKey: null,
          siblingOrder: 1,
        },
        {
          kind: 'project_group',
          id: 'A',
          name: 'Первый',
          parentKey: null,
          siblingOrder: 0,
        },
      ],
      { expandedKeys: [] },
    );

    expect(rows.map((row) => row.id)).toEqual(['A', 'B', 'WK-01']);
  });
});
