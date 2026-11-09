import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { calendarDaysDelta } from '../common/calendar-days-delta';
import { DEMO_DATA_SOURCE, DemoDataSource } from '../data/demo-data-source';
import type {
  ScheduleGroupFixture,
  ScheduleMilestoneAttachment,
  ScheduleWorkFixture,
  ScheduleWorkSnapshotFixture,
} from '../data/fixtures/schedule-works';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { assertScheduleLink } from './schedule-link-rules';
import {
  equipmentProgressPct,
  milestoneProgressPct,
} from '../data/schedule/schedule-control-progress';
import {
  buildEquipmentAttachments,
  mergeDemoTree,
  rollupProgress,
} from '../data/schedule/schedule-demo-tree';
import {
  SCHEDULE_LINK_TYPES,
  type ScheduleDto,
  type ScheduleEquipmentItemDto,
  type ScheduleGroupItemDto,
  type ScheduleItemDto,
  type ScheduleLinkDto,
  type ScheduleMilestoneItemDto,
  type ScheduleWorkItemDto,
} from './dto/schedule.dto';

const GROUP_KEY_PATTERN = /^(?:project_group|stage_group):.+$/;
const PANEL_MILESTONE_ID = 'MS-CLN-PANEL';

/**
 * Schedule read model: control points (Milestone + Equipment delivery, D11),
 * Work bars and dependency links (G07–G11), and the snapshot 03 group tree.
 * `wbs` is a stable view-model code, not a domain WBS. Links are demo data,
 * not a computed critical path. Groups do not store a summary interval.
 */
@Injectable()
export class ScheduleService {
  constructor(
    @Inject(DEMO_DATA_SOURCE) private readonly dataSource: DemoDataSource,
  ) {}

  getSchedule(projectId: string, snapshotId: SnapshotId): ScheduleDto {
    const snapshot = this.dataSource.getSnapshot(snapshotId);
    const project = this.dataSource.getProject(snapshot.id, projectId);
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const rawWorks = this.dataSource.getScheduleWorks(snapshot.id);
    const scheduleWorks = mergeDemoTree(
      rawWorks,
      snapshot.milestones.map((m) => ({ id: m.id, workstream: m.workstream })),
      snapshot.scenarioAsOfDate,
      snapshot.id,
    );
    const catalogueMilestoneIds = snapshot.milestones.map(
      (milestone) => milestone.id,
    );
    validateScheduleWorks(
      snapshot.id,
      scheduleWorks,
      catalogueMilestoneIds,
      snapshot.scenarioAsOfDate,
    );

    const equipmentAttachments = buildEquipmentAttachments(
      snapshot.equipment.map((eq) => ({
        id: eq.id,
        workstream: eq.workstream,
      })),
    );
    const equipmentById = new Map(
      equipmentAttachments.map((a) => [a.id, a] as const),
    );

    const equipmentItems: ScheduleEquipmentItemDto[] = snapshot.equipment.map(
      (eq) => {
        const eqDelta = calendarDaysDelta(
          eq.baselineDelivery,
          eq.forecastDelivery,
        );
        const attachment = equipmentById.get(eq.id);
        return {
          kind: 'equipment_delivery',
          id: eq.id,
          name: eq.name,
          workstream: eq.workstream,
          critical: eq.critical,
          status: eq.status,
          baselineDate: eq.baselineDelivery,
          forecastDate: eq.forecastDelivery,
          dateVariance: {
            baselineDate: eq.baselineDelivery,
            forecastDate: eq.forecastDelivery,
            deltaDays: eqDelta,
          },
          parentKey: attachment?.parentKey ?? null,
          wbs: attachment?.wbs ?? null,
          siblingOrder: attachment?.siblingOrder ?? null,
          progressPct: equipmentProgressPct({
            id: eq.id,
            scenarioAsOfDate: snapshot.scenarioAsOfDate,
          }),
          sourceWeeks: null,
        };
      },
    );

    const attachmentById = new Map<string, ScheduleMilestoneAttachment>();
    for (const attachment of scheduleWorks.milestoneAttachments ?? []) {
      attachmentById.set(attachment.id, attachment);
    }

    const aliasedById = new Map(
      (scheduleWorks.aliasedCheckpoints ?? []).map((a) => [a.id, a] as const),
    );
    const milestoneItems: ScheduleMilestoneItemDto[] = snapshot.milestones.map(
      (ms) => {
        const attachment = attachmentById.get(ms.id);
        const alias = aliasedById.get(ms.id);
        if (alias) {
          // Source КТ aliased to catalog MS: controlpoint metadata wins.
          const delta = calendarDaysDelta(
            alias.baselineDate,
            alias.forecastDate,
          );
          return {
            kind: 'milestone',
            id: ms.id,
            name: alias.name,
            workstream: alias.workstream ?? ms.workstream,
            rag: alias.rag,
            baselineDate: alias.baselineDate,
            forecastDate: alias.forecastDate,
            dateVariance: {
              baselineDate: alias.baselineDate,
              forecastDate: alias.forecastDate,
              deltaDays: delta,
            },
            parentKey: alias.parentKey,
            wbs: alias.wbs,
            siblingOrder: alias.siblingOrder,
            progressPct: alias.progressPct,
            sourceWeeks: alias.sourceWeeks,
            sourceKind: 'controlpoint',
            sourceStatus: alias.sourceStatus,
          };
        }
        const msDelta = calendarDaysDelta(ms.baselineDate, ms.forecastDate);
        return {
          kind: 'milestone',
          id: ms.id,
          name: ms.name,
          workstream: ms.workstream,
          rag: ms.rag,
          baselineDate: ms.baselineDate,
          forecastDate: ms.forecastDate,
          dateVariance: {
            baselineDate: ms.baselineDate,
            forecastDate: ms.forecastDate,
            deltaDays: msDelta,
          },
          parentKey: attachment?.parentKey ?? null,
          wbs: attachment?.wbs ?? null,
          siblingOrder: attachment?.siblingOrder ?? null,
          progressPct: milestoneProgressPct({
            id: ms.id,
            scenarioAsOfDate: snapshot.scenarioAsOfDate,
          }),
          sourceWeeks: null,
          sourceKind: 'catalog_milestone',
          sourceStatus: null,
        };
      },
    );

    const importedCheckpointItems: ScheduleMilestoneItemDto[] = (
      scheduleWorks.importedCheckpoints ?? []
    ).map((kt) => {
      const delta = calendarDaysDelta(kt.baselineDate, kt.forecastDate);
      return {
        kind: 'milestone',
        id: kt.id,
        name: kt.name,
        workstream: kt.workstream,
        rag: kt.rag,
        baselineDate: kt.baselineDate,
        forecastDate: kt.forecastDate,
        dateVariance: {
          baselineDate: kt.baselineDate,
          forecastDate: kt.forecastDate,
          deltaDays: delta,
        },
        parentKey: kt.parentKey,
        wbs: kt.wbs,
        siblingOrder: kt.siblingOrder,
        progressPct: kt.progressPct,
        sourceWeeks: kt.sourceWeeks,
        sourceKind: 'controlpoint',
        sourceStatus: kt.sourceStatus,
      };
    });

    const workItems: ScheduleWorkItemDto[] = scheduleWorks.works.map((work) =>
      toWorkItem(work),
    );

    const draftItems: ScheduleItemDto[] = [
      ...equipmentItems,
      ...milestoneItems,
      ...importedCheckpointItems,
      ...(scheduleWorks.groups ?? []).map((group): ScheduleGroupItemDto => ({
        kind: group.kind,
        id: group.id,
        name: group.name,
        parentKey: group.parentKey,
        wbs: group.wbs,
        siblingOrder: group.siblingOrder,
        progressPct: null,
        sourceWeeks: group.sourceWeeks,
      })),
      ...workItems,
    ];

    const groupKeys = new Set(
      draftItems
        .filter(isScheduleGroup)
        .map((group) => `${group.kind}:${group.id}`),
    );
    const groupItems: ScheduleGroupItemDto[] = draftItems
      .filter(isScheduleGroup)
      .map((group) => ({
        ...group,
        progressPct: rollupProgress(
          `${group.kind}:${group.id}`,
          draftItems,
          groupKeys,
        ),
      }));

    const items: ScheduleItemDto[] = [
      ...equipmentItems,
      ...milestoneItems,
      ...importedCheckpointItems,
      ...groupItems,
      ...workItems,
    ].sort(compareScheduleItems);

    assertAssembledSchedule(snapshot.id, items);

    const links: ScheduleLinkDto[] = scheduleWorks.links.map((link) =>
      link.kind === 'cross_project_predecessor'
        ? {
            id: link.id,
            kind: 'cross_project_predecessor',
            sourceRef: link.sourceRef,
            targetRef: link.targetRef,
          }
        : {
            id: link.id,
            kind: 'scheduling',
            sourceRef: link.sourceRef,
            targetRef: link.targetRef,
            type: link.type,
          },
    );

    return {
      snapshotId: snapshot.id,
      scenarioAsOfDate: snapshot.scenarioAsOfDate,
      projectId: project.id,
      items,
      links,
    };
  }
}

function toWorkItem(work: ScheduleWorkFixture): ScheduleWorkItemDto {
  // Actual fields are optional until the fixture owner writes them.
  const actual = work as ScheduleWorkFixture & {
    actualStart?: string | null;
    actualEnd?: string | null;
  };
  return {
    kind: 'work',
    id: work.id,
    name: work.name,
    workstream: work.workstream ?? null,
    startDate: work.startDate,
    endDate: work.endDate,
    status: work.status,
    parentKey: work.parentKey ?? null,
    wbs: work.wbs ?? null,
    siblingOrder: work.siblingOrder ?? null,
    // `??` keeps a known 0. Do not use `||`.
    progressPct: work.progressPct ?? null,
    sourceWeeks: work.sourceWeeks ?? null,
    sourceStatus: work.sourceStatus ?? null,
    baselineStart: work.baselineStart ?? null,
    baselineEnd: work.baselineEnd ?? null,
    actualStart: actual.actualStart ?? null,
    actualEnd: actual.actualEnd ?? null,
  };
}

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** ISO calendar date, or null when the string is not a real day. */
function parseCalendarDate(value: string): string | null {
  const match = CALENDAR_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function assertWorkActual(
  fail: (message: string) => never,
  work: ScheduleWorkFixture,
  scenarioAsOfDate: string | undefined,
): void {
  const actual = work as ScheduleWorkFixture & {
    actualStart?: string | null;
    actualEnd?: string | null;
  };
  const start = actual.actualStart ?? null;
  const end = actual.actualEnd ?? null;
  if (end != null && start == null) {
    fail(`work ${work.id} actualEnd without actualStart`);
  }
  for (const [label, value] of [
    ['actualStart', start],
    ['actualEnd', end],
  ] as const) {
    if (value == null) continue;
    if (parseCalendarDate(value) == null) {
      fail(`work ${work.id} ${label} ${value} is not a calendar date`);
    }
    if (scenarioAsOfDate != null && value > scenarioAsOfDate) {
      fail(
        `work ${work.id} ${label} ${value} is after scenarioAsOfDate ${scenarioAsOfDate}`,
      );
    }
  }
  if (start != null && end != null && end < start) {
    fail(`work ${work.id} actualEnd ${end} < actualStart ${start}`);
  }
}

/**
 * Guards fixture integrity at read time: a broken fixture must fail loudly
 * (500) instead of shipping a dangling tree or arrow to the Gantt.
 * Snapshot 03 must contain the AN-08 tree and all four link types.
 * `catalogueMilestoneIds` is the milestone catalogue of the same snapshot.
 * An empty list skips the catalogue-count check (direct unit calls).
 */
export function validateScheduleWorks(
  snapshotId: SnapshotId,
  fixture: ScheduleWorkSnapshotFixture,
  catalogueMilestoneIds: readonly string[] = [],
  scenarioAsOfDate?: string,
): void {
  const fail = (message: string): never => {
    throw new InternalServerErrorException(
      `Schedule fixture ${snapshotId}: ${message}`,
    );
  };

  const groups = fixture.groups ?? [];
  const attachments = fixture.milestoneAttachments ?? [];
  const { works, links } = fixture;

  const rowIds = new Set<string>();
  for (const group of groups) {
    if (group.id === PANEL_MILESTONE_ID) fail('second MS-CLN-PANEL');
    if (rowIds.has(group.id)) fail(`duplicate group id ${group.id}`);
    rowIds.add(group.id);
    assertProgressPct(fail, group.progressPct, `group ${group.id}`);
    if (group.wbs == null || String(group.wbs).trim() === '') {
      fail(`group ${group.id} missing wbs`);
    }
  }

  const workIds = new Set<string>();
  for (const work of works) {
    if (work.id === PANEL_MILESTONE_ID) fail('second MS-CLN-PANEL');
    if (rowIds.has(work.id) || workIds.has(work.id)) {
      fail(`duplicate work id ${work.id}`);
    }
    workIds.add(work.id);
    rowIds.add(work.id);
    if (work.endDate < work.startDate) {
      fail(
        `work ${work.id} endDate ${work.endDate} < startDate ${work.startDate}`,
      );
    }
    if ((work.baselineStart == null) !== (work.baselineEnd == null)) {
      fail(`work ${work.id} baseline only one side`);
    }
    assertWorkActual(fail, work, scenarioAsOfDate);
    assertProgressPct(fail, work.progressPct, `work ${work.id}`);
  }

  const attachmentIds = new Set<string>();
  for (const attachment of attachments) {
    if (attachmentIds.has(attachment.id)) {
      fail(
        attachment.id === PANEL_MILESTONE_ID
          ? 'second MS-CLN-PANEL'
          : `duplicate milestone attachment ${attachment.id}`,
      );
    }
    attachmentIds.add(attachment.id);
    if (rowIds.has(attachment.id)) fail('second MS-CLN-PANEL');
  }

  if (catalogueMilestoneIds.length > 0) {
    const panelCount = catalogueMilestoneIds.filter(
      (id) => id === PANEL_MILESTONE_ID,
    ).length;
    if (panelCount > 1) fail('second MS-CLN-PANEL');
    for (const attachment of attachments) {
      const catalogueCount = catalogueMilestoneIds.filter(
        (id) => id === attachment.id,
      ).length;
      if (catalogueCount !== 1) {
        fail(
          catalogueCount > 1
            ? 'second MS-CLN-PANEL'
            : `milestone attachment ${attachment.id} is not in the catalogue`,
        );
      }
    }
  }

  const groupKeys = new Set(groups.map((group) => groupKey(group)));
  for (const group of groups) {
    assertParentKey(fail, group.parentKey, `group ${group.id}`, groupKeys);
  }
  for (const work of works) {
    assertParentKey(fail, work.parentKey, `work ${work.id}`, groupKeys);
  }
  for (const attachment of attachments) {
    assertParentKey(
      fail,
      attachment.parentKey,
      `milestone ${attachment.id}`,
      groupKeys,
    );
  }

  const linkIds = new Set<string>();
  const milestoneIds = new Set(catalogueMilestoneIds);
  for (const kt of fixture.importedCheckpoints ?? []) {
    milestoneIds.add(kt.id);
  }
  for (const link of links) {
    if (linkIds.has(link.id)) fail(`duplicate link id ${link.id}`);
    linkIds.add(link.id);
    assertScheduleLink(link, workIds, milestoneIds, fail);
  }

  // Full demo tree (AN-08…) requires all four scheduling arrow types.
  const hasDemoTree = groups.some(
    (group) => group.kind === 'project_group' && group.id === 'AN-08',
  );
  if (hasDemoTree) {
    const presentTypes = new Set(
      links.flatMap((link) =>
        (link.kind ?? 'scheduling') === 'scheduling' && link.type
          ? [link.type]
          : [],
      ),
    );
    const missing = SCHEDULE_LINK_TYPES.filter((t) => !presentTypes.has(t));
    if (missing.length > 0) {
      fail(`missing link types ${missing.join(', ')}`);
    }
    assertSnapshotCTree(fail, groups, works, attachments);
  }
}

function assertProgressPct(
  fail: (message: string) => never,
  value: number | null | undefined,
  owner: string,
): void {
  if (value == null) return;
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    fail(`progressPct ${value} outside 0..100 on ${owner}`);
  }
}

function assertParentKey(
  fail: (message: string) => never,
  parentKey: string | null | undefined,
  owner: string,
  groupKeys: ReadonlySet<string>,
): void {
  if (parentKey == null) return;
  if (!GROUP_KEY_PATTERN.test(parentKey) || !groupKeys.has(parentKey)) {
    fail(
      `parentKey "${parentKey}" on ${owner} does not point at a group in this snapshot`,
    );
  }
}

function groupKey(group: ScheduleGroupFixture): string {
  return `${group.kind}:${group.id}`;
}

function assertSnapshotCTree(
  fail: (message: string) => never,
  groups: readonly ScheduleGroupFixture[],
  works: readonly ScheduleWorkFixture[],
  attachments: readonly ScheduleMilestoneAttachment[],
): void {
  const project = groups.find(
    (group) => group.kind === 'project_group' && group.id === 'AN-08',
  );
  const stage = groups.find(
    (group) => group.kind === 'stage_group' && group.id === '8.2',
  );
  const panels = works.find((work) => work.id === '8.2.1');
  const floors = works.find((work) => work.id === '8.2.2');
  const panelAttachment = attachments.find(
    (attachment) => attachment.id === PANEL_MILESTONE_ID,
  );
  if (
    !project ||
    project.parentKey != null ||
    project.wbs !== '8' ||
    !stage ||
    stage.parentKey !== 'project_group:AN-08' ||
    stage.wbs !== '8.2' ||
    stage.sourceWeeks !== 3 ||
    !panels ||
    panels.parentKey !== 'stage_group:8.2' ||
    panels.wbs !== '8.2.1' ||
    !floors ||
    floors.parentKey !== 'stage_group:8.2' ||
    floors.wbs !== '8.2.2' ||
    floors.baselineStart == null ||
    floors.baselineEnd == null ||
    !panelAttachment ||
    panelAttachment.parentKey !== 'stage_group:8.2' ||
    panelAttachment.wbs !== '8.2.3' ||
    panelAttachment.siblingOrder !== 2
  ) {
    fail('missing schedule tree');
  }
  // progressPct is snapshot-overlay authored (01–19); not asserted here.
}

/**
 * Response-side guard. The milestone catalogue row is updated in place;
 * a second MS-CLN-PANEL — from a fixture work or a pushed copy — fails here.
 */
function assertAssembledSchedule(
  snapshotId: SnapshotId,
  items: readonly ScheduleItemDto[],
): void {
  const fail = (message: string): never => {
    throw new InternalServerErrorException(
      `Schedule fixture ${snapshotId}: ${message}`,
    );
  };

  const groupKeys = new Set(
    items.filter(isScheduleGroup).map((group) => `${group.kind}:${group.id}`),
  );
  const seenIds = new Set<string>();
  for (const item of items) {
    if (seenIds.has(item.id)) {
      fail(
        item.id === PANEL_MILESTONE_ID
          ? 'second MS-CLN-PANEL'
          : `duplicate id ${item.id}`,
      );
    }
    seenIds.add(item.id);
    assertProgressPct(fail, item.progressPct, `${item.kind}:${item.id}`);
    if (item.wbs == null || String(item.wbs).trim() === '') {
      fail(`${item.kind}:${item.id} missing wbs`);
    }
    if (item.kind === 'work') {
      if (item.endDate < item.startDate) {
        fail(
          `work ${item.id} endDate ${item.endDate} < startDate ${item.startDate}`,
        );
      }
      if ((item.baselineStart == null) !== (item.baselineEnd == null)) {
        fail(`work ${item.id} baseline only one side`);
      }
    }
    assertParentKey(fail, item.parentKey, `${item.kind}:${item.id}`, groupKeys);
  }

  const panels = items.filter((item) => item.id === PANEL_MILESTONE_ID);
  if (panels.length > 1) fail('second MS-CLN-PANEL');
  if (panels.length !== 1 || panels[0]?.kind !== 'milestone') {
    fail('missing MS-CLN-PANEL');
  }

  if (snapshotId === '03') {
    const project = items.find(
      (item) => item.kind === 'project_group' && item.id === 'AN-08',
    );
    const stage = items.find(
      (item) => item.kind === 'stage_group' && item.id === '8.2',
    );
    const panelsWork = items.find(
      (item) => item.kind === 'work' && item.id === '8.2.1',
    );
    const floors = items.find(
      (item) => item.kind === 'work' && item.id === '8.2.2',
    );
    const panel = panels[0];
    if (
      !project ||
      !stage ||
      stage.parentKey !== 'project_group:AN-08' ||
      !panelsWork ||
      panelsWork.parentKey !== 'stage_group:8.2' ||
      panelsWork.progressPct !== 0 ||
      !floors ||
      floors.parentKey !== 'stage_group:8.2' ||
      panel?.kind !== 'milestone' ||
      panel.parentKey !== 'stage_group:8.2' ||
      panel.wbs !== '8.2.3' ||
      panel.siblingOrder !== 2
    ) {
      fail('missing schedule tree');
    }
  }
}

function isScheduleGroup(item: ScheduleItemDto): item is ScheduleGroupItemDto {
  return item.kind === 'project_group' || item.kind === 'stage_group';
}

/**
 * Groups have no forecast interval. Sort them by wbs (else id) so comparison
 * does not throw. The client reorders the tree; this order only keeps the
 * payload stable and does not drop equipment or milestone rows.
 */
function scheduleDateKey(item: ScheduleItemDto): string {
  if (isScheduleGroup(item)) return item.wbs ?? item.id;
  return item.kind === 'work' ? item.startDate : item.forecastDate;
}

/**
 * Kind tiebreak on equal date keys: groups, then equipment_delivery →
 * milestone → work. Control points stay ahead of a work that starts the
 * same day so existing EQ/MS ordering is unchanged.
 */
const KIND_ORDER: Record<ScheduleItemDto['kind'], number> = {
  project_group: 0,
  stage_group: 1,
  equipment_delivery: 2,
  milestone: 3,
  work: 4,
};

/** Dated rows: date key → kind → id. Groups: wbs or id, then kind, then id. */
export function compareScheduleItems(
  a: ScheduleItemDto,
  b: ScheduleItemDto,
): number {
  const dateA = scheduleDateKey(a);
  const dateB = scheduleDateKey(b);
  if (dateA !== dateB) {
    return dateA.localeCompare(dateB);
  }
  if (a.kind !== b.kind) {
    return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
  }
  return a.id.localeCompare(b.id);
}
