import { SNAPSHOT_IDS, type SnapshotId } from '../snapshot/snapshot-id';
import { DECISION_CATALOG } from './fixtures/catalog';
import {
  DECISION_EXECUTION_OBSERVATIONS,
  type DecisionExecutionObservationFixture,
  type DecisionExecutionStatusValue,
} from './fixtures/decision-execution-observations';
import type { SnapshotFixture } from './fixtures/types';

export type DecisionExecutionStatus = 'unknown' | DecisionExecutionStatusValue;

export type DecisionExecutionView = {
  status: DecisionExecutionStatus;
  execution: null | {
    status: DecisionExecutionStatusValue;
    evidenceNote: string;
    source: { kind: 'demo'; label: string };
    updatedAt: string;
    observationId: string;
    asOfDate: string;
  };
};

export type DecisionCatalogLike = Record<string, { first: SnapshotId }>;

function snapshotIndex(id: SnapshotId): number {
  return SNAPSHOT_IDS.indexOf(id);
}

export function isSnapshotAtOrAfter(
  current: SnapshotId,
  first: SnapshotId,
): boolean {
  return snapshotIndex(current) >= snapshotIndex(first);
}

/** Strict calendar YYYY-MM-DD (rejects 2027-99-99, leap errors). */
export function isValidIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(5, 7));
  const d = Number(value.slice(8, 10));
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

/** Exported for unit coverage of stable ordering (incl. id tie-break). */
export function compareDecisionExecutionObservations(
  a: DecisionExecutionObservationFixture,
  b: DecisionExecutionObservationFixture,
): number {
  if (a.asOfDate !== b.asOfDate) {
    return a.asOfDate < b.asOfDate ? -1 : 1;
  }
  const bySnap =
    snapshotIndex(a.effectiveFromSnapshot) -
    snapshotIndex(b.effectiveFromSnapshot);
  if (bySnap !== 0) return bySnap;
  // Explicit stable id tie-break (collisions of same decision/date/snap are rejected).
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Pure validator — usable with custom observations (no global mutation).
 * Fail-closed catalog rules for demo execution observations.
 */
export function validateDecisionExecutionObservations(
  observations: readonly DecisionExecutionObservationFixture[],
  catalog: DecisionCatalogLike = DECISION_CATALOG,
): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const collisionKeys = new Set<string>();

  for (const o of observations) {
    if (seenIds.has(o.id)) {
      errors.push(`duplicate observation id ${o.id}`);
    }
    seenIds.add(o.id);

    if (!(o.decisionId in catalog)) {
      errors.push(`unknown decisionId ${o.decisionId} on ${o.id}`);
    } else {
      const first = catalog[o.decisionId].first;
      if (!isSnapshotId(o.effectiveFromSnapshot)) {
        errors.push(`${o.id}: invalid effectiveFromSnapshot`);
      } else if (!isSnapshotAtOrAfter(o.effectiveFromSnapshot, first)) {
        errors.push(
          `${o.id}: effectiveFrom ${o.effectiveFromSnapshot} before decision first ${first}`,
        );
      }
    }

    if (!isValidIsoCalendarDate(o.asOfDate)) {
      errors.push(`${o.id}: invalid asOfDate ${o.asOfDate}`);
    }
    if (!isValidIsoCalendarDate(o.updatedAt)) {
      errors.push(`${o.id}: invalid updatedAt ${o.updatedAt}`);
    }
    if (o.updatedAt !== o.asOfDate) {
      errors.push(`${o.id}: updatedAt must equal asOfDate in demo catalog`);
    }
    if (o.source.kind !== 'demo') {
      errors.push(`${o.id}: source.kind must be demo`);
    }

    const collisionKey = `${o.decisionId}|${o.asOfDate}|${o.effectiveFromSnapshot}`;
    if (collisionKeys.has(collisionKey)) {
      errors.push(
        `${o.id}: collision decision/asOf/effectiveFrom ${collisionKey}`,
      );
    }
    collisionKeys.add(collisionKey);
  }

  return errors;
}

export function listDecisionExecutionIntegrityErrors(): string[] {
  return validateDecisionExecutionObservations(
    DECISION_EXECUTION_OBSERVATIONS,
    DECISION_CATALOG,
  );
}

/** Spy seam for fail-closed unit tests (no fixture mutation). */
export const decisionExecutionIntegrity = {
  listErrors: listDecisionExecutionIntegrityErrors,
};

/**
 * Latest visible observation for a decision in a snapshot.
 * Requires the Decision record to exist on the snapshot (not catalog-only).
 * Fail-closed if catalog integrity is broken.
 */
export function resolveDecisionExecution(
  decisionId: string,
  snapshot: SnapshotFixture,
): DecisionExecutionView {
  // Call via export object so tests can spy fail-closed without mutating globals.
  const integrity = decisionExecutionIntegrity.listErrors();
  if (integrity.length > 0) {
    throw new Error(
      `Decision execution catalog invalid: ${integrity.join('; ')}`,
    );
  }

  const recordPresent = snapshot.decisions.some((d) => d.id === decisionId);
  if (!recordPresent) {
    return { status: 'unknown', execution: null };
  }

  const snapId = snapshot.id;
  const asOf = snapshot.scenarioAsOfDate;
  const visible = DECISION_EXECUTION_OBSERVATIONS.filter(
    (o) =>
      o.decisionId === decisionId &&
      isSnapshotAtOrAfter(snapId, o.effectiveFromSnapshot) &&
      o.asOfDate <= asOf,
  ).sort(compareDecisionExecutionObservations);

  const latest = visible[visible.length - 1];
  if (!latest) {
    return { status: 'unknown', execution: null };
  }

  return {
    status: latest.status,
    execution: {
      status: latest.status,
      evidenceNote: latest.evidenceNote,
      source: { ...latest.source },
      updatedAt: latest.updatedAt,
      observationId: latest.id,
      asOfDate: latest.asOfDate,
    },
  };
}

/** Module load / fixture bootstrap — throw if demo catalog is corrupt. */
export function assertDecisionExecutionCatalogOrThrow(): void {
  const errors = decisionExecutionIntegrity.listErrors();
  if (errors.length > 0) {
    throw new Error(`Decision execution catalog invalid: ${errors.join('; ')}`);
  }
}

assertDecisionExecutionCatalogOrThrow();
