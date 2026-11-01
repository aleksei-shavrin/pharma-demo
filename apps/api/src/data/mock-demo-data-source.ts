import { Injectable, NotFoundException } from '@nestjs/common';
import { DemoDataSource } from './demo-data-source';
import {
  DEFAULT_SNAPSHOT_ID,
  SNAPSHOTS,
  type ProjectFixture,
  type SnapshotFixture,
  type SnapshotId,
} from './fixtures';

/** Deterministic in-memory adapter over DOC-PROD-012 fixtures. */
@Injectable()
export class MockDemoDataSource extends DemoDataSource {
  getSnapshot(id: SnapshotId): SnapshotFixture {
    const snapshot = SNAPSHOTS[id];
    if (!snapshot) {
      throw new NotFoundException(`Unknown snapshot: ${id}`);
    }
    return snapshot;
  }

  getProject(snapshotId: SnapshotId, projectId: string): ProjectFixture | null {
    const snapshot = this.getSnapshot(snapshotId);
    if (snapshot.project.id !== projectId) {
      return null;
    }
    return snapshot.project;
  }

  listSnapshotIds(): SnapshotId[] {
    return Object.keys(SNAPSHOTS) as SnapshotId[];
  }

  /** I1 default context — Snapshot A only (full A/B/C switch is I2). */
  getDefaultSnapshot(): SnapshotFixture {
    return this.getSnapshot(DEFAULT_SNAPSHOT_ID);
  }
}
