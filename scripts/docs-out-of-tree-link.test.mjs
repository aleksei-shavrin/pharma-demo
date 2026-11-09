import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  demoteLinkLabel,
  shouldDemoteOutOfTreeLink,
} from './lib/docs-out-of-tree-link.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = path.join(ROOT, 'docs');
const openspecRoot = path.join(ROOT, 'openspec', 'specs');
const roots = [docsRoot, openspecRoot];

const handoff = path.join(
  docsRoot,
  '07-delivery/handoffs/2026-11-09-dashboard-card-composition.md',
);
const ux = path.join(docsRoot, '05-ux-ui/demo-v1-shell-navigation.md');

// Fail→pass contract: repo source links are not portal routes.
assert.equal(
  shouldDemoteOutOfTreeLink(
    handoff,
    '../../../apps/web/src/components/dashboard/top-exceptions-panel.tsx',
    roots,
  ),
  true,
);
assert.equal(
  shouldDemoteOutOfTreeLink(
    path.join(docsRoot, '07-delivery/handoffs/x.md'),
    '../../../docker-compose.dev.yml',
    roots,
  ),
  true,
);

// Keep in-tree doc links and site/hash/external.
assert.equal(
  shouldDemoteOutOfTreeLink(
    ux,
    '../06-architecture/decisions/0006-portfolio-program-project-read-model.md',
    roots,
  ),
  false,
);
assert.equal(
  shouldDemoteOutOfTreeLink(ux, '/requirements/REQ-NFR-001', roots),
  false,
);
assert.equal(shouldDemoteOutOfTreeLink(ux, '#section', roots), false);
assert.equal(
  shouldDemoteOutOfTreeLink(ux, 'https://example.com/x', roots),
  false,
);

// Assets under docs/ stay (Dockerfile COPY docs).
assert.equal(
  shouldDemoteOutOfTreeLink(
    path.join(docsRoot, '07-delivery/reports/x.md'),
    './assets/c09-c11-timeline-compare/A-light-1-current.png',
    roots,
  ),
  false,
);

assert.equal(
  demoteLinkLabel('top-exceptions-panel.tsx', '../../../apps/web/foo.tsx'),
  'top-exceptions-panel.tsx',
);

console.log('docs-out-of-tree-link.test: PASS');
