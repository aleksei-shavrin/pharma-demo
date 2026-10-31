---
id: DOC-UX-README-001
title: "UX / UI"
type: index
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-PROD-001
  - DOC-UX-001
  - DOC-UX-010
---

# 05-ux-ui

UX + Visual Direction documentation для **Demo v1**. Frontmatter документов — `status: draft` (lifecycle docs ≠ decision status).

**D1–D11** — `approved UX decision`; **D12** — `deferred decision`. Visual Direction (VD-A primary) — `proposal` до отдельного human review. BA-OQ/HIP и mock volume остаются open / hypothesis.

## Правила

- Не подменять продуктовые REQ / BR / living OpenSpec.
- Не править DOC-PROD-012 в этом пакете; mock volume = `hypothesis`.
- AI не ставит `status: approved` на UX/VD docs (frontmatter).
- Различать: `approved UX decision` · `deferred decision` · `open_question` · `hypothesis` · `proposal` · `assumption`.
- Макеты (Figma и т.п.) — по ссылке; в git — описания и решения.

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

## Demo v1 Visual Direction (`proposal`)

| Файл | ID | Назначение |
|------|-----|------------|
| [demo-v1-visual-direction.md](./demo-v1-visual-direction.md) | DOC-UX-010 | VD-A primary; VD-B/C compare; principles |
| [demo-v1-design-tokens.md](./demo-v1-design-tokens.md) | DOC-UX-011 | Roles / Light-Dark / semantic status / type / depth |
| [demo-v1-screen-compositions.md](./demo-v1-screen-compositions.md) | DOC-UX-012 | Shell + key screens visual composition |
| [demo-v1-visual-references.md](./demo-v1-visual-references.md) | DOC-UX-013 | Reference honesty log (no external product audit this wave) |

## Связанное

- UX handoff: [`docs/07-delivery/handoffs/2026-10-31-ux-ui.md`](../07-delivery/handoffs/2026-10-31-ux-ui.md)
- Visual Direction handoff: [`docs/07-delivery/handoffs/2026-10-31-visual-direction.md`](../07-delivery/handoffs/2026-10-31-visual-direction.md)
- Domain / BR / needs: `docs/02-business-analysis/`
- Living OpenSpec: `openspec/specs/`
- Plan (repo path, not portal): `.cursor/plans/visual-direction-demo-v1.md`
