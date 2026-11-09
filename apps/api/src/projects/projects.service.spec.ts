import { NotFoundException } from '@nestjs/common';
import { DemoDataSource } from '../data/demo-data-source';
import { SNAPSHOT_01, SNAPSHOT_02, SNAPSHOT_03 } from '../data/fixtures';
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
    return this.snapshots['01']!;
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
    '01': SNAPSHOT_01,
    '02': SNAPSHOT_02,
    '03': SNAPSHOT_03,
  });

  it('returns project stub for requested snapshot via DemoDataSource', () => {
    const service = new ProjectsService(ds);
    expect(service.getProjectStub('PRT-01', '01').name).toBe(
      'Строительство фармацевтической фабрики (Greenfield)',
    );
    expect(service.getProjectStub('PRT-01', '01')).toEqual(
      expect.objectContaining({
        snapshotId: '01',
        forecastProductionStart: SNAPSHOT_01.project.forecastProductionStart,
        scenarioAsOfDate: SNAPSHOT_01.scenarioAsOfDate,
      }),
    );
    expect(service.getProjectStub('PRT-01', '02')).toEqual(
      expect.objectContaining({
        snapshotId: '02',
        forecastProductionStart: SNAPSHOT_02.project.forecastProductionStart,
        scenarioAsOfDate: SNAPSHOT_02.scenarioAsOfDate,
      }),
    );
  });

  it('throws NotFoundException for unknown project', () => {
    const service = new ProjectsService(ds);
    expect(() => service.getProjectStub('NOPE', '01')).toThrow(
      NotFoundException,
    );
  });
});
