import { BadRequestException } from '@nestjs/common';
import { parseSnapshotQuery } from './parse-snapshot-query';

describe('parseSnapshotQuery', () => {
  it('defaults omitted/empty to A', () => {
    expect(parseSnapshotQuery(undefined)).toBe('A');
    expect(parseSnapshotQuery(null)).toBe('A');
    expect(parseSnapshotQuery('')).toBe('A');
  });

  it('accepts A, B, C', () => {
    expect(parseSnapshotQuery('A')).toBe('A');
    expect(parseSnapshotQuery('B')).toBe('B');
    expect(parseSnapshotQuery('C')).toBe('C');
  });

  it('rejects invalid values with 400 semantics', () => {
    expect(() => parseSnapshotQuery('D')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('a')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('AB')).toThrow(BadRequestException);
  });
});
