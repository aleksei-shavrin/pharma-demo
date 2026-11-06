import type { PersonId } from '../contracts/person-id';
import type { BuiltProjectCosts } from './fixtures/build-costs';
import type { NotificationFixture } from './fixtures/notification-catalog';
import type { PersonFixture } from './fixtures/person-catalog';
import type { ScheduleWorkSnapshotFixture } from './fixtures/schedule-works';
import type {
  ProjectFixture,
  SnapshotFixture,
  SnapshotId,
} from './fixtures/types';
import type { WorkstreamId } from './workstream-ids';

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
  /** Person catalogue (R2-P1). */
  abstract listPeople(): readonly PersonFixture[];
  abstract getPerson(id: PersonId): PersonFixture | null;
  abstract personFullNameRu(id: PersonId): string;
  abstract leadPersonIdForWorkstream(ws: WorkstreamId): PersonId;
  abstract leadWorkstreamIdsForPerson(id: PersonId): WorkstreamId[];
  /** Director notifications read-model (R2-N1; fixture-authored, not SoT). */
  abstract listNotifications(snapshotId: SnapshotId): NotificationFixture[];
  /** Schedule Work bars + dependency links (G07–G11); empty for snapshots without works. */
  abstract getScheduleWorks(
    snapshotId: SnapshotId,
  ): ScheduleWorkSnapshotFixture;
}

export const DEMO_DATA_SOURCE = Symbol('DEMO_DATA_SOURCE');
