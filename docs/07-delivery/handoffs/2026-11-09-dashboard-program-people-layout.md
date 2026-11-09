---
id: DOC-HANDOFF-2026-11-09-PROGRAM-PEOPLE-LAYOUT
title: 'Handoff: dashboard program layout + people-focus density'
type: handoff
status: draft
version: '0.2.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: demo-v1
related:
  - docs/05-ux-ui/demo-v1-dashboard.md
  - .cursor/plans/dashboard-program-people-layout.md
---

# Handoff: dashboard program + people layout

## Мета

- **От:** Auto agent (Cursor sole executor)
- **Кому:** review / следующий UI pass
- **Дата:** 2026-11-09
- **Область:** `docs/**`, `openspec/specs/portfolio-program-project`, `apps/web` dashboard cards, API audit spec

## Цель волны

Выровнять колонки «Состояние по программам», снять путаницу dual-axis (status vs progressFillTone), уплотнить people-focus (все people в DOM, critical-first summary).

## Сделано

- Audit 19 snaps: `status` = worst child; `progressFillTone` = `fillToneForProgramProjects`; dual-axis retained (нет helper bug). Артефакт `program-severity-audit.json`, Jest `program-severity-audit.spec.ts`.
- Program card: name | status badge | fixed progress (96–128px); no row fill; shared column widths; progress tip (% ≠ календарное отклонение).
- PeopleFocus: critical→new→people; no left border; no topN/show-more; snap 05/06 = 8/8 в DOM.
- Fix r2: `SemanticProgressBar` percent col `4.75ch` + dashboard `compact`; browser measure scrollWidth≤clientWidth for «100%»; clean shots без toast, people scrollTop=0 + bottom proof.
- Docs/OpenSpec/handoff/plan; artifacts → `/tmp/pharma-demo-artifacts/pharma-dashboard-program-people-layout/`.

## Не сделано / вне scope

- commit/push; eligibility/ranking peopleFocus; force fillTone=status; foreign dirty.

## Артефакты

| Путь | Примечание |
|------|------------|
| `.cursor/plans/dashboard-program-people-layout.md` | план |
| `program-severity-audit.json` | 19-snap matrix |
| PNG browser | card+context light/dark |

## Certainty / риски

> **certainty:** assumption
>
> Dual-axis — наблюдение кода + audit; не повышено до domain fact/approved без человека.
