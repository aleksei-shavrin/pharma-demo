import { MockDemoDataSource } from './mock-demo-data-source';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from './snapshot-access';

describe('MockDemoDataSource (E2 01–08 fixtures)', () => {
  const ds = new MockDemoDataSource();

  it('exposes populated snapshots 01–19', () => {
    expect(ds.listSnapshotIds().sort()).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
    ]);
  });

  it('default snapshot is 01 with baseline PS dates equal', () => {
    const a = ds.getDefaultSnapshot();
    expect(a.id).toBe('01');
    expect(a.project.id).toBe('PRT-01');
    expect(a.project.baselineProductionStart).toBe('2027-09-15');
    expect(a.project.forecastProductionStart).toBe('2027-09-15');
    expect(findEquipment(a, 'EQ-HVAC-01')?.status).toBe('OnTrack');
    expect(a.equipment).toHaveLength(52);
    expect(a.issues).toEqual([]);
    expect(a.decisions).toEqual([]);
  });

  it('snapshot 02: local PKG/BLD Yellow path; HVAC/PS calm; no DEC', () => {
    const b = ds.getSnapshot('02');
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

  it('snapshot 03: HVAC +21 / Open ISS-001 / Red; no DEC-001', () => {
    const c = ds.getSnapshot('03');
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

  it('04–08 are populated; Z remains invalid at parse layer (not this API)', () => {
    for (const id of ['04', '05', '06', '07', '08'] as const) {
      expect(ds.getSnapshot(id).id).toBe(id);
    }
    expect(ds.getSnapshot('06').decisions.some((d) => d.id === 'DEC-001')).toBe(
      true,
    );
    expect(ds.getSnapshot('07').project.forecastProductionStart).toBe(
      '2027-09-29',
    );
  });

  it('09–19 populated; 19 achieves Production Start', () => {
    expect(ds.getSnapshot('09').id).toBe('09');
    expect(ds.getSnapshot('15').project.forecastProductionStart).toBe(
      '2027-09-22',
    );
    expect(ds.getSnapshot('19').scenarioAsOfDate).toBe('2027-09-22');
  });
});
