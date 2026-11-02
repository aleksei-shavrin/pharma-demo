import { BadRequestException } from '@nestjs/common';
import {
  isSnapshotId,
  SNAPSHOT_IDS_ALLOWED_MESSAGE,
  type SnapshotId,
} from './snapshot-id';

/**
 * Request-scoped snapshot query: omitted → A; invalid → 400 (no silent fallback).
 * Accepts A–S (R2); fixture population remains A–H until R2-L1.
 */
export function parseSnapshotQuery(raw: string | undefined | null): SnapshotId {
  if (raw === undefined || raw === null || raw === '') {
    return 'A';
  }
  if (typeof raw !== 'string' || !isSnapshotId(raw)) {
    throw new BadRequestException(
      `Invalid snapshot '${String(raw)}'. Allowed values: ${SNAPSHOT_IDS_ALLOWED_MESSAGE}.`,
    );
  }
  return raw;
}
