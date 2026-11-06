import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DEMO_DATA_SOURCE } from '../data/demo-data-source';
import { MockDemoDataSource } from '../data/mock-demo-data-source';
import type {
  ScheduleEquipmentItemDto,
  ScheduleGroupItemDto,
  ScheduleItemDto,
  ScheduleMilestoneItemDto,
  ScheduleWorkItemDto,
} from './dto/schedule.dto';
import {
  compareScheduleItems,
  ScheduleService,
  validateScheduleWorks,
} from './schedule.service';
import { InternalServerErrorException } from '@nestjs/common';
import type { ScheduleWorkSnapshotFixture } from '../data/fixtures/schedule-works';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        MockDemoDataSource,
        { provide: DEMO_DATA_SOURCE, useExisting: MockDemoDataSource },
      ],
    }).compile();
    service = moduleRef.get(ScheduleService);
  });

  it('A: multi control points; HVAC OnTrack; no Activity', () => {
    const s = service.getSchedule('PRJ-01', 'A');
    expect(s.snapshotId).toBe('A');
    expect(s.items.length).toBeGreaterThanOrEqual(2);
    expect(s.items.every((i) => i.kind !== ('activity' as string))).toBe(true);

    const eq = s.items.find(
      (i) => i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
    );
    const ms = s.items.find((i) => i.kind === 'milestone' && i.id === 'MS-PS');
    expect(eq).toMatchObject({
      status: 'OnTrack',
      baselineDate: '2027-05-15',
      forecastDate: '2027-05-15',
      dateVariance: { deltaDays: 0 },
      workstream: 'WS-HVAC',
      parentKey: null,
      wbs: null,
      siblingOrder: null,
      progressPct: null,
      sourceWeeks: null,
    });
    expect(eq).not.toHaveProperty('baselineStart');
    expect(eq && 'name' in eq && eq.name.length).toBeGreaterThan(0);
    expect(s.items).toHaveLength(96);
    expect(s.items.filter((i) => i.kind === 'equipment_delivery')).toHaveLength(
      52,
    );
    expect(s.items.filter((i) => i.kind === 'milestone')).toHaveLength(44);
    expect(ms).toMatchObject({
      rag: 'Green',
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
      dateVariance: { deltaDays: 0 },
      workstream: null,
    });
    expect(JSON.stringify(s)).not.toMatch(
      /equipmentMilestone|relatedMilestone/,
    );
    expect(s.items.filter((i) => i.kind === 'work')).toHaveLength(0);
    expect(s.items.some((i) => i.kind === 'project_group')).toBe(false);
    expect(s.items.some((i) => i.kind === 'stage_group')).toBe(false);
    expect(s.links).toEqual([]);
    const panel = s.items.filter((i) => i.id === 'MS-CLN-PANEL');
    expect(panel).toHaveLength(1);
    expect(panel[0]).toMatchObject({
      kind: 'milestone',
      parentKey: null,
      wbs: null,
      siblingOrder: null,
      progressPct: null,
      sourceWeeks: null,
    });
    expect(panel[0]).not.toHaveProperty('baselineStart');
  });

  it('B: HVAC calm; PKG Delayed; MS-PS Green', () => {
    const s = service.getSchedule('PRJ-01', 'B');
    const hvac = s.items.find(
      (i): i is ScheduleEquipmentItemDto =>
        i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
    );
    const pkg = s.items.find(
      (i): i is ScheduleEquipmentItemDto =>
        i.kind === 'equipment_delivery' && i.id === 'EQ-PKG-01',
    );
    const ms = s.items.find(
      (i): i is ScheduleMilestoneItemDto =>
        i.kind === 'milestone' && i.id === 'MS-PS',
    );
    expect(hvac?.status).toBe('OnTrack');
    expect(pkg?.status).toBe('Delayed');
    expect(ms).toMatchObject({
      forecastDate: '2027-09-15',
      rag: 'Green',
      dateVariance: { deltaDays: 0 },
    });
  });

  it('C: HVAC +21 Delayed; MS-PS Red +21; no recovery heal', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const eq = s.items.find(
      (i): i is ScheduleEquipmentItemDto =>
        i.kind === 'equipment_delivery' && i.id === 'EQ-HVAC-01',
    );
    const ms = s.items.find(
      (i): i is ScheduleMilestoneItemDto =>
        i.kind === 'milestone' && i.id === 'MS-PS',
    );
    expect(eq?.forecastDate).toBe('2027-06-05');
    expect(eq?.dateVariance.deltaDays).toBe(21);
    expect(ms?.forecastDate).toBe('2027-10-06');
    expect(ms?.rag).toBe('Red');
    expect(ms?.dateVariance.deltaDays).toBe(21);
  });

  it('C: WK-кластер и 4 связи поверх контрольных точек, плюс дерево 8.2', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const works = s.items.filter(
      (i): i is ScheduleWorkItemDto => i.kind === 'work',
    );
    expect(s.items.filter((i) => i.kind === 'equipment_delivery')).toHaveLength(
      52,
    );
    expect(s.items.filter((i) => i.kind === 'milestone')).toHaveLength(44);
    expect(s.items).toHaveLength(113);
    expect(s.items.filter((i) => i.kind === 'project_group')).toHaveLength(3);
    expect(s.items.filter((i) => i.kind === 'stage_group')).toHaveLength(3);
    expect(works).toHaveLength(11);
    const wk = works.filter((w) => w.id.startsWith('WK-'));
    expect(wk.map((w) => w.id).sort()).toEqual([
      'WK-01',
      'WK-02',
      'WK-03',
      'WK-04',
      'WK-05',
    ]);
    expect(
      Object.fromEntries(
        wk.map((w) => [w.id, [w.startDate, w.endDate, w.status]]),
      ),
    ).toEqual({
      'WK-01': ['2027-02-20', '2027-02-24', 'Completed'],
      'WK-02': ['2027-02-20', '2027-02-22', 'Completed'],
      'WK-03': ['2027-02-27', '2027-03-10', 'Delayed'],
      'WK-04': ['2027-03-06', '2027-03-10', 'OnSchedule'],
      'WK-05': ['2027-03-13', '2027-03-13', 'Waiting'],
    });
    const wk05 = wk.find((w) => w.id === 'WK-05');
    expect(wk05?.startDate).toBe(wk05?.endDate);
    expect(works.every((w) => w.workstream === null)).toBe(true);
    expect(
      wk.every(
        (w) =>
          w.parentKey === null &&
          w.wbs === null &&
          w.siblingOrder === null &&
          w.sourceWeeks === null,
      ),
    ).toBe(true);
    expect(wk.find((w) => w.id === 'WK-01')).toMatchObject({
      startDate: '2027-02-20',
      endDate: '2027-02-24',
      baselineStart: '2027-02-20',
      baselineEnd: '2027-02-24',
      actualStart: '2027-02-18',
      actualEnd: '2027-02-23',
    });
    expect(
      wk
        .filter((w) => w.id !== 'WK-01')
        .every((w) => w.baselineStart === null && w.baselineEnd === null),
    ).toBe(true);
    expect(wk.find((w) => w.id === 'WK-01')?.progressPct).toBe(100);
    expect(
      wk.filter((w) => w.id !== 'WK-01').every((w) => w.progressPct === null),
    ).toBe(true);
    expect(works.every((w) => 'actualStart' in w && 'actualEnd' in w)).toBe(
      true,
    );
    expect(wk.find((w) => w.id === 'WK-02')).toMatchObject({
      status: 'Completed',
      actualStart: null,
      actualEnd: null,
    });
    expect(works.find((w) => w.id === '8.2.1')).toMatchObject({
      actualStart: null,
      actualEnd: null,
    });
    expect(works.find((w) => w.id === '8.2.2')).toMatchObject({
      startDate: '2027-03-04',
      endDate: '2027-03-18',
      baselineStart: '2027-02-26',
      baselineEnd: '2027-03-08',
      actualStart: '2027-03-01',
      actualEnd: null,
    });
    expect(s.items.find((item) => item.kind === 'milestone')).not.toHaveProperty(
      'actualStart',
    );
    expect(s.items.find((item) => item.kind === 'project_group')).not.toHaveProperty(
      'actualStart',
    );

    expect(s.links).toEqual([
      {
        id: 'LNK-SS-01',
        kind: 'scheduling',
        sourceRef: 'work:WK-01',
        targetRef: 'work:WK-02',
        type: 'SS',
      },
      {
        id: 'LNK-FS-01',
        kind: 'scheduling',
        sourceRef: 'work:WK-01',
        targetRef: 'work:WK-03',
        type: 'FS',
      },
      {
        id: 'LNK-FF-01',
        kind: 'scheduling',
        sourceRef: 'work:WK-03',
        targetRef: 'work:WK-04',
        type: 'FF',
      },
      {
        id: 'LNK-SF-01',
        kind: 'scheduling',
        sourceRef: 'work:WK-04',
        targetRef: 'work:WK-05',
        type: 'SF',
      },
      {
        id: 'LNK-X-PWR-HVAC',
        kind: 'cross_project_predecessor',
        sourceRef: 'milestone:MS-UTL-PWR',
        targetRef: 'work:9.3.2',
      },
    ]);
    const workIds = new Set(works.map((w) => `work:${w.id}`));
    expect(
      s.links
        .filter((link) => link.kind !== 'cross_project_predecessor')
        .every(
          (link) => workIds.has(link.sourceRef) && workIds.has(link.targetRef),
        ),
    ).toBe(true);
    expect(
      s.links.some(
        (l) => l.sourceRef.includes('8.2') || l.targetRef.includes('8.2'),
      ),
    ).toBe(false);
  });

  it('C: дерево AN-08 → 8.2 и одна веха MS-CLN-PANEL', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const project = s.items.find(
      (i): i is ScheduleGroupItemDto =>
        i.kind === 'project_group' && i.id === 'AN-08',
    );
    const stage = s.items.find(
      (i): i is ScheduleGroupItemDto =>
        i.kind === 'stage_group' && i.id === '8.2',
    );
    const panels = s.items.find(
      (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '8.2.1',
    );
    const floors = s.items.find(
      (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '8.2.2',
    );
    const milestone = s.items.filter((i) => i.id === 'MS-CLN-PANEL');

    expect(project).toMatchObject({
      name: 'Внутренняя отделка и чистые помещения',
      parentKey: null,
      wbs: '8',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: null,
    });
    expect(project).not.toHaveProperty('startDate');
    expect(project).not.toHaveProperty('endDate');
    expect(stage).toMatchObject({
      name: 'Чистые помещения классов C/D',
      parentKey: 'project_group:AN-08',
      wbs: '8.2',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: 3,
    });
    expect(stage).not.toHaveProperty('startDate');
    expect(panels).toMatchObject({
      name: 'Сэндвич-панели и герметизация',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.1',
      siblingOrder: 0,
      progressPct: 0,
      sourceWeeks: 3,
      startDate: '2027-02-25',
      endDate: '2027-03-02',
      status: 'Delayed',
      baselineStart: null,
      baselineEnd: null,
    });
    expect(Object.prototype.hasOwnProperty.call(panels, 'progressPct')).toBe(
      true,
    );
    expect(floors).toMatchObject({
      name: 'Фальшполы и потолки',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.2',
      siblingOrder: 1,
      progressPct: 40,
      sourceWeeks: null,
      startDate: '2027-03-04',
      endDate: '2027-03-18',
      status: 'OnSchedule',
      baselineStart: '2027-02-26',
      baselineEnd: '2027-03-08',
    });
    expect(milestone).toHaveLength(1);
    expect(milestone[0]).toMatchObject({
      kind: 'milestone',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.3',
      siblingOrder: 2,
      progressPct: null,
      sourceWeeks: null,
      baselineDate: '2027-02-16',
      forecastDate: '2027-03-09',
      rag: 'Red',
    });
    expect(milestone[0]).not.toHaveProperty('baselineStart');
  });

  it('C: дерево AN-24 → 24.1 и AN-09 → 9.3, одна MS-UTL-PWR, без новой связи', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const powerProject = s.items.find(
      (i) => i.kind === 'project_group' && i.id === 'AN-24',
    );
    const powerStage = s.items.find(
      (i) => i.kind === 'stage_group' && i.id === '24.1',
    );
    const hvacProject = s.items.find(
      (i) => i.kind === 'project_group' && i.id === 'AN-09',
    );
    const hvacStage = s.items.find(
      (i) => i.kind === 'stage_group' && i.id === '9.3',
    );
    const feeders = s.items.find(
      (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '24.1.1',
    );
    const substation = s.items.find(
      (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '24.1.2',
    );
    const ahu = s.items.find(
      (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '9.3.1',
    );
    const connect = s.items.find(
      (i): i is ScheduleWorkItemDto => i.kind === 'work' && i.id === '9.3.2',
    );
    const power = s.items.filter((i) => i.id === 'MS-UTL-PWR');

    expect(powerProject).toMatchObject({
      name: 'Внешние сети и энергоснабжение',
      parentKey: null,
      wbs: '24',
      siblingOrder: 1,
      progressPct: null,
    });
    expect(powerStage).toMatchObject({
      name: 'Электроснабжение',
      parentKey: 'project_group:AN-24',
      wbs: '24.1',
      sourceWeeks: 8,
      progressPct: null,
    });
    expect(hvacProject).toMatchObject({
      name: 'HVAC и системы подготовки воздуха',
      parentKey: null,
      wbs: '9',
      siblingOrder: 2,
      progressPct: null,
    });
    expect(hvacStage).toMatchObject({
      name: 'Монтаж AHU',
      parentKey: 'project_group:AN-09',
      wbs: '9.3',
      sourceWeeks: null,
      progressPct: null,
    });
    expect(feeders).toMatchObject({
      startDate: '2027-02-08',
      endDate: '2027-03-19',
      status: 'Delayed',
      sourceWeeks: 8,
      progressPct: null,
      baselineStart: null,
      baselineEnd: null,
      parentKey: 'stage_group:24.1',
    });
    expect(substation).toMatchObject({
      startDate: '2027-02-15',
      endDate: '2027-03-12',
      status: 'OnSchedule',
      progressPct: null,
      baselineStart: null,
      parentKey: 'stage_group:24.1',
    });
    expect(ahu).toMatchObject({
      startDate: '2027-02-22',
      endDate: '2027-03-19',
      status: 'OnSchedule',
      progressPct: null,
      baselineStart: null,
      parentKey: 'stage_group:9.3',
    });
    expect(connect).toMatchObject({
      startDate: '2027-04-16',
      endDate: '2027-04-30',
      status: 'Waiting',
      progressPct: null,
      baselineStart: null,
      parentKey: 'stage_group:9.3',
    });
    expect(power).toHaveLength(1);
    expect(power[0]).toMatchObject({
      kind: 'milestone',
      parentKey: 'stage_group:24.1',
      wbs: '24.1.3',
      siblingOrder: 2,
      baselineDate: '2027-02-18',
      forecastDate: '2027-04-15',
      rag: 'Red',
    });
    expect(s.links.map((link) => link.id)).toEqual([
      'LNK-SS-01',
      'LNK-FS-01',
      'LNK-FF-01',
      'LNK-SF-01',
      'LNK-X-PWR-HVAC',
    ]);
    expect(
      s.links.find((link) => link.id === 'LNK-X-PWR-HVAC'),
    ).toEqual({
      id: 'LNK-X-PWR-HVAC',
      kind: 'cross_project_predecessor',
      sourceRef: 'milestone:MS-UTL-PWR',
      targetRef: 'work:9.3.2',
    });
  });

  it('A, D, F: нет дерева и родителя у MS-CLN-PANEL; на A связи пустые', () => {
    for (const id of ['A', 'D', 'F'] as const) {
      const s = service.getSchedule('PRJ-01', id);
      expect(s.items.some((i) => i.kind === 'project_group')).toBe(false);
      expect(s.items.some((i) => i.kind === 'stage_group')).toBe(false);
      expect(
        s.items.some(
          (i) => i.kind === 'work' && (i.id === '8.2.1' || i.id === '8.2.2'),
        ),
      ).toBe(false);
      const panel = s.items.filter((i) => i.id === 'MS-CLN-PANEL');
      expect(panel).toHaveLength(1);
      expect(panel[0]).toMatchObject({
        kind: 'milestone',
        parentKey: null,
        wbs: null,
        siblingOrder: null,
      });
      if (id === 'A') expect(s.links).toEqual([]);
      const power = s.items.filter((i) => i.id === 'MS-UTL-PWR');
      expect(power).toHaveLength(1);
      expect(power[0]).toMatchObject({
        kind: 'milestone',
        parentKey: null,
        wbs: null,
      });
      expect(
        s.items.some((i) =>
          ['AN-24', 'AN-09', '24.1', '9.3', '24.1.1', '9.3.2'].includes(i.id),
        ),
      ).toBe(false);
      expect(s.links.some((link) => link.id === 'LNK-X-PWR-HVAC')).toBe(
        false,
      );
    }
  });

  it('B и остальные снимки: works/links пустые', () => {
    for (const id of ['B', 'D', 'S'] as const) {
      const s = service.getSchedule('PRJ-01', id);
      expect(s.items.some((i) => i.kind === 'work')).toBe(false);
      expect(s.links).toEqual([]);
    }
  });

  it('порядок: даты по возрастанию у строк с интервалом; группы не выпадают', () => {
    const s = service.getSchedule('PRJ-01', 'C');
    const dated = s.items.filter(
      (item): item is Exclude<ScheduleItemDto, ScheduleGroupItemDto> =>
        item.kind !== 'project_group' && item.kind !== 'stage_group',
    );
    const keys = dated.map((i) =>
      i.kind === 'work' ? i.startDate : i.forecastDate,
    );
    expect(keys).toEqual([...keys].sort());
    expect(s.items.filter((i) => i.kind === 'equipment_delivery')).toHaveLength(
      52,
    );
    expect(s.items.filter((i) => i.kind === 'milestone')).toHaveLength(44);
    expect(
      s.items.some((i) => i.kind === 'project_group' && i.id === 'AN-08'),
    ).toBe(true);
  });

  it('unknown project → 404', () => {
    expect(() => service.getSchedule('PRJ-99', 'A')).toThrow(NotFoundException);
  });

  describe('compareScheduleItems', () => {
    const eq = {
      kind: 'equipment_delivery',
      id: 'EQ-1',
      forecastDate: '2027-03-01',
    } as ScheduleEquipmentItemDto;
    const ms = {
      kind: 'milestone',
      id: 'MS-1',
      forecastDate: '2027-03-01',
    } as ScheduleMilestoneItemDto;
    const wk = (id: string, startDate: string) =>
      ({
        kind: 'work',
        id,
        startDate,
        endDate: startDate,
      }) as ScheduleWorkItemDto;

    it('при равной дате: equipment_delivery → milestone → work', () => {
      const sorted = [wk('WK-1', '2027-03-01'), ms, eq].sort(
        compareScheduleItems,
      );
      expect(sorted.map((i) => i.kind)).toEqual([
        'equipment_delivery',
        'milestone',
        'work',
      ]);
    });

    const group = (
      kind: ScheduleGroupItemDto['kind'],
      id: string,
      wbs: string | null,
    ) =>
      ({
        kind,
        id,
        wbs,
      }) as ScheduleGroupItemDto;

    it('группы сортируются по wbs и не роняют сравнение', () => {
      const sorted = [
        wk('WK-1', '2027-03-01'),
        group('stage_group', '8.2', '8.2'),
        ms,
        group('project_group', 'AN-08', '8'),
        eq,
        group('project_group', 'NO-WBS', null),
      ].sort(compareScheduleItems);
      expect(sorted.map((i) => i.id)).toEqual([
        'EQ-1',
        'MS-1',
        'WK-1',
        'AN-08',
        '8.2',
        'NO-WBS',
      ]);
    });

    it('работа сортируется по startDate, затем по id', () => {
      const sorted = [
        wk('WK-2', '2027-03-02'),
        wk('WK-B', '2027-03-01'),
        wk('WK-A', '2027-03-01'),
        ms,
      ].sort(compareScheduleItems);
      expect(sorted.map((i) => i.id)).toEqual(['MS-1', 'WK-A', 'WK-B', 'WK-2']);
    });
  });

  describe('validateScheduleWorks', () => {
    const work = (
      id: string,
      startDate = '2027-03-01',
      endDate = '2027-03-02',
    ) => ({
      id,
      name: id,
      startDate,
      endDate,
      status: 'Waiting' as const,
    });
    const fixture = (
      overrides: Partial<ScheduleWorkSnapshotFixture>,
    ): ScheduleWorkSnapshotFixture => ({
      works: [work('WK-01'), work('WK-02')],
      links: [],
      ...overrides,
    });

    it('пустой снимок валиден', () => {
      expect(() =>
        validateScheduleWorks('A', { works: [], links: [] }),
      ).not.toThrow();
    });

    it('endDate < startDate → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({ works: [work('WK-01', '2027-03-05', '2027-03-01')] }),
        ),
      ).toThrow(InternalServerErrorException);
    });

    it('дубликаты work/link id → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({ works: [work('WK-01'), work('WK-01')] }),
        ),
      ).toThrow(/duplicate work id/);
      const link = {
        id: 'L1',
        sourceRef: 'work:WK-01',
        targetRef: 'work:WK-02',
        type: 'FS' as const,
      };
      expect(() =>
        validateScheduleWorks('B', fixture({ links: [link, link] })),
      ).toThrow(/duplicate link id/);
    });

    it('ref не по формату work:<id> → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            links: [
              {
                id: 'L1',
                sourceRef: 'WK-01',
                targetRef: 'work:WK-02',
                type: 'FS',
              },
            ],
          }),
        ),
      ).toThrow(/must match work:<id>/);
    });

    it('ref на несуществующую работу → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            links: [
              {
                id: 'L1',
                sourceRef: 'work:WK-01',
                targetRef: 'work:WK-99',
                type: 'FS',
              },
            ],
          }),
        ),
      ).toThrow(/unknown work WK-99/);
    });

    const treeGroup = (
      id: string,
      kind: 'project_group' | 'stage_group',
      parentKey: string | null,
      wbs: string,
      sourceWeeks: number | null = null,
    ) => ({
      id,
      kind,
      name: id,
      parentKey,
      wbs,
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks,
    });

    const validTree = (): ScheduleWorkSnapshotFixture => ({
      groups: [
        treeGroup('AN-08', 'project_group', null, '8'),
        treeGroup('8.2', 'stage_group', 'project_group:AN-08', '8.2', 3),
      ],
      works: [
        work('WK-01'),
        work('WK-02'),
        {
          ...work('8.2.1', '2027-02-25', '2027-03-02'),
          parentKey: 'stage_group:8.2',
          wbs: '8.2.1',
          progressPct: 0,
          sourceWeeks: 3,
        },
        {
          ...work('8.2.2', '2027-03-04', '2027-03-18'),
          parentKey: 'stage_group:8.2',
          wbs: '8.2.2',
          progressPct: 40,
          baselineStart: '2027-02-26',
          baselineEnd: '2027-03-08',
        },
      ],
      links: [
        {
          id: 'L1',
          sourceRef: 'work:WK-01',
          targetRef: 'work:WK-02',
          type: 'FS',
        },
        {
          id: 'L2',
          sourceRef: 'work:WK-01',
          targetRef: 'work:WK-02',
          type: 'SS',
        },
        {
          id: 'L3',
          sourceRef: 'work:WK-01',
          targetRef: 'work:WK-02',
          type: 'FF',
        },
        {
          id: 'L4',
          sourceRef: 'work:WK-01',
          targetRef: 'work:WK-02',
          type: 'SF',
        },
      ],
      milestoneAttachments: [
        {
          id: 'MS-CLN-PANEL',
          parentKey: 'stage_group:8.2',
          wbs: '8.2.3',
          siblingOrder: 2,
        },
      ],
    });

    it('progressPct 0 допустим, вне 0..100 — нет', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({ works: [{ ...work('WK-01'), progressPct: 0 }] }),
        ),
      ).not.toThrow();
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({ works: [{ ...work('WK-01'), progressPct: 101 }] }),
        ),
      ).toThrow(/progressPct 101 outside 0\.\.100/);
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({ works: [{ ...work('WK-01'), progressPct: -1 }] }),
        ),
      ).toThrow(/progressPct -1 outside 0\.\.100/);
    });

    it('baseline только с одной стороны → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            works: [
              {
                ...work('WK-01'),
                baselineStart: '2027-03-01',
                baselineEnd: null,
              },
            ],
          }),
        ),
      ).toThrow(/baseline only one side/);
    });

    it('parentKey не на группу этого снимка → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            works: [{ ...work('WK-01'), parentKey: 'work:WK-01' }],
          }),
        ),
      ).toThrow(/does not point at a group/);
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            works: [{ ...work('WK-01'), parentKey: 'stage_group:8.2' }],
          }),
        ),
      ).toThrow(/does not point at a group/);
    });

    it('parentKey на группу того же снимка допустим', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            groups: [treeGroup('8.2', 'stage_group', null, '8.2')],
            works: [{ ...work('WK-01'), parentKey: 'stage_group:8.2' }],
          }),
        ),
      ).not.toThrow();
    });

    it('дубликат group id и вторая MS-CLN-PANEL → ошибка', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            groups: [
              treeGroup('AN-08', 'project_group', null, '8'),
              treeGroup('AN-08', 'project_group', null, '8'),
            ],
          }),
        ),
      ).toThrow(/duplicate group id AN-08/);
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({ works: [work('WK-01'), work('MS-CLN-PANEL')] }),
        ),
      ).toThrow(/second MS-CLN-PANEL/);
      expect(() =>
        validateScheduleWorks('C', {
          ...validTree(),
          milestoneAttachments: [
            {
              id: 'MS-CLN-PANEL',
              parentKey: 'stage_group:8.2',
              wbs: '8.2.3',
              siblingOrder: 2,
            },
            {
              id: 'MS-CLN-PANEL',
              parentKey: 'stage_group:8.2',
              wbs: '8.2.3',
              siblingOrder: 2,
            },
          ],
        }),
      ).toThrow(/second MS-CLN-PANEL/);
    });

    it('на C без дерева → ошибка, полное дерево проходит', () => {
      expect(() =>
        validateScheduleWorks('C', validTree(), ['MS-CLN-PANEL']),
      ).not.toThrow();
      expect(() =>
        validateScheduleWorks(
          'C',
          { ...validTree(), milestoneAttachments: [] },
          ['MS-CLN-PANEL'],
        ),
      ).toThrow(/missing schedule tree/);
      expect(() =>
        validateScheduleWorks(
          'C',
          {
            ...validTree(),
            groups: validTree().groups?.filter((group) => group.id !== '8.2'),
          },
          ['MS-CLN-PANEL'],
        ),
      ).toThrow(/does not point at a group|missing schedule tree/);
    });

    it('фактическая дата равна scenarioAsOfDate', () => {
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            works: [
              {
                ...work('8.2.2', '2027-03-04', '2027-03-18'),
                actualStart: '2027-03-01',
                actualEnd: null,
              } as ScheduleWorkSnapshotFixture['works'][number],
            ],
          }),
          [],
          '2027-03-01',
        ),
      ).not.toThrow();
    });

    it('отклоняет дату позже scenarioAsOfDate, конец без начала и перевёрнутый факт', () => {
      const withActual = (
        actualStart: string | null,
        actualEnd: string | null,
      ) =>
        fixture({
          works: [
            {
              ...work('WK-01'),
              actualStart,
              actualEnd,
            } as ScheduleWorkSnapshotFixture['works'][number],
          ],
        });
      expect(() =>
        validateScheduleWorks('B', withActual('2027-03-02', null), [], '2027-03-01'),
      ).toThrow(/after scenarioAsOfDate/);
      expect(() =>
        validateScheduleWorks('B', withActual(null, '2027-02-23'), [], '2027-03-01'),
      ).toThrow(/actualEnd without actualStart/);
      expect(() =>
        validateScheduleWorks(
          'B',
          withActual('2027-02-23', '2027-02-18'),
          [],
          '2027-03-01',
        ),
      ).toThrow(/actualEnd/);
      expect(() =>
        validateScheduleWorks('B', withActual('2027-02-31', null), [], '2027-03-01'),
      ).toThrow(/not a calendar date/);
    });

    it('Completed без фактических дат не заполняет их', () => {
      const row = {
        ...work('WK-02'),
        status: 'Completed' as const,
        actualStart: null,
        actualEnd: null,
      };
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            works: [row as ScheduleWorkSnapshotFixture['works'][number]],
          }),
          [],
          '2027-03-01',
        ),
      ).not.toThrow();
      expect(row.actualStart).toBeNull();
      expect(row.actualEnd).toBeNull();
    });

    it('на C обязательны все четыре типа связей', () => {
      expect(() =>
        validateScheduleWorks(
          'C',
          fixture({
            links: [
              {
                id: 'L1',
                sourceRef: 'work:WK-01',
                targetRef: 'work:WK-02',
                type: 'FS',
              },
            ],
          }),
        ),
      ).toThrow(/missing link types SS, FF, SF/);
    });

    it('межпроектная связь: оба конца, направление и отсутствие типа', () => {
      const accepted = {
        id: 'LNK-X-PWR-HVAC',
        kind: 'cross_project_predecessor' as const,
        sourceRef: 'milestone:MS-UTL-PWR',
        targetRef: 'work:WK-01',
      };
      expect(() =>
        validateScheduleWorks('B', fixture({ links: [accepted] }), [
          'MS-UTL-PWR',
        ]),
      ).not.toThrow();
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            links: [{ ...accepted, targetRef: 'work:WK-99' }],
          }),
          ['MS-UTL-PWR'],
        ),
      ).toThrow(/unknown work WK-99/);
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            links: [
              {
                ...accepted,
                sourceRef: 'work:WK-01',
                targetRef: 'milestone:MS-UTL-PWR',
              },
            ],
          }),
          ['MS-UTL-PWR'],
        ),
      ).toThrow(/direction must be milestone to work/);
      expect(() =>
        validateScheduleWorks(
          'B',
          fixture({
            links: [{ ...accepted, type: 'FS' }],
          }),
          ['MS-UTL-PWR'],
        ),
      ).toThrow(/must not carry a planning type/);
    });
  });
});
