/**
 * Builds discrete SnapshotFixture A–S from catalog + snapshot-states overlays.
 */
import {
  SNAPSHOT_IDS,
  type PopulatedSnapshotId,
} from '../../snapshot/snapshot-id';
import {
  DECISION_CATALOG,
  DECISION_IDS,
  EQUIPMENT_CATALOG,
  EQUIPMENT_IDS,
  ISSUE_CATALOG,
  MILESTONE_CATALOG,
  MILESTONE_IDS,
  PROJECT,
  RISK_CATALOG,
  RISK_IDS,
  type DecisionId,
  type IssueId,
  type RiskId,
} from './catalog';
import { addDays } from './dates';
import { EQUIPMENT_RESPONSIBLE_PERSON } from './person-catalog';
import { SNAPSHOT_STATES } from './snapshot-states';
import type {
  DecisionFixture,
  EquipmentFixture,
  IssueFixture,
  MilestoneFixture,
  RiskFixture,
  SnapshotFixture,
  SnapshotId,
} from './types';

/** Chronological order for A–S (catalog `first` comparisons). */
const SNAPSHOT_ORDER: readonly SnapshotId[] = SNAPSHOT_IDS;

function snapshotIndex(id: SnapshotId): number {
  return SNAPSHOT_ORDER.indexOf(id);
}

function isAtOrAfter(current: SnapshotId, first: SnapshotId): boolean {
  return snapshotIndex(current) >= snapshotIndex(first);
}

function buildEquipment(snapshotId: PopulatedSnapshotId): EquipmentFixture[] {
  const state = SNAPSHOT_STATES[snapshotId];
  const { eqDelta, eqStatus } = state;
  return EQUIPMENT_IDS.map((id) => {
    const cat = EQUIPMENT_CATALOG[id];
    const delta = eqDelta[id] ?? 0;
    const forecastDelivery = addDays(cat.baselineDelivery, delta);
    // Default enrichment semantics: positive schedule variance ⇒ Delayed.
    // asOf does NOT imply actual delivery. Optional eqStatus is fixture-authored
    // operational recovery/completion only (e.g. S HVAC after PS achieved).
    const status = eqStatus?.[id] ?? (delta > 0 ? 'Delayed' : 'OnTrack');
    return {
      id,
      projectId: PROJECT.id,
      name: cat.name,
      critical: cat.critical,
      baselineDelivery: cat.baselineDelivery,
      forecastDelivery,
      status,
      workstream: cat.workstream,
      responsiblePersonId: EQUIPMENT_RESPONSIBLE_PERSON[id] ?? null,
    };
  });
}

function buildMilestones(snapshotId: PopulatedSnapshotId): MilestoneFixture[] {
  const { msDelta, msRag } = SNAPSHOT_STATES[snapshotId];
  return MILESTONE_IDS.map((id) => {
    const cat = MILESTONE_CATALOG[id];
    const delta = msDelta[id] ?? 0;
    return {
      id,
      name: cat.name,
      baselineDate: cat.baselineDate,
      forecastDate: addDays(cat.baselineDate, delta),
      rag: msRag[id] ?? 'Green',
      workstream: cat.workstream,
    };
  });
}

function buildIssues(snapshotId: PopulatedSnapshotId): IssueFixture[] {
  const { issues } = SNAPSHOT_STATES[snapshotId];
  const result: IssueFixture[] = [];
  for (const id of Object.keys(issues) as IssueId[]) {
    const status = issues[id];
    if (!status) continue;
    const cat = ISSUE_CATALOG[id];
    result.push({
      id,
      title: cat.title,
      status,
      ownerPersonId: cat.ownerPersonId,
      equipmentId: cat.equipmentId,
      milestoneId: cat.milestoneId,
      workstream: cat.workstream,
    });
  }
  return result;
}

function buildRisks(snapshotId: PopulatedSnapshotId): RiskFixture[] {
  const { riskRag, issues } = SNAPSHOT_STATES[snapshotId];
  const result: RiskFixture[] = [];
  for (const id of RISK_IDS) {
    const cat = RISK_CATALOG[id];
    if (!isAtOrAfter(snapshotId, cat.first)) continue;
    const rag = riskRag[id];
    if (!rag) continue;

    let issueId = cat.issueId;
    if (issueId && !issues[issueId]) {
      issueId = null;
    }

    result.push({
      id,
      title: cat.title,
      rag,
      milestoneId: cat.milestoneId,
      equipmentId: cat.equipmentId,
      issueId,
      workstream: cat.workstream,
    });
  }
  return result;
}

function buildDecisions(snapshotId: PopulatedSnapshotId): DecisionFixture[] {
  const result: DecisionFixture[] = [];
  for (const id of DECISION_IDS) {
    const cat = DECISION_CATALOG[id];
    if (!isAtOrAfter(snapshotId, cat.first)) continue;
    result.push({
      id,
      projectId: cat.projectId,
      milestoneId: cat.milestoneId,
      type: cat.type,
      ownerPersonId: cat.ownerPersonId,
      dueDate: cat.dueDate,
      note: cat.note,
    });
  }
  return result;
}

export function buildSnapshot(
  snapshotId: PopulatedSnapshotId,
): SnapshotFixture {
  const state = SNAPSHOT_STATES[snapshotId];
  return {
    id: snapshotId,
    scenarioAsOfDate: state.asOf,
    project: {
      id: PROJECT.id,
      name: PROJECT.name,
      baselineProductionStart: PROJECT.baselineProductionStart,
      forecastProductionStart: state.psForecast,
    },
    equipment: buildEquipment(snapshotId),
    milestones: buildMilestones(snapshotId),
    issues: buildIssues(snapshotId),
    risks: buildRisks(snapshotId),
    decisions: buildDecisions(snapshotId),
    executiveMilestoneIds: [...state.executiveMilestoneIds],
    topExceptions: state.topExceptions.map((t) => ({
      ...t,
      links: [...t.links],
    })),
    trend: {
      better: [...state.trend.better],
      worse: [...state.trend.worse],
      unchangedCritical: [...state.trend.unchangedCritical],
    },
  };
}

export function buildAllSnapshots(): Record<
  PopulatedSnapshotId,
  SnapshotFixture
> {
  const out = {} as Record<PopulatedSnapshotId, SnapshotFixture>;
  for (const id of Object.keys(SNAPSHOT_STATES) as PopulatedSnapshotId[]) {
    out[id] = buildSnapshot(id);
  }
  return out;
}

/** Decision IDs present at snapshot (for tests). */
export function decisionsPresentAt(
  snapshotId: PopulatedSnapshotId,
): DecisionId[] {
  return DECISION_IDS.filter((id) =>
    isAtOrAfter(snapshotId, DECISION_CATALOG[id].first),
  );
}

/** Issue IDs present at snapshot (for tests). */
export function issuesPresentAt(snapshotId: PopulatedSnapshotId): IssueId[] {
  return Object.keys(SNAPSHOT_STATES[snapshotId].issues) as IssueId[];
}

/** Risk IDs present at snapshot (for tests). */
export function risksPresentAt(snapshotId: PopulatedSnapshotId): RiskId[] {
  return Object.keys(SNAPSHOT_STATES[snapshotId].riskRag) as RiskId[];
}
