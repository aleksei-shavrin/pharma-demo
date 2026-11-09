/**
 * Discrete Demo v1 snapshot machine ids (canonical numeric strings 01–19).
 */
export const SNAPSHOT_IDS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
] as const;
export type SnapshotId = (typeof SNAPSHOT_IDS)[number];

/** Snapshots loaded in Nest fixtures (full 01–19). */
export const POPULATED_SNAPSHOT_IDS = SNAPSHOT_IDS;
export type PopulatedSnapshotId = SnapshotId;

export const SNAPSHOT_IDS_ALLOWED_MESSAGE =
  '01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19';

export function isSnapshotId(value: string): value is SnapshotId {
  return (SNAPSHOT_IDS as readonly string[]).includes(value);
}

export function isPopulatedSnapshotId(
  value: string,
): value is PopulatedSnapshotId {
  return (POPULATED_SNAPSHOT_IDS as readonly string[]).includes(value);
}
