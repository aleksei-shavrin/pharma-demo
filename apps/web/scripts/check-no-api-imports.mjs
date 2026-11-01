#!/usr/bin/env node
/**
 * Architecture guard (I1): FE source must not reference apps/api paths or Nest packages.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');

const forbidden = [
  /from\s+['"][^'"]*apps\/api/,
  /require\(['"][^'"]*apps\/api/,
  /@nestjs\//,
  /fixtures\/snapshot-/,
  /mock-demo-data-source/,
  /DemoDataSource/,
];

/** Only the DHTMLX adapter may import the Gantt vendor package (ADR-0004). */
const ganttImport = /from\s+['"]dhtmlx-gantt(?:\/[^'"]*)?['"]|require\(['"]dhtmlx-gantt/;
const ganttAdapterRel = path.join(
  'src',
  'components',
  'schedule',
  'dhtmlx-gantt-adapter.tsx',
);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name)) files.push(full);
  }
  return files;
}

const files = await walk(srcRoot);
const violations = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const rel = path.relative(root, file);
  for (const re of forbidden) {
    if (re.test(text)) {
      violations.push(`${rel} matches ${re}`);
    }
  }
  if (ganttImport.test(text) && rel !== ganttAdapterRel) {
    violations.push(
      `${rel} imports dhtmlx-gantt (allowed only in ${ganttAdapterRel})`,
    );
  }
}

if (violations.length) {
  console.error('Architecture guard FAILED (FE → API/mock / Gantt boundary):');
  for (const v of violations) console.error(' -', v);
  process.exit(1);
}

console.log(
  'Architecture guard OK: no FE imports of API/mock internals; Gantt confined to adapter.',
);
