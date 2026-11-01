---
id: DOC-ADR-0004
title: "ADR-0004: D12 Schedule timeline renderer — dhtmlx-gantt Community"
type: adr
status: draft
version: "0.3.0"
created: 2026-11-01
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-UX-005
  - DOC-UX-018
  - DOC-ADR-0002
---

# ADR-0004: D12 Schedule timeline renderer — dhtmlx-gantt Community

- **Статус решения:** accepted
- **Document lifecycle (`status` frontmatter):** `draft` — как у остальных ADR репозитория; решение D12 при этом **accepted** (не путать со `status: approved` документации).
- **Дата:** 2026-11-01

## Контекст

Demo v1 Schedule (D10/D11) needs a **read-only** secondary timeline for Milestone + Equipment delivery control points. Library choice was **D12 deferred**. I6 shipped Table + disabled Split/Timeline readiness. I7 resolves D12 and ships a real renderer without becoming a scheduling engine.

Spike checked npm/`LICENSE.md` for `dhtmlx-gantt@10.0.3`: **MIT** Community (`gantt.license === "mit"`). v9.x remains GPL — **not** used.

## Решение

> **certainty:** fact
>
> - **Renderer:** `dhtmlx-gantt` **Community Edition** pinned **`10.0.3`** (MIT).
> - **Integration:** core package + **project-owned React adapter** (`DhtmlxGanttAdapter`). No commercial React wrapper. No PRO/trial packages. No PRO APIs (`addTaskLayer`, built-in baselines, etc.).
> - **Boundary:** only the adapter imports `dhtmlx-gantt`. Schedule API/DTO, Domain, and Nest remain library-agnostic.
> - **Logical row model:** exactly **one** DHTMLX zero-duration `milestone` row per Schedule control point. Logical identity = `{ kind, entityId }` (presentation id `kind:entityId`). `deltaDays` **never** becomes DHTMLX `duration` / `type: 'task'`.
> - **Forecast:** `forecastDate` is the DHTMLX milestone `start_date` (primary marker; Equipment diamond / Milestone RAG geometry via CSS).
> - **Baseline:** when `baselineDate !== forecastDate`, a **project-owned overlay** ghost marker is painted on the **same** logical row. Baseline is **not** a second DHTMLX task/row. Overlay X from Community `posFromDate(baseline)`; Y from `getTaskPosition` of the logical row. Click maps to the same selection key.
> - **Fit-to-data / scale:** visible range = min/max of all baseline+forecast dates + modest padding; v10 `config.scales` month-only (`%F %Y`) with Russian locale; compact project-owned viewport height (`10.5rem`).
> - **Variance connector:** **not** implemented (would need PRO `addTaskLayer`, fake duration, or dependency link). Legend distinguishes forecast vs baseline.
> - **Theme:** adapter remaps vendor `--dhx-gantt-*` CSS variables to app design-system tokens under `.ppc-gantt-host` (Light/Dark).
> - **Selection:** Table ↔ Timeline sync at logical-row level; no horizontal auto-scroll that breaks fit-to-data.
> - **Read-only:** `readonly`, drag/link creation disabled; `links: []`.

## Разделение ответственности (Demo v1)

| Layer | Owns |
|---|---|
| **DHTMLX Community** | Logical row; forecast milestone; timeline scale/grid; row geometry |
| **Project adapter** | `ScheduleItem` → presentation row; baseline ghost overlay; logical selection; fit-to-data; design-system theme overrides |

This is a Demo v1 **presentation** compromise — not a general-purpose baseline/scheduling framework.

## Последствия

### Положительные

- MIT license fits closed Demo packaging.
- Point semantics match BA/UI (baseline/forecast are dates, not work bars).
- One visible row per control point (A/B/C = 2 rows for Demo fixtures).
- Multiple instances via `Gantt.getGanttInstance()` for React lifecycle.

### Отрицательные / компромиссы

- No PRO `addTaskLayer` / built-in baselines — baseline is a project overlay.
- No connector line between baseline and forecast.
- Vendor CSS requires scoped token remapping for shell Light/Dark.
- Height must stay project-owned (definite viewport) to avoid DHTMLX resize→render growth.

## Альтернативы

- **Fake duration task** styled as variance connector — **rejected** (encodes delta as work duration).
- **Dual DHTMLX rows** (`…:baseline` / `…:forecast`) — **rejected** for rendering (looked like two entities); legacy id parsing may remain for compatibility only.
- **SVAR React Gantt** / **Frappe Gantt** / **custom SVG** — not selected after DHTMLX GO.
- **dhtmlx-gantt ≤9.x (GPL)** — rejected (license).
- **DHTMLX PRO** — rejected (license/cost/scope).

## Ссылки

- [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md), [DOC-UX-018](../../05-ux-ui/demo-v1-ui-data-viz.md)
- npm `dhtmlx-gantt@10.0.3`, GitHub release v10.0.0 (Community MIT)
