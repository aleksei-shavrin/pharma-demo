/**
 * Portal must not treat repo paths outside published content roots as routes.
 * Relative markdown links to apps/, compose files, etc. break CI docs image
 * (Dockerfile copies docs + openspec/specs + website only — not apps/).
 * On a full checkout Docusaurus may copy such files into /assets/files/; that
 * is not the contract for the docs portal and must not be required for build.
 */

import path from 'node:path';

/**
 * @param {string} fromFile absolute path of the markdown file
 * @param {string} url markdown link destination (may include hash/title)
 * @param {string[]} contentRoots absolute directories that are published
 * @returns {boolean} true → demote link to inline code (not a portal route)
 */
export function shouldDemoteOutOfTreeLink(fromFile, url, contentRoots) {
  if (url == null) return false;
  const raw = String(url).trim();
  if (!raw) return false;

  // Angle-bracket destinations / titled links: take first token.
  const bare = raw.replace(/^</, '').replace(/>$/, '').split(/\s+/)[0] ?? '';
  if (!bare) return false;

  const lower = bare.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('//')
  ) {
    return false;
  }
  // Site-absolute or in-page hash — leave to Docusaurus / autolink.
  if (bare.startsWith('/') || bare.startsWith('#')) return false;

  const pathPart = bare.split('#')[0].split('?')[0];
  if (!pathPart) return false;

  const resolved = path.resolve(path.dirname(fromFile), pathPart);
  const roots = contentRoots.map((r) => path.resolve(r));
  for (const root of roots) {
    const rel = path.relative(root, resolved);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
      return false; // inside a published content root (md, png, …)
    }
    // exact root match
    if (rel === '') return false;
  }
  return true;
}

/**
 * Plain label for demoted link (prefer link text, else basename).
 * @param {string} linkText
 * @param {string} url
 */
export function demoteLinkLabel(linkText, url) {
  const t = (linkText ?? '').trim();
  if (t) return t;
  const bare = String(url).trim().split(/\s+/)[0] ?? '';
  const pathPart = bare.split('#')[0];
  return path.basename(pathPart) || pathPart || bare;
}
