import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Structural API boundary:
 * use cases / controllers → DemoDataSource → MockDemoDataSource → fixtures.
 * Value imports of fixture modules are allowed only under src/data/.
 * `import type` of shared shapes from fixtures/types is allowed (no runtime fixture constants).
 */

const FIXTURE_VALUE_IMPORT_RE =
  /(?:from\s+|require\s*\(\s*)['"][^'"]*data\/fixtures(?:\/|['"])|from\s+['"]\.\/fixtures(?:\/|['"])|from\s+['"]\.\.\/fixtures(?:\/|['"])|fixtures\/snapshot-|SNAPSHOT_[ABC]\b/;

function stripTypeOnlyImports(source: string): string {
  return source.replace(
    /import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?/g,
    '',
  );
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkTsFiles(full, out);
      continue;
    }
    if (!name.endsWith('.ts')) continue;
    if (name.endsWith('.spec.ts')) continue;
    out.push(full);
  }
  return out;
}

/** True when a non-data source file value-imports fixture implementation. */
export function isForbiddenFixtureImport(
  relPosixPath: string,
  source: string,
): boolean {
  const normalized = relPosixPath.replace(/\\/g, '/');
  if (normalized.startsWith('data/')) {
    return false;
  }
  return FIXTURE_VALUE_IMPORT_RE.test(stripTypeOnlyImports(source));
}

function findViolations(srcRoot: string): string[] {
  const files = walkTsFiles(srcRoot);
  const violations: string[] = [];
  for (const file of files) {
    const rel = path.relative(srcRoot, file).replace(/\\/g, '/');
    const source = readFileSync(file, 'utf8');
    if (isForbiddenFixtureImport(rel, source)) {
      violations.push(rel);
    }
  }
  return violations;
}

describe('API layer boundaries (structural)', () => {
  const srcRoot = path.join(__dirname);

  it('catches application services that value-import fixtures', () => {
    expect(
      isForbiddenFixtureImport(
        'projects/evil.service.ts',
        `import { SNAPSHOT_A } from '../data/fixtures/snapshot-a';\n`,
      ),
    ).toBe(true);
    expect(
      isForbiddenFixtureImport(
        'dashboard/evil.service.ts',
        `import { SNAPSHOTS } from '../data/fixtures';\n`,
      ),
    ).toBe(true);
  });

  it('allows import type of fixture shapes outside data/', () => {
    expect(
      isForbiddenFixtureImport(
        'dashboard/dashboard.service.ts',
        `import type { SnapshotFixture } from '../data/fixtures/types';\n`,
      ),
    ).toBe(false);
  });

  it('allows fixture imports inside the data-access boundary', () => {
    expect(
      isForbiddenFixtureImport(
        'data/mock-demo-data-source.ts',
        `import { SNAPSHOT_A } from './fixtures/snapshot-a';\n`,
      ),
    ).toBe(false);
  });

  it('scans src recursively: no application value-imports of fixtures', () => {
    const violations = findViolations(srcRoot);
    expect(violations).toEqual([]);
  });
});
