/** @vitest-environment node */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('primary IA pages are no longer placeholder stubs', () => {
  it('I4–I6 pages ship real surfaces without PagePlaceholder / iteration jargon', () => {
    for (const rel of [
      'equipment/page.tsx',
      'issues-risks/page.tsx',
      'milestones/page.tsx',
      'schedule/page.tsx',
    ] as const) {
      const src = readFileSync(join(__dirname, rel), 'utf8');
      expect(src).not.toMatch(/PagePlaceholder/);
      expect(src).not.toMatch(/Раздел находится в разработке/);
      expect(src).not.toMatch(/\bI[3-8]\b/);
      expect(src).not.toMatch(/\bD12\b/);
    }
  });
});
