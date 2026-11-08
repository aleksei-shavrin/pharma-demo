import { SCHEDULE_LINK_TYPES } from './dto/schedule.dto';

const WORK_REF_PATTERN = /^work:(.+)$/;
const MILESTONE_REF_PATTERN = /^milestone:(.+)$/;
const LEAF_REF_PATTERN = /^(work|milestone):(.+)$/;

export type ScheduleLinkKind = 'scheduling' | 'cross_project_predecessor';

export type ScheduleLinkRuleInput = {
  id: string;
  kind?: ScheduleLinkKind;
  sourceRef: string;
  targetRef: string;
  type?: string;
};

/**
 * Leaf ends may be work or milestone (DHTMLX supports task↔milestone arrows).
 * `scheduling` requires a planning type (FS/SS/FF/SF).
 * `cross_project_predecessor` is typed ⇢ without a planning type; direction is preserved.
 * A missing kind stays `scheduling` so older fixture literals keep their meaning.
 */
export function assertScheduleLink(
  link: ScheduleLinkRuleInput,
  workIds: ReadonlySet<string>,
  milestoneIds: ReadonlySet<string>,
  fail: (message: string) => never,
): void {
  const kind = link.kind ?? 'scheduling';
  if (kind === 'scheduling') {
    assertSchedulingLink(link, workIds, milestoneIds, fail);
    return;
  }
  assertCrossProjectPredecessor(link, workIds, milestoneIds, fail);
}

function resolveLeafId(
  ref: string,
  workIds: ReadonlySet<string>,
  milestoneIds: ReadonlySet<string>,
): { kind: 'work' | 'milestone'; id: string } | null {
  const work = WORK_REF_PATTERN.exec(ref);
  if (work) {
    return workIds.has(work[1]) ? { kind: 'work', id: work[1] } : null;
  }
  const ms = MILESTONE_REF_PATTERN.exec(ref);
  if (ms) {
    return milestoneIds.has(ms[1]) ? { kind: 'milestone', id: ms[1] } : null;
  }
  return null;
}

function assertLeafRef(
  linkId: string,
  field: string,
  ref: string,
  workIds: ReadonlySet<string>,
  milestoneIds: ReadonlySet<string>,
  fail: (message: string) => never,
): void {
  if (!LEAF_REF_PATTERN.test(ref)) {
    fail(
      `link ${linkId} ${field} "${ref}" must match work:<id> or milestone:<id>`,
    );
  }
  if (!resolveLeafId(ref, workIds, milestoneIds)) {
    fail(`link ${linkId} ${field} references unknown leaf ${ref}`);
  }
}

function assertSchedulingLink(
  link: ScheduleLinkRuleInput,
  workIds: ReadonlySet<string>,
  milestoneIds: ReadonlySet<string>,
  fail: (message: string) => never,
): void {
  if (
    link.type == null ||
    !SCHEDULE_LINK_TYPES.includes(
      link.type as (typeof SCHEDULE_LINK_TYPES)[number],
    )
  ) {
    fail(`link ${link.id} scheduling requires a type`);
  }
  assertLeafRef(
    link.id,
    'sourceRef',
    link.sourceRef,
    workIds,
    milestoneIds,
    fail,
  );
  assertLeafRef(
    link.id,
    'targetRef',
    link.targetRef,
    workIds,
    milestoneIds,
    fail,
  );
}

function assertCrossProjectPredecessor(
  link: ScheduleLinkRuleInput,
  workIds: ReadonlySet<string>,
  milestoneIds: ReadonlySet<string>,
  fail: (message: string) => never,
): void {
  if (link.type != null) {
    fail(
      `link ${link.id} cross_project_predecessor must not carry a planning type`,
    );
  }
  assertLeafRef(
    link.id,
    'sourceRef',
    link.sourceRef,
    workIds,
    milestoneIds,
    fail,
  );
  assertLeafRef(
    link.id,
    'targetRef',
    link.targetRef,
    workIds,
    milestoneIds,
    fail,
  );
}
