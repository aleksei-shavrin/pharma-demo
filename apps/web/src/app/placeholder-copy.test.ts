/** @vitest-environment node */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Schedule remains deferred placeholder after I4 (I6). */
const deferredPlaceholders = ['schedule/page.tsx'] as const;

describe('deferred placeholder pages (director-facing copy)', () => {
  it('Schedule uses neutral RU copy without iteration jargon', () => {
    for (const rel of deferredPlaceholders) {
      const src = readFileSync(join(__dirname, rel), 'utf8');
      expect(src).toMatch(/Раздел находится в разработке/);
      expect(src).not.toMatch(/\bI[3-8]\b/);
      expect(src).not.toMatch(/Заглушка оболочки/);
      expect(src).not.toMatch(/итерац/i);
    }
  });

  it('I4 register pages are no longer placeholder stubs', () => {
    for (const rel of [
      'equipment/page.tsx',
      'issues-risks/page.tsx',
      'milestones/page.tsx',
    ] as const) {
      const src = readFileSync(join(__dirname, rel), 'utf8');
      expect(src).not.toMatch(/PagePlaceholder/);
      expect(src).not.toMatch(/Раздел находится в разработке/);
      expect(src).not.toMatch(/\bI[3-8]\b/);
    }
  });
});
