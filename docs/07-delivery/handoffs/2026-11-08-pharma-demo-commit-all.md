---
id: DOC-HO-2026-11-08-PHARMA-COMMIT-ALL
title: 'Handoff: локальный snapshot-коммит накопленного pharma-demo'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: apps-engineering
---

# Handoff — фиксация накопленного diff (pharma-demo)

## Контекст

Явный запрос: проверить и зафиксировать все текущие изменения локальными коммитами. Только `pharma-demo`. Без push/deploy/amend/rebase. Coverage dumps и секреты не в git.

## Сделано

- Gates: typecheck api/web 0; lint api/web 0; api tests 336; web vitest 491; api/web build 0; lint:docs 0; lint:links 0; docs:build 0 при `DOCUSAURUS_BASE_URL=/docs/` (закреплено в `package.json` script).
- Минимальные lint/build blockers: unused vars, Suspense для `useSearchParams`, docs MD/links, ignore `coverage-*`.
- Secret scan: hits только test fixtures / env refs / parser tokens (значения не в отчёт).
- Один snapshot commit (переплетённый накопленный diff).

## Исключения (намеренно вне commit)

- `apps/*/coverage-*` — generated, добавлены в `.gitignore`
- gitignored secrets: `.env*`, `.dev-login-password*`, `.server-login-password*`
- browser evidence в `/tmp/`

## Следующее

- Human review docs/OpenSpec drafts; archive changes по процессу.
- Документационный репозиторий — отдельная волна (вне этого workspace).
