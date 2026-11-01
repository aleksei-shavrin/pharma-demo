---
id: DOC-UX-009
title: "Demo v1 UX traceability"
type: product
status: draft
version: "0.2.5"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-BA-016
  - DOC-UX-015
---

# Demo v1 UX traceability

> **certainty:** hypothesis
>
> Матрица связывает UX-решения Demo v1 с экранами и источниками. Колонка Decision Status — классификация UX/decision, не frontmatter `status` документа и не «утверждено организацией».

## Legend — Decision Status

| Value | Meaning |
|-------|---------|
| `approved UX decision` | Принятое UX-решение для Demo v1 (зафиксировано в этом pack) |
| `approved Visual Direction baseline` | Утверждённое Visual Direction для Demo v1 (VD-A) |
| `deferred decision` | Решение отложено (напр. D12 lib) |
| `approved requirement` | Ссылка на действующий BR / REQ / living OpenSpec / BA freeze |
| `proposal` | Ещё не принятое UX-предложение (остаточные элементы) |
| `assumption` | Временное допущение UX/impl |
| `hypothesis` | Гипотеза (в т.ч. mock volume) |
| `open_question` | BA-OQ / HIP / нерешённый tech choice |

Реестр D1–D12: [demo-v1-ux-concept.md](./demo-v1-ux-concept.md) §4.

## Matrix

| UX Decision | Screen / Component | BR / REQ / OpenSpec | Data Source | Decision Status |
|-------------|-------------------|---------------------|-------------|-----------------|
| D1 Dashboard start | P1 Dashboard | C-01/C-05; REQ-IMPCT-001 | PRJ/MS/EQ/Decision aggregate fields | `approved UX decision` |
| D2 multi-page Sidebar | App Shell Sidebar | Demo scope C-01…C-05 | — | `approved UX decision` |
| D9 five Sidebar items | App Shell Sidebar | — | — | `approved UX decision` |
| D3 Director priority | Dashboard blocks order | DOC-BA-012 N-DIR-*; SCN-007 | DOC-PROD-012 | `approved UX decision` |
| D4 Full Page + Tabs | D-EQ/ISS/RSK/MS | Domain attributes; REQ-* | Entity fields | `approved UX decision` |
| D4 Breadcrumbs / return | App Bar + detail | — | Nav state | `approved UX decision`; return filters = `assumption` (MVP) |
| D5 Δ delivery → PS | Dashboard Δ strip | BR-004; REQ-EQPT; REQ-IMPCT | baseline/forecast delivery & PS | `approved UX decision` + `approved requirement` (BR-004 math) |
| D6 PrioritizeRecovery honesty | Decision panel; M-DEC | BR-006; REQ-IMPCT-002; OpenSpec C | DEC-001; Issue Mitigating; unchanged forecast/RAG | `approved UX decision` + `approved requirement` (BR-006) |
| D7 One shell | App Shell | BA-OQ-001 audience | — | `approved UX decision` |
| D8 Dashboard composition | P1 blocks | REQ-IMPCT-001/002 | Aggregate + refs | `approved UX decision` |
| D8 Issue/Risk layout on register | P4 Issues & Risks | BA-OQ-006 | ISS/RISK | `open_question` |
| D10 Schedule Table primary | P2 TanStack | Domain dates MS/EQ | baseline/forecast dates | `approved UX decision` |
| D10 read-only Gantt secondary | P2 Gantt view | D11 constraints | Same control points | `approved UX decision` |
| D11 Schedule = Milestone + Equipment Delivery only; **без** Activity, WBS, CPM, dependencies (FS/SS и т.п.), scheduling engine | P2 scope | DOC-BA-015; PROC-001; BA-A-003 | Только control-point rows MS + EQ delivery; no Activity/WBS/CPM/deps/engine | `approved UX decision` (+ `approved requirement` no Activity entity) |
| D12 Gantt library | P2 implementation later | — | — | `deferred decision` |
| Layout shell + Page Surface | App Shell | — | — | `approved UX decision` |
| Snapshot A/B/C switcher | App Bar | OpenSpec reproducibility; DOC-PROD-012 | Snapshots A/B/C | `approved UX decision` (control); data = mock / `approved requirement` |
| Light/Dark theme | App Bar + shell | — | Theme tokens | `approved UX decision` |
| shadcn / TanStack / Recharts | Components | — | — | `approved UX decision` |
| Links = direct Domain only | Entity Detail Links | DOC-BA-015 | Existing direct FKs | `approved UX decision` |
| Causal / PS Δ in Impact or viz | Dashboard / Impact | DOC-BA-015; BR-004 | Direct edges; Δ derived | `approved UX decision` (layout); edges = domain; PS Δ = derived |
| KPI group ≥4 or omit | Dashboard / Detail | — | Real aggregates only | `approved UX decision` |
| FE via HTTP API | Future apps | REQ-NFR-001; architecture-constraints | API | `approved requirement` |
| Mock volume scale | All registers | — | Future DOC-PROD-012 expansion | `hypothesis` |
| Status allowlist Open/Mitigating; OnTrack/Delayed; Green/Red | Registers / KPI | Domain; BR-002/003; mock | Same | `approved requirement` (values) |
| Closed / Amber in ambient | — | BA-OQ / BR Amber out | — | `open_question` |
| AcceptDateSlip Must UI | — | REQ-IMPCT-002; BA-OQ-004/005 | — | `open_question` (not Must journey) |
| VD-A Industrial Control Lattice | Theme / all screens | DOC-UX-010 | — | `approved Visual Direction baseline` |
| VD-B / VD-C | Comparison only | DOC-UX-010 | — | considered; **not selected** |
| Design token roles + surface depth (principles) | Shell / components | DOC-UX-011 | Theme CSS vars | `approved Visual Direction baseline` (principles) |
| Concrete HEX Light/Dark + calculated contrast | Theme / badges | DOC-UX-015 | shadcn CSS vars | `proposal` (UI Foundations) |
| Multi-channel status encoding | Badges / tables | DOC-UX-011; allowlist | Allowlisted statuses only | `approved Visual Direction baseline` (encoding) + `approved requirement` (values) |
| Dashboard narrative-first composition | P1 | DOC-UX-012; DOC-UX-004 | Same as D8 data | `approved Visual Direction baseline` on `approved UX decision` (blocks) |
| Schedule table-primary visual mass | P2 | DOC-UX-012; DOC-UX-005 | MS + EQ rows | `approved Visual Direction baseline` + D10/D11 approved |
| Issues & Risks register layout variants | P4 | DOC-UX-012 | ISS/RISK | `open_question` (BA-OQ-006); variants not closed |
| UI Design wave overview | Pack DOC-UX-014…020 | DOC-UX-014 | — | wave in progress; new UI Design = `proposal` |
| BA-OQ-006 working layout V1 (single table + Type) | P4 / UI screens | DOC-UX-014 | Shared columns only | `assumption`; OQ remains open |
