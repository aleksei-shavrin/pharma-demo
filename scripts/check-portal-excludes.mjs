#!/usr/bin/env node
/**
 * Portal exclude guards:
 * 1) website/ must not hold a copied docs content tree (SoT stays in ../docs).
 * 2) website/build must not publish openspec/changes (or archive) routes.
 *
 * Soft: if website/build is missing, skip the build scan with a clear message
 *       (exit 0 for that part). Source-tree checks always run.
 * Hard: when build exists, fail on leaked change paths.
 *
 * test:docs runs this twice — before build (soft if no build) and after (hard).
 */
import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { ROOT, rel } from './lib/docs-files.mjs';

const errors = [];
const notes = [];

function isSymlinkToDocs(targetPath) {
  try {
    const st = fs.lstatSync(targetPath);
    if (!st.isSymbolicLink()) return false;
    const resolved = fs.realpathSync(targetPath);
    const docsRoot = fs.realpathSync(path.join(ROOT, 'docs'));
    return resolved === docsRoot;
  } catch {
    return false;
  }
}

// --- 1) No website/docs content copy ---
const websiteDocs = path.join(ROOT, 'website', 'docs');
if (fs.existsSync(websiteDocs)) {
  if (isSymlinkToDocs(websiteDocs)) {
    notes.push('website/docs is a symlink to repo docs/ (allowed)');
  } else {
    const mdCopies = globSync('**/*.{md,mdx}', {
      cwd: websiteDocs,
      nodir: true,
      absolute: false,
    });
    // Heuristic: any markdown under website/docs is a content duplicate risk.
    if (mdCopies.length > 0) {
      errors.push(
        `website/docs contains ${mdCopies.length} markdown file(s) — docs SoT must stay outside website/ (use path: ../docs). Sample: ${mdCopies.slice(0, 5).join(', ')}`,
      );
    } else {
      notes.push('website/docs exists but has no .md/.mdx (ok)');
    }
  }
}

// Also flag accidental product-tree mirrors under website/content or website/src/docs
for (const candidate of ['website/content', 'website/src/docs']) {
  const abs = path.join(ROOT, candidate);
  if (!fs.existsSync(abs)) continue;
  const md = globSync('**/*.{md,mdx}', { cwd: abs, nodir: true });
  if (md.length > 0) {
    errors.push(
      `${candidate} contains ${md.length} markdown file(s); avoid copying docs trees into website/`,
    );
  }
}

// --- 2) Build scan for openspec/changes leakage ---
const buildDir = path.join(ROOT, 'website', 'build');
const soft = process.argv.includes('--soft');
const hard = process.argv.includes('--hard');
const requireBuild = hard || process.env.PORTAL_EXCLUDES_REQUIRE_BUILD === '1';

if (!fs.existsSync(buildDir)) {
  const msg =
    'website/build missing — skipping build scan for openspec/changes (run docs:build, then re-check)';
  if (requireBuild) {
    errors.push(msg);
  } else {
    notes.push(soft || !hard ? `soft: ${msg}` : msg);
    console.warn(`check-portal-excludes: ${msg}`);
  }
} else {
  // Directory / route presence
  const forbiddenDirs = [
    path.join(buildDir, 'openspec', 'changes'),
    path.join(buildDir, 'changes'),
  ];
  for (const dir of forbiddenDirs) {
    if (fs.existsSync(dir)) {
      errors.push(`forbidden build path exists: ${rel(dir)}`);
    }
  }

  const changeHtml = globSync('**/openspec/changes/**/*.{html,htm}', {
    cwd: buildDir,
    nodir: true,
    absolute: true,
  });
  if (changeHtml.length) {
    errors.push(
      `build publishes openspec/changes pages (${changeHtml.length}): ${changeHtml.slice(0, 5).map(rel).join(', ')}`,
    );
  }

  // href="/openspec/changes/... — real navigation leak (prose mentions alone OK)
  const htmlFiles = globSync('**/*.{html,htm}', {
    cwd: buildDir,
    nodir: true,
    absolute: true,
    ignore: ['**/assets/**'],
  });
  const hrefLeakRe =
    /(?:href|src)=["'][^"']*\/openspec\/changes(?:\/|"|')/i;
  const leaks = [];
  for (const file of htmlFiles) {
    const text = fs.readFileSync(file, 'utf8');
    if (hrefLeakRe.test(text)) {
      leaks.push(rel(file));
    }
  }
  if (leaks.length) {
    errors.push(
      `HTML href leak to /openspec/changes in ${leaks.length} file(s): ${leaks.slice(0, 8).join(', ')}`,
    );
  }

  notes.push(`scanned website/build (${htmlFiles.length} html file(s))`);
}

for (const n of notes) {
  if (!n.startsWith('soft:')) console.log(`note: ${n}`);
}

if (errors.length) {
  console.error('check-portal-excludes: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('check-portal-excludes: OK');
