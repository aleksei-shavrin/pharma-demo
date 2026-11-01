import type { SnapshotFixture } from '../data/fixtures/types';

export type EntityRefType = 'equipment' | 'issue' | 'risk' | 'milestone';

/** DOC-BA-015 directed edge present in a snapshot (no EQ—MS; no Decision edges). */
export type DirectEdge = {
  kind: 'direct';
  fromType: EntityRefType;
  fromId: string;
  toType: EntityRefType;
  toId: string;
};

export type EntityLink = {
  targetType: EntityRefType;
  targetId: string;
  displayName: string;
};

/**
 * Canonical direct Domain edges for the snapshot.
 * Reciprocal presentation is built by {@link linksForEntity}.
 */
export function buildDirectEdges(snapshot: SnapshotFixture): DirectEdge[] {
  const edges: DirectEdge[] = [];
  const eq = snapshot.equipment.id;
  const risk = snapshot.risk.id;
  const ms = snapshot.milestone.id;

  edges.push({
    kind: 'direct',
    fromType: 'equipment',
    fromId: eq,
    toType: 'risk',
    toId: risk,
  });
  edges.push({
    kind: 'direct',
    fromType: 'risk',
    fromId: risk,
    toType: 'milestone',
    toId: ms,
  });

  if (snapshot.issue) {
    const iss = snapshot.issue.id;
    edges.push({
      kind: 'direct',
      fromType: 'equipment',
      fromId: eq,
      toType: 'issue',
      toId: iss,
    });
    edges.push({
      kind: 'direct',
      fromType: 'issue',
      fromId: iss,
      toType: 'risk',
      toId: risk,
    });
    edges.push({
      kind: 'direct',
      fromType: 'issue',
      fromId: iss,
      toType: 'milestone',
      toId: ms,
    });
  }

  return edges;
}

function displayNameFor(
  snapshot: SnapshotFixture,
  type: EntityRefType,
  id: string,
): string {
  if (type === 'equipment' && snapshot.equipment.id === id) {
    return snapshot.equipment.id;
  }
  if (type === 'risk' && snapshot.risk.id === id) {
    return snapshot.risk.id;
  }
  if (type === 'milestone' && snapshot.milestone.id === id) {
    return snapshot.milestone.name;
  }
  if (type === 'issue' && snapshot.issue?.id === id) {
    return snapshot.issue.title;
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
