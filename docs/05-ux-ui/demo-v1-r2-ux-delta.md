---
id: DOC-UX-022
title: "Demo v1 R2 — UX delta (lifecycle, cost, people, notifications)"
type: product
status: draft
version: "0.1.4"
created: 2026-11-02
updated: 2026-11-02
owner: "docs-engineering"
related:
  - DOC-UX-021
  - DOC-UX-002
  - DOC-UX-004
  - DOC-PROD-023
  - DOC-PROD-024
  - DOC-PROD-025
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

> **certainty:** assumption
>
> R2-U1-R4 corrective UX pass (awaiting human visual approval; **not** APPROVED). R2/R3 composition base preserved; R4 fixes overview stretch, readiness RAG surfaces, Exceptions|Attention row, **stable** executive milestone map.

Hierarchy (desktop):

1. **Executive overview row** (~55/45):
   - LEFT: Project Status + Production Start + Cost — inner zones **stretch to full card height** (dividers full height)
   - RIGHT: Workstream readiness — dense clickable rows; soft RAG-tinted surfaces; hover/focus; Red → Yellow → Green + catalog `sortOrder`; optional internal scroll → `/workstreams/:id`
2. **Контрольные вехи проекта** — **stable curated executive map** (exactly **12** IDs, identical A–S). Snapshot switching changes state/RAG/chrome accents, **not** set membership. Always includes MS-PS. Deliberate RU short labels. Horizon `01.02.2027–30.09.2027`. Multi-lane collision policy; no horizontal timeline scroll.
3. **Key Exceptions | Management Attention** — one desktop row (~1.5fr / 1fr); stacks vertically on narrow viewports
4. Trend / Decisions — director-facing narrative RU-only (tech terms HVAC/WFI/IQ/OQ/PQ/BMS/EMS/QC/EAC/VAC/BAC allowed)

**Stable executive set (normative):** MS-BLD-EXC, MS-BLD-FND, MS-BLD-STR, MS-BLD-ENCL, MS-CLN-RDY, MS-HVAC-IQ, MS-UTL-WFI, MS-PRD-INST, MS-PKG-SAT, MS-COM-OQ, MS-COM-GO, MS-PS.

**Not** a KPI wall or finance dashboard. Notifications do not duplicate Dashboard content. Selector phase groups remain navigation-only (not a second Dashboard timeline).

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
- Read/unread (sessionStorage key `ppc.demo.notificationRead`; per notification id)
- Switch: «Показывать уведомления при смене снимка» (localStorage key `ppc.demo.notificationPopup`; **default on**)
- On **successful** atomic snapshot commit: ≤3 prioritized toasts; remainder in tray
- Failed/stale/bootstrap switch: **no** toast; toast appearance does **not** auto-mark read
- Fixtures authored per snapshot (not generic diff); Notification not SoT; entityRefs soft only
- Decision refs: no Decision detail route in N1 → no broken link
- Director-facing `titleRu` / `bodyRu` / taxonomy labels — RU-only (N1-R1); taxonomy `issue` → «Проблема»; allowed tech terms/IDs (HVAC, WFI, IQ/OQ/PQ, BMS/EMS, QC, HPLC, ETC/EAC/VAC, entity IDs, Production Start)
- Taxonomy: critical_risk, issue, milestone, cost, decision, recovery, readiness
- Payload: id, snapshotId, severity, taxonomy, titleRu, bodyRu?, href?, entityRefs?

## 7. Snapshot selector A–S

**Implemented in R2-U1** — phase-grouped scrollable listbox (portal preserved):

- Phases (RU): Ранний этап · Срыв и давление · Управленческие меры · Монтаж · Пусконаладка · Готовность и старт
- Sticky phase headers; max-height ~60vh; keyboard (arrows, Home/End, Enter/Space, Escape, Tab)
- Trigger: id + asOf + phase hint
- Atomic switch + stale protection; sessionStorage `ppc.demo.snapshot` persists A–S
- Timeline horizon: 01.02.2027–30.09.2027
- **No** second Gantt/timeline inside AppBar

## 8. Light / Dark / a11y

Preserve enrichment expectations: contrast for RAG, focus rings, no theme-specific layout break, selector keyboard, toast not trapping focus permanently.

## 9. Russian presentation

Director-facing RU prose; retain technical acronyms (HVAC, WFI, BMS/EMS, IQ/OQ/PQ as демо-гейты). IQ/OQ/PQ: no real GMP/CSV claims.
