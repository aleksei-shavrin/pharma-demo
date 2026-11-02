import { linksForEntity } from '../../common/direct-edges';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from '../snapshot-access';
import { computeProjectStatus, workstreamStatus } from '../project-status';
import {
  SNAPSHOT_A,
  SNAPSHOT_B,
  SNAPSHOT_C,
  SNAPSHOT_F,
  SNAPSHOT_G,
  SNAPSHOT_H,
  SNAPSHOTS,
} from './index';

/**
 * E8 release-candidate smoke over already-approved contracts.
 * Prefer asserting invariants already enforced by fixture-integrity /
 * project-status / direct-edges rather than duplicating inventory.
 */
describe('E8 acceptance candidate (canonical contracts)', () => {
  it('A–H calendar + overall status spine', () => {
    expect(SNAPSHOT_A.scenarioAsOfDate).toBe('2027-02-15');
    expect(SNAPSHOT_B.scenarioAsOfDate).toBe('2027-02-28');
    expect(SNAPSHOT_C.scenarioAsOfDate).toBe('2027-03-01');
    expect(SNAPSHOT_F.scenarioAsOfDate).toBe('2027-04-20');
    expect(SNAPSHOT_G.scenarioAsOfDate).toBe('2027-05-15');
    expect(SNAPSHOT_H.scenarioAsOfDate).toBe('2027-06-01');

    expect(computeProjectStatus(SNAPSHOT_A)).toBe('Green');
    expect(computeProjectStatus(SNAPSHOT_B)).toBe('Yellow');
    expect(computeProjectStatus(SNAPSHOT_C)).toBe('Red');
    expect(computeProjectStatus(SNAPSHOT_G)).toBe('Red');
    expect(computeProjectStatus(SNAPSHOT_H)).toBe('Red');
  });

  it('C +21 and G/H +14 on HVAC → PS path; BR-007 Red', () => {
    expect(findEquipment(SNAPSHOT_C, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-06-05',
    );
    expect(SNAPSHOT_C.project.forecastProductionStart).toBe('2027-10-06');
    expect(findRisk(SNAPSHOT_C, 'RISK-001')!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_C, 'MS-PS')!.rag).toBe('Red');

    expect(findEquipment(SNAPSHOT_G, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-05-29',
    );
    expect(SNAPSHOT_G.project.forecastProductionStart).toBe('2027-09-29');
    expect(findMilestone(SNAPSHOT_G, 'MS-PS')!.rag).toBe('Red');
    expect(findRisk(SNAPSHOT_H, 'RISK-001')!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_H, 'MS-PS')!.rag).toBe('Red');
  });

  it('G PKG residual Yellow under unchanged rollup', () => {
    expect(workstreamStatus(SNAPSHOT_G, 'WS-PKG')).toBe('Yellow');
    expect(findEquipment(SNAPSHOT_G, 'EQ-PKG-03')!.status).toBe('Delayed');
    expect(findIssue(SNAPSHOT_G, 'ISS-PKG-02')!.status).toBe('Open');
  });

  it('BA-015: EQ no MS; Issue→MS; Decision no EQ/ISS/RISK', () => {
    const eqLinks = linksForEntity(SNAPSHOT_C, 'equipment', 'EQ-HVAC-01');
    expect(eqLinks.every((l) => l.targetType !== 'milestone')).toBe(true);

    const issLinks = linksForEntity(SNAPSHOT_C, 'issue', 'ISS-001');
    expect(issLinks.some((l) => l.targetType === 'milestone')).toBe(true);

    for (const snap of [SNAPSHOT_F, SNAPSHOT_G, SNAPSHOT_H]) {
      for (const dec of snap.decisions) {
        expect(dec).not.toHaveProperty('equipmentId');
        expect(dec).not.toHaveProperty('issueId');
        expect(dec).not.toHaveProperty('riskId');
        const links = linksForEntity(snap, 'decision', dec.id);
        expect(
          links.every(
            (l) =>
              l.targetType !== 'equipment' &&
              l.targetType !== 'issue' &&
              l.targetType !== 'risk',
          ),
        ).toBe(true);
      }
    }
  });

  it('G/H director-facing exception titles are Russian prose (acronyms OK)', () => {
    const banned = [
      /\bresidual\b/i,
      /\bfixture-authored\b/i,
      /\bapproved orphan\b/i,
      /\bworkaround\b/i,
      /^Freeze\b/,
    ];
    for (const id of ['G', 'H'] as const) {
      for (const tex of SNAPSHOTS[id].topExceptions) {
        for (const re of banned) {
          expect(tex.title).not.toMatch(re);
          expect(tex.causeImpact).not.toMatch(re);
        }
      }
      for (const line of [
        ...SNAPSHOTS[id].trend.better,
        ...SNAPSHOTS[id].trend.worse,
        ...SNAPSHOTS[id].trend.unchangedCritical,
      ]) {
        for (const re of banned) {
          expect(line).not.toMatch(re);
        }
      }
    }
  });
});
