#!/usr/bin/env node
/**
 * For key product/architecture seed files, require at least one certainty
 * vocabulary marker in the body:
 *   fact | assumption | hypothesis | open_question
 *
 * Does not scan every docs file (avoids false positives on empty indexes).
 */
import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { ROOT, rel } from './lib/docs-files.mjs';

// Prefer explicit certainty blocks; also accept bare `certainty: <value>` lines.
const CERTAINTY_RE =
  /(?:\*\*certainty:\*\*|certainty:)\s*(fact|assumption|hypothesis|open_question)\b/i;

/** Globs relative to repo root — intentional seed allowlist. */
const SEED_GLOBS = [
  'docs/03-product/vision-and-scope.md',
  'docs/03-product/target-technology-stack.md',
  'docs/03-product/demo-v1-architecture.md',
  'docs/03-product/persistence-transition.md',
  'docs/06-architecture/arc42.md',
  'docs/06-architecture/decisions/0001-*.md',
  'docs/06-architecture/decisions/0002-*.md',
  'docs/06-architecture/decisions/0003-*.md',
  'docs/00-portal/research-and-decisions.md',
  'docs/standards/documentation-standard.md',
];

function resolveSeeds() {
  const files = new Set();
  for (const pattern of SEED_GLOBS) {
    const absPattern = path.join(ROOT, pattern).replace(/\\/g, '/');
    for (const match of globSync(absPattern, { nodir: true, absolute: true })) {
      files.add(match);
    }
  }
  return [...files].sort((a, b) => a.localeCompare(b));
}

const seeds = resolveSeeds();
const errors = [];
const warnings = [];

if (seeds.length === 0) {
  console.error('check-certainty-markers: FAILED — no seed files matched');
  process.exit(1);
}

for (const file of seeds) {
  if (!fs.existsSync(file)) {
    errors.push(`missing seed file: ${rel(file)}`);
    continue;
  }
  const raw = fs.readFileSync(file, 'utf8');
  // Strip YAML frontmatter so we only judge body vocabulary.
  const body = raw.replace(/^---[\s\S]*?---\r?\n/, '');
  if (!CERTAINTY_RE.test(body)) {
    errors.push(`${rel(file)}: no certainty vocabulary (fact|assumption|hypothesis|open_question)`);
  }
}

// Soft warning: product README should mention certainty policy if present.
const productReadme = path.join(ROOT, 'docs/03-product/README.md');
if (fs.existsSync(productReadme)) {
  const body = fs.readFileSync(productReadme, 'utf8');
  if (!CERTAINTY_RE.test(body)) {
    warnings.push('docs/03-product/README.md has no certainty marker (warn only)');
  }
}

for (const w of warnings) console.warn(`warn: ${w}`);

if (errors.length) {
  console.error('check-certainty-markers: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} issue(s); ${seeds.length} seed file(s).`);
  process.exit(1);
}

console.log(
  `check-certainty-markers: OK (${seeds.length} seed file(s) with certainty vocabulary)`,
);
