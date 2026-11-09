import { BadRequestException } from '@nestjs/common';
import {
  isSnapshotId,
  SNAPSHOT_IDS_ALLOWED_MESSAGE,
  type SnapshotId,
} from './snapshot-id';

/**
 * Request-scoped snapshot query: omitted → 01; invalid → 400 (no silent fallback).
 * Letters and non-canonical numerics are rejected (no dual identity).
 */
export function parseSnapshotQuery(raw: string | undefined | null): SnapshotId {
  if (raw === undefined || raw === null || raw === '') {
    return '01';
  }
  if (typeof raw !== 'string' || !isSnapshotId(raw)) {
    throw new BadRequestException(
      `Invalid snapshot '${String(raw)}'. Allowed values: ${SNAPSHOT_IDS_ALLOWED_MESSAGE}.`,
    );
  }
  return raw;
}
