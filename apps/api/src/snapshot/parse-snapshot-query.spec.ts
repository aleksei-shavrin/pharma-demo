import { BadRequestException } from '@nestjs/common';
import { parseSnapshotQuery } from './parse-snapshot-query';

describe('parseSnapshotQuery', () => {
  it('defaults omitted/empty to A', () => {
    expect(parseSnapshotQuery(undefined)).toBe('A');
    expect(parseSnapshotQuery(null)).toBe('A');
    expect(parseSnapshotQuery('')).toBe('A');
  });

  it('accepts A–S machine ids', () => {
    expect(parseSnapshotQuery('A')).toBe('A');
    expect(parseSnapshotQuery('C')).toBe('C');
    expect(parseSnapshotQuery('H')).toBe('H');
    expect(parseSnapshotQuery('I')).toBe('I');
    expect(parseSnapshotQuery('S')).toBe('S');
  });

  it('rejects T and other invalid values with 400 semantics', () => {
    expect(() => parseSnapshotQuery('T')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('Z')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('a')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('AB')).toThrow(BadRequestException);
  });
});
