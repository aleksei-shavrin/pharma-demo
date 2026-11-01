import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { DashboardService } from './dashboard.service';

class FakeDataSource extends DemoDataSource {
  constructor(private readonly snapshots: Record<SnapshotId, SnapshotFixture>) {
    super();
  }

  getSnapshot(id: SnapshotId): SnapshotFixture {
    return this.snapshots[id];
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const s = this.getSnapshot(snapshotId);
    return s.project.id === projectId ? s.project : null;
  }

  listSnapshotIds(): SnapshotId[] {
    return Object.keys(this.snapshots) as SnapshotId[];
  }

  getDefaultSnapshot(): SnapshotFixture {
    return this.snapshots.A;
  }
}

function base(
  id: SnapshotId,
  asOf: string,
  psForecast: string,
  eqForecast: string,
  eqStatus: 'OnTrack' | 'Delayed',
  rag: 'Green' | 'Red',
  issue: SnapshotFixture['issue'],
  decision: SnapshotFixture['decision'],
): SnapshotFixture {
  return {
    id,
    scenarioAsOfDate: asOf,
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: psForecast,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      baselineDate: '2027-09-15',
      forecastDate: psForecast,
      rag,
    },
    equipment: {
      id: 'EQ-HVAC-01',
      projectId: 'PRJ-01',
      critical: true,
      baselineDelivery: '2027-05-15',
      forecastDelivery: eqForecast,
      status: eqStatus,
    },
    risk: {
      id: 'RISK-001',
      rag,
      milestoneId: 'MS-PS',
      equipmentId: 'EQ-HVAC-01',
      issueId: issue?.id ?? null,
    },
    issue,
    decision,
  };
}

const A = base(
  'A',
  '2027-02-15',
  '2027-09-15',
  '2027-05-15',
  'OnTrack',
  'Green',
  null,
  null,
);
const B = base(
  'B',
  '2027-03-01',
  '2027-10-06',
  '2027-06-05',
  'Delayed',
  'Red',
  {
    id: 'ISS-001',
    title: 'HVAC long-lead delivery slip',
    status: 'Open',
    owner: 'SH-002',
    equipmentId: 'EQ-HVAC-01',
    milestoneId: 'MS-PS',
  },
  null,
);
const C = base(
  'C',
  '2027-03-02',
  '2027-10-06',
  '2027-06-05',
  'Delayed',
  'Red',
  {
    id: 'ISS-001',
    title: 'HVAC long-lead delivery slip',
    status: 'Mitigating',
    owner: 'SH-002',
    equipmentId: 'EQ-HVAC-01',
    milestoneId: 'MS-PS',
  },
  {
    id: 'DEC-001',
    type: 'PrioritizeRecovery',
    ownerRole: 'SH-006',
    dueDate: '2027-03-20',
    note: 'Expedite vendor / alternate lane',
  },
);

describe('DashboardService', () => {
  const service = new DashboardService(new FakeDataSource({ A, B, C }));

  it('Snapshot A: on-track, no decision, zero deltas', () => {
    const d = service.getOverview('PRJ-01', 'A');
    expect(d.scenarioAsOfDate).toBe('2027-02-15');
    expect(d.equipment.deliveryVariance.deltaDays).toBe(0);
    expect(d.project.productionStartVariance.deltaDays).toBe(0);
    expect(d.issue).toBeNull();
    expect(d.decisionPanelState).toBe('absent');
    expect(d.decision).toBeNull();
    expect(d.directEdges.some((e) => e.fromType === 'issue')).toBe(false);
    expect(
      d.directEdges.some(
        (e) => e.fromType === 'equipment' && e.toType === 'milestone',
      ),
    ).toBe(false);
  });

  it('Snapshot B: +21, Open, Red, needed decision, no DEC', () => {
    const d = service.getOverview('PRJ-01', 'B');
    expect(d.equipment.forecastDelivery).toBe('2027-06-05');
    expect(d.equipment.deliveryVariance.deltaDays).toBe(21);
    expect(d.issue?.status).toBe('Open');
    expect(d.risk.rag).toBe('Red');
    expect(d.milestone.rag).toBe('Red');
    expect(d.project.forecastProductionStart).toBe('2027-10-06');
    expect(d.project.productionStartVariance.deltaDays).toBe(21);
    expect(d.decisionPanelState).toBe('needed');
    expect(d.decision).toBeNull();
  });

  it('Snapshot C: Decision recorded; Mitigating; Red; forecasts unrecovered (BR-006)', () => {
    const d = service.getOverview('PRJ-01', 'C');
    expect(d.decision?.id).toBe('DEC-001');
    expect(d.decision?.type).toBe('PrioritizeRecovery');
    expect(d.decision?.dueDate).toBe('2027-03-20');
    expect(d.decisionPanelState).toBe('recorded');
    expect(d.issue?.status).toBe('Mitigating');
    expect(d.risk.rag).toBe('Red');
    expect(d.milestone.rag).toBe('Red');
    expect(d.equipment.forecastDelivery).toBe('2027-06-05');
    expect(d.project.forecastProductionStart).toBe('2027-10-06');
    expect(d.project.productionStartVariance.deltaDays).toBe(21);
    expect(d.decisionHonesty).toEqual({ recoveryExecuted: false });
    expect(d.derivedImpact.kind).toBe('aligned_slip');
    expect(
      d.directEdges.some(
        (e) => e.fromType === 'equipment' && e.toType === 'milestone',
      ),
    ).toBe(false);
  });

  it('throws NotFound for unknown project', () => {
    expect(() => service.getOverview('NOPE', 'A')).toThrow(NotFoundException);
  });
});
