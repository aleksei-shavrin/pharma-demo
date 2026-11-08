---
id: DOC-HANDOFF-2026-11-08-TIMELINE-ECHARTS-DECISIONS
title: 'Handoff: ECharts densify + decisions register'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-08'
updated: '2026-11-08'
owner: 'apps-engineering'
related:
  - DOC-UX-004
---

## Мета

- **От:** Auto (execute wave)
- **Кому:** Codex review / next session
- **Дата:** 2026-11-08
- **Область:** `openspec/changes/timeline-echarts-decisions-register/`, `docs/05-ux-ui/**`, `apps/web/**`, `apps/api/src/registers/**`, `.cursor/plans/timeline-echarts-decisions-register.md`

## Цель волны

1. Перенести информативность шкалы варианта 1 в вариант 3 (Apache ECharts) с постоянными подписями; default=1; vis не трогать.
2. Вынести «Управленческие решения» в sidebar `/decisions` (register + API) по существующим полям.

## Сделано

- План: `.cursor/plans/timeline-echarts-decisions-register.md`
- OpenSpec change + UX docs drafts
- ECharts densify + **Codex fix:** shared `ECHARTS_PLOT_INSETS` (128/10) for grid+SnapshotChrome
- Decisions register + **Codex fix:** `mergeRegisterSearchParams` retain `program`; toolbar search-only; page tests
- Vis: shared host filters feed same model; regression covered (unit + Playwright)
- Gates: typecheck 0/0; lint/build web & lint:docs fail on **baseline** unrelated paths; API build 0
- Label collision: `labelLayout` hideOverlap/moveOverlap + lane-aware selection; PS legend kept
- Chart evidence after scrollIntoView: `echarts-C-{desktop,overview,narrow}-chart.png` (+ full) in `/tmp/pharma-timeline-echarts-decisions/`
- Own-path eslint **0**, own docs markdownlint **0**, vitest labels **0**, web typecheck **0**
- Report v0.3: `docs/07-delivery/reports/2026-11-08-timeline-echarts-decisions-execute.md`

## Не сделано / вне scope

- Смена default на ECharts
- Decision entity-detail
- Новые npm-пакеты / commit / push
- Чужие dirty-правки (auth, schedule, analyst, …)

## Артефакты

| Путь | Примечание |
|------|------------|
| `.cursor/plans/timeline-echarts-decisions-register.md` | Accepted execute plan |
| `openspec/changes/timeline-echarts-decisions-register/` | OpenSpec change (draft) |

## Certainty / риски

> **certainty:** assumption
>
> Densify ECharts labels на 189 — приоритет overview/Red + collision; полный canvas label для всех 189 не требуется (как v1 markers).

## Блокеры

- Нет (IA `/decisions` явно разрешён пользователем 2026-11-08)

## Рекомендации следующей волне

1. Human review OpenSpec change / UX drafts (AI не ставит approved).
2. При необходимости — C14-style visual compare A/C light/dark для ECharts densify.
