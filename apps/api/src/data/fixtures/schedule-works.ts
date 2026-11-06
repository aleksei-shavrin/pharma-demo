import type { SnapshotId } from '../../snapshot/snapshot-id';

/**
 * Work-bar / link fixtures for the Schedule read model (G07–G11)
 * plus the snapshot C view-model tree (groups, not domain WBS).
 * Dates are already shifted for Snapshot C asOf 2027-03-01; see
 * docs/07-delivery/reports/2026-11-06-g07-g11-schedule-work-fixtures.md.
 *
 * Kept outside SnapshotFixture on purpose: works/links/groups are a
 * Schedule-only concern, so the shared fixture type stays untouched.
 * Snapshots without an entry have no works, no groups, and no links.
 *
 * 8.2 dates and percents are synthetic demo values. Names and sourceWeeks
 * come from the analyst file.
 *
 * AN-24 / AN-09 forecast intervals are also synthetic. Their progressPct
 * stays null: the analyst file has no percent. See the narrative section
 * «Подвыборка AN-24 → AN-09».
 */

export type ScheduleWorkFixtureStatus =
  'Waiting' | 'OnSchedule' | 'Delayed' | 'Completed';

export type ScheduleLinkFixtureType = 'FS' | 'SS' | 'FF' | 'SF';

export type ScheduleGroupFixtureKind = 'project_group' | 'stage_group';

export interface ScheduleGroupFixture {
  id: string;
  kind: ScheduleGroupFixtureKind;
  name: string;
  parentKey: string | null;
  wbs: string | null;
  siblingOrder: number | null;
  /** Groups never carry a known percent. null is required, not 0. */
  progressPct: null;
  sourceWeeks: number | null;
}

/**
 * Nesting for a milestone that already exists in the catalogue.
 * The service updates that row. It must not append a second item.
 */
export interface ScheduleMilestoneAttachment {
  id: string;
  parentKey: string;
  wbs: string;
  siblingOrder: number;
}

export interface ScheduleWorkFixture {
  id: string;
  name: string;
  workstream?: string | null;
  startDate: string;
  endDate: string;
  status: ScheduleWorkFixtureStatus;
  parentKey?: string | null;
  wbs?: string | null;
  siblingOrder?: number | null;
  /** 0 is a known percent. null means the source has no percent. */
  progressPct?: number | null;
  sourceWeeks?: number | null;
  baselineStart?: string | null;
  baselineEnd?: string | null;
  /** Inclusive. Both null means no fact. Not derived from status or progress. */
  actualStart?: string | null;
  actualEnd?: string | null;
}

export interface ScheduleLinkFixture {
  id: string;
  /** Absent on older literals. The service reads that as `scheduling`. */
  kind?: 'scheduling' | 'cross_project_predecessor';
  sourceRef: string;
  targetRef: string;
  /** Required for `scheduling`. Absent on `cross_project_predecessor`. */
  type?: ScheduleLinkFixtureType;
}

export interface ScheduleWorkSnapshotFixture {
  works: readonly ScheduleWorkFixture[];
  links: readonly ScheduleLinkFixture[];
  groups?: readonly ScheduleGroupFixture[];
  milestoneAttachments?: readonly ScheduleMilestoneAttachment[];
}

const EMPTY_SCHEDULE_WORKS: ScheduleWorkSnapshotFixture = {
  groups: [],
  works: [],
  links: [],
  milestoneAttachments: [],
};

const UNNESTED_WORK = {
  parentKey: null,
  wbs: null,
  siblingOrder: null,
  sourceWeeks: null,
  baselineStart: null,
  baselineEnd: null,
} as const;

const SNAPSHOT_C_SCHEDULE_WORKS: ScheduleWorkSnapshotFixture = {
  groups: [
    {
      id: 'AN-08',
      kind: 'project_group',
      name: 'Внутренняя отделка и чистые помещения',
      parentKey: null,
      wbs: '8',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: null,
    },
    {
      id: '8.2',
      kind: 'stage_group',
      name: 'Чистые помещения классов C/D',
      parentKey: 'project_group:AN-08',
      wbs: '8.2',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: 3,
    },
    {
      id: 'AN-24',
      kind: 'project_group',
      name: 'Внешние сети и энергоснабжение',
      parentKey: null,
      wbs: '24',
      siblingOrder: 1,
      progressPct: null,
      sourceWeeks: null,
    },
    {
      id: '24.1',
      kind: 'stage_group',
      name: 'Электроснабжение',
      parentKey: 'project_group:AN-24',
      wbs: '24.1',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: 8,
    },
    {
      id: 'AN-09',
      kind: 'project_group',
      name: 'HVAC и системы подготовки воздуха',
      parentKey: null,
      wbs: '9',
      siblingOrder: 2,
      progressPct: null,
      sourceWeeks: null,
    },
    {
      id: '9.3',
      kind: 'stage_group',
      name: 'Монтаж AHU',
      parentKey: 'project_group:AN-09',
      wbs: '9.3',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: null,
    },
  ],
  /**
   * MS-CLN-PANEL is not listed here. Snapshot C only records where the
   * existing catalogue milestone sits in the tree.
   */
  milestoneAttachments: [
    {
      id: 'MS-CLN-PANEL',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.3',
      siblingOrder: 2,
    },
    {
      id: 'MS-UTL-PWR',
      parentKey: 'stage_group:24.1',
      wbs: '24.1.3',
      siblingOrder: 2,
    },
  ],
  works: [
    {
      id: 'WK-01',
      name: 'Подготовка зоны монтажа',
      startDate: '2027-02-20',
      endDate: '2027-02-24',
      status: 'Completed',
      progressPct: 100,
      ...UNNESTED_WORK,
      baselineStart: '2027-02-20',
      baselineEnd: '2027-02-24',
      actualStart: '2027-02-18',
      actualEnd: '2027-02-23',
    },
    {
      id: 'WK-02',
      name: 'Разметка зон чистых помещений',
      startDate: '2027-02-20',
      endDate: '2027-02-22',
      status: 'Completed',
      // Completed does not imply a percent. This row has no known progress.
      progressPct: null,
      ...UNNESTED_WORK,
      actualStart: null,
      actualEnd: null,
    },
    {
      id: 'WK-03',
      name: 'Монтаж панелей чистых помещений',
      startDate: '2027-02-27',
      endDate: '2027-03-10',
      status: 'Delayed',
      progressPct: null,
      ...UNNESTED_WORK,
    },
    {
      id: 'WK-04',
      name: 'Герметизация стыков',
      startDate: '2027-03-06',
      endDate: '2027-03-10',
      status: 'OnSchedule',
      progressPct: null,
      ...UNNESTED_WORK,
    },
    {
      // Single-day work (start === end): visible one-day bar, not a milestone.
      id: 'WK-05',
      name: 'Приёмка участка',
      startDate: '2027-03-13',
      endDate: '2027-03-13',
      status: 'Waiting',
      progressPct: null,
      ...UNNESTED_WORK,
    },
    {
      id: '8.2.1',
      name: 'Сэндвич-панели и герметизация',
      startDate: '2027-02-25',
      endDate: '2027-03-02',
      status: 'Delayed',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.1',
      siblingOrder: 0,
      progressPct: 0,
      sourceWeeks: 3,
      baselineStart: null,
      baselineEnd: null,
      actualStart: null,
      actualEnd: null,
    },
    {
      id: '8.2.2',
      name: 'Фальшполы и потолки',
      startDate: '2027-03-04',
      endDate: '2027-03-18',
      status: 'OnSchedule',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.2',
      siblingOrder: 1,
      progressPct: 40,
      sourceWeeks: null,
      baselineStart: '2027-02-26',
      baselineEnd: '2027-03-08',
      actualStart: '2027-03-01',
      actualEnd: null,
    },
    {
      // Forecast is synthetic. ⚠️8н supplies Delayed and sourceWeeks, not dates.
      id: '24.1.1',
      name: 'Два ввода от сети',
      startDate: '2027-02-08',
      endDate: '2027-03-19',
      status: 'Delayed',
      parentKey: 'stage_group:24.1',
      wbs: '24.1.1',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: 8,
      baselineStart: null,
      baselineEnd: null,
    },
    {
      id: '24.1.2',
      name: 'Подстанция',
      startDate: '2027-02-15',
      endDate: '2027-03-12',
      status: 'OnSchedule',
      parentKey: 'stage_group:24.1',
      wbs: '24.1.2',
      siblingOrder: 1,
      progressPct: null,
      sourceWeeks: null,
      baselineStart: null,
      baselineEnd: null,
    },
    {
      id: '9.3.1',
      name: 'Установка AHU',
      startDate: '2027-02-22',
      endDate: '2027-03-19',
      status: 'OnSchedule',
      parentKey: 'stage_group:9.3',
      wbs: '9.3.1',
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: null,
      baselineStart: null,
      baselineEnd: null,
    },
    {
      // Starts the day after the existing MS-UTL-PWR forecast. Not a computed lag.
      id: '9.3.2',
      name: 'Подключение к сетям',
      startDate: '2027-04-16',
      endDate: '2027-04-30',
      status: 'Waiting',
      parentKey: 'stage_group:9.3',
      wbs: '9.3.2',
      siblingOrder: 1,
      progressPct: null,
      sourceWeeks: null,
      baselineStart: null,
      baselineEnd: null,
    },
  ],
  links: [
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
      // SF is not a natural construction dependency here (WK-05 starts after
      // WK-04 ends). It exists only so the demo UI can show all four arrow
      // attachment variants (start/finish → start/finish); do not read it as
      // a scheduling constraint.
      id: 'LNK-SF-01',
      kind: 'scheduling',
      sourceRef: 'work:WK-04',
      targetRef: 'work:WK-05',
      type: 'SF',
    },
    {
      // ⇢ in the analyst file is not a planning type. No FS/SS/FF/SF field.
      id: 'LNK-X-PWR-HVAC',
      kind: 'cross_project_predecessor',
      sourceRef: 'milestone:MS-UTL-PWR',
      targetRef: 'work:9.3.2',
    },
  ],
};

const SCHEDULE_WORKS_BY_SNAPSHOT: Partial<
  Record<SnapshotId, ScheduleWorkSnapshotFixture>
> = {
  C: SNAPSHOT_C_SCHEDULE_WORKS,
};

export function getScheduleWorkFixture(
  snapshotId: SnapshotId,
): ScheduleWorkSnapshotFixture {
  return SCHEDULE_WORKS_BY_SNAPSHOT[snapshotId] ?? EMPTY_SCHEDULE_WORKS;
}
