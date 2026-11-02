import { SNAPSHOT_IDS } from '../../snapshot/snapshot-id';
import { WORKSTREAM_IDS } from '../workstream-ids';
import {
  DECISION_CATALOG,
  EQUIPMENT_CATALOG,
  ISSUE_CATALOG,
  MILESTONE_CATALOG,
  RISK_CATALOG,
} from './catalog';
import {
  allNotificationFixtures,
  notificationsForSnapshot,
} from './notification-catalog';
import { PERSON_BY_ID } from './person-catalog';
import { SNAPSHOTS } from './index';

/** Forbidden mixed-language presentation fragments (director-facing RU). */
const FORBIDDEN_PRESENTATION_FRAGMENTS = [
  'Spine очищен',
  'baseline date missed',
  'закрыт (Green)',
  'authored post-state',
  'operational OnTrack',
  'schedule variance',
  'asOf не равен delivery',
  'fixture post-state',
  'AcceptDateSlip',
  'committed scope',
  'Utilities path',
  'Contingency draw',
  'Closed Issue',
  "issue: 'Issue'",
] as const;

describe('Notification fixture integrity (R2-N1 / N1-R1)', () => {
  it('covers A–S with unique ids and valid taxonomy/severity', () => {
    const all = allNotificationFixtures();
    const ids = all.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of SNAPSHOT_IDS) {
      expect(notificationsForSnapshot(id).every((n) => n.snapshotId === id)).toBe(
        true,
      );
    }
    expect(notificationsForSnapshot('A')).toHaveLength(0);
    expect(notificationsForSnapshot('C').length).toBeGreaterThanOrEqual(3);
    expect(notificationsForSnapshot('S').length).toBeGreaterThanOrEqual(2);
  });

  it('does not mutate domain snapshot fixtures', () => {
    const before = JSON.stringify(SNAPSHOTS.C.issues.map((i) => i.status));
    void notificationsForSnapshot('C');
    const after = JSON.stringify(SNAPSHOTS.C.issues.map((i) => i.status));
    expect(after).toBe(before);
  });

  it('resolves soft entityRefs for all seven types against canonical catalogues', () => {
    const workstreamSet = new Set<string>(WORKSTREAM_IDS);
    for (const n of allNotificationFixtures()) {
      for (const ref of n.entityRefs) {
        switch (ref.type) {
          case 'equipment':
            expect(
              EQUIPMENT_CATALOG[ref.id as keyof typeof EQUIPMENT_CATALOG],
            ).toBeDefined();
            break;
          case 'issue':
            expect(
              ISSUE_CATALOG[ref.id as keyof typeof ISSUE_CATALOG],
            ).toBeDefined();
            break;
          case 'risk':
            expect(
              RISK_CATALOG[ref.id as keyof typeof RISK_CATALOG],
            ).toBeDefined();
            break;
          case 'milestone':
            expect(
              MILESTONE_CATALOG[ref.id as keyof typeof MILESTONE_CATALOG],
            ).toBeDefined();
            break;
          case 'decision':
            expect(
              DECISION_CATALOG[ref.id as keyof typeof DECISION_CATALOG],
            ).toBeDefined();
            expect(n.href).toBeNull();
            break;
          case 'workstream':
            expect(workstreamSet.has(ref.id)).toBe(true);
            break;
          case 'person':
            expect(PERSON_BY_ID.has(ref.id as never)).toBe(true);
            break;
          default: {
            const _exhaustive: never = ref.type;
            throw new Error(`Unknown ref type ${_exhaustive}`);
          }
        }
      }
      expect(JSON.stringify(n)).not.toMatch(/SH-/);
    }
  });

  it('director-facing titleRu/bodyRu avoid known mixed-language fragments', () => {
    const blob = allNotificationFixtures()
      .map((n) => `${n.titleRu}\n${n.bodyRu ?? ''}`)
      .join('\n');
    for (const frag of FORBIDDEN_PRESENTATION_FRAGMENTS) {
      expect(blob).not.toContain(frag);
    }
    // Allowed technical anchors still present where story requires them.
    expect(blob).toMatch(/Production Start/);
    expect(blob).toMatch(/RISK-001/);
    expect(blob).toMatch(/HVAC/);
    expect(blob).toMatch(/22\.09\.2027/);
  });
});
