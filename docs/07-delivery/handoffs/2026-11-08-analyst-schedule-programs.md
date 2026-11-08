---
id: DOC-HANDOFF-2026-11-08-ANALYST-MERGE
title: 'Handoff: слияние календаря аналитика и программ'
type: handoff
status: draft
version: 0.4.0
created: '2026-11-08'
updated: '2026-11-08'
owner: demo-engineering
related:
  - DOC-RPT-2026-11-08-ANALYST-IMPORT
---

# Handoff: слияние календаря аналитика и программ

## Мета

- **От:** Auto (сессия 1c199ddd, финальный consistency pass)
- **Кому:** review
- **Дата:** 2026-11-08
- **Область:** apps/api, apps/web, openspec, docs

## Сделано

- Leaf↔leaf links: scheduling FS + cross_project; seams fan-out/chain; droppedResolvable=0
- Alias MS = controlpoint; counters КТ 147 / catalog 42 / items 688
- WS-QC→AN-20; UI без «Направление»
- Shared list/detail read model: progress = completed/(works+КТ); без seed «якорь C»/depth
- Программы: колонка «Ответственные» из WS leads / владельцев AN / связей issue+EQ (без выдуманного program owner)
- Living OpenSpec portfolio; audit RU; evidence r2 (schedule) + r3 (portfolio)

## Evidence

`/tmp/pharma-demo-artifacts/pharma-analyst-programs-1c199ddd/`

- `browser-evidence-r2.json` — schedule A/C/S (сохранять)
- `browser-evidence-r3.json` — programs/projects tables + AN-08 + API 7/25 list=detail (`ok: true`)
- `web-coverage-wave-r3.txt` — FE wave modules (не auth)
- `api-coverage-r3.txt` — overall branches ≥80%

## Gates (факт прогона)

- API jest 284 pass; coverage stmts 93.96% / branches **80.18%** / funcs 89.07% / lines 94.34%
- FE vitest 409 pass; wave coverage (program-filter, ws-redirect, portfolio-views, visible-rows, gantt-*, fill-tone): stmts 96.45% / branches 83.96% / funcs 97.05% / lines 96.45%
- typecheck API + web: ok
- architecture boundary: без нарушений в этом прогоне

## Остаточные пределы

- `PRG-DSN` / `PRG-ORG` могут иметь пустых ответственных (нет WS lead и authored owner) — честно «Не назначены»
- Vendor DHTMLX adapter не в wave coverage include

## Не утверждается

Human approval / archive OpenSpec change — не выполнялись. Commit/push — не выполнялись.
