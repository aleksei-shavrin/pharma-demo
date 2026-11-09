/**
 * Portal link contract (deployment-prefix independent).
 *
 * Registry / autolink store **routeBasePath-relative** site paths
 * (docs plugin `routeBasePath: '/'`), e.g. `/requirements/REQ-NFR-001`,
 * `/portal/DOC-PORTAL-HOME-001`, `/openspec/foo/spec` — NEVER embed
 * `DOCUSAURUS_BASE_URL` (`/docs/`, `/portal/`, `/`) in the registry.
 *
 * At Docusaurus build time, join with baseUrl once. This avoids:
 * - `/portal/` + `/docs/…` → broken `/portal/docs/…`
 * - baseUrl `/portal/` + path `/portal/…` skipping prepend (folder name
 *   collision with deployment prefix) → missing `/portal/portal/…`
 */

/**
 * @param {string} sitePath route path starting with `/` (no deployment base)
 * @param {string} [baseUrl] DOCUSAURUS_BASE_URL (default `/`)
 * @returns {string} absolute pathname including deployment base once
 */
export function joinDocsBaseUrl(sitePath, baseUrl = '/') {
  const path = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
  const raw = baseUrl == null || baseUrl === '' ? '/' : String(baseUrl);
  if (raw === '/') return path;
  const base = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  return `${base}${path}`;
}

/**
 * Doc file under docs/ → site path (no deployment base).
 * Mirrors Docusaurus strip of numeric folder prefixes + frontmatter id.
 *
 * @param {string} relativeFromDocs posix path relative to docs/
 * @param {string} frontmatterId
 */
export function sitePathFromDocsFile(relativeFromDocs, frontmatterId) {
  const baseName = relativeFromDocs.split('/').pop() ?? relativeFromDocs;
  const dir =
    relativeFromDocs.includes('/')
      ? relativeFromDocs.slice(0, relativeFromDocs.lastIndexOf('/'))
      : '.';
  const strippedDir =
    dir === '.'
      ? ''
      : dir
          .split('/')
          .map((seg) => seg.replace(/^\d+-/, ''))
          .join('/');

  if (/^readme\.md$/i.test(baseName)) {
    if (!strippedDir) return '/';
    return `/${strippedDir}/`;
  }

  const idSeg = String(frontmatterId).trim();
  const base = strippedDir ? `${strippedDir}/${idSeg}` : idSeg;
  return `/${base}`;
}
