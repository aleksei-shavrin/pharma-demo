import assert from 'node:assert/strict';
import {
  joinDocsBaseUrl,
  sitePathFromDocsFile,
} from './lib/docs-site-href.mjs';

assert.equal(sitePathFromDocsFile('README.md', 'DOC-PORTAL-001'), '/');
assert.equal(
  sitePathFromDocsFile('03-requirements/REQ-NFR-001.md', 'REQ-NFR-001'),
  '/requirements/REQ-NFR-001',
);
assert.equal(
  sitePathFromDocsFile('00-portal/home.md', 'DOC-PORTAL-HOME-001'),
  '/portal/DOC-PORTAL-HOME-001',
);
assert.equal(
  sitePathFromDocsFile('02-business-analysis/README.md', 'DOC-BA-README'),
  '/business-analysis/',
);

// Registry must NOT embed deployment base — join once per build.
assert.equal(joinDocsBaseUrl('/requirements/REQ-NFR-001', '/'), '/requirements/REQ-NFR-001');
assert.equal(
  joinDocsBaseUrl('/requirements/REQ-NFR-001', '/docs/'),
  '/docs/requirements/REQ-NFR-001',
);
assert.equal(
  joinDocsBaseUrl('/requirements/REQ-NFR-001', '/portal/'),
  '/portal/requirements/REQ-NFR-001',
);
// Folder name `portal` under deployment base `/portal/` must double-prefix once intentionally.
assert.equal(
  joinDocsBaseUrl('/portal/DOC-PORTAL-HOME-001', '/portal/'),
  '/portal/portal/DOC-PORTAL-HOME-001',
);
assert.equal(
  joinDocsBaseUrl('/portal/DOC-PORTAL-HOME-001', '/docs/'),
  '/docs/portal/DOC-PORTAL-HOME-001',
);
// Correct site path never yields /portal/docs/
assert.equal(
  joinDocsBaseUrl('/requirements/REQ-NFR-001', '/portal/').includes('/portal/docs/'),
  false,
);

console.log('docs-site-href.test: PASS');
