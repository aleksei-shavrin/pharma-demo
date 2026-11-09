---
id: DOC-UX-014
title: Demo v1 UI Design Specification — обзор
type: product
status: draft
version: 0.7.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-001
  - DOC-UX-010
  - DOC-UX-009
  - DOC-UX-015
  - DOC-UX-016
  - DOC-UX-017
  - DOC-UX-018
  - DOC-UX-019
  - DOC-UX-020
  - DOC-HANDOFF-VD-001
  - DOC-HANDOFF-UID-001
---
# Demo v1 UI Design Specification — overview

> **certainty:** hypothesis
>
> UI Design / Design Specification wave. UI Design pack Demo v1 = **APPROVED** (human). Pack decisions = **`approved UI Design decision`**. Frontmatter `status: draft` = lifecycle. **Не** переоткрывает VD-A / D1–D11. Plan COMPLETED ≠ pack APPROVED. **Demo v1 Implementation I1–I8** — **COMPLETED / APPROVED + committed** (см. `.cursor/plans/demo-v1-implementation.md`).

## 1. Purpose and wave status

| Item | Status |
|------|--------|
| Visual Direction | **COMPLETED**; VD-A = `approved Visual Direction baseline` |
| UX decisions D1–D11 | `approved UX decision` — not reopened |
| UI Design **plan** | **COMPLETED** (Iterations 0–5) |
| UI Design docs wave | **COMPLETED** — Iterations 0–5 COMPLETED |
| UI Design **pack** | **APPROVED** (human, after full review + R1–R3); decisions = `approved UI Design decision` |
| Implementation (`apps/`) | **I1–I8 COMPLETED / APPROVED + committed** (Demo v1 implementation plan exhausted at I8) |

Цель волны: markdown UI Design Specification (foundations → components → screens → viz → interactions → quality), пригодная для последующей frontend implementation без изменения Domain/BR/REQ/OpenSpec.

## 2. Decision status vocabulary

| Status | Meaning in this wave |
|--------|----------------------|
| `approved UX decision` | D1–D11 / shell/stack — cite only |
| `approved Visual Direction baseline` | VD-A — cite only |
| `approved UI Design decision` | UI Design pack choices (HEX, components, screens, viz, interactions, quality) after human pack APPROVE |
| `proposal` | Residual unapproved UX/UI suggestion (not pack-locked) |
| `assumption` | Temporary design working choice (e.g. filter non-restore MVP) |
| `hypothesis` | Unproven scale (mock volume) |
| `deferred decision` | — (D12 resolved: ADR-0004) |
| `open_question` | Unresolved BA / product / UX / implementation question intentionally left open by this wave (includes BA-OQ/HIP, persistence, shell DOM order, and other non-closed choices — not limited to BA-OQ/HIP or tech-only) |

Do not confuse document frontmatter `status: draft|approved` with decision status above. Human Demo v1 pack APPROVE ≠ organizational approval.

## 3. Approved constraints (do not reopen)

- **VD-A** Industrial Control Lattice.
- **D1–D11**; shell: Sidebar + App Bar + breadcrumbs + Page Surface; Light/Dark; Snapshot 01/02/03.
- Stack intent: **shadcn/ui**, **TanStack Table**, **Recharts**.
- Links = direct DOC-BA-015 only; Impact = derived; no Equipment—Milestone edge.
- Schedule = Milestone + Equipment delivery only; no Activity / WBS / CPM / deps / scheduling engine / drag-reschedule.
- BR-006: PrioritizeRecovery does not improve forecast/RAG or imply recovery execution.
- KPI group ≥4 justified metrics or omit.
- AcceptDateSlip not Must journey (BA-OQ-004/005).
- FE data later only via HTTP API (REQ-NFR-001).
- UI Design pack DOC-UX-014…020 (as approved) — cite as `approved UI Design decision`.

## 4. Working assumptions and deferred / open

| Topic | Handling | Status |
|-------|----------|--------|
| Issues & Risks register layout | **single table + Type column** | **BA-OQ-006 closed** (DOC-BA-010 Demo v1 decision) |
| V1 table columns | Only truly shared columns; do not force-unify Issue-only or Risk-only attributes | `assumption` |
| StatusIndicator | May be shared component; Issue status / Risk RAG / Milestone RAG / Equipment delivery status keep distinct visual+semantic models | `approved UI Design decision` |
| Gantt library | Visual semantics + Community adapter | **RESOLVED** (ADR-0004, I7) |
| Mock volume | Density guidance only | `hypothesis`; DOC-PROD-012 unchanged |
| BA-OQ-004/005/002, HIP-003/004/005/007 | Stay open; no invented messaging / AcceptDateSlip Must UI | `open_question` |
| Closed / Amber | Not in Must palette | `open_question` |
| Interactive PrioritizeRecovery recording outside Must | Must DecisionPanel = read-only + DEC-001 on 03 | Must = decided; interactive outside Must = `open_question` |
| Contrast ratios | Calculated targets in DOC-UX-015 locked with pack; browser verification at implementation | calc done; impl later |

## 5. UI Design pack

| ID | File | Iteration | Status |
|----|------|-----------|--------|
| DOC-UX-014 | `demo-v1-ui-design-overview.md` | 0 | **done** |
| DOC-UX-015 | `demo-v1-ui-foundations.md` | 1 | **done** (`approved UI Design decision`) |
| DOC-UX-016 | `demo-v1-component-specification.md` | 2 | **done** (`approved UI Design decision`) |
| DOC-UX-017 | `demo-v1-ui-screens.md` | 4 | **done** (`approved UI Design decision`) |
| DOC-UX-018 | `demo-v1-ui-data-viz.md` | 3 | **done** (`approved UI Design decision`) |
| DOC-UX-019 | `demo-v1-ui-interactions.md` | 3 | **done** (`approved UI Design decision`) |
| DOC-UX-020 | `demo-v1-ui-quality.md` | 5 | **done** (`approved UI Design decision`) |
| DOC-HANDOFF-UID-001 | `docs/07-delivery/handoffs/2026-11-01-ui-design.md` | 5 | **done** (pack APPROVED recorded) |

## 6. Source map (verified paths)

| Area | Paths |
|------|-------|
| UX / VD | [`docs/05-ux-ui/`](./README.md) DOC-UX-001…013 |
| Domain / BR / OQ | [`docs/02-business-analysis/`](../02-business-analysis/README.md) |
| Product / mock | [`docs/03-product/`](../03-product/README.md) |
| REQ | [`docs/04-requirements/`](../04-requirements/README.md) |
| OpenSpec | `openspec/specs/` (6 living specs; portal `/openspec`) — read-only for this wave |
| Handoffs | [`2026-10-31-visual-direction.md`](../07-delivery/handoffs/2026-10-31-visual-direction.md), [`2026-10-31-ux-ui.md`](../07-delivery/handoffs/2026-10-31-ux-ui.md), [`2026-11-01-ui-design.md`](../07-delivery/handoffs/2026-11-01-ui-design.md) |

## 7. Boundary vs Implementation

| UI Design (this pack) | Implementation (later, explicit start) |
|-----------------------|----------------------------------------|
| Markdown specs DOC-UX-014…020 + handoff | `apps/web`, `apps/api`, npm packages |
| Approved HEX / token maps / component states | Actual CSS variables, shadcn theme, React |
| Calculated contrast targets + checklist | Browser-measured contrast / keyboard testing |
| Gantt visual semantics | Library choice (D12) + code |
| Design AC (DOC-UX-020) | E2E / visual regression against apps |

Pack APPROVE **does not** authorize Implementation.

## 8. Iteration checklist (all COMPLETED)

### Iterations 0–5

- [x] DOC-UX-014…020 + handoff DOC-HANDOFF-UID-001; indexes/plan/traceability synced.
- [x] Corrective R1–R3 applied.
- [x] UI Design Spec **plan** COMPLETED; UI Design **pack** **APPROVED**; Implementation **I1–I8 COMPLETED**.

## 9. Handoff summary

Full handoff: [`docs/07-delivery/handoffs/2026-11-01-ui-design.md`](../07-delivery/handoffs/2026-11-01-ui-design.md) (DOC-HANDOFF-UID-001).

| For reviewers | Note |
|---------------|------|
| Pack contents | DOC-UX-014…020 + handoff |
| Dependency chain | 015 → 016 → 018/019 → 017 → 020 |
| Pack status | **APPROVED** |
| Use for impl planning | After pack APPROVE **and** separate explicit Implementation start |
| Do not treat as | Permission to build `apps/` without that separate start |

Open questions remain: interactive PrioritizeRecovery recording **outside Must** (Must DecisionPanel stays read-only), shell DOM order, theme/snapshot/cross-session filter persistence (MVP filter non-restore = `assumption`, DOC-UX-019), AcceptDateSlip/Closed/Amber (BA-OQ-004/005), HIP-*. BA-OQ-006 **closed**; D12 **resolved** (ADR-0004).

## 10. Related

- [ui-foundations](./demo-v1-ui-foundations.md) · [component-specification](./demo-v1-component-specification.md) · [ui-screens](./demo-v1-ui-screens.md) · [ui-data-viz](./demo-v1-ui-data-viz.md) · [ui-interactions](./demo-v1-ui-interactions.md) · [ui-quality](./demo-v1-ui-quality.md) · [ux-traceability](./demo-v1-ux-traceability.md) · [README](./README.md)
- Handoff: [2026-11-01-ui-design.md](../07-delivery/handoffs/2026-11-01-ui-design.md)
