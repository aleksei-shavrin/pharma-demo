#!/usr/bin/env node
/**
 * Require substantive docs frontmatter fields:
 * id, title, type, status, version, created, updated, owner
 *
 * - All Markdown under docs/ is checked by default (W1 ships frontmatter everywhere).
 * - docs/_templates are linted loosely: require id+title+type if frontmatter present;
 *   fail only if frontmatter is missing entirely or required seed fields absent.
 * - Pure README indexes without frontmatter would be allowlisted; currently W1
 *   includes frontmatter on indexes, so they are checked fully.
 */
import fs from 'node:fs';
import matter from 'gray-matter';
import { collectMarkdownFiles, rel } from './lib/docs-files.mjs';

const REQUIRED = [
  'id',
  'title',
  'type',
  'status',
  'version',
  'created',
  'updated',
  'owner',
];

const TEMPLATE_REQUIRED = ['id', 'title', 'type', 'status'];

function isTemplate(filePath) {
  return rel(filePath).startsWith('docs/_templates/');
}

function isEmptyish(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

const files = collectMarkdownFiles({ roots: ['docs'] });
const errors = [];
let checked = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const hasFence = raw.startsWith('---\n') || raw.startsWith('---\r\n');
  const relative = rel(file);
  const template = isTemplate(file);

  if (!hasFence) {
    // Allowlist: pure README indexes may omit frontmatter (none today).
    if (/\/README\.md$/i.test(relative) || /\\README\.md$/i.test(relative)) {
      console.warn(`skip (index without frontmatter): ${relative}`);
      continue;
    }
    errors.push(`${relative}: missing YAML frontmatter`);
    continue;
  }

  let data;
  try {
    ({ data } = matter(raw));
  } catch (err) {
    errors.push(`${relative}: invalid frontmatter (${err.message})`);
    continue;
  }

  const required = template ? TEMPLATE_REQUIRED : REQUIRED;
  const missing = required.filter((key) => isEmptyish(data[key]));
  if (missing.length) {
    errors.push(`${relative}: missing fields: ${missing.join(', ')}`);
  }
  checked += 1;
}

if (errors.length) {
  console.error('check-doc-frontmatter: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} issue(s); ${checked} file(s) checked.`);
  process.exit(1);
}

console.log(
  `check-doc-frontmatter: OK (${checked} file(s) with required frontmatter)`,
);
