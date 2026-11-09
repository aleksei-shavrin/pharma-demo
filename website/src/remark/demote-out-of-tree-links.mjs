/**
 * Remark: demote relative links that resolve outside published content roots
 * (docs/, openspec/specs/) to inline code. Keeps onBrokenLinks=throw honest
 * without shipping apps/ into the docs Docker image.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visitParents } from 'unist-util-visit-parents';
import {
  demoteLinkLabel,
  shouldDemoteOutOfTreeLink,
} from '../../../scripts/lib/docs-out-of-tree-link.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

const DEFAULT_ROOTS = [
  path.join(REPO_ROOT, 'docs'),
  path.join(REPO_ROOT, 'openspec', 'specs'),
];

function linkText(node) {
  const parts = [];
  const walk = (n) => {
    if (!n) return;
    if (n.type === 'text' || n.type === 'inlineCode') {
      parts.push(n.value ?? '');
      return;
    }
    if (Array.isArray(n.children)) n.children.forEach(walk);
  };
  walk(node);
  return parts.join('');
}

/**
 * @returns {import('unified').Plugin}
 */
export default function demoteOutOfTreeLinks(options = {}) {
  const contentRoots = options.contentRoots ?? DEFAULT_ROOTS;
  return (tree, file) => {
    const fromFile = file.path ? path.resolve(file.path) : null;
    if (!fromFile) return;

    visitParents(tree, 'link', (node, ancestors) => {
      const parent = ancestors[ancestors.length - 1];
      if (!parent?.children) return;
      const url = node.url ?? '';
      if (!shouldDemoteOutOfTreeLink(fromFile, url, contentRoots)) return;
      const index = parent.children.indexOf(node);
      if (index < 0) return;
      const label = demoteLinkLabel(linkText(node), url);
      parent.children[index] = { type: 'inlineCode', value: label };
    });
  };
}
