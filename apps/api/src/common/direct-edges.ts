import type { SnapshotFixture } from '../data/fixtures/types';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from '../data/snapshot-access';

export type EntityRefType =
  'equipment' | 'issue' | 'risk' | 'milestone' | 'decision';

/** DOC-BA-015 directed edge (no EQ—MS; Decision→MS optional; no Decision→EQ/ISS/RISK). */
export type DirectEdge = {
  kind: 'direct';
  fromType: EntityRefType;
  fromId: string;
  toType: EntityRefType;
  toId: string;
};

export type EntityLink = {
  targetType: Exclude<EntityRefType, 'decision'> | 'decision';
  targetId: string;
  displayName: string;
};

function pushEdge(
  edges: DirectEdge[],
  seen: Set<string>,
  edge: DirectEdge,
): void {
  const key = `${edge.fromType}:${edge.fromId}->${edge.toType}:${edge.toId}`;
  if (seen.has(key)) return;
  seen.add(key);
  edges.push(edge);
}

/**
 * Canonical direct Domain edges for the snapshot.
 * Reciprocal presentation is built by {@link linksForEntity}.
 */
export function buildDirectEdges(snapshot: SnapshotFixture): DirectEdge[] {
  const edges: DirectEdge[] = [];
  const seen = new Set<string>();

  for (const risk of snapshot.risks) {
    if (risk.equipmentId) {
      pushEdge(edges, seen, {
        kind: 'direct',
        fromType: 'equipment',
        fromId: risk.equipmentId,
        toType: 'risk',
        toId: risk.id,
      });
    }
    if (risk.milestoneId) {
      pushEdge(edges, seen, {
        kind: 'direct',
        fromType: 'risk',
        fromId: risk.id,
        toType: 'milestone',
        toId: risk.milestoneId,
      });
    }
    if (risk.issueId) {
      pushEdge(edges, seen, {
        kind: 'direct',
        fromType: 'issue',
        fromId: risk.issueId,
        toType: 'risk',
        toId: risk.id,
      });
    }
  }

  for (const issue of snapshot.issues) {
    pushEdge(edges, seen, {
      kind: 'direct',
      fromType: 'equipment',
      fromId: issue.equipmentId,
      toType: 'issue',
      toId: issue.id,
    });
    if (issue.milestoneId) {
      pushEdge(edges, seen, {
        kind: 'direct',
        fromType: 'issue',
        fromId: issue.id,
        toType: 'milestone',
        toId: issue.milestoneId,
      });
    }
  }

  for (const decision of snapshot.decisions) {
    if (decision.milestoneId) {
      pushEdge(edges, seen, {
        kind: 'direct',
        fromType: 'decision',
        fromId: decision.id,
        toType: 'milestone',
        toId: decision.milestoneId,
      });
    }
  }

  return edges;
}

function displayNameFor(
  snapshot: SnapshotFixture,
  type: EntityRefType,
  id: string,
): string {
  if (type === 'equipment') {
    return findEquipment(snapshot, id)?.name ?? id;
  }
  if (type === 'risk') {
    return findRisk(snapshot, id)?.title ?? id;
  }
  if (type === 'milestone') {
    return findMilestone(snapshot, id)?.name ?? id;
  }
  if (type === 'issue') {
    return findIssue(snapshot, id)?.title ?? id;
  }
  if (type === 'decision') {
    const d = snapshot.decisions.find((x) => x.id === id);
    return d?.note ?? id;
  }
  return id;
}

/** Reciprocal Links for one entity — DOC-BA-015 only; never EQ—MS. */
export function linksForEntity(
  snapshot: SnapshotFixture,
  entityType: EntityRefType,
  entityId: string,
): EntityLink[] {
  const links: EntityLink[] = [];
  const seen = new Set<string>();

  for (const edge of buildDirectEdges(snapshot)) {
    let targetType: EntityRefType | null = null;
    let targetId: string | null = null;
    if (edge.fromType === entityType && edge.fromId === entityId) {
      targetType = edge.toType;
      targetId = edge.toId;
    } else if (edge.toType === entityType && edge.toId === entityId) {
      targetType = edge.fromType;
      targetId = edge.fromId;
    }
    if (!targetType || !targetId) continue;
    const key = `${targetType}:${targetId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({
      targetType,
      targetId,
      displayName: displayNameFor(snapshot, targetType, targetId),
    });
  }

  return links;
}
