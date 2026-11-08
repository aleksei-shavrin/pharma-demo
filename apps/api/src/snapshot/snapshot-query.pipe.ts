import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { parseSnapshotQuery } from './parse-snapshot-query';
import { SNAPSHOT_IDS_ALLOWED_MESSAGE, type SnapshotId } from './snapshot-id';

@Injectable()
export class SnapshotQueryPipe implements PipeTransform<unknown, SnapshotId> {
  transform(value: unknown): SnapshotId {
    if (value === undefined || value === null || value === '') {
      return parseSnapshotQuery(undefined);
    }
    if (typeof value !== 'string') {
      throw new BadRequestException(
        `Invalid snapshot '${typeof value}'. Allowed values: ${SNAPSHOT_IDS_ALLOWED_MESSAGE}.`,
      );
    }
    return parseSnapshotQuery(value);
  }
}
