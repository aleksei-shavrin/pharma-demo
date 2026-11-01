import { BadRequestException } from '@nestjs/common';
import { isSnapshotId, type SnapshotId } from './snapshot-id';

/**
 * Request-scoped snapshot query: omitted → A; invalid → 400 (no silent fallback).
 */
export function parseSnapshotQuery(raw: string | undefined | null): SnapshotId {
  if (raw === undefined || raw === null || raw === '') {
    return 'A';
  }
  if (typeof raw !== 'string' || !isSnapshotId(raw)) {
    throw new BadRequestException(
      `Invalid snapshot '${String(raw)}'. Allowed values: A, B, C.`,
    );
  }
  return raw;
}
