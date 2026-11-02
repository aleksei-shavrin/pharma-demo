---
id: DOC-UX-022
title: "Demo v1 R2 — UX delta (lifecycle, cost, people, notifications)"
type: product
status: draft
version: "0.1.1"
created: 2026-11-02
updated: 2026-11-02
owner: "docs-engineering"
related:
  - DOC-UX-021
  - DOC-UX-002
  - DOC-UX-004
  - DOC-PROD-023
  - DOC-PROD-024
  - DOC-PROD-026
  - DOC-BA-018
---

# Demo v1 R2 — UX delta

> **certainty:** hypothesis
>
> IA/UX norms for R2. Does not rewrite DOC-UX-021 history. No runtime UI in R2-D0.

## 1. Navigation IA

> **certainty:** assumption
>
> Human R2-D0-R1: **Люди** and **Стоимость** are top-level. Workstreams are **not** a required top-level nav item.

**Primary navigation (7):**

1. Обзор
2. График
3. Оборудование
4. Проблемы и риски
5. Вехи
6. Люди → `/people`, `/people/:id`
7. Стоимость → `/costs`

AppBar: Notification bell (not a nav section).

**Workstream access:** `/workstreams/:id` via Dashboard Workstream readiness and related entity/person/control links. Optional later Workstream register must **not** automatically add an 8th top-level section.

## 2. Dashboard (executive)

Hierarchy:

1. **Project Status + Production Start + Cost signal** (BAC / EAC / VAC / contingency health — compact)
2. Top Exceptions
3. Management Attention
4. Workstream readiness (**clickable** → `/workstreams/:id`)
5. Executive Milestones (**snapshot-aware** subset from API; always includes MS-PS)
6. Trend / Decisions

**Not** a KPI wall or finance dashboard. Notifications do not duplicate Dashboard content.

### Snapshot personality (design checks)

| Snap | Expectation |
|------|-------------|
| A | Calm Green; EAC=BAC VAC=0; empty exceptions |
| C | Red HVAC/PS +21; cost shock visible |
| H | Residual +14; AUT rising; cost residual |
| M/N | Commissioning drama; decisions; PS still +14 until O |
| P | Red; final readiness / RISK-001 still Red |
| Q | Yellow; baseline date honesty without start |
| R | Yellow; Go/No-Go |
| S | Production Start achieved; Green; final cost |

## 3. Workstream page `/workstreams/:id`

Control drill-down (not full Dashboard clone):

- Title RU + RAG + lead Person
- Schedule health (key MS + delayed critical EQ counts)
- Cost summary (WS BAC/EAC/VAC/Actual/Committed/ETC)
- Next executive milestone (if any for WS)
- Lists: Equipment, active Issues, Risks, Decisions
- Related People projections

## 4. People `/people` and `/people/:id`

- List: name, role, primary WS, active
- Detail: responsibilities; linked Issues/Decisions/EQ; WS leadships — **control view**, not HR profile
- No payroll/org-chart/permissions UI

## 5. Costs `/costs`

Project Controls view:

- BAC / EAC / VAC
- Actual / Committed / ETC
- Contingency (project reserve row/section)
- Workstream forecast table
- Top variances
- Risk cost exposure summary
- Optional A–S spark/table of EAC evolution (fixture-authored series)

No GL, invoices, or contractor ledgers.

**Detail cost fields:** only where BA says applicable (EQ selective; Risk exposure; Issue impact; Decision approved impact).

## 6. Notifications (AppBar)

- Bell + unread badge + popover list
- Read/unread (sessionStorage)
- Switch: «Показывать уведомления при смене снимка» (localStorage)
- On **successful** atomic snapshot commit: ≤3 prioritized toasts; remainder in tray
- Failed/stale switch: **no** toast
- Taxonomy: critical_risk, issue, milestone, cost, decision, recovery, readiness
- Payload: id, snapshotId, severity, taxonomy, titleRu, bodyRu?, href?, entityRefs?

## 7. Snapshot selector A–S

Replace flat A–H-only assumption with:

**Phase-grouped scrollable listbox** (portal preserved):

- Phases: Early · Disruption · Management · Installation · Commissioning · Close-out
- Sticky phase headers; max-height ~60vh; keyboard (arrows, Home/End, Enter/Space, Escape, Tab)
- Trigger: id + asOf + short context
- Atomic switch + stale protection + sessionStorage snapshot id unchanged
- **No** second Gantt/timeline inside AppBar

## 8. Light / Dark / a11y

Preserve enrichment expectations: contrast for RAG, focus rings, no theme-specific layout break, selector keyboard, toast not trapping focus permanently.

## 9. Russian presentation

Director-facing RU prose; retain technical acronyms (HVAC, WFI, BMS/EMS, IQ/OQ/PQ as демо-гейты). IQ/OQ/PQ: no real GMP/CSV claims.
