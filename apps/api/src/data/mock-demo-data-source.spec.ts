import { NotFoundException } from '@nestjs/common';
import { MockDemoDataSource } from './mock-demo-data-source';
import {
  findEquipment,
  findIssue,
  findMilestone,
  findRisk,
} from './snapshot-access';

describe('MockDemoDataSource (E1-R1 collection stubs)', () => {
  const ds = new MockDemoDataSource();

  it('exposes populated snapshots A, B, C', () => {
    expect(ds.listSnapshotIds().sort()).toEqual(['A', 'B', 'C']);
  });

  it('default snapshot is A with baseline PS dates equal', () => {
    const a = ds.getDefaultSnapshot();
    expect(a.id).toBe('A');
    expect(a.project.id).toBe('PRJ-01');
    expect(a.project.baselineProductionStart).toBe('2027-09-15');
    expect(a.project.forecastProductionStart).toBe('2027-09-15');
    expect(findEquipment(a, 'EQ-HVAC-01')?.status).toBe('OnTrack');
    expect(a.issues).toEqual([]);
    expect(a.decisions).toEqual([]);
  });

  it('snapshot B: local PKG Yellow path; HVAC/PS calm; no DEC', () => {
    const b = ds.getSnapshot('B');
    expect(findEquipment(b, 'EQ-HVAC-01')?.status).toBe('OnTrack');
    expect(findEquipment(b, 'EQ-PKG-01')?.status).toBe('Delayed');
    expect(b.project.forecastProductionStart).toBe('2027-09-15');
    expect(findMilestone(b, 'MS-PS')?.rag).toBe('Green');
    expect(findRisk(b, 'RISK-001')?.rag).toBe('Green');
    expect(findIssue(b, 'ISS-001')).toBeUndefined();
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
    expect(c.decisions).toEqual([]);
  });

  it('D–H are valid machine ids but not populated in E1', () => {
    expect(() => ds.getSnapshot('D')).toThrow(NotFoundException);
  });
});
