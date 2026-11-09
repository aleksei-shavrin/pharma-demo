import { linksForEntity } from '../../common/direct-edges';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from '../snapshot-access';
import { computeProjectStatus, workstreamStatus } from '../project-status';
import {
  SNAPSHOT_01,
  SNAPSHOT_02,
  SNAPSHOT_03,
  SNAPSHOT_06,
  SNAPSHOT_07,
  SNAPSHOT_08,
  SNAPSHOTS,
} from './index';

/**
 * E8 release-candidate smoke over already-approved contracts.
 * Prefer asserting invariants already enforced by fixture-integrity /
 * project-status / direct-edges rather than duplicating inventory.
 */
describe('E8 acceptance candidate (canonical contracts)', () => {
  it('01–08 calendar + overall status spine', () => {
    expect(SNAPSHOT_01.scenarioAsOfDate).toBe('2027-02-15');
    expect(SNAPSHOT_02.scenarioAsOfDate).toBe('2027-02-28');
    expect(SNAPSHOT_03.scenarioAsOfDate).toBe('2027-03-01');
    expect(SNAPSHOT_06.scenarioAsOfDate).toBe('2027-04-20');
    expect(SNAPSHOT_07.scenarioAsOfDate).toBe('2027-05-15');
    expect(SNAPSHOT_08.scenarioAsOfDate).toBe('2027-06-01');

    expect(computeProjectStatus(SNAPSHOT_01)).toBe('Green');
    expect(computeProjectStatus(SNAPSHOT_02)).toBe('Yellow');
    expect(computeProjectStatus(SNAPSHOT_03)).toBe('Red');
    expect(computeProjectStatus(SNAPSHOT_07)).toBe('Red');
    expect(computeProjectStatus(SNAPSHOT_08)).toBe('Red');
  });

  it('03 +21 and 07/08 +14 on HVAC → PS path; BR-007 Red', () => {
    expect(findEquipment(SNAPSHOT_03, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-06-05',
    );
    expect(SNAPSHOT_03.project.forecastProductionStart).toBe('2027-10-06');
    expect(findRisk(SNAPSHOT_03, 'RISK-001')!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_03, 'MS-PS')!.rag).toBe('Red');

    expect(findEquipment(SNAPSHOT_07, 'EQ-HVAC-01')!.forecastDelivery).toBe(
      '2027-05-29',
    );
    expect(SNAPSHOT_07.project.forecastProductionStart).toBe('2027-09-29');
    expect(findMilestone(SNAPSHOT_07, 'MS-PS')!.rag).toBe('Red');
    expect(findRisk(SNAPSHOT_08, 'RISK-001')!.rag).toBe('Red');
    expect(findMilestone(SNAPSHOT_08, 'MS-PS')!.rag).toBe('Red');
  });

  it('07 PKG residual Yellow under unchanged rollup', () => {
    expect(workstreamStatus(SNAPSHOT_07, 'WS-PKG')).toBe('Yellow');
    expect(findEquipment(SNAPSHOT_07, 'EQ-PKG-03')!.status).toBe('Delayed');
    expect(findIssue(SNAPSHOT_07, 'ISS-PKG-02')!.status).toBe('Open');
  });

  it('02A-015: EQ no MS; Issue→MS; Decision no EQ/ISS/RISK', () => {
    const eqLinks = linksForEntity(SNAPSHOT_03, 'equipment', 'EQ-HVAC-01');
    expect(eqLinks.every((l) => l.targetType !== 'milestone')).toBe(true);

    const issLinks = linksForEntity(SNAPSHOT_03, 'issue', 'ISS-001');
    expect(issLinks.some((l) => l.targetType === 'milestone')).toBe(true);

    for (const snap of [SNAPSHOT_06, SNAPSHOT_07, SNAPSHOT_08]) {
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

  it('07/08 director-facing exception titles are Russian prose (acronyms OK)', () => {
    const banned = [
      /\bresidual\b/i,
      /\bfixture-authored\b/i,
      /\bapproved orphan\b/i,
      /\bworkaround\b/i,
      /^Freeze\b/,
    ];
    for (const id of ['07', '08'] as const) {
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
