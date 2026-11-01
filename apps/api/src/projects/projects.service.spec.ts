import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import type { ProjectFixture, SnapshotFixture, SnapshotId } from '../data/fixtures/types';
import { ProjectsService } from './projects.service';

class FakeDataSource extends DemoDataSource {
  constructor(private readonly snapshot: SnapshotFixture) {
    super();
  }

  getSnapshot(id: SnapshotId): SnapshotFixture {
    if (id !== this.snapshot.id) {
      throw new Error(`unexpected snapshot ${id}`);
    }
    return this.snapshot;
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const s = this.getSnapshot(snapshotId);
    return s.project.id === projectId ? s.project : null;
  }

  listSnapshotIds(): SnapshotId[] {
    return [this.snapshot.id];
  }

  getDefaultSnapshot(): SnapshotFixture {
    return this.snapshot;
  }
}

describe('ProjectsService', () => {
  const snapshotA: SnapshotFixture = {
    id: 'A',
    scenarioAsOfDate: '2027-02-15',
    project: {
      id: 'PRJ-01',
      name: 'Facility Expansion Alpha',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: '2027-09-15',
    },
    milestone: {
      id: 'MS-PS',
      name: 'Ready for production',
      baselineDate: '2027-09-15',
      forecastDate: '2027-09-15',
      rag: 'Green',
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
      rag: 'Green',
      milestoneId: 'MS-PS',
      equipmentId: 'EQ-HVAC-01',
      issueId: null,
    },
    issue: null,
    decision: null,
  };

  it('returns project stub from DemoDataSource without fixture imports', () => {
    const service = new ProjectsService(new FakeDataSource(snapshotA));
    const dto = service.getProjectStub('PRJ-01');
    expect(dto).toEqual({
      id: 'PRJ-01',
      name: 'Facility Expansion Alpha',
      baselineProductionStart: '2027-09-15',
      forecastProductionStart: '2027-09-15',
      snapshotId: 'A',
      scenarioAsOfDate: '2027-02-15',
    });
  });

  it('throws NotFoundException for unknown project', () => {
    const service = new ProjectsService(new FakeDataSource(snapshotA));
    expect(() => service.getProjectStub('NOPE')).toThrow(NotFoundException);
  });
});
