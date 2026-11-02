import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { ProjectsService } from './projects.service';

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

  getCosts(): never {
    throw new Error('getCosts not used by ProjectsService');
  }
}

function stub(id: SnapshotId, forecast: string, asOf: string): SnapshotFixture {
  return {
    id,
    scenarioAsOfDate: asOf,
    project: {
      id: 'PRJ-01',
      name: 'Строительство фармацевтического завода',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: forecast,
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      baselineDate: '2027-09-15',
      forecastDate: forecast,
      rag: id === 'A' ? 'Green' : 'Red',
    },
    equipment: {
      id: 'EQ-HVAC-01',
      projectId: 'PRJ-01',
      critical: true,
      baselineDelivery: '2027-05-15',
      forecastDelivery: '2027-05-15',
      status: 'OnTrack',
    },
    risk: {
      id: 'RISK-001',
      rag: id === 'A' ? 'Green' : 'Red',
      milestoneId: 'MS-PS',
      equipmentId: 'EQ-HVAC-01',
      issueId: null,
    },
    issue: null,
    decision: null,
  };
}

describe('ProjectsService', () => {
  const ds = new FakeDataSource({
    A: stub('A', '2027-09-15', '2027-02-15'),
    B: stub('B', '2027-10-06', '2027-03-01'),
    C: stub('C', '2027-10-06', '2027-03-02'),
  });

  it('returns project stub for requested snapshot via DemoDataSource', () => {
    const service = new ProjectsService(ds);
    expect(service.getProjectStub('PRJ-01', 'A')).toEqual(
      expect.objectContaining({
        snapshotId: 'A',
        forecastProductionStart: '2027-09-15',
        scenarioAsOfDate: '2027-02-15',
      }),
    );
    expect(service.getProjectStub('PRJ-01', 'B')).toEqual(
      expect.objectContaining({
        snapshotId: 'B',
        forecastProductionStart: '2027-10-06',
        scenarioAsOfDate: '2027-03-01',
      }),
    );
  });

  it('throws NotFoundException for unknown project', () => {
    const service = new ProjectsService(ds);
    expect(() => service.getProjectStub('NOPE', 'A')).toThrow(
      NotFoundException,
    );
  });
});
