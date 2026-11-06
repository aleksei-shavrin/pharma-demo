import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import { SNAPSHOT_A, SNAPSHOT_B, SNAPSHOT_C } from '../data/fixtures';
import type { ProjectFixture, SnapshotFixture } from '../data/fixtures/types';
import type { SnapshotId } from '../snapshot/snapshot-id';
import { ProjectsService } from './projects.service';

class FakeDataSource extends DemoDataSource {
  constructor(
    private readonly snapshots: Partial<Record<SnapshotId, SnapshotFixture>>,
  ) {
    super();
  }

  getSnapshot(id: SnapshotId): SnapshotFixture {
    const snapshot = this.snapshots[id];
    if (!snapshot) {
      throw new NotFoundException(`Unknown snapshot: ${id}`);
    }
    return snapshot;
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const s = this.getSnapshot(snapshotId);
    return s.project.id === projectId ? s.project : null;
  }

  listSnapshotIds(): SnapshotId[] {
    return Object.keys(this.snapshots) as SnapshotId[];
  }

  getDefaultSnapshot(): SnapshotFixture {
    return this.snapshots.A!;
  }

  getCosts(): never {
    throw new Error('getCosts not used by ProjectsService');
  }

  listPeople(): never {
    throw new Error('listPeople not used by ProjectsService');
  }
  getPerson(): never {
    throw new Error('getPerson not used by ProjectsService');
  }
  personFullNameRu(): never {
    throw new Error('personFullNameRu not used by ProjectsService');
  }
  leadPersonIdForWorkstream(): never {
    throw new Error('leadPersonIdForWorkstream not used by ProjectsService');
  }
  leadWorkstreamIdsForPerson(): never {
    throw new Error('leadWorkstreamIdsForPerson not used by ProjectsService');
  }
  getScheduleWorks(): never {
    throw new Error('getScheduleWorks not used by ProjectsService');
  }

  listNotifications(): never {
    throw new Error('listNotifications not used by ProjectsService');
  }
}

describe('ProjectsService', () => {
  const ds = new FakeDataSource({
    A: SNAPSHOT_A,
    B: SNAPSHOT_B,
    C: SNAPSHOT_C,
  });

  it('returns project stub for requested snapshot via DemoDataSource', () => {
    const service = new ProjectsService(ds);
    expect(service.getProjectStub('PRJ-01', 'A')).toEqual(
      expect.objectContaining({
        snapshotId: 'A',
        forecastProductionStart: SNAPSHOT_A.project.forecastProductionStart,
        scenarioAsOfDate: SNAPSHOT_A.scenarioAsOfDate,
      }),
    );
    expect(service.getProjectStub('PRJ-01', 'B')).toEqual(
      expect.objectContaining({
        snapshotId: 'B',
        forecastProductionStart: SNAPSHOT_B.project.forecastProductionStart,
        scenarioAsOfDate: SNAPSHOT_B.scenarioAsOfDate,
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
