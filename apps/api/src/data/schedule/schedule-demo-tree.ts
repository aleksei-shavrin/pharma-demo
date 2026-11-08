/**
 * Demo schedule tree: analyst 25-project import + EQ/MS attachments.
 * certainty: assumption for supplementary dates; source WBS/names/status from analyst.
 */
import { EQUIPMENT_CATALOG, MILESTONE_CATALOG } from '../fixtures/catalog';
import type { WorkstreamId } from '../workstream-ids';
import {
  MILESTONE_WBS_ALIASES,
  primaryWorkstreamForProject,
} from '../ws-program-mapping';
import type {
  ScheduleGroupFixture,
  ScheduleMilestoneAttachment,
  ScheduleWorkFixture,
  ScheduleWorkSnapshotFixture,
} from '../fixtures/schedule-works';
import type { SnapshotId } from '../../snapshot/snapshot-id';
import { applyWorkStates, reconcileWorkFacts } from './schedule-work-states';
import {
  applyMasterLifecycleToWorks,
  getRegisteredLifecycleGraph,
} from '../fixtures/analyst/schedule-master-simulation';

export type StageBinding = {
  projectId: string;
  projectWbs: string;
  projectName: string;
  stageId: string;
  stageWbs: string;
  stageName: string;
  projectSiblingOrder: number;
};

/**
 * Internal WS tag → analyst stage for EQ/MS parenting.
 * Not a user-facing workstream tree (25 AN projects are the schedule roots).
 */
export const WORKSTREAM_STAGE: Record<WorkstreamId, StageBinding> = {
  'WS-BLD': {
    projectId: 'AN-06',
    projectWbs: '6',
    projectName: 'Земляные работы и нулевой цикл',
    stageId: '6.1',
    stageWbs: '6.1',
    stageName: 'Подготовка площадки',
    projectSiblingOrder: 5,
  },
  'WS-CLN': {
    projectId: 'AN-08',
    projectWbs: '8',
    projectName: 'Внутренняя отделка и чистые помещения',
    stageId: '8.2',
    stageWbs: '8.2',
    stageName: 'Чистые помещения классов C/D',
    projectSiblingOrder: 7,
  },
  'WS-HVAC': {
    projectId: 'AN-09',
    projectWbs: '9',
    projectName: 'HVAC и системы подготовки воздуха',
    stageId: '9.3',
    stageWbs: '9.3',
    stageName: 'Монтаж AHU',
    projectSiblingOrder: 8,
  },
  'WS-UTL': {
    projectId: 'AN-24',
    projectWbs: '24',
    projectName: 'Внешние сети и энергоснабжение',
    stageId: '24.1',
    stageWbs: '24.1',
    stageName: 'Электроснабжение',
    projectSiblingOrder: 23,
  },
  'WS-PRD': {
    projectId: 'AN-13',
    projectWbs: '13',
    projectName: 'Технологическое оборудование: закупка и монтаж',
    stageId: '13.1',
    stageWbs: '13.1',
    stageName: 'Закупка основного оборудования',
    projectSiblingOrder: 12,
  },
  'WS-PKG': {
    projectId: 'AN-14',
    projectWbs: '14',
    projectName: 'GMP-склад и логистика',
    stageId: '14.1',
    stageWbs: '14.1',
    stageName: 'Зонирование склада',
    projectSiblingOrder: 13,
  },
  'WS-QC': {
    projectId: 'AN-20',
    projectWbs: '20',
    projectName: 'Квалификация (IQ/OQ/PQ)',
    stageId: '20.1',
    stageWbs: '20.1',
    stageName: 'IQ',
    projectSiblingOrder: 19,
  },
  'WS-AUT': {
    projectId: 'AN-16',
    projectWbs: '16',
    projectName: 'Автоматизация (BMS/EMS/DCS)',
    stageId: '16.1',
    stageWbs: '16.1',
    stageName: 'BMS',
    projectSiblingOrder: 15,
  },
};

export const NULL_WORKSTREAM_STAGE = WORKSTREAM_STAGE['WS-BLD'];

export function buildDemoGroups(): ScheduleGroupFixture[] {
  // Groups come from getScheduleWorkFixture (analyst topology) at merge time.
  return Object.values(WORKSTREAM_STAGE).flatMap((binding) => [
    {
      id: binding.projectId,
      kind: 'project_group' as const,
      name: binding.projectName,
      parentKey: null,
      wbs: binding.projectWbs,
      siblingOrder: binding.projectSiblingOrder,
      progressPct: null,
      sourceWeeks: null,
    },
    {
      id: binding.stageId,
      kind: 'stage_group' as const,
      name: binding.stageName,
      parentKey: `project_group:${binding.projectId}`,
      wbs: binding.stageWbs,
      siblingOrder: 0,
      progressPct: null,
      sourceWeeks: null,
    },
  ]);
}

export function stageKey(binding: StageBinding): string {
  return `stage_group:${binding.stageId}`;
}

let milestoneWbsCatalogue: Map<string, ScheduleMilestoneAttachment> | null =
  null;

function milestoneWbsById(): Map<string, ScheduleMilestoneAttachment> {
  if (milestoneWbsCatalogue) return milestoneWbsCatalogue;
  const usedWbs = new Set<string>();
  const counters = new Map<string, number>();
  const map = new Map<string, ScheduleMilestoneAttachment>();

  for (const [id, meta] of Object.entries(MILESTONE_WBS_ALIASES)) {
    const stageWbs = meta.wbs.split('.').slice(0, 2).join('.');
    map.set(id, {
      id,
      parentKey: `stage_group:${stageWbs}`,
      wbs: meta.wbs,
      siblingOrder: Number(meta.wbs.split('.').pop()) - 1,
    });
    usedWbs.add(meta.wbs);
  }

  const sorted = Object.entries(MILESTONE_CATALOG)
    .map(([id, row]) => ({
      id,
      workstream: row.workstream,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const ms of sorted) {
    if (map.has(ms.id)) continue;
    const binding =
      ms.workstream && ms.workstream in WORKSTREAM_STAGE
        ? WORKSTREAM_STAGE[ms.workstream]
        : NULL_WORKSTREAM_STAGE;
    const parentKey = stageKey(binding);
    const n = (counters.get(parentKey) ?? 0) + 1;
    counters.set(parentKey, n);
    let order = 70 + n;
    let wbs = `${binding.stageWbs}.${order}`;
    while (usedWbs.has(wbs)) {
      order += 1;
      wbs = `${binding.stageWbs}.${order}`;
    }
    usedWbs.add(wbs);
    map.set(ms.id, { id: ms.id, parentKey, wbs, siblingOrder: order });
  }
  milestoneWbsCatalogue = map;
  return map;
}

export function buildMilestoneAttachments(
  milestones: readonly { id: string; workstream: string | null }[],
): ScheduleMilestoneAttachment[] {
  const catalogue = milestoneWbsById();
  return milestones.map((ms) => {
    const row = catalogue.get(ms.id);
    if (!row) {
      throw new Error(`milestone WBS catalogue missing ${ms.id}`);
    }
    return row;
  });
}

export type EquipmentAttachment = {
  id: string;
  parentKey: string;
  wbs: string;
  siblingOrder: number;
};

let equipmentWbsCatalogue: Map<string, EquipmentAttachment> | null = null;

function equipmentWbsById(): Map<string, EquipmentAttachment> {
  if (equipmentWbsCatalogue) return equipmentWbsCatalogue;
  const sorted = Object.entries(EQUIPMENT_CATALOG)
    .map(([id, row]) => ({
      id,
      workstream: row.workstream,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const counters = new Map<string, number>();
  const usedWbs = new Set(
    Object.values(MILESTONE_WBS_ALIASES).map((m) => m.wbs),
  );
  const map = new Map<string, EquipmentAttachment>();
  for (const eq of sorted) {
    const binding =
      eq.workstream in WORKSTREAM_STAGE
        ? WORKSTREAM_STAGE[eq.workstream]
        : NULL_WORKSTREAM_STAGE;
    const parentKey = stageKey(binding);
    const n = (counters.get(parentKey) ?? 0) + 1;
    counters.set(parentKey, n);
    let order = 80 + n;
    let wbs = `${binding.stageWbs}.${order}`;
    while (usedWbs.has(wbs)) {
      order += 1;
      wbs = `${binding.stageWbs}.${order}`;
    }
    usedWbs.add(wbs);
    map.set(eq.id, { id: eq.id, parentKey, wbs, siblingOrder: order });
  }
  equipmentWbsCatalogue = map;
  return map;
}

export function buildEquipmentAttachments(
  equipment: readonly { id: string; workstream: string }[],
): EquipmentAttachment[] {
  const catalogue = equipmentWbsById();
  return equipment.map((eq) => {
    const row = catalogue.get(eq.id);
    if (!row) {
      throw new Error(`equipment WBS catalogue missing ${eq.id}`);
    }
    return row;
  });
}

export function rollupProgress(
  groupKeyValue: string,
  items: readonly {
    parentKey: string | null;
    kind: string;
    id: string;
    progressPct: number | null;
  }[],
  groupKeys: ReadonlySet<string>,
): number | null {
  const childrenKeys = new Set<string>([groupKeyValue]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of items) {
      if (
        item.parentKey &&
        childrenKeys.has(item.parentKey) &&
        (item.kind === 'project_group' || item.kind === 'stage_group')
      ) {
        const key = `${item.kind}:${item.id}`;
        if (!childrenKeys.has(key) && groupKeys.has(key)) {
          childrenKeys.add(key);
          grew = true;
        }
      }
    }
  }
  const leafKinds = new Set(['work', 'equipment_delivery', 'milestone']);
  const values: number[] = [];
  for (const item of items) {
    if (!item.parentKey || !childrenKeys.has(item.parentKey)) continue;
    if (!leafKinds.has(item.kind)) continue;
    if (item.progressPct == null || !Number.isFinite(item.progressPct))
      continue;
    values.push(item.progressPct);
  }
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round(sum / values.length);
}

/** @deprecated WK nesting handled in analyst import; keep for tests. */
export function nestUnscopedWorks(
  works: readonly ScheduleWorkFixture[],
): ScheduleWorkFixture[] {
  return [...works];
}

export function clampWorkActualsToAsOf(
  works: readonly ScheduleWorkFixture[],
  scenarioAsOfDate: string,
): ScheduleWorkFixture[] {
  return works.map((work) => {
    let actualStart = work.actualStart ?? null;
    let actualEnd = work.actualEnd ?? null;
    if (actualStart != null && actualStart > scenarioAsOfDate) {
      actualStart = null;
      actualEnd = null;
    } else if (actualEnd != null && actualEnd > scenarioAsOfDate) {
      actualEnd = null;
    }
    return { ...work, actualStart, actualEnd };
  });
}

export function mergeDemoTree(
  base: ScheduleWorkSnapshotFixture,
  milestones: readonly { id: string; workstream: string | null }[],
  scenarioAsOfDate?: string,
  snapshotId?: SnapshotId,
): ScheduleWorkSnapshotFixture {
  // Prefer topology from data layer (getScheduleWorkFixture). Tiny unit
  // fixtures without AN-01 keep their own groups/works/links.
  const useImported =
    (base.groups ?? []).some((g) => g.id === 'AN-01' || g.id === 'AN-08') ||
    (base.importedCheckpoints?.length ?? 0) > 0;

  const groups = useImported ? [...(base.groups ?? [])] : (base.groups ?? []);
  let works = useImported
    ? base.works.map((w) => ({ ...w }))
    : nestUnscopedWorks(base.works);
  const links = useImported ? base.links : base.links;

  // Master lifecycle for analyst leaves (asOf + full-graph forecast); WK overlays after.
  const graph =
    snapshotId && scenarioAsOfDate && useImported
      ? getRegisteredLifecycleGraph()
      : null;
  if (snapshotId && scenarioAsOfDate && useImported && graph) {
    works = applyMasterLifecycleToWorks(
      works,
      scenarioAsOfDate,
      snapshotId,
      graph,
    );
  }
  // Work-state overlays only for curated WK showcase ids — not all analyst rows.
  if (snapshotId) {
    works = applyWorkStates(works, snapshotId);
  }
  if (scenarioAsOfDate) {
    works = clampWorkActualsToAsOf(works, scenarioAsOfDate);
  }
  if (snapshotId) {
    works = reconcileWorkFacts(works);
  }

  const attachments =
    useImported && (base.milestoneAttachments?.length ?? 0) > 0
      ? [...(base.milestoneAttachments ?? [])]
      : buildMilestoneAttachments(milestones);

  // Ensure every catalogue milestone has an attachment.
  const have = new Set(attachments.map((a) => a.id));
  for (const row of buildMilestoneAttachments(milestones)) {
    if (!have.has(row.id)) attachments.push(row);
  }

  let importedCheckpoints = base.importedCheckpoints
    ? [...base.importedCheckpoints]
    : undefined;
  let aliasedCheckpoints = base.aliasedCheckpoints
    ? [...base.aliasedCheckpoints]
    : undefined;
  if (snapshotId && scenarioAsOfDate && useImported) {
    const mapKt = <
      T extends {
        wbs: string;
        baselineDate: string;
        forecastDate: string;
        status: ScheduleWorkFixture['status'];
        progressPct: number;
        sourceStatus: string;
        actualStart?: string | null;
        actualEnd?: string | null;
      },
    >(
      list: T[],
    ): T[] => {
      const asWorks = list.map((kt) => ({
        id: kt.wbs,
        wbs: kt.wbs,
        startDate: kt.baselineDate,
        endDate: kt.forecastDate,
        baselineStart: kt.baselineDate,
        // KT zero-duration: end == start on baseline plane
        baselineEnd: kt.baselineDate,
        status: kt.status,
        progressPct: kt.progressPct,
        sourceStatus: kt.sourceStatus,
        actualStart: null as string | null,
        actualEnd: null as string | null,
      }));
      const lived = applyMasterLifecycleToWorks(
        asWorks,
        scenarioAsOfDate,
        snapshotId,
        graph ?? undefined,
      );
      return list.map((kt, i) => ({
        ...kt,
        baselineDate: lived[i].baselineStart ?? kt.baselineDate,
        forecastDate: lived[i].endDate,
        status: lived[i].status,
        progressPct: lived[i].progressPct ?? 0,
        actualStart: lived[i].actualStart ?? null,
        actualEnd: lived[i].actualEnd ?? null,
      }));
    };
    if (importedCheckpoints) importedCheckpoints = mapKt(importedCheckpoints);
    if (aliasedCheckpoints) aliasedCheckpoints = mapKt(aliasedCheckpoints);
  }

  return {
    groups,
    works,
    links,
    milestoneAttachments: attachments,
    importedCheckpoints,
    aliasedCheckpoints,
  };
}

export function workstreamTagForAnalystProject(
  projectId: string,
): WorkstreamId | null {
  return primaryWorkstreamForProject(projectId as never);
}
