#!/usr/bin/env node
/**
 * Guardrails for portal cross-references:
 * - registry builds cleanly (unique IDs);
 * - every BR-/PROC-/SCN- registry entry has an #anchor;
 * - canonical BR headings declare stable {#br-NNN} anchors;
 * - no duplicate {#anchor} within a multi-entity page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, rel } from './lib/docs-files.mjs';

const errors = [];

const build = spawnSync(process.execPath, ['scripts/build-cross-ref-registry.mjs'], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (build.status !== 0) {
  console.error(build.stdout);
  console.error(build.stderr);
  process.exit(build.status ?? 1);
}

const registryPath = path.join(ROOT, 'website/src/cross-ref-registry.json');
const payload = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const entries = payload.entries ?? {};

for (const [id, entry] of Object.entries(entries)) {
  if (!entry.href || typeof entry.href !== 'string') {
    errors.push(`${id}: missing href`);
    continue;
  }
  if (['br', 'proc', 'scn'].includes(entry.kind)) {
    if (!entry.href.includes('#')) {
      errors.push(`${id}: ${entry.kind} entry must include #anchor (${entry.href})`);
    }
  }
  if (entry.kind === 'doc' || entry.kind === 'req' || entry.kind === 'adr') {
    if (entry.href.includes('#')) {
      // document-level IDs should not force anchors
    }
  }
}

function assertExplicitAnchors(file, headingRe, expectedIds) {
  const raw = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const found = new Map();
  let m;
  while ((m = headingRe.exec(raw)) !== null) {
    found.set(m[1], m[2]);
  }
  for (const id of expectedIds) {
    const anchor = found.get(id);
    if (!anchor) {
      errors.push(`${file}: missing explicit {#…} anchor for ${id}`);
      continue;
    }
    const want = id.toLowerCase();
    if (anchor !== want && !anchor.startsWith(`${want}-`)) {
      errors.push(
        `${file}: ${id} anchor "{#${anchor}}" should be "{#${want}}" (or ${want}-…)`,
      );
    }
  }
  // duplicate anchors in file
  const anchors = [...found.values()];
  const seen = new Set();
  for (const a of anchors) {
    if (seen.has(a)) errors.push(`${file}: duplicate anchor #${a}`);
    seen.add(a);
  }
}

assertExplicitAnchors(
  'docs/02-business-analysis/business-rules-demo-v1.md',
  /^#{2,3}\s+(BR-\d{3})\b[^\n]*\{#([a-z0-9-]+)\}/gm,
  ['BR-001', 'BR-002', 'BR-003', 'BR-004', 'BR-005', 'BR-006', 'BR-007'],
);

assertExplicitAnchors(
  'docs/02-business-analysis/process-specs-demo-v1.md',
  /^#{2,3}\s+(PROC-\d{3})\b[^\n]*\{#([a-z0-9-]+)\}/gm,
  ['PROC-001', 'PROC-004', 'PROC-005', 'PROC-007', 'PROC-010', 'PROC-011'],
);

assertExplicitAnchors(
  'docs/01-discovery/management-scenarios.md',
  /^#{2,3}\s+(SCN-\d{3})\b[^\n]*\{#([a-z0-9-]+)\}/gm,
  ['SCN-001', 'SCN-002', 'SCN-003', 'SCN-004', 'SCN-005', 'SCN-006', 'SCN-007', 'SCN-008'],
);

// Required namespaces present
for (const id of ['BR-004', 'DOC-BA-014', 'ADR-0001', 'DOC-ADR-0001', 'REQ-EQPT-001', 'SCN-007', 'PROC-007']) {
  if (!entries[id]) errors.push(`registry missing expected id ${id}`);
}

if (errors.length) {
  console.error('check-cross-ref-registry: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} issue(s).`);
  process.exit(1);
}

console.log(
  `check-cross-ref-registry: OK (${Object.keys(entries).length} entries; anchors verified)`,
);
