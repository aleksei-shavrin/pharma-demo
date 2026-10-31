---
id: DOC-UX-009
title: "Demo v1 UX traceability"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-BA-016
---

# Demo v1 UX traceability

> **certainty:** hypothesis
>
> Матрица связывает UX Discovery recommendations с экранами и источниками. Колонка Decision Status — не human APPROVE UX, а классификация утверждения.

## Legend — Decision Status

| Value | Meaning |
|-------|---------|
| `approved requirement` | Ссылка на действующий BR / REQ / living OpenSpec / BA freeze (источник) |
| `UX proposal` | Композиция/layout recommendation; ждёт отдельного human APPROVE |
| `assumption` | Временное допущение UX/impl |
| `hypothesis` | Гипотеза (в т.ч. mock volume) |
| `open_question` | BA-OQ / HIP / tech choice |

## Matrix

| UX Decision | Screen / Component | BR / REQ / OpenSpec | Data Source | Decision Status |
|-------------|-------------------|---------------------|-------------|-----------------|
| D1 Dashboard start | P1 Dashboard | C-01/C-05; REQ-IMPCT-001 | PRJ/MS/EQ/Decision aggregate fields | UX proposal |
| D2/D9 five Sidebar items | App Shell Sidebar | Demo scope C-01…C-05 | — | UX proposal |
| D3 Director priority | Dashboard blocks order | DOC-BA-012 N-DIR-*; SCN-007 | DOC-PROD-012 | UX proposal |
| D4 Full Page + Tabs | D-EQ/ISS/RSK/MS | Domain attributes; REQ-* | Entity fields | UX proposal |
| D4 Breadcrumbs / return | App Bar + detail | — | Nav state | UX proposal; return filters = assumption (MVP) |
| D5 Δ delivery → PS | Dashboard Δ strip | BR-004; REQ-EQPT; REQ-IMPCT | baseline/forecast delivery & PS | UX proposal + approved requirement (BR-004 math) |
| D6 PrioritizeRecovery honesty | Decision panel; M-DEC | BR-006; REQ-IMPCT-002; OpenSpec C | DEC-001; Issue Mitigating; unchanged forecast/RAG | UX proposal + approved requirement (BR-006 semantics) |
| D7 One shell | App Shell | BA-OQ-001 audience | — | UX proposal |
| D8 Dashboard composition | P1 blocks | REQ-IMPCT-001/002 | Aggregate + refs | UX proposal |
| D8 Issue/Risk layout on register | P4 Issues & Risks | BA-OQ-006 | ISS/RISK | open_question |
| D10 Schedule Table primary | P2 TanStack | Domain dates MS/EQ | baseline/forecast dates | UX proposal |
| D10 read-only Gantt secondary | P2 Gantt view | D11 constraints | Same control points | UX proposal |
| D11 no Activity/WBS/CPM | P2 scope | DOC-BA-015; PROC-001; BA-A-003 | No Activity rows | approved requirement (no Activity) + UX proposal (schedule viz) |
| D12 Gantt library | P2 implementation later | — | — | open_question |
| Snapshot A/B/C switcher | App Bar | OpenSpec reproducibility; DOC-PROD-012 | Snapshots A/B/C | UX proposal (control); data = approved requirement / mock assumption |
| Light/Dark theme | App Bar + shell | — | Theme tokens | UX proposal |
| Causal viz edges | Dashboard | DOC-BA-015 direct links; BR-004 for PS Δ (derived) | Existing direct FKs/links only; narrative EQ→…→PS ≠ edges | UX proposal (layout); edges = domain; PS Δ = derived |
| FE via HTTP API | Future apps | REQ-NFR-001; architecture-constraints | API | approved requirement |
| Mock volume scale | All registers | — | Future DOC-PROD-012 expansion | hypothesis |
| Status allowlist Open/Mitigating; OnTrack/Delayed; Green/Red | Registers / KPI | Domain; BR-002/003; mock | Same | approved requirement (values) |
| Closed / Amber in ambient | — | BA-OQ / BR Amber out | — | open_question |
| AcceptDateSlip Must UI | — | REQ-IMPCT-002; BA-OQ-004/005 | — | open_question (not Must journey) |
