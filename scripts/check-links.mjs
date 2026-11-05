#!/usr/bin/env node
/**
 * Lightweight internal relative-link check for docs/ and openspec/specs Markdown.
 * Skips http(s), mailto, anchors-only, and non-file schemes. Dependency-light.
 */
import fs from 'node:fs';
import path from 'node:path';
import { collectMarkdownFiles, rel, ROOT } from './lib/docs-files.mjs';

const LINK_RE = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;

const files = collectMarkdownFiles({
  roots: ['docs', 'openspec/specs'],
});

const errors = [];
let linkCount = 0;

function stripHashAndQuery(target) {
  const noHash = target.split('#')[0];
  return noHash.split('?')[0];
}

function shouldSkip(target) {
  const t = target.trim();
  if (!t || t.startsWith('#')) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return true; // http:, mailto:, etc.
  if (t.startsWith('//')) return true;
  return false;
}

function resolveCandidates(fromFile, targetPath) {
  const dir = path.dirname(fromFile);
  const decoded = decodeURIComponent(targetPath);
  const base = path.resolve(dir, decoded);
  const candidates = [base];
  if (!path.extname(base)) {
    candidates.push(`${base}.md`, `${base}.mdx`, path.join(base, 'README.md'), path.join(base, 'index.md'));
  }
  return candidates;
}

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  // Ignore fenced code blocks to avoid example-link false positives.
  const withoutCode = raw.replace(/```[\s\S]*?```/g, '');
  let match;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(withoutCode)) !== null) {
    const target = match[2].trim().replace(/^<|>$/g, '');
    // Markdown title: url "title"
    const url = target.split(/\s+/)[0].replace(/^<|>$/g, '');
    if (shouldSkip(url)) continue;
    linkCount += 1;
    const cleaned = stripHashAndQuery(url);
    if (!cleaned) continue;

    const candidates = resolveCandidates(file, cleaned);
    const exists = candidates.some((c) => fs.existsSync(c));
    if (!exists) {
      errors.push(`${rel(file)}: broken relative link → (${url})`);
    } else {
      // Prefer targets inside repo (warn if escapes, but still ok if exists)
      const hit = candidates.find((c) => fs.existsSync(c));
      const normalized = path.resolve(hit);
      if (!normalized.startsWith(ROOT + path.sep) && normalized !== ROOT) {
        errors.push(`${rel(file)}: link escapes repo root → (${url})`);
      } else if (url.includes('#')) {
        const hash = url.split('#')[1]?.split('?')[0]?.trim();
        if (hash && fs.existsSync(hit) && hit.endsWith('.md')) {
          const targetRaw = fs.readFileSync(hit, 'utf8');
          const explicit = new RegExp(`\\{#${escapeRegExp(hash)}\\}`, 'i');
          if (!explicit.test(targetRaw) && explicitAnchorsRequired(hit)) {
            errors.push(
              `${rel(file)}: missing anchor #${hash} in ${rel(hit)}`,
            );
          }
        }
      }
    }
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Multi-entity canonical pages must keep explicit {#id} anchors. */
function explicitAnchorsRequired(absPath) {
  const r = rel(absPath);
  return (
    r.endsWith('business-rules-demo-v1.md') ||
    r.endsWith('process-specs-demo-v1.md') ||
    r.endsWith('management-scenarios.md')
  );
}

if (errors.length) {
  console.error('check-links: FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} broken link(s); ${linkCount} internal link(s) checked.`);
  process.exit(1);
}

console.log(
  `check-links: OK (${linkCount} internal relative link(s) across ${files.length} file(s))`,
);
