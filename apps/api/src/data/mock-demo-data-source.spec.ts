import { MockDemoDataSource } from './mock-demo-data-source';

describe('MockDemoDataSource (DOC-PROD-012 integrity smoke)', () => {
  const ds = new MockDemoDataSource();

  it('exposes discrete snapshots A, B, C', () => {
    expect(ds.listSnapshotIds().sort()).toEqual(['A', 'B', 'C']);
  });

  it('default snapshot is A with baseline PS dates equal', () => {
    const a = ds.getDefaultSnapshot();
    expect(a.id).toBe('A');
    expect(a.project.id).toBe('PRJ-01');
    expect(a.project.baselineProductionStart).toBe('2027-09-15');
    expect(a.project.forecastProductionStart).toBe('2027-09-15');
    expect(a.equipment.status).toBe('OnTrack');
    expect(a.issue).toBeNull();
    expect(a.decision).toBeNull();
  });

  it('snapshot B applies +21d delay and Open issue', () => {
    const b = ds.getSnapshot('B');
    expect(b.equipment.forecastDelivery).toBe('2027-06-05');
    expect(b.equipment.status).toBe('Delayed');
    expect(b.project.forecastProductionStart).toBe('2027-10-06');
    expect(b.milestone.rag).toBe('Red');
    expect(b.risk.rag).toBe('Red');
    expect(b.issue?.status).toBe('Open');
    expect(b.decision).toBeNull();
  });

  it('snapshot C keeps B forecasts and records PrioritizeRecovery (BR-006)', () => {
    const b = ds.getSnapshot('B');
    const c = ds.getSnapshot('C');
    expect(c.project.forecastProductionStart).toBe(b.project.forecastProductionStart);
    expect(c.milestone.forecastDate).toBe(b.milestone.forecastDate);
    expect(c.milestone.rag).toBe('Red');
    expect(c.risk.rag).toBe('Red');
    expect(c.issue?.status).toBe('Mitigating');
    expect(c.decision?.id).toBe('DEC-001');
    expect(c.decision?.type).toBe('PrioritizeRecovery');
  });

  it('getProject returns PRJ-01 for A and null for unknown', () => {
    expect(ds.getProject('A', 'PRJ-01')?.name).toContain('Facility Expansion');
    expect(ds.getProject('A', 'PRJ-999')).toBeNull();
  });
});
