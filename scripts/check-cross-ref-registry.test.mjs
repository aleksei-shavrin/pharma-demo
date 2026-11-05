import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(script) {
  return spawnSync(process.execPath, [script], {
    cwd: ROOT,
    encoding: 'utf8',
  });
}

const build = run('scripts/build-cross-ref-registry.mjs');
assert.equal(build.status, 0, build.stderr || build.stdout);

const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'website/src/cross-ref-registry.json'), 'utf8'),
);
assert.equal(
  registry.entries['BR-004']?.href,
  '/docs/business-analysis/DOC-BA-014#br-004',
);
assert.equal(
  registry.entries['DOC-BA-014']?.href,
  '/docs/business-analysis/DOC-BA-014',
);
assert.equal(registry.entries['ADR-0001']?.href, registry.entries['DOC-ADR-0001']?.href);
assert.ok(registry.entries['ADR-0001']?.href.includes('/docs/architecture/decisions/'));
assert.ok(registry.entries['REQ-EQPT-001']?.href.includes('/docs/requirements/'));
assert.ok(registry.entries['SCN-007']?.href.endsWith('#scn-007'));
assert.ok(registry.entries['PROC-007']?.href.endsWith('#proc-007'));
assert.equal(
  registry.entries['project-status-overview']?.href,
  '/openspec/project-status-overview/spec',
);
const check = run('scripts/check-cross-ref-registry.mjs');
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log('check-cross-ref-registry.test: PASS');
