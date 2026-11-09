import { BadRequestException } from '@nestjs/common';
import { parseSnapshotQuery } from './parse-snapshot-query';

describe('parseSnapshotQuery', () => {
  it('defaults omitted/empty to 01', () => {
    expect(parseSnapshotQuery(undefined)).toBe('01');
    expect(parseSnapshotQuery(null)).toBe('01');
    expect(parseSnapshotQuery('')).toBe('01');
  });

  it('accepts numeric machine ids 01–19', () => {
    expect(parseSnapshotQuery('01')).toBe('01');
    expect(parseSnapshotQuery('03')).toBe('03');
    expect(parseSnapshotQuery('08')).toBe('08');
    expect(parseSnapshotQuery('09')).toBe('09');
    expect(parseSnapshotQuery('19')).toBe('19');
  });

  it('rejects letters and non-canonical numerics with 400 semantics', () => {
    expect(() => parseSnapshotQuery('A')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('C')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('S')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('1')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('001')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('00')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('20')).toThrow(BadRequestException);
    expect(() => parseSnapshotQuery('T')).toThrow(BadRequestException);
  });
});
