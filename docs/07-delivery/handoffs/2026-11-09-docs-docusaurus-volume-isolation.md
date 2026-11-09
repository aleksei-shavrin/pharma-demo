---
id: DOC-HO-2026-11-09-DOCS-DOCUSAURUS-VOLUME
title: 'Handoff: DX docs .docusaurus named volume isolation'
type: handoff
status: draft
version: '1.0.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
---

# Handoff — docs DX `.docusaurus` isolation

## Контекст

Переход сайдбар «Документация» → `http://127.0.0.1:3080/docs/` давал overlay  
`Cannot find module '/home/aleksei/.../website/.docusaurus/.../layers.css'`.  
Причина: host `npm run docs:build` писал absolute host paths в bind-mounted `website/.docusaurus`, а контейнер `docs` резолвит `/app/website/...`.

## Итог

В [`docker-compose.dev.yml`](../../../docker-compose.dev.yml) добавлен named volume `ppc_dev_docs_docusaurus` → `/app/website/.docusaurus` (как у `node_modules`). Recreate **только** `docs`. Ops: [`local-dev-and-demo.md`](../../10-operations/local-dev-and-demo.md). Evidence: `/tmp/pharma-docs-navigation/FIX-REPORT.md`.

## Проверки (факты)

| Check | Result |
|-------|--------|
| Pre-fix Playwright | FAIL (`pre-fix/browser-report.json`) |
| Post-fix Playwright | PASS → portal home, no pageerror |
| Host `docs:build` при живом docs | exit 0; container `client-modules.js` остаётся `/app/website/...` |
| Сервисы | api/docs/proxy/web — один стек `pharma-demo` |

## Ограничения

- Не `mv`/`rm` host `website/.docusaurus` при запущенном `docs` (ломает nested mount).
- `status` этого handoff — `draft`; certainty утверждений выше — по прогону 2026-11-09, не AI-approved product decision.
- docs-portal не затрагивался; Caddy/sidebar не менялись.
