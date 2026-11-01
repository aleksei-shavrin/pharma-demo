---
id: DOC-UX-014
title: "Demo v1 UI Design Specification — overview"
type: product
status: draft
version: "0.4.0"
created: 2026-10-31
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-UX-010
  - DOC-UX-009
  - DOC-UX-015
  - DOC-UX-016
  - DOC-UX-018
  - DOC-UX-019
  - DOC-HANDOFF-VD-001
---

# Demo v1 UI Design Specification — overview

> **certainty:** hypothesis
>
> UI Design / Design Specification wave. Новые UI Design решения — **`proposal`** до отдельного human APPROVE UI Design pack. Frontmatter `status: draft` = lifecycle. **Не** переоткрывает VD-A / D1–D11. **Не** apps.

## 1. Purpose and wave status

| Item | Status |
|------|--------|
| Visual Direction | **COMPLETED**; VD-A = `approved Visual Direction baseline` |
| UX decisions D1–D11 | `approved UX decision` — not reopened |
| UI Design docs wave | **IN PROGRESS** — Iterations 0–3 done; Iterations 4–5 not started |
| Implementation (`apps/`) | **Out of scope** until separate explicit start |

Цель волны: markdown UI Design Specification (foundations → components → screens → viz → interactions → quality), пригодная для последующей frontend implementation без изменения Domain/BR/REQ/OpenSpec.

## 2. Decision status vocabulary

| Status | Meaning in this wave |
|--------|----------------------|
| `approved UX decision` | D1–D11 / shell/stack — cite only |
| `approved Visual Direction baseline` | VD-A — cite only |
| `proposal` | New UI Design choices (HEX, sizes, component details) until human APPROVE UI Design pack |
| `assumption` | Temporary design working choice (e.g. BA-OQ-006 V1 layout) |
| `hypothesis` | Unproven scale (mock volume) |
| `deferred decision` | D12 Gantt library |
| `open_question` | BA-OQ / HIP still open |

Do not confuse document frontmatter `status: draft|approved` with decision status above.

## 3. Approved constraints (do not reopen)

- **VD-A** Industrial Control Lattice.
- **D1–D11**; shell: Sidebar + App Bar + breadcrumbs + Page Surface; Light/Dark; Snapshot A/B/C.
- Stack intent: **shadcn/ui**, **TanStack Table**, **Recharts**.
- Links = direct DOC-BA-015 only; Impact = derived; no Equipment—Milestone edge.
- Schedule = Milestone + Equipment delivery only; no Activity / WBS / CPM / deps / scheduling engine / drag-reschedule.
- BR-006: PrioritizeRecovery does not improve forecast/RAG or imply recovery execution.
- KPI group ≥4 justified metrics or omit.
- AcceptDateSlip not Must journey (BA-OQ-004/005).
- FE data later only via HTTP API (REQ-NFR-001).

## 4. Working assumptions and deferred / open

| Topic | Handling | Status |
|-------|----------|--------|
| Issues & Risks register layout | **V1 — single table + Type column** for UI Design specs | `assumption`; **BA-OQ-006 remains open** |
| V1 table columns | Only truly shared columns; do not force-unify Issue-only or Risk-only attributes | `assumption` (guidance for Iter 2/4) |
| StatusIndicator | May be shared component; Issue status / Risk RAG / Milestone RAG / Equipment delivery status keep distinct visual+semantic models | guidance for Iter 2 |
| Gantt library | Visual semantics only | `deferred decision` (D12) |
| Mock volume | Density guidance only | `hypothesis`; DOC-PROD-012 unchanged |
| BA-OQ-004/005/002, HIP-003/004/005/007 | Stay open; no invented messaging / AcceptDateSlip Must UI | `open_question` |
| Closed / Amber | Not in Must palette | `open_question` |
| Contrast ratios | Calculated targets in DOC-UX-015; browser verification at implementation | Iter 1 done (calc); impl later |

## 5. Planned UI Design pack

| ID | File | Iteration | Status |
|----|------|-----------|--------|
| DOC-UX-014 | `demo-v1-ui-design-overview.md` | 0 | **done** |
| DOC-UX-015 | `demo-v1-ui-foundations.md` | 1 | **done** (`proposal`) |
| DOC-UX-016 | `demo-v1-component-specification.md` | 2 | **done** (`proposal`) |
| DOC-UX-017 | `demo-v1-ui-screens.md` | 4 | not started |
| DOC-UX-018 | `demo-v1-ui-data-viz.md` | 3 | **done** (`proposal`) |
| DOC-UX-019 | `demo-v1-ui-interactions.md` | 3 | **done** (`proposal`) |
| DOC-UX-020 | `demo-v1-ui-quality.md` | 5 | not started |
| DOC-HANDOFF-UID-001 | `docs/07-delivery/handoffs/…-ui-design.md` | 5 | not started |

## 6. Source map (verified paths)

| Area | Paths |
|------|-------|
| UX / VD | [`docs/05-ux-ui/`](./README.md) DOC-UX-001…013 |
| Domain / BR / OQ | [`docs/02-business-analysis/`](../02-business-analysis/README.md) |
| Product / mock | [`docs/03-product/`](../03-product/README.md) (not `03-product-definition`) |
| REQ | [`docs/04-requirements/`](../04-requirements/README.md) |
| OpenSpec | `openspec/specs/` (6 living specs; portal `/openspec`) — read-only for this wave |
| Handoffs | [`2026-10-31-visual-direction.md`](../07-delivery/handoffs/2026-10-31-visual-direction.md), [`2026-10-31-ux-ui.md`](../07-delivery/handoffs/2026-10-31-ux-ui.md) |
| Plan | `.cursor/plans/ui-design-spec-demo-v1.md` (repo path; вне портала) |

## 7. Boundary: UI Design vs Implementation

| UI Design (this wave) | Implementation (later) |
|-----------------------|------------------------|
| Markdown specs DOC-UX-014…020 | `apps/web`, `apps/api`, npm |
| Proposed HEX, token→shadcn map, calculated contrast targets | Applied CSS / measured browser checks |
| Component & screen specs | React + shadcn code |
| Gantt look | Library choice (D12) + code |

## 8. Iteration stop criteria

### Iteration 0

- [x] Sources and constraints synced; DOC-UX-014 created; README stub; plan synced.

### Iteration 1

- [x] DOC-UX-015 foundations: Light/Dark HEX, semantic status aliases, calculated contrast, type/spacing/radius, shadcn map, a11y checklist.
- [x] Link from DOC-UX-011; README / overview / plan / traceability synced.

### Iteration 2

- [x] DOC-UX-016 component specification: shell, data display, entity summaries, detail patterns, viz boundaries.
- [x] StatusIndicator four semantic models; Links≠Impact; BR-006 DecisionPanel honesty; BA-OQ-006 left open.

### Iteration 3

- [x] DOC-UX-018 data visualization: Snapshot A/B/C story, Links vs Impact, Δ labeling, charts allow/deny, Gantt semantics.
- [x] DOC-UX-019 interactions: Snapshot/theme/nav/table/detail/keyboard; Decision Must read-only; selection/pagination off by default.
- [ ] Iteration 4+ **not** started in this pass.

## 9. Related

- [ui-foundations](./demo-v1-ui-foundations.md) · [component-specification](./demo-v1-component-specification.md) · [ui-data-viz](./demo-v1-ui-data-viz.md) · [ui-interactions](./demo-v1-ui-interactions.md) · [ux-concept](./demo-v1-ux-concept.md) · [visual-direction](./demo-v1-visual-direction.md) · [ux-traceability](./demo-v1-ux-traceability.md) · [README](./README.md)
