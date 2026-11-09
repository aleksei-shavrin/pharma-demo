#!/usr/bin/env node
/**
 * Build portal cross-reference registry (DOC/BR/ADR/REQ/SCN/PROC → href).
 * Writes website/src/cross-ref-registry.json for the remark autolink plugin
 * and for check-cross-ref-registry.mjs.
 *
 * href values are **site paths** (routeBasePath `/`), without DOCUSAURUS_BASE_URL.
 * Consumers join the deployment base at build time (see docs-site-href.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { collectMarkdownFiles, ROOT, rel } from './lib/docs-files.mjs';
import { sitePathFromDocsFile } from './lib/docs-site-href.mjs';

const OUT = path.join(ROOT, 'website/src/cross-ref-registry.json');

/** @typedef {{ href: string, kind: string, source: string }} Entry */
/** @type {Record<string, Entry>} */
const registry = {};
/** @type {string[]} */
const errors = [];

function put(id, entry) {
  if (!id) return;
  if (registry[id] && registry[id].href !== entry.href) {
    errors.push(
      `duplicate id "${id}": ${registry[id].source} vs ${entry.source}`,
    );
    return;
  }
  registry[id] = entry;
}

/**
 * Category README.md → category index URL (`/business-analysis/`), not `.../DOC-*-README`.
 * Root docs/README.md → `/`.
 */
function portalHrefFromDocFile(absFile, frontmatterId) {
  const relative = path
    .relative(path.join(ROOT, 'docs'), absFile)
    .replaceAll('\\', '/');
  return sitePathFromDocsFile(relative, frontmatterId);
}

// --- DOC-* and REQ-* from frontmatter ---
for (const file of collectMarkdownFiles({ roots: ['docs'] })) {
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.startsWith('---')) continue;
  let data;
  try {
    ({ data } = matter(raw));
  } catch {
    continue;
  }
  const id = data?.id != null ? String(data.id).trim() : '';
  if (!id || id.includes('<') || id.includes('DOC-...')) continue;
  if (rel(file).startsWith('docs/_templates/')) continue;

  const href = portalHrefFromDocFile(file, id);
  put(id, {
    href,
    kind: id.startsWith('REQ-') ? 'req' : 'doc',
    source: rel(file),
  });

  // ADR-* aliases for DOC-ADR-NNNN
  const adr = /^DOC-ADR-(\d{4})$/.exec(id);
  if (adr) {
    put(`ADR-${adr[1]}`, {
      href,
      kind: 'adr',
      source: rel(file),
    });
  }
}

// --- Heading anchors: BR / PROC / SCN ---
function collectAnchors(file, re, kind, hrefBase) {
  const raw = fs.readFileSync(file, 'utf8');
  const withoutCode = raw.replace(/```[\s\S]*?```/g, '');
  let m;
  const local = new Set();
  while ((m = re.exec(withoutCode)) !== null) {
    const id = m[1];
    const anchor = m[2];
    if (local.has(id)) {
      errors.push(`${rel(file)}: duplicate heading id ${id}`);
      continue;
    }
    local.add(id);
    put(id, {
      href: `${hrefBase}#${anchor}`,
      kind,
      source: rel(file),
    });
  }
}

const ba014 = path.join(
  ROOT,
  'docs/02-business-analysis/business-rules-demo-v1.md',
);
const ba014Href = portalHrefFromDocFile(ba014, 'DOC-BA-014');
collectAnchors(
  ba014,
  /^##\s+(BR-\d{3})\b[^\n]*\{#([a-z0-9-]+)\}/gm,
  'br',
  ba014Href,
);

const procFile = path.join(
  ROOT,
  'docs/02-business-analysis/process-specs-demo-v1.md',
);
const procHref = portalHrefFromDocFile(procFile, 'DOC-BA-013');
collectAnchors(
  procFile,
  /^#{2,3}\s+(PROC-\d{3})\b[^\n]*\{#([a-z0-9-]+)\}/gm,
  'proc',
  procHref,
);

const scnFile = path.join(ROOT, 'docs/01-discovery/management-scenarios.md');
const scnHref = portalHrefFromDocFile(
  scnFile,
  matter(fs.readFileSync(scnFile, 'utf8')).data.id,
);
collectAnchors(
  scnFile,
  /^#{2,3}\s+(SCN-\d{3})\b[^\n]*\{#([a-z0-9-]+)\}/gm,
  'scn',
  scnHref,
);

// OpenSpec living specs → /openspec/<capability>/spec
const specsRoot = path.join(ROOT, 'openspec/specs');
for (const name of fs.readdirSync(specsRoot)) {
  const dir = path.join(specsRoot, name);
  if (!fs.statSync(dir).isDirectory()) continue;
  if (name === 'archive' || name === 'changes') continue;
  const specMd = path.join(dir, 'spec.md');
  if (!fs.existsSync(specMd)) continue;
  const href = `/openspec/${name}/spec`;
  put(name, {
    href,
    kind: 'openspec',
    source: `openspec/specs/${name}/spec.md`,
  });
}

if (errors.length) {
  console.error('build-cross-ref-registry: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const payload = {
  generatedAt: new Date().toISOString().slice(0, 10),
  count: Object.keys(registry).length,
  /** Site paths only — join DOCUSAURUS_BASE_URL at Docusaurus build time. */
  hrefMode: 'site-path',
  entries: registry,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `build-cross-ref-registry: OK (${payload.count} entries → ${path.relative(ROOT, OUT)})`,
);
