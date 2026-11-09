import type { PersonId } from '../contracts/person-id';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { SNAPSHOT_IDS } from '../snapshot/snapshot-id';
import type {
  EquipmentFixture,
  IssueFixture,
  SnapshotFixture,
} from '../data/fixtures/types';

/** Active management issue — Closed never qualifies. */
export function isActiveIssue(issue: Pick<IssueFixture, 'status'>): boolean {
  return issue.status === 'Open' || issue.status === 'Mitigating';
}

/** Critical delayed delivery — authoritative EQ fields only. */
export function isCriticalDelayedEquipment(
  eq: Pick<EquipmentFixture, 'critical' | 'status'>,
): boolean {
  return eq.critical === true && eq.status === 'Delayed';
}

export type PeopleFocusEntityLink = {
  type: 'issue' | 'equipment';
  id: string;
};

export type PeopleFocusReason = {
  /** Short RU reason for UI (no score/algorithm wording). */
  text: string;
  links: PeopleFocusEntityLink[];
};

export type PeopleFocusPersonRow = {
  personId: PersonId;
  fullNameRu: string;
  roleTitleRu: string;
  primaryWorkstreamId: string | null;
  criticalIncidentCount: number;
  otherActiveIssueCount: number;
  hasNewCritical: boolean;
  /** Current − previous critical key count; 0 when previous unknown. */
  incidentGrowth: number;
  /** Keys present on previous person agg but not current; 0 when previous unknown. */
  criticalSignalsRemoved: number;
  reasons: PeopleFocusReason[];
  /** Deduped critical incident keys for audits. */
  criticalIncidentKeys: string[];
  activeIssueIds: string[];
  delayedCriticalEquipmentIds: string[];
};

export type PeopleFocusPanel = {
  previousSnapshotId: SnapshotId | null;
  summary: {
    peopleWithQuestions: number;
    criticalQuestionCount: number;
    /** null on first snapshot (A) — no comparison. */
    newCriticalQuestionCount: number | null;
    /**
     * Critical keys in previous global set but not current.
     * Same critical-incident predicate; not “closed issues” / execution.
     * null when previous unknown.
     */
    removedCriticalSignalCount: number | null;
    /** Other active issues (not linked to a critical Delayed EQ case). */
    otherActiveIssueCount: number;
  };
  people: PeopleFocusPersonRow[];
  /** Critical Delayed EQ with null responsiblePersonId — honest optional gap. */
  unassignedDelayedCriticalEquipmentIds: string[];
  totalPeopleInFocus: number;
};

export type PeopleFocusPersonLookup = {
  fullNameRu: string;
  roleTitleRu: string;
  primaryWorkstreamId: string | null;
};

type PersonAgg = {
  criticalKeys: Set<string>;
  /** key → links for that incident */
  criticalLinks: Map<string, PeopleFocusEntityLink[]>;
  otherIssueIds: Set<string>;
  allActiveIssueIds: Set<string>;
  delayedEqIds: Set<string>;
};

function emptyAgg(): PersonAgg {
  return {
    criticalKeys: new Set(),
    criticalLinks: new Map(),
    otherIssueIds: new Set(),
    allActiveIssueIds: new Set(),
    delayedEqIds: new Set(),
  };
}

function addCriticalLink(
  agg: PersonAgg,
  key: string,
  link: PeopleFocusEntityLink,
): void {
  agg.criticalKeys.add(key);
  const list = agg.criticalLinks.get(key) ?? [];
  if (!list.some((l) => l.type === link.type && l.id === link.id)) {
    list.push(link);
  }
  agg.criticalLinks.set(key, list);
}

/**
 * Build per-person aggregations for one snapshot.
 * Critical incidents dedupe issue+equipment for the same person via equipment id.
 */
export function aggregatePeopleFocusSignals(snapshot: SnapshotFixture): {
  byPerson: Map<PersonId, PersonAgg>;
  unassignedDelayedCriticalEquipmentIds: string[];
  globalCriticalKeys: Set<string>;
} {
  const eqById = new Map(snapshot.equipment.map((e) => [e.id, e]));
  const byPerson = new Map<PersonId, PersonAgg>();
  const ensure = (id: PersonId) => {
    let a = byPerson.get(id);
    if (!a) {
      a = emptyAgg();
      byPerson.set(id, a);
    }
    return a;
  };

  const criticalEqIds = new Set(
    snapshot.equipment.filter(isCriticalDelayedEquipment).map((e) => e.id),
  );

  const unassignedDelayedCriticalEquipmentIds = snapshot.equipment
    .filter(
      (e) =>
        isCriticalDelayedEquipment(e) &&
        (e.responsiblePersonId == null || e.responsiblePersonId === undefined),
    )
    .map((e) => e.id)
    .sort();

  // Issues first — establish critical keys by equipment when linked.
  for (const issue of snapshot.issues) {
    if (!isActiveIssue(issue)) continue;
    const agg = ensure(issue.ownerPersonId);
    agg.allActiveIssueIds.add(issue.id);
    const eq = eqById.get(issue.equipmentId);
    const criticalCase =
      eq != null && criticalEqIds.has(eq.id) && isCriticalDelayedEquipment(eq);
    if (criticalCase) {
      const key = `eq:${issue.equipmentId}`;
      addCriticalLink(agg, key, { type: 'issue', id: issue.id });
      addCriticalLink(agg, key, { type: 'equipment', id: issue.equipmentId });
      agg.delayedEqIds.add(issue.equipmentId);
    } else {
      agg.otherIssueIds.add(issue.id);
    }
  }

  // Critical Delayed EQ without same-person active issue already covering it.
  for (const eq of snapshot.equipment) {
    if (!isCriticalDelayedEquipment(eq)) continue;
    const owner = eq.responsiblePersonId;
    if (owner == null) continue;
    const agg = ensure(owner);
    const key = `eq:${eq.id}`;
    if (agg.criticalKeys.has(key)) {
      // Already linked via issue — ensure equipment link present.
      addCriticalLink(agg, key, { type: 'equipment', id: eq.id });
      agg.delayedEqIds.add(eq.id);
      continue;
    }
    addCriticalLink(agg, key, { type: 'equipment', id: eq.id });
    agg.delayedEqIds.add(eq.id);
  }

  const globalCriticalKeys = new Set<string>();
  for (const agg of byPerson.values()) {
    for (const k of agg.criticalKeys) globalCriticalKeys.add(k);
  }

  return {
    byPerson,
    unassignedDelayedCriticalEquipmentIds,
    globalCriticalKeys,
  };
}

export function previousSnapshotIdOf(
  snapshotId: SnapshotId,
): SnapshotId | null {
  const idx = SNAPSHOT_IDS.indexOf(snapshotId);
  if (idx <= 0) return null;
  return SNAPSHOT_IDS[idx - 1] ?? null;
}

function comparePeopleFocusRows(
  a: PeopleFocusPersonRow,
  b: PeopleFocusPersonRow,
): number {
  if (a.criticalIncidentCount !== b.criticalIncidentCount) {
    return b.criticalIncidentCount - a.criticalIncidentCount;
  }
  if (a.hasNewCritical !== b.hasNewCritical) {
    return a.hasNewCritical ? -1 : 1;
  }
  if (a.otherActiveIssueCount !== b.otherActiveIssueCount) {
    return b.otherActiveIssueCount - a.otherActiveIssueCount;
  }
  if (a.incidentGrowth !== b.incidentGrowth) {
    return b.incidentGrowth - a.incidentGrowth;
  }
  return a.personId.localeCompare(b.personId);
}

/**
 * Reasons for a person row.
 * When `previousKnown` is false (first snapshot / no previous), never emit
 * «Новый…» / «+N…» — only neutral current-state copy.
 */
export function buildReasons(
  agg: PersonAgg,
  prev: PersonAgg | undefined,
  previousKnown: boolean,
): PeopleFocusReason[] {
  const reasons: PeopleFocusReason[] = [];

  if (previousKnown) {
    const newKeys = [...agg.criticalKeys].filter(
      (k) => !prev?.criticalKeys.has(k),
    );
    for (const key of newKeys.sort()) {
      const links = agg.criticalLinks.get(key) ?? [];
      const hasIssue = links.some((l) => l.type === 'issue');
      reasons.push({
        text: hasIssue
          ? 'Новый критичный вопрос по поставке'
          : 'Новая задержка критичной поставки',
        links,
      });
    }
    const growthIssues =
      agg.allActiveIssueIds.size - (prev?.allActiveIssueIds.size ?? 0);
    if (growthIssues > 0 && newKeys.length === 0) {
      reasons.push({
        text: `+${growthIssues} активных вопроса`,
        links: [...agg.allActiveIssueIds]
          .sort()
          .slice(0, 3)
          .map((id) => ({ type: 'issue' as const, id })),
      });
    }
    const removed = [...(prev?.criticalKeys ?? [])].filter(
      (k) => !agg.criticalKeys.has(k),
    ).length;
    if (removed > 0 && reasons.length === 0) {
      reasons.push({
        text:
          removed === 1
            ? 'Снят критичный сигнал'
            : `Снято критичных сигналов: ${removed}`,
        links: [],
      });
    }
  }

  if (agg.criticalKeys.size > 0 && reasons.length === 0) {
    const key = [...agg.criticalKeys].sort()[0];
    reasons.push({
      text: 'Критичный вопрос по поставке',
      links: agg.criticalLinks.get(key) ?? [],
    });
  }
  if (agg.otherIssueIds.size > 0) {
    reasons.push({
      text: `Активные проблемы (${agg.otherIssueIds.size})`,
      links: [...agg.otherIssueIds]
        .sort()
        .slice(0, 3)
        .map((id) => ({ type: 'issue' as const, id })),
    });
  }
  // Cap reasons for compact card.
  return reasons.slice(0, 3);
}

/**
 * Director people-focus read-model. Decisions / risks / milestones never qualify.
 */
export function buildPeopleFocus(
  current: SnapshotFixture,
  previous: SnapshotFixture | null,
  personLookup: (id: PersonId) => PeopleFocusPersonLookup | null,
): PeopleFocusPanel {
  const cur = aggregatePeopleFocusSignals(current);
  const prev = previous ? aggregatePeopleFocusSignals(previous) : null;
  const previousKnown = previous != null;

  const people: PeopleFocusPersonRow[] = [];
  for (const [personId, agg] of cur.byPerson) {
    const criticalIncidentCount = agg.criticalKeys.size;
    const otherActiveIssueCount = agg.otherIssueIds.size;
    if (criticalIncidentCount === 0 && otherActiveIssueCount === 0) continue;

    const prevAgg = prev?.byPerson.get(personId);
    const prevCritical = prevAgg?.criticalKeys.size ?? 0;
    const hasNewCritical = [...agg.criticalKeys].some(
      (k) => !prevAgg?.criticalKeys.has(k),
    );
    const incidentGrowth = criticalIncidentCount - prevCritical;
    const criticalSignalsRemoved = previousKnown
      ? [...(prevAgg?.criticalKeys ?? [])].filter(
          (k) => !agg.criticalKeys.has(k),
        ).length
      : 0;
    const meta = personLookup(personId);
    if (!meta) continue;

    people.push({
      personId,
      fullNameRu: meta.fullNameRu,
      roleTitleRu: meta.roleTitleRu,
      primaryWorkstreamId: meta.primaryWorkstreamId,
      criticalIncidentCount,
      otherActiveIssueCount,
      hasNewCritical: previousKnown ? hasNewCritical : false,
      incidentGrowth: previousKnown ? incidentGrowth : 0,
      criticalSignalsRemoved,
      reasons: buildReasons(agg, prevAgg, previousKnown),
      criticalIncidentKeys: [...agg.criticalKeys].sort(),
      activeIssueIds: [...agg.allActiveIssueIds].sort(),
      delayedCriticalEquipmentIds: [...agg.delayedEqIds].sort(),
    });
  }

  people.sort(comparePeopleFocusRows);

  let newCriticalQuestionCount: number | null = null;
  let removedCriticalSignalCount: number | null = null;
  if (prev) {
    let added = 0;
    for (const key of cur.globalCriticalKeys) {
      if (!prev.globalCriticalKeys.has(key)) added += 1;
    }
    newCriticalQuestionCount = added;
    let removed = 0;
    for (const key of prev.globalCriticalKeys) {
      if (!cur.globalCriticalKeys.has(key)) removed += 1;
    }
    removedCriticalSignalCount = removed;
  }

  let otherActiveIssueCount = 0;
  for (const agg of cur.byPerson.values()) {
    otherActiveIssueCount += agg.otherIssueIds.size;
  }

  return {
    previousSnapshotId: previous?.id ?? null,
    summary: {
      peopleWithQuestions: people.length,
      criticalQuestionCount: cur.globalCriticalKeys.size,
      newCriticalQuestionCount,
      removedCriticalSignalCount,
      otherActiveIssueCount,
    },
    people,
    unassignedDelayedCriticalEquipmentIds:
      cur.unassignedDelayedCriticalEquipmentIds,
    totalPeopleInFocus: people.length,
  };
}
