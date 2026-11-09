---
id: DOC-DEL-RPT-2026-11-09-GUIDE-DOCS-SYNC
title: 'Отчёт: аудит и синхронизация DOC-GUIDE-001 / active docs'
type: report
status: draft
version: '1.1.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-GUIDE-001
  - DOC-HO-2026-11-09-GUIDE-DOCS-SYNC
---

# Отчёт — аудит GUIDE и active docs (2026-11-09)

> **certainty:** assumption — сверка реализации DX UI/docs на `http://127.0.0.1:3080`; не domain fact и не human-approved закрытие E02.

## Scope

- Репозиторий **pharma-demo** only; apps/API runtime **не** менялись.
- Цель: актуализировать [DOC-GUIDE-001](../../guides/how-to/demo-v1-live-presentation.md), затем согласованный active docs слой (guides/product/UX/portal/ops/rehearsal + точечно enrichment drafts).
- **Не** в scope: docs-portal; rewrite archive handoffs/reports как current; approved domain REQ; commit/push.

## Method

1. Индексы docs/portal + scoped `rg` (12 вех, renderer toggle, «Решение записано», A–H, `:3000`, `docs.localhost`, «Обзор» как home, `PRJ-01`).
2. Playwright shell на существующем `:3080` (login admin/admin): снимки 01/02/03/06/07/08, календарь, реестр решений, portal GUIDE; допроверка EAC `MetricAbbrTip` и `?program=PRG-DSN`.
3. Правки docs + docs gates; evidence screenshots/logs в `/tmp/pharma-guide-docs-sync/` (не в Git).

## Coverage matrix (кратко)

| Область | Результат |
|---------|-----------|
| GUIDE how-to | **Исправлено** → current DX сценарий |
| Director rehearsal / walkthrough E01–E03 | **Исправлено**; dated прогон 2026-11-06 — **historical** |
| Dashboard / R2 UX delta / shell / schedule UX / ui-screens | **Исправлено** или помечено historical / superseded |
| Portal home + access | **Исправлено** (DX same-origin vs W1 `docs.localhost`) |
| Enrichment spine PRJ→PRT | **Исправлено** в drafts + historical note |
| Ops local-dev / form-login | Уже current — **без изменений** в этой волне review |
| Living OpenSpec | Spot: конфликтов PRJ/Обзор как current не найдено — **без изменений** |
| Requirements / BA / architecture product | **Граница покрытия: spot only**, не полная верификация domain truth |
| Handoffs / reports / final-report | **Archive** — не переписывались задним числом |

## Findings (review-fix после Codex)

1. Walkthrough §E01–E03 шаги «снова 12 вех» / три renderer в «текущем» абзаце → current steps 189/default + ECharts; прогон 2026-11-06 вынесен под **historical**.
2. R2-U1 APPROVED сохранён как human decision **2026-11-02**; рядом **Superseded presentation** → [demo-v1-dashboard.md](../../05-ux-ui/demo-v1-dashboard.md) (ECharts / 189).
3. Cost tips: hover/focus EAC открывает tip «Прогноз стоимости по завершении (Estimate at Completion)» via `MetricAbbrTip` — uncertainty закрыта (реализация есть).
4. `PRG-DSN` на C: «Вехи программы» с контентом; старая empty-фраза — historical.
5. Портфель 01 vs PRT-01 — intentional UX/id split, не open question.
6. E02 — остаётся открытым (нужен другой участник).

## Checks

Docs gates (frontmatter, ids, certainty, cross-ref, portal-excludes, lint:docs, lint:links, docs:build) — см. evidence `/tmp/pharma-guide-docs-sync/gates-summary.txt` (ожидаемо exit 0 после волны). Portal GUIDE + labels — browser smoke в том же каталоге.

## Unresolved

- E02 human rehearsal.
- Полный обход всех BA/REQ/architecture документов как domain truth — **не** выполнен (явная граница).
