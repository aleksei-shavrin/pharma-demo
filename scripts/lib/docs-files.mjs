import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');

/**
 * Collect Markdown files under docs/ (and optionally other roots).
 * Always skips node_modules.
 */
export function collectMarkdownFiles({
  roots = ['docs'],
  ignoreTemplates = false,
} = {}) {
  const patterns = roots.map((root) =>
    path.join(ROOT, root, '**/*.md').replace(/\\/g, '/'),
  );
  const ignore = ['**/node_modules/**'];
  if (ignoreTemplates) {
    ignore.push('**/docs/_templates/**');
  }

  const files = globSync(patterns, {
    nodir: true,
    ignore,
    absolute: true,
  });

  return files.sort((a, b) => a.localeCompare(b));
}

export function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}
