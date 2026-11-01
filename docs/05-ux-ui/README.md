---
id: DOC-UX-README-001
title: "UX / UI"
type: index
status: draft
version: "1.1.0"
created: 2026-10-30
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-PROD-001
  - DOC-UX-001
  - DOC-UX-010
  - DOC-UX-014
  - DOC-UX-015
  - DOC-UX-016
  - DOC-UX-017
  - DOC-UX-018
  - DOC-UX-019
  - DOC-UX-020
  - DOC-HANDOFF-UID-001
---

# 05-ux-ui

UX + Visual Direction + UI Design documentation для **Demo v1**. Frontmatter документов — `status: draft` (lifecycle docs ≠ decision status).

**D1–D11** — `approved UX decision`; **D12** — `deferred decision`. **VD-A** — `approved Visual Direction baseline`. **UI Design Spec plan** — COMPLETED (Iterations 0–5). **UI Design pack** — **APPROVED** (`approved UI Design decision`). **Implementation** — NOT STARTED (pack APPROVE ≠ impl start). BA-OQ-006 open (working assumption V1 table); mock volume = `hypothesis`.

## Правила

- Не подменять продуктовые REQ / BR / living OpenSpec.
- Не править DOC-PROD-012 в этом пакете; mock volume = `hypothesis`.
- AI не ставит `status: approved` на UX/VD docs (frontmatter).
- Различать: `approved UX decision` · `approved Visual Direction baseline` · `approved UI Design decision` · `deferred decision` · `open_question` · `hypothesis` · `proposal` · `assumption`.
- Макеты (Figma и т.п.) — по ссылке; в git — описания и решения.
- UI Design overview: [demo-v1-ui-design-overview.md](./demo-v1-ui-design-overview.md) (DOC-UX-014).
- UI Foundations: [demo-v1-ui-foundations.md](./demo-v1-ui-foundations.md) (DOC-UX-015).
- UI Components: [demo-v1-component-specification.md](./demo-v1-component-specification.md) (DOC-UX-016).
- UI Data viz: [demo-v1-ui-data-viz.md](./demo-v1-ui-data-viz.md) (DOC-UX-018).
- UI Interactions: [demo-v1-ui-interactions.md](./demo-v1-ui-interactions.md) (DOC-UX-019).
- UI Screens: [demo-v1-ui-screens.md](./demo-v1-ui-screens.md) (DOC-UX-017).
- UI Quality: [demo-v1-ui-quality.md](./demo-v1-ui-quality.md) (DOC-UX-020).
- UI Design handoff: [`docs/07-delivery/handoffs/2026-11-01-ui-design.md`](../07-delivery/handoffs/2026-11-01-ui-design.md).

## Demo v1 UX decisions

| Файл | ID | Назначение |
|------|-----|------------|
| [demo-v1-ux-concept.md](./demo-v1-ux-concept.md) | DOC-UX-001 | Summary, D1–D12 statuses, constraints, open Q |
| [demo-v1-shell-navigation.md](./demo-v1-shell-navigation.md) | DOC-UX-002 | Shell, 5 nav, theme, Snapshot, breadcrumbs |
| [demo-v1-screens-and-flows.md](./demo-v1-screens-and-flows.md) | DOC-UX-003 | Inventory + A→B→C (+ PM paths) |
| [demo-v1-dashboard.md](./demo-v1-dashboard.md) | DOC-UX-004 | Director Dashboard (D8); BA-OQ-006 open |
| [demo-v1-schedule-workspace.md](./demo-v1-schedule-workspace.md) | DOC-UX-005 | Table/Gantt control points (D10–D12) |
| [demo-v1-entity-detail.md](./demo-v1-entity-detail.md) | DOC-UX-006 | Full Page + Tabs + Links vs Impact |
| [demo-v1-data-viz-and-components.md](./demo-v1-data-viz-and-components.md) | DOC-UX-007 | shadcn / TanStack / Recharts / Gantt deferred |
| [demo-v1-mock-ux-requirements.md](./demo-v1-mock-ux-requirements.md) | DOC-UX-008 | Volume hypothesis + integrity + status allowlist |
| [demo-v1-ux-traceability.md](./demo-v1-ux-traceability.md) | DOC-UX-009 | UX Decision → Screen → sources → Status |

## Demo v1 Visual Direction (`approved Visual Direction baseline` = VD-A)

| Файл | ID | Назначение |
|------|-----|------------|
| [demo-v1-visual-direction.md](./demo-v1-visual-direction.md) | DOC-UX-010 | VD-A baseline; VD-B/C not selected; principles |
| [demo-v1-design-tokens.md](./demo-v1-design-tokens.md) | DOC-UX-011 | Roles / principles under VD-A; HEX illustrative → UI Design |
| [demo-v1-screen-compositions.md](./demo-v1-screen-compositions.md) | DOC-UX-012 | Shell + key screens composition under VD-A |
| [demo-v1-visual-references.md](./demo-v1-visual-references.md) | DOC-UX-013 | Reference honesty log |

## Demo v1 UI Design Specification (plan COMPLETED; pack APPROVED; Implementation NOT STARTED)

| Файл | ID | Назначение |
|------|-----|------------|
| [demo-v1-ui-design-overview.md](./demo-v1-ui-design-overview.md) | DOC-UX-014 | Wave overview, status map, constraints, handoff summary |
| [demo-v1-ui-foundations.md](./demo-v1-ui-foundations.md) | DOC-UX-015 | Foundations: HEX Light/Dark, contrast, type, density, shadcn map (`approved UI Design decision`) |
| [demo-v1-component-specification.md](./demo-v1-component-specification.md) | DOC-UX-016 | Components: shell, data display, entity summaries, detail, viz boundaries (`approved UI Design decision`) |
| [demo-v1-ui-screens.md](./demo-v1-ui-screens.md) | DOC-UX-017 | Screens: eight surfaces composition (`approved UI Design decision`) |
| [demo-v1-ui-data-viz.md](./demo-v1-ui-data-viz.md) | DOC-UX-018 | Data viz: Snapshot A/B/C, Links vs Impact, charts, Gantt semantics (`approved UI Design decision`) |
| [demo-v1-ui-interactions.md](./demo-v1-ui-interactions.md) | DOC-UX-019 | Interactions: Snapshot/theme/nav/table/detail/keyboard (`approved UI Design decision`) |
| [demo-v1-ui-quality.md](./demo-v1-ui-quality.md) | DOC-UX-020 | Quality criteria: docs vs impl checks (`approved UI Design decision`) |

## Связанное

- UX handoff: [`docs/07-delivery/handoffs/2026-10-31-ux-ui.md`](../07-delivery/handoffs/2026-10-31-ux-ui.md)
- Visual Direction handoff: [`docs/07-delivery/handoffs/2026-10-31-visual-direction.md`](../07-delivery/handoffs/2026-10-31-visual-direction.md)
- Domain / BR / needs: `docs/02-business-analysis/`
- Living OpenSpec: `openspec/specs/`
- Plans (repo path, not portal): `.cursor/plans/visual-direction-demo-v1.md`, `.cursor/plans/ui-design-spec-demo-v1.md`
