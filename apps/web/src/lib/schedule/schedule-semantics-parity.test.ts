/** @vitest-environment node */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveScheduleFillTone } from './schedule-fill-tone';
import {
  resolveScheduleWarning,
  type ScheduleWarningItem,
} from './schedule-warning';

const cases = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      '../../tools/test-fixtures/schedule-semantics-parity-cases.json',
    ),
    'utf8',
  ),
) as {
  warningCases: {
    id: string;
    item: ScheduleWarningItem;
    descendants: ScheduleWarningItem[];
    expectTone: string;
  }[];
  fillCases: {
    id: string;
    input: {
      kind: string;
      status?: string | null;
      rag?: string | null;
      warningTone: 'shift' | 'lag' | 'none';
    };
    expect: string;
  }[];
};

describe('FE schedule semantics parity fixtures', () => {
  for (const c of cases.warningCases) {
    it(`warning:${c.id}`, () => {
      expect(resolveScheduleWarning(c.item, c.descendants).tone).toBe(
        c.expectTone,
      );
    });
  }
  for (const c of cases.fillCases) {
    it(`fill:${c.id}`, () => {
      expect(resolveScheduleFillTone(c.input)).toBe(c.expect);
    });
  }
});
