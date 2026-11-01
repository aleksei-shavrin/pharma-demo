import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Structural API boundary (I1):
 * use cases / controllers → DemoDataSource → MockDemoDataSource → fixtures.
 * Fixture implementation imports are allowed only under src/data/.
 */

const FIXTURE_IMPORT_RE =
  /(?:from\s+|require\s*\(\s*)['"][^'"]*data\/fixtures(?:\/|['"])|from\s+['"]\.\/fixtures(?:\/|['"])|from\s+['"]\.\.\/fixtures(?:\/|['"])|fixtures\/snapshot-|SNAPSHOT_[ABC]\b/;

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

/** True when a non-data source file imports fixture implementation. */
export function isForbiddenFixtureImport(
  relPosixPath: string,
  source: string,
): boolean {
  const normalized = relPosixPath.replace(/\\/g, '/');
  if (normalized.startsWith('data/')) {
    return false;
  }
  return FIXTURE_IMPORT_RE.test(source);
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

describe('API layer boundaries (I1 structural)', () => {
  const srcRoot = path.join(__dirname);

  it('catches a hypothetical application service that imports fixtures', () => {
    expect(
      isForbiddenFixtureImport(
        'projects/evil.service.ts',
        `import { SNAPSHOT_A } from '../data/fixtures/snapshot-a';\n`,
      ),
    ).toBe(true);
    expect(
      isForbiddenFixtureImport(
        'projects/evil.controller.ts',
        `import { SNAPSHOTS } from '../data/fixtures';\n`,
      ),
    ).toBe(true);
  });

  it('allows fixture imports inside the data-access boundary', () => {
    expect(
      isForbiddenFixtureImport(
        'data/mock-demo-data-source.ts',
        `import { SNAPSHOT_A } from './fixtures/snapshot-a';\n`,
      ),
    ).toBe(false);
    expect(
      isForbiddenFixtureImport(
        'data/fixtures/index.ts',
        `import { SNAPSHOT_A } from './snapshot-a';\n`,
      ),
    ).toBe(false);
  });

  it('scans src recursively: no application/controller fixture imports', () => {
    const violations = findViolations(srcRoot);
    expect(violations).toEqual([]);
  });
});
