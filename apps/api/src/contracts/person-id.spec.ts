import {
  PERSON_ID_PATTERN_SOURCE,
  SH_TO_PER,
  assertPersonId,
  isPersonId,
  mapShToPer,
} from './person-id';

describe('R2-C1-R1 Person id contract', () => {
  it('runtime accepts PER-01 / PER-12; rejects SH / short / non-digit', () => {
    expect(isPersonId('PER-01')).toBe(true);
    expect(isPersonId('PER-12')).toBe(true);
    expect(isPersonId('SH-DIR-01')).toBe(false);
    expect(isPersonId('PER-1')).toBe(false);
    expect(isPersonId('PER-ABC')).toBe(false);
    expect(isPersonId('PERSON-01')).toBe(false);
    expect(PERSON_ID_PATTERN_SOURCE).toBe(String.raw`^PER-\d{2,}$`);
  });

  it('assertPersonId is the reusable runtime primitive for P1/W1', () => {
    expect(assertPersonId('PER-08')).toBe('PER-08');
    expect(() => assertPersonId('SH-DIR-01', 'leadPersonId')).toThrow(
      /leadPersonId/,
    );
    expect(() => assertPersonId('PER-1')).toThrow(/PER-/);
  });

  it('exposes SH→PER migration map only (not semantic ownership of records)', () => {
    expect(mapShToPer('SH-DIR-01')).toBe('PER-01');
    expect(mapShToPer('SH-ENG-01')).toBe('PER-08');
    expect(mapShToPer('SH-UNKNOWN')).toBeUndefined();
    expect(Object.keys(SH_TO_PER).every((k) => k.startsWith('SH-'))).toBe(true);
    expect(Object.values(SH_TO_PER).every((v) => isPersonId(v))).toBe(true);
  });
});
