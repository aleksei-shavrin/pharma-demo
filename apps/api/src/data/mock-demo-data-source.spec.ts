import { MockDemoDataSource } from './mock-demo-data-source';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from './snapshot-access';

describe('MockDemoDataSource (E2 A–H fixtures)', () => {
  const ds = new MockDemoDataSource();

  it('exposes populated snapshots A–S', () => {
    expect(ds.listSnapshotIds().sort()).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
    ]);
  });

  it('default snapshot is A with baseline PS dates equal', () => {
    const a = ds.getDefaultSnapshot();
    expect(a.id).toBe('A');
    expect(a.project.id).toBe('PRJ-01');
    expect(a.project.baselineProductionStart).toBe('2027-09-15');
    expect(a.project.forecastProductionStart).toBe('2027-09-15');
    expect(findEquipment(a, 'EQ-HVAC-01')?.status).toBe('OnTrack');
    expect(a.equipment).toHaveLength(52);
    expect(a.issues).toEqual([]);
    expect(a.decisions).toEqual([]);
  });

  it('snapshot B: local PKG/BLD Yellow path; HVAC/PS calm; no DEC', () => {
    const b = ds.getSnapshot('B');
    expect(findEquipment(b, 'EQ-HVAC-01')?.status).toBe('OnTrack');
    expect(findEquipment(b, 'EQ-PKG-01')?.status).toBe('Delayed');
    expect(findEquipment(b, 'EQ-BLD-02')?.status).toBe('Delayed');
    expect(findIssue(b, 'ISS-BLD-01')?.status).toBe('Open');
    expect(b.project.forecastProductionStart).toBe('2027-09-15');
    expect(findMilestone(b, 'MS-PS')?.rag).toBe('Green');
    expect(findRisk(b, 'RISK-001')?.rag).toBe('Green');
    expect(findIssue(b, 'ISS-001')).toBeUndefined();
    expect(findIssue(b, 'ISS-PKG-01')?.status).toBe('Open');
    expect(b.decisions).toEqual([]);
  });

  it('snapshot C: HVAC +21 / Open ISS-001 / Red; no DEC-001', () => {
    const c = ds.getSnapshot('C');
    expect(findEquipment(c, 'EQ-HVAC-01')?.forecastDelivery).toBe('2027-06-05');
    expect(findEquipment(c, 'EQ-HVAC-01')?.status).toBe('Delayed');
    expect(c.project.forecastProductionStart).toBe('2027-10-06');
    expect(findMilestone(c, 'MS-PS')?.rag).toBe('Red');
    expect(findMilestone(c, 'MS-PS')?.forecastDate).toBe('2027-10-06');
    expect(findRisk(c, 'RISK-001')?.rag).toBe('Red');
    expect(findIssue(c, 'ISS-001')?.status).toBe('Open');
    expect(findIssue(c, 'ISS-BLD-01')?.status).toBe('Closed');
    expect(c.decisions).toEqual([]);
  });

  it('D–H are populated; Z remains invalid at parse layer (not this API)', () => {
    for (const id of ['D', 'E', 'F', 'G', 'H'] as const) {
      expect(ds.getSnapshot(id).id).toBe(id);
    }
    expect(ds.getSnapshot('F').decisions.some((d) => d.id === 'DEC-001')).toBe(
      true,
    );
    expect(ds.getSnapshot('G').project.forecastProductionStart).toBe(
      '2027-09-29',
    );
  });

  it('I–S populated; S achieves Production Start', () => {
    expect(ds.getSnapshot('I').id).toBe('I');
    expect(ds.getSnapshot('O').project.forecastProductionStart).toBe(
      '2027-09-22',
    );
    expect(ds.getSnapshot('S').scenarioAsOfDate).toBe('2027-09-22');
  });
});
