#!/usr/bin/env node
/**
 * Ensure document IDs in YAML frontmatter are unique across docs/**.
 * Body placeholders inside templates (e.g. `id: DOC-ADR-NNNN`) are ignored.
 */
import fs from 'node:fs';
import matter from 'gray-matter';
import { collectMarkdownFiles, rel } from './lib/docs-files.mjs';

const files = collectMarkdownFiles({ roots: ['docs'] });
/** @type {Map<string, string[]>} */
const byId = new Map();
const errors = [];

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.startsWith('---')) continue;

  let data;
  try {
    ({ data } = matter(raw));
  } catch (err) {
    errors.push(`${rel(file)}: invalid frontmatter (${err.message})`);
    continue;
  }

  const id = data.id;
  if (id === undefined || id === null || String(id).trim() === '') {
    errors.push(`${rel(file)}: missing frontmatter id`);
    continue;
  }

  const key = String(id).trim();
  const list = byId.get(key) ?? [];
  list.push(rel(file));
  byId.set(key, list);
}

for (const [id, paths] of byId) {
  if (paths.length > 1) {
    errors.push(`duplicate id "${id}":\n    - ${paths.join('\n    - ')}`);
  }
}

if (errors.length) {
  console.error('check-doc-ids: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} issue(s); ${byId.size} unique id(s) seen.`);
  process.exit(1);
}

console.log(`check-doc-ids: OK (${byId.size} unique id(s) across ${files.length} file(s))`);
