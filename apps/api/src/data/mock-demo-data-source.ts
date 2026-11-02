import { Injectable, NotFoundException } from '@nestjs/common';
import { DemoDataSource } from './demo-data-source';
import { isPopulatedSnapshotId } from '../snapshot/snapshot-id';
import {
  DEFAULT_SNAPSHOT_ID,
  SNAPSHOTS,
  type ProjectFixture,
  type SnapshotFixture,
  type SnapshotId,
} from './fixtures';
import {
  COST_SNAPSHOTS,
  type BuiltProjectCosts,
} from './fixtures/build-costs';

/** Deterministic in-memory adapter over DOC-PROD-012 / R2 fixtures. */
@Injectable()
export class MockDemoDataSource extends DemoDataSource {
  getSnapshot(id: SnapshotId): SnapshotFixture {
    if (!isPopulatedSnapshotId(id)) {
      throw new NotFoundException(`Unknown snapshot: ${id}`);
    }
    return SNAPSHOTS[id];
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const snapshot = this.getSnapshot(snapshotId);
    if (snapshot.project.id !== projectId) {
      return null;
    }
    return snapshot.project;
  }

  listSnapshotIds(): SnapshotId[] {
    return Object.keys(SNAPSHOTS) as (keyof typeof SNAPSHOTS)[];
  }

  /** I1 default context — Snapshot A only (full A/B/C switch is I2). */
  getDefaultSnapshot(): SnapshotFixture {
    return this.getSnapshot(DEFAULT_SNAPSHOT_ID);
  }

  getCosts(snapshotId: SnapshotId): BuiltProjectCosts {
    if (!isPopulatedSnapshotId(snapshotId)) {
      throw new NotFoundException(`Unknown snapshot: ${snapshotId}`);
    }
    return COST_SNAPSHOTS[snapshotId];
  }
}
