import { SCHEDULE_LINK_TYPES } from './dto/schedule.dto';

const WORK_REF_PATTERN = /^work:(.+)$/;
const MILESTONE_REF_PATTERN = /^milestone:(.+)$/;

export type ScheduleLinkKind = 'scheduling' | 'cross_project_predecessor';

export type ScheduleLinkRuleInput = {
  id: string;
  kind?: ScheduleLinkKind;
  sourceRef: string;
  targetRef: string;
  type?: string;
};

/**
 * `scheduling` stays work↔work with a required planning type.
 * `cross_project_predecessor` is milestone→work and must not carry that type.
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
    assertSchedulingLink(link, workIds, fail);
    return;
  }
  assertCrossProjectPredecessor(link, workIds, milestoneIds, fail);
}

function assertSchedulingLink(
  link: ScheduleLinkRuleInput,
  workIds: ReadonlySet<string>,
  fail: (message: string) => never,
): void {
  if (
    link.type == null ||
    !SCHEDULE_LINK_TYPES.includes(link.type as (typeof SCHEDULE_LINK_TYPES)[number])
  ) {
    fail(`link ${link.id} scheduling requires a type`);
  }
  for (const [field, ref] of [
    ['sourceRef', link.sourceRef],
    ['targetRef', link.targetRef],
  ] as const) {
    const match = WORK_REF_PATTERN.exec(ref);
    if (!match) {
      fail(`link ${link.id} ${field} "${ref}" must match work:<id>`);
    } else if (!workIds.has(match[1])) {
      fail(`link ${link.id} ${field} references unknown work ${match[1]}`);
    }
  }
}

function assertCrossProjectPredecessor(
  link: ScheduleLinkRuleInput,
  workIds: ReadonlySet<string>,
  milestoneIds: ReadonlySet<string>,
  fail: (message: string) => never,
): void {
  if (link.type != null) {
    fail(`link ${link.id} cross_project_predecessor must not carry a planning type`);
  }
  const source = MILESTONE_REF_PATTERN.exec(link.sourceRef);
  const target = WORK_REF_PATTERN.exec(link.targetRef);
  if (!source || !target) {
    fail(`link ${link.id} direction must be milestone to work`);
  }
  if (!milestoneIds.has(source[1])) {
    fail(
      `link ${link.id} sourceRef references unknown milestone ${source[1]}`,
    );
  }
  if (!workIds.has(target[1])) {
    fail(`link ${link.id} targetRef references unknown work ${target[1]}`);
  }
}
