---
id: DOC-HANDOFF-2026-11-09-PEOPLE-FOCUS
title: 'Handoff: Dashboard people-focus card'
type: handoff
status: draft
version: '0.1.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-v1
related:
  - openspec/changes/dashboard-people-focus/proposal.md
---

# Handoff: Участники — управленческий фокус

## Мета

- **От:** Cursor Auto (people-signals wave)
- **Кому:** review / QA / next dashboard polish
- **Дата:** 2026-11-09
- **Область:** `openspec/changes/dashboard-people-focus/**`, `apps/api/src/dashboard/people-focus*`, `apps/web/src/components/dashboard/people-focus*`, `docs/05-ux-ui/demo-v1-dashboard.md`

## Цель волны

Карточка «Участники: управленческий фокус» в lower-grid (5-й child): typed BE read-model + FE card + 19-snap audit + gates/browser. Без commit/push; без portfolio/timeline/calendar правок.

## Сделано

- OpenSpec change draft: proposal / design / delta spec
- `buildPeopleFocus` + Jest (dedup / sort / A-first / decisions excluded / Closed)
- `DashboardOverview.peopleFocus` DTO + service wiring (previous only if listed in dataSource)
- FE `PeopleFocusPanel` + fixture/types + u1 grid order tests
- UX note in `demo-v1-dashboard.md` (5th card / dense A)
- Review-wave r2: «Новых критичных» + hint `к снимку NN · date`; `buildReasons(previousKnown)`; `removedCriticalSignalCount`; quiet «нет активных вопросов»; row «Критичные вопросы»; MetricAbbrTip dedup; entity title/aria on links

## Limits (не баг продукта)

- Risk / Milestone **без** `ownerPersonId` — не создаём red «unassigned risks» на карточке людей
- Decisions **не** в eligibility/sort/quiet (due ≠ исполнение)
- Critical только через `critical && Delayed` EQ и/или active issue с `equipmentId` на такой EQ
- Нет fake `owner=` query на реестрах; drill = `/people/{id}` + entity detail hrefs
- «Снято критичных сигналов» ≠ Closed/execution; personCriticalSum ≥ global unique (verified)

## Артефакты

| Путь | Примечание |
|------|------------|
| `/tmp/pharma-demo-artifacts/pharma-people-signals-1c199ddd/` | Jest logs, snap-audit, browser PNG |
| `openspec/changes/dashboard-people-focus/` | draft change |

## Certainty

> **certainty:** fact — owner fields Issue/EQ; Risk/MS owner отсутствует в модели Demo v1
>
> **certainty:** assumption — формулировки summary «критичных вопросов» = product label для distinct critical incidents
