/**
 * Remark plugin: autolink known portal IDs (BR-/DOC-/ADR-/REQ-/SCN-/PROC-…)
 * using website/src/cross-ref-registry.json. Skips existing links and code.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visitParents } from 'unist-util-visit-parents';

const registryPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../cross-ref-registry.json',
);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadRegistry() {
  const payload = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const entries = payload.entries ?? {};
  const ids = Object.keys(entries).sort((a, b) => b.length - a.length);
  const idRe = ids.length
    ? new RegExp(`\\b(${ids.map(escapeRegExp).join('|')})\\b`, 'g')
    : null;
  return { entries, idRe };
}

function isSkipAncestor(ancestors) {
  return ancestors.some((n) => {
    const t = n.type;
    return (
      t === 'link' ||
      t === 'linkReference' ||
      t === 'definition' ||
      t === 'inlineCode' ||
      t === 'code' ||
      t === 'yaml' ||
      t === 'html'
    );
  });
}

/**
 * @returns {import('unified').Plugin}
 */
export default function crossRefAutolink() {
  const { entries: ENTRIES, idRe: ID_RE } = loadRegistry();
  return (tree) => {
    if (!ID_RE) return;

    visitParents(tree, 'text', (node, ancestors) => {
      if (isSkipAncestor(ancestors)) return;
      const value = node.value;
      if (!value || !ID_RE.test(value)) {
        ID_RE.lastIndex = 0;
        return;
      }
      ID_RE.lastIndex = 0;

      const parent = ancestors[ancestors.length - 1];
      if (!parent || !Array.isArray(parent.children)) return;

      const parts = [];
      let last = 0;
      let match;
      while ((match = ID_RE.exec(value)) !== null) {
        const id = match[1];
        const entry = ENTRIES[id];
        if (!entry) continue;
        if (match.index > last) {
          parts.push({ type: 'text', value: value.slice(last, match.index) });
        }
        parts.push({
          type: 'link',
          url: entry.href,
          title: null,
          children: [{ type: 'text', value: id }],
          data: {
            hProperties: {
              className: ['ppc-cross-ref'],
              'data-ref-id': id,
              'data-ref-kind': entry.kind,
            },
          },
        });
        last = match.index + id.length;
      }
      if (parts.length === 0) return;
      if (last < value.length) {
        parts.push({ type: 'text', value: value.slice(last) });
      }

      const idx = parent.children.indexOf(node);
      if (idx === -1) return;
      parent.children.splice(idx, 1, ...parts);
    });
  };
}