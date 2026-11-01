/** @vitest-environment node */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pages = [
  'schedule/page.tsx',
  'equipment/page.tsx',
  'issues-risks/page.tsx',
  'milestones/page.tsx',
] as const;

describe('placeholder pages (director-facing copy)', () => {
  it('uses neutral RU copy without iteration jargon', () => {
    for (const rel of pages) {
      const src = readFileSync(
        join(__dirname, rel),
        'utf8',
      );
      expect(src).toMatch(/Раздел находится в разработке/);
      expect(src).not.toMatch(/\bI[3-8]\b/);
      expect(src).not.toMatch(/Заглушка оболочки/);
      expect(src).not.toMatch(/итерац/i);
    }
  });
});
