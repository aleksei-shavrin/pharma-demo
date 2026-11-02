import type { BuiltProjectCosts } from './fixtures/build-costs';
import type {
  ProjectFixture,
  SnapshotFixture,
  SnapshotId,
} from './fixtures/types';

/**
 * Minimal Demo v1 data-access boundary.
 * Use cases depend on this port — not on fixture constants directly.
 * Not a DB PersistencePort; shaped by Demo read use cases only.
 */
export abstract class DemoDataSource {
  abstract getSnapshot(id: SnapshotId): SnapshotFixture;
  abstract getProject(
    snapshotId: SnapshotId,
    projectId: string,
  ): ProjectFixture | null;
  abstract listSnapshotIds(): SnapshotId[];
  /** I1 default narrative context (Snapshot A) until I2 snapshot switching. */
  abstract getDefaultSnapshot(): SnapshotFixture;
  /** Project / Workstream / selective Equipment cost overview (R2-M1). */
  abstract getCosts(snapshotId: SnapshotId): BuiltProjectCosts;
}

export const DEMO_DATA_SOURCE = Symbol('DEMO_DATA_SOURCE');
