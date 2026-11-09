---
id: DOC-HANDOFF-2026-11-09-DOCS-CI-PORTAL-LINKS
title: 'Handoff: fix Docusaurus broken links under CI baseUrl=/portal/'
type: handoff
status: draft
version: 0.1.0
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
certainty_note: 'assumption link contract; not Codex-accepted stamp.'
---

# Handoff — docs CI portal links

## Мета

- **От:** Auto
- **Кому:** Codex / CI
- **Evidence:** `/tmp/pharma-docs-ci-links/`

## Root cause

1. Registry hardcodил `/docs/…`; CI `DOCUSAURUS_BASE_URL=/portal/` → broken `/portal/docs/…`. Footer `to: /portal/DOC-PORTAL-HOME-001` без join base (коллизия имени папки `portal` с deployment prefix).
2. Relative markdown → `apps/…` / `docker-compose*.yml`: на полном checkout Docusaurus кладёт файлы в `/assets/files/`, в CI image `apps/` нет → broken `/apps/…`. Duplicate `/` — `pages/index.tsx` vs docs `routeBasePath: '/'`.

## Fix

- Site-path registry + `joinDocsBaseUrl` once at build (remark/footer)
- Remark `demote-out-of-tree-links` → inline code для путей вне `docs/` + `openspec/specs/`
- Remove conflicting `website/src/pages/index.tsx`
- Tests: `docs-site-href.test.mjs`, `docs-out-of-tree-link.test.mjs`, updated cross-ref expectations
- Doc note in `server-compose-demo.md`

## Gates

См. `/tmp/pharma-docs-ci-links/` и итоговый отчёт сессии. Evidence: fail→pass unit + docker `Dockerfile` build с `DOCUSAURUS_BASE_URL=/portal/`.
