/**
 * Build schedule fixtures from analyst parse result.
 * Dates: content-based master-schedule (see schedule-master-simulation.ts).
 * Raw sourceStatus/weeks preserved; sourceWeeks is delay mark, not duration.
 */
import { ANALYST_PROJECTS } from '../../analyst-portfolio';
import type {
  ScheduleGroupFixture,
  ScheduleLinkFixture,
  ScheduleMilestoneAttachment,
  ScheduleWorkFixture,
  ScheduleWorkFixtureStatus,
  ScheduleWorkSnapshotFixture,
} from '../schedule-works';
import {
  MILESTONE_WBS_ALIASES,
  primaryWorkstreamForProject,
} from '../../ws-program-mapping';
import {
  parseAnalystFixture,
  type AnalystParseResult,
  type AnalystRow,
  type AnalystSourceStatus,
} from './analyst-parser';
import {
  MASTER_SIM_ASSUMPTIONS,
  registerLifecycleGraph,
  simulateMasterBaseline,
  type FsEdge,
  type LeafDatePlan,
} from './schedule-master-simulation';

export const ANALYST_STATUS_ANCHOR_SNAPSHOT = 'C' as const;
/** Canonical snapshot C asOf from snapshot-states (narrative anchor, not date generator). */
export const ANALYST_STATUS_ANCHOR_ASOF = '2027-03-01';
export { MASTER_SIM_ASSUMPTIONS };

/**
 * Leaf↔leaf FS edges for CPM — same stage-boundary projection as runtime LNK-A links.
 * Raw stage→stage edges are resolved to boundary checkpoint/work WBS so dating
 * matches the API graph (not only unprojected owner WBS).
 */
export function buildAnalystFsEdges(parsed: AnalystParseResult): FsEdge[] {
  const byWbs = new Map(parsed.rows.map((r) => [r.wbs, r]));
  const toLeaf = (wbs: string): string | null => {
    const row = byWbs.get(wbs);
    if (!row) return null;
    if (row.kind === 'work' || row.kind === 'checkpoint') return wbs;
    if (row.kind === 'stage') return stageBoundaryWbs(wbs, parsed.rows);
    return null;
  };

  const fsEdges: FsEdge[] = [];
  const seen = new Set<string>();
  const push = (fromWbs: string, toWbs: string) => {
    const from = toLeaf(fromWbs);
    const to = toLeaf(toWbs);
    if (!from || !to || from === to) return;
    const key = `${from}->${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    fsEdges.push({ fromWbs: from, toWbs: to, type: 'FS' });
  };

  for (const edge of parsed.edges) {
    for (const f of edge.from) {
      push(f.wbs, edge.toOwnerWbs);
    }
  }
  for (const seam of parsed.seams) {
    for (const ae of seam.atomicEdges) {
      push(ae.fromWbs, ae.toWbs);
    }
  }
  return fsEdges;
}

const MS_BY_WBS = new Map(
  Object.entries(MILESTONE_WBS_ALIASES).map(([id, meta]) => [meta.wbs, id]),
);

function projectIdForNo(no: number): string {
  return `AN-${String(no).padStart(2, '0')}`;
}

function statusToFixture(
  source: AnalystSourceStatus,
): ScheduleWorkFixtureStatus {
  switch (source) {
    case 'completed':
      return 'Completed';
    case 'delayed':
    case 'missed':
      return 'Delayed';
    case 'in_progress':
      return 'OnSchedule';
    case 'waiting':
    default:
      return 'Waiting';
  }
}

/**
 * @deprecated Removed as primary dating. Kept only for WK showcase helpers in tests.
 * Prefer master-sim LeafDatePlan.
 */
export function supplementaryDatesFor(
  _source: AnalystSourceStatus,
  opts: { zeroDuration?: boolean } = {},
): {
  startDate: string;
  endDate: string;
  progressPct: number;
  actualStart: string | null;
  actualEnd: string | null;
} {
  // Showcase-only stub dates; callers pass distinct windows so LNK-FS/SS/FF/SF demos hold.
  const start = '2027-02-18';
  const end = opts.zeroDuration ? start : '2027-02-25';
  return {
    startDate: start,
    endDate: end,
    progressPct: 0,
    actualStart: null,
    actualEnd: null,
  };
}

function planToWorkFields(plan: LeafDatePlan): {
  startDate: string;
  endDate: string;
  baselineStart: string;
  baselineEnd: string;
  progressPct: number;
  actualStart: string | null;
  actualEnd: string | null;
} {
  return {
    startDate: plan.forecastStart,
    endDate: plan.forecastEnd,
    baselineStart: plan.baselineStart,
    baselineEnd: plan.baselineEnd,
    // Lifecycle applied per-snapshot in mergeDemoTree; topology defaults Waiting/0.
    progressPct: 0,
    actualStart: null,
    actualEnd: null,
  };
}

function parentStageKey(row: AnalystRow): string {
  if (row.kind === 'stage') {
    return `project_group:${projectIdForNo(row.projectNo)}`;
  }
  const parts = row.wbs.split('.');
  if (parts.length < 2) return `project_group:${projectIdForNo(row.projectNo)}`;
  return `stage_group:${parts.slice(0, 2).join('.')}`;
}

function siblingOrder(wbs: string): number {
  const last = Number(wbs.split('.').pop());
  return Number.isFinite(last) ? last - 1 : 0;
}

export type ImportedCheckpointFixture = {
  id: string;
  name: string;
  parentKey: string;
  wbs: string;
  siblingOrder: number;
  workstream: string | null;
  sourceStatus: AnalystSourceStatus;
  sourceWeeks: number | null;
  status: ScheduleWorkFixtureStatus;
  baselineDate: string;
  forecastDate: string;
  progressPct: number;
  rag: 'Green' | 'Red';
  actualStart?: string | null;
  actualEnd?: string | null;
};

export type LinkAuditRow = {
  sourceEdgeId: string;
  raw: string;
  arrow: 'intra' | 'cross';
  fromWbs: string;
  toWbs: string;
  canonicalSourceRef: string;
  canonicalTargetRef: string;
  projection: 'direct' | 'stage_boundary' | 'seam' | 'alias';
  renderKind: 'scheduling' | 'cross_project_predecessor' | 'dropped';
  note?: string;
};

export type AnalystScheduleBuild = {
  parse: AnalystParseResult;
  fixture: ScheduleWorkSnapshotFixture & {
    importedCheckpoints: ImportedCheckpointFixture[];
    aliasedCheckpoints: ImportedCheckpointFixture[];
  };
  skippedCheckpointWbs: string[];
  linkAudit: LinkAuditRow[];
  importCoverage: {
    projects: number;
    stages: number;
    works: number;
    checkpoints: number;
    checkpointsAliasedToMs: number;
    linksScheduling: number;
    linksCross: number;
    linkAuditRows: number;
    droppedCount: number;
    droppedResolvableCount: number;
    seamAtomicEdges: number;
    unresolved: string[];
    cycles: string[][];
    statusContradictions: string[];
  };
};

type Ref =
  | { kind: 'work'; id: string; wbs: string }
  | { kind: 'milestone'; id: string; wbs: string }
  | { kind: 'stage'; id: string; wbs: string }
  | { kind: 'project'; id: string; wbs: string };

function resolveRef(
  wbs: string,
  byWbs: Map<string, AnalystRow>,
  workIds: Set<string>,
  checkpointIds: Map<string, string>,
): Ref | null {
  const aliasMs = MS_BY_WBS.get(wbs);
  if (aliasMs) return { kind: 'milestone', id: aliasMs, wbs };
  const row = byWbs.get(wbs);
  if (!row) return null;
  if (row.kind === 'stage') return { kind: 'stage', id: wbs, wbs };
  if (row.kind === 'work') {
    if (!workIds.has(wbs)) return null;
    return { kind: 'work', id: wbs, wbs };
  }
  // checkpoint
  const ktId = checkpointIds.get(wbs);
  if (ktId) return { kind: 'milestone', id: ktId, wbs };
  return null;
}

/** One boundary leaf under a stage: prefer checkpoint, else last work. */
function stageBoundaryWbs(
  stageWbs: string,
  rows: readonly AnalystRow[],
): string | null {
  const prefix = `${stageWbs}.`;
  const children = rows.filter(
    (r) =>
      r.wbs.startsWith(prefix) &&
      !r.wbs.slice(prefix.length).includes('.') &&
      (r.kind === 'work' || r.kind === 'checkpoint'),
  );
  if (children.length === 0) return null;
  const kt = [...children].reverse().find((r) => r.kind === 'checkpoint');
  if (kt) return kt.wbs;
  return children[children.length - 1]?.wbs ?? null;
}

function refToLinkToken(ref: Ref): string {
  if (ref.kind === 'work') return `work:${ref.id}`;
  if (ref.kind === 'milestone') return `milestone:${ref.id}`;
  if (ref.kind === 'stage') return `stage_group:${ref.id}`;
  return `project_group:${ref.id}`;
}

export function buildAnalystScheduleFixture(
  parsed: AnalystParseResult = parseAnalystFixture(),
): AnalystScheduleBuild {
  const projectMeta = new Map(ANALYST_PROJECTS.map((p) => [p.id, p] as const));
  const byWbs = new Map(parsed.rows.map((r) => [r.wbs, r]));
  const groups: ScheduleGroupFixture[] = [];
  const works: ScheduleWorkFixture[] = [];
  const importedCheckpoints: ImportedCheckpointFixture[] = [];
  const aliasedCheckpoints: ImportedCheckpointFixture[] = [];
  const milestoneAttachments: ScheduleMilestoneAttachment[] = [];
  const skippedCheckpointWbs: string[] = [];
  const checkpointIds = new Map<string, string>();

  const fsEdges = buildAnalystFsEdges(parsed);
  const master = simulateMasterBaseline(parsed.rows, fsEdges);
  registerLifecycleGraph({
    edges: fsEdges,
    rows: parsed.rows,
    baselineByWbs: master.byWbs,
  });
  const planOf = (wbs: string): LeafDatePlan => {
    const p = master.byWbs.get(wbs);
    if (p) return p;
    // Fallback should not happen for leaves; keep window start.
    return {
      wbs,
      baselineStart: ANALYST_STATUS_ANCHOR_ASOF,
      baselineEnd: ANALYST_STATUS_ANCHOR_ASOF,
      forecastStart: ANALYST_STATUS_ANCHOR_ASOF,
      forecastEnd: ANALYST_STATUS_ANCHOR_ASOF,
      durationDays: 0,
    };
  };

  for (const project of parsed.projects) {
    const id = projectIdForNo(project.no);
    const catalog = projectMeta.get(id as never);
    groups.push({
      id,
      kind: 'project_group',
      name: catalog?.name ?? project.name,
      parentKey: null,
      wbs: String(project.no),
      siblingOrder: project.no - 1,
      progressPct: null,
      sourceWeeks: null,
    });
  }

  const stages = parsed.rows.filter((r) => r.kind === 'stage');
  for (const stage of stages) {
    groups.push({
      id: stage.wbs,
      kind: 'stage_group',
      name: stage.name,
      parentKey: `project_group:${projectIdForNo(stage.projectNo)}`,
      wbs: stage.wbs,
      siblingOrder: siblingOrder(stage.wbs),
      progressPct: null,
      sourceWeeks: stage.sourceWeeks,
    });
  }

  let aliased = 0;
  for (const row of parsed.rows) {
    if (row.kind === 'work') {
      const ws =
        primaryWorkstreamForProject(projectIdForNo(row.projectNo) as never) ??
        null;
      const fields = planToWorkFields(planOf(row.wbs));
      works.push({
        id: row.wbs,
        name: row.name,
        workstream: ws,
        startDate: fields.startDate,
        endDate: fields.endDate,
        // Display status overwritten per asOf in mergeDemoTree; keep source mapping as seed.
        status: statusToFixture(row.sourceStatus),
        parentKey: parentStageKey(row),
        wbs: row.wbs,
        siblingOrder: siblingOrder(row.wbs),
        progressPct: fields.progressPct,
        sourceWeeks: row.sourceWeeks,
        sourceStatus: row.sourceStatus,
        baselineStart: fields.baselineStart,
        baselineEnd: fields.baselineEnd,
        actualStart: fields.actualStart,
        actualEnd: fields.actualEnd,
      });
      continue;
    }
    if (row.kind !== 'checkpoint') continue;

    const aliasMs = MS_BY_WBS.get(row.wbs);
    if (aliasMs) {
      skippedCheckpointWbs.push(row.wbs);
      aliased += 1;
      const fields = planToWorkFields(planOf(row.wbs));
      milestoneAttachments.push({
        id: aliasMs,
        parentKey: parentStageKey(row),
        wbs: row.wbs,
        siblingOrder: siblingOrder(row.wbs),
      });
      checkpointIds.set(row.wbs, aliasMs);
      aliasedCheckpoints.push({
        id: aliasMs,
        name: row.name,
        parentKey: parentStageKey(row),
        wbs: row.wbs,
        siblingOrder: siblingOrder(row.wbs),
        workstream:
          primaryWorkstreamForProject(projectIdForNo(row.projectNo) as never) ??
          null,
        sourceStatus: row.sourceStatus,
        sourceWeeks: row.sourceWeeks,
        status: statusToFixture(row.sourceStatus),
        baselineDate: fields.baselineStart,
        forecastDate: fields.endDate,
        progressPct: fields.progressPct,
        rag:
          row.sourceStatus === 'missed' || row.sourceStatus === 'delayed'
            ? 'Red'
            : 'Green',
      });
      continue;
    }

    const fields = planToWorkFields(planOf(row.wbs));
    const id = `KT-${row.wbs}`;
    checkpointIds.set(row.wbs, id);
    const status = statusToFixture(row.sourceStatus);
    importedCheckpoints.push({
      id,
      name: row.name,
      parentKey: parentStageKey(row),
      wbs: row.wbs,
      siblingOrder: siblingOrder(row.wbs),
      workstream:
        primaryWorkstreamForProject(projectIdForNo(row.projectNo) as never) ??
        null,
      sourceStatus: row.sourceStatus,
      sourceWeeks: row.sourceWeeks,
      status,
      baselineDate: fields.baselineStart,
      forecastDate: fields.endDate,
      progressPct: fields.progressPct,
      rag:
        row.sourceStatus === 'missed' || row.sourceStatus === 'delayed'
          ? 'Red'
          : 'Green',
    });
  }

  // Demo arrow-type showcase (collision-free WBS under 8.2).
  // Dates satisfy LNK-SS/FS/FF/SF among WK-* (type gallery, not analyst CPM).
  const showcaseDates = {
    'WK-01': {
      startDate: '2027-02-18',
      endDate: '2027-02-25',
      progressPct: 0,
      actualStart: null as string | null,
      actualEnd: null as string | null,
    },
    'WK-02': {
      startDate: '2027-02-18',
      endDate: '2027-02-22',
      progressPct: 0,
      actualStart: null as string | null,
      actualEnd: null as string | null,
    },
    'WK-03': {
      startDate: '2027-02-25',
      endDate: '2027-03-04',
      progressPct: 0,
      actualStart: null as string | null,
      actualEnd: null as string | null,
    },
    'WK-04': {
      startDate: '2027-02-25',
      endDate: '2027-03-04',
      progressPct: 0,
      actualStart: null as string | null,
      actualEnd: null as string | null,
    },
    'WK-05': {
      startDate: '2027-03-04',
      endDate: '2027-03-04',
      progressPct: 0,
      actualStart: null as string | null,
      actualEnd: null as string | null,
    },
  } as const;
  const showcase: ScheduleWorkFixture[] = [
    {
      id: 'WK-01',
      name: 'Монтаж стеновых панелей (demo SS/FS)',
      workstream: 'WS-CLN',
      ...showcaseDates['WK-01'],
      status: 'Completed',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.90',
      siblingOrder: 90,
      sourceWeeks: null,
      baselineStart: showcaseDates['WK-01'].startDate,
      baselineEnd: showcaseDates['WK-01'].endDate,
    },
    {
      id: 'WK-02',
      name: 'Герметизация стыков (demo SS)',
      workstream: 'WS-CLN',
      ...showcaseDates['WK-02'],
      status: 'Completed',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.91',
      siblingOrder: 91,
      sourceWeeks: null,
      baselineStart: showcaseDates['WK-02'].startDate,
      baselineEnd: showcaseDates['WK-02'].endDate,
    },
    {
      id: 'WK-03',
      name: 'Установка дверей (demo FS/FF)',
      workstream: 'WS-CLN',
      ...showcaseDates['WK-03'],
      status: 'Delayed',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.92',
      siblingOrder: 92,
      sourceWeeks: null,
      baselineStart: showcaseDates['WK-03'].startDate,
      baselineEnd: showcaseDates['WK-03'].endDate,
    },
    {
      id: 'WK-04',
      name: 'Потолочные панели (demo FF/SF)',
      workstream: 'WS-CLN',
      ...showcaseDates['WK-04'],
      status: 'Waiting',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.93',
      siblingOrder: 93,
      sourceWeeks: null,
      baselineStart: showcaseDates['WK-04'].startDate,
      baselineEnd: showcaseDates['WK-04'].endDate,
    },
    {
      id: 'WK-05',
      name: 'Финишная приёмка зоны (demo SF)',
      workstream: 'WS-CLN',
      ...showcaseDates['WK-05'],
      status: 'Waiting',
      parentKey: 'stage_group:8.2',
      wbs: '8.2.94',
      siblingOrder: 94,
      sourceWeeks: null,
      baselineStart: showcaseDates['WK-05'].startDate,
      baselineEnd: showcaseDates['WK-05'].endDate,
    },
  ];
  works.push(...showcase);

  const workIds = new Set(works.map((w) => w.id));

  const links: ScheduleLinkFixture[] = [];
  const linkAudit: LinkAuditRow[] = [];
  const unresolved: string[] = [];
  let linkSeq = 0;

  const toEndpointWbs = (
    wbs: string,
  ): { wbs: string; projection: LinkAuditRow['projection'] } => {
    const row = byWbs.get(wbs);
    if (!row) return { wbs, projection: 'direct' };
    if (row.kind === 'stage') {
      const boundary = stageBoundaryWbs(wbs, parsed.rows);
      if (!boundary) return { wbs, projection: 'stage_boundary' };
      return { wbs: boundary, projection: 'stage_boundary' };
    }
    if (row.kind === 'work' || row.kind === 'checkpoint') {
      return {
        wbs,
        projection: MS_BY_WBS.has(wbs) ? 'alias' : 'direct',
      };
    }
    return { wbs, projection: 'direct' };
  };

  const emitEdge = (
    edgeId: string,
    raw: string,
    arrow: 'intra' | 'cross',
    fromWbsRaw: string,
    toWbsRaw: string,
    projectionHint: LinkAuditRow['projection'],
  ) => {
    const fromB = toEndpointWbs(fromWbsRaw);
    const toB = toEndpointWbs(toWbsRaw);
    const fromRef = resolveRef(fromB.wbs, byWbs, workIds, checkpointIds);
    const toRef = resolveRef(toB.wbs, byWbs, workIds, checkpointIds);
    const projection =
      projectionHint !== 'direct'
        ? projectionHint
        : fromB.projection !== 'direct' || toB.projection !== 'direct'
          ? fromB.projection === 'alias' || toB.projection === 'alias'
            ? 'alias'
            : 'stage_boundary'
          : 'direct';

    if (!fromRef || !toRef) {
      unresolved.push(`${fromWbsRaw}->${toWbsRaw}`);
      linkAudit.push({
        sourceEdgeId: edgeId,
        raw,
        arrow,
        fromWbs: fromWbsRaw,
        toWbs: toWbsRaw,
        canonicalSourceRef: fromRef
          ? refToLinkToken(fromRef)
          : `unresolved:${fromWbsRaw}`,
        canonicalTargetRef: toRef
          ? refToLinkToken(toRef)
          : `unresolved:${toWbsRaw}`,
        projection,
        renderKind: 'dropped',
        note: 'unresolved endpoint',
      });
      return;
    }

    // Group-level typed edges stay documented in audit; render via boundary leaf refs.
    const sourceToken = refToLinkToken(
      fromRef.kind === 'stage' || fromRef.kind === 'project'
        ? (resolveRef(fromB.wbs, byWbs, workIds, checkpointIds) ?? fromRef)
        : fromRef,
    );
    const targetToken = refToLinkToken(
      toRef.kind === 'stage' || toRef.kind === 'project'
        ? (resolveRef(toB.wbs, byWbs, workIds, checkpointIds) ?? toRef)
        : toRef,
    );

    const srcLeaf =
      sourceToken.startsWith('work:') || sourceToken.startsWith('milestone:');
    const tgtLeaf =
      targetToken.startsWith('work:') || targetToken.startsWith('milestone:');

    if (!srcLeaf || !tgtLeaf) {
      linkAudit.push({
        sourceEdgeId: edgeId,
        raw,
        arrow,
        fromWbs: fromWbsRaw,
        toWbs: toWbsRaw,
        canonicalSourceRef: sourceToken,
        canonicalTargetRef: targetToken,
        projection,
        renderKind: 'dropped',
        note: `non-leaf after projection ${sourceToken}→${targetToken}`,
      });
      return;
    }

    linkSeq += 1;
    if (arrow === 'cross') {
      const id = `LNK-X-${String(linkSeq).padStart(4, '0')}`;
      links.push({
        id,
        kind: 'cross_project_predecessor',
        sourceRef: sourceToken,
        targetRef: targetToken,
      });
      linkAudit.push({
        sourceEdgeId: edgeId,
        raw,
        arrow,
        fromWbs: fromWbsRaw,
        toWbs: toWbsRaw,
        canonicalSourceRef: sourceToken,
        canonicalTargetRef: targetToken,
        projection,
        renderKind: 'cross_project_predecessor',
      });
      return;
    }

    const id = `LNK-A-${String(linkSeq).padStart(4, '0')}`;
    links.push({
      id,
      kind: 'scheduling',
      sourceRef: sourceToken,
      targetRef: targetToken,
      type: 'FS',
    });
    linkAudit.push({
      sourceEdgeId: edgeId,
      raw,
      arrow,
      fromWbs: fromWbsRaw,
      toWbs: toWbsRaw,
      canonicalSourceRef: sourceToken,
      canonicalTargetRef: targetToken,
      projection,
      renderKind: 'scheduling',
    });
  };

  // Source edges (one projected link per from×to pair of the edge, not full stage cartesian of all leaves).
  let edgeIdx = 0;
  for (const edge of parsed.edges) {
    edgeIdx += 1;
    const edgeId = `EDGE-${String(edgeIdx).padStart(4, '0')}`;
    for (const from of edge.from) {
      emitEdge(
        edgeId,
        edge.raw,
        edge.arrow,
        from.wbs,
        edge.toOwnerWbs,
        edge.needsProjection ? 'stage_boundary' : 'direct',
      );
    }
  }

  // Critical seams → edge union via arrow-group atomic edges (fan-out / chain).
  for (const seam of parsed.seams) {
    for (const atomic of seam.atomicEdges) {
      emitEdge(
        seam.id,
        seam.rawDependency,
        atomic.arrow,
        atomic.fromWbs,
        atomic.toWbs,
        'seam',
      );
    }
  }

  // Demo four arrow types + curated cross demos.
  links.push(
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
    {
      id: 'LNK-X-PANEL-CLN',
      kind: 'cross_project_predecessor',
      sourceRef: 'milestone:MS-CLN-PANEL',
      targetRef: 'work:WK-05',
    },
  );

  const droppedResolvable = linkAudit.filter(
    (a) =>
      a.renderKind === 'dropped' &&
      !a.canonicalSourceRef.startsWith('unresolved:') &&
      !a.canonicalTargetRef.startsWith('unresolved:'),
  );
  const fixture = {
    groups,
    works,
    links,
    milestoneAttachments,
    importedCheckpoints,
    aliasedCheckpoints,
  };

  return {
    parse: parsed,
    fixture,
    skippedCheckpointWbs,
    linkAudit,
    importCoverage: {
      projects: parsed.projects.length,
      stages: stages.length,
      works: works.filter((w) => !w.id.startsWith('WK-')).length,
      checkpoints: importedCheckpoints.length + aliased,
      checkpointsAliasedToMs: aliased,
      linksScheduling: links.filter(
        (l) => (l.kind ?? 'scheduling') === 'scheduling',
      ).length,
      linksCross: links.filter((l) => l.kind === 'cross_project_predecessor')
        .length,
      linkAuditRows: linkAudit.length,
      droppedCount: linkAudit.filter((a) => a.renderKind === 'dropped').length,
      droppedResolvableCount: droppedResolvable.length,
      seamAtomicEdges: parsed.seams.reduce(
        (n, s) => n + s.atomicEdges.length,
        0,
      ),
      unresolved: [...new Set(unresolved)],
      cycles: parsed.cycles,
      statusContradictions: parsed.statusContradictions,
    },
  };
}
