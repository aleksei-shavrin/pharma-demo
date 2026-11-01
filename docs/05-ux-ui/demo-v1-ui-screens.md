---
id: DOC-UX-017
title: "Demo v1 UI Design — screen specification"
type: product
status: draft
version: "0.1.1"
created: 2026-11-01
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-UX-014
  - DOC-UX-015
  - DOC-UX-016
  - DOC-UX-018
  - DOC-UX-019
  - DOC-UX-002
  - DOC-UX-003
  - DOC-UX-004
  - DOC-UX-005
  - DOC-UX-006
  - DOC-UX-012
  - DOC-PROD-012
  - DOC-BA-015
---

# Demo v1 UI Design — screen specification

> **certainty:** hypothesis
>
> Экранные композиции восьми поверхностей Demo v1. UI Design решения пакета — **`approved UI Design decision`** (human APPROVE UI Design pack Demo v1). Frontmatter `status: draft` = lifecycle. **Не** apps / Figma / npm. Не переоткрывает VD-A / D1–D11. Не закрывает BA-OQ / HIP / D12. Не меняет Domain / BR / REQ / OpenSpec / DOC-PROD-012.

## 1. Purpose and scope

| In | Out |
|----|-----|
| Layout, hierarchy, composition for 8 surfaces | React/CSS implementation |
| Binding to DOC-UX-015…019 + UX + fixtures | Changing fixture values |
| Screen↔component mapping | Choosing Gantt lib (D12) |

**Certainty vocabulary:** cite `approved UX decision` / `approved Visual Direction baseline` / `approved UI Design decision`; BA-OQ-006 single table+Type = Demo v1 decision (DOC-BA-010); mock volume = `hypothesis`; D12 resolved (ADR-0004); residual unapproved ideas (if any) = `proposal`.

## 2. Screen inventory (eight surfaces)

| # | ID | Surface | Nav |
|---|----|---------|-----|
| 1 | S-SHELL | Application Shell (chrome) | Always |
| 2 | P1 | Dashboard | Sidebar 1 |
| 3 | P2 | Schedule | Sidebar 2 |
| 4 | P3 | Equipment register | Sidebar 3 |
| 5 | P4 | Issues & Risks register | Sidebar 4 |
| 6 | P5 | Milestones register | Sidebar 5 |
| 7 | D-\* | Entity Detail (EQ/ISS/RSK/MS pattern) | From registers/Schedule/Dashboard |
| 8 | M-DEC | Decision surface | Dashboard / Issue Impact (Must = **read-only**) |

Sources: DOC-UX-003 inventory; plan Iteration 4; Must Decision behavior from DOC-UX-016/019 (interactive write **not** Must).

## 3. Global shell and page composition (`approved UI Design decision`)

```text
┌─ canvas ──────────────────────────────────────────────────┐
│ ┌ Sidebar ┐ ┌─ TopAppBar ───────────────────────────────┐ │
│ │ Brand   │ │ Breadcrumbs │ Snapshot A/B/C │ Theme │PRJ│ │
│ │ Nav×5   │ ├─ PageSurface (surface) ───────────────────┤ │
│ │         │ │ PageHeader                                 │ │
│ │         │ │ Main content (per screen)                  │ │
│ └─────────┘ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

| Region | Tokens / comps | Notes |
|--------|----------------|-------|
| canvas | `canvas` | Behind chrome |
| Sidebar | SidebarNavItem | 240 / 64 collapsed |
| TopAppBar | Breadcrumbs, SnapshotSelector, ThemeToggle, ProjectSummary (compact chip variant) | Snapshot visually primary vs Theme |
| PageSurface | `surface` + radius-lg | Work plate |
| Focus order | DOC-UX-019 §12 | Skip → TopBar → Sidebar → main; DOM order open_question |

Interactions: DOC-UX-019. Markers/status: DOC-UX-018 §2 (locked geometry).

---

## 4. Screen specifications

Template fields below are filled for each surface.

### 4.1 S-SHELL — Application Shell

| Field | Spec |
|-------|------|
| Purpose | Constant IA + global Snapshot/theme context for all pages (D2/D7/D9). |
| Primary user | Director + PM (one shell). |
| Entry points | App load → Dashboard (D1). |
| Information hierarchy | 1) Active nav + Snapshot 2) Breadcrumbs/project 3) Page content. |
| Layout regions | Sidebar \| TopAppBar \| PageSurface as §3. |
| Grid / proportions (`approved UI Design decision`) | Sidebar 240px; TopBar 52px; content flex; gutters 24 (≥1280) / 16 (1024–1279). Not measured production values. |
| Components | AppShell, SidebarNavItem, TopAppBar, Breadcrumbs, SnapshotSelector, ThemeToggle, PageSurface, PageHeader. |
| Data mapping | Snapshot id; theme; route; PRJ-01 identity. |
| Snapshot A/B/C | Selector always; content refresh per DOC-UX-019. |
| Visual states | Default; sidebar collapsed; loading/error inside PageSurface only. |
| Light / Dark | Full shell themed (DOC-UX-015). |
| Responsive | Icon rail 1024–1279; drawer best-effort &lt;1024. |
| Navigation / interactions | DOC-UX-019 §3–5, §12. |
| Traceability | DOC-UX-002; D1/D2/D7/D9; VD-A. |

### 4.2 P1 — Dashboard

| Field | Spec |
|-------|------|
| Purpose | Director-first exception narrative: PS state, causal drivers, Decision honesty (D1/D3/D5/D6/D8). |
| Primary user | Director primary; PM secondary. |
| Entry points | Sidebar Dashboard; app start. |
| Information hierarchy | 1) Δ strip (delivery → PS) 2) Causal viz + Decision rail 3) Exceptions / optional KPI / optional chart. |
| Layout regions | See wireframe. |
| Grid (`approved UI Design decision`) | ≥1280: story column ~62% + rail ~38%; stack below 1280 (story then rail). Proportions illustrative. |
| Components | PageHeader, AsOfMeta/SnapshotEcho, VarianceDelta, MetricTile/KpiGroup (conditional), ImpactCallout, RelationshipList/causal nodes via EntityLink, DecisionPanel, EquipmentDeliverySummary / IssueSummary / RiskSummary / MilestoneSummary (preview), ChartContainer (optional), Empty/Loading/Error. **Compact schedule peek** = composition of compact DataTable and/or GanttSurface (DOC-UX-016 variants) — not a separate component. |
| Data mapping | PRJ baseline/forecast PS; EQ-HVAC-01 delivery; MS-PS; RISK-001; ISS-001 (B/C); DEC-001 (C); Δ derived BR-004. Fixtures DOC-PROD-012. |
| Snapshot | **A:** calm OnTrack/Green; causal shows RISK—EQ & RISK—MS; no Issue delay chain; Decision empty. **B:** Delayed/+21d delivery Δ; Open Issue; Red; PS forecast 2027-10-06; Decision = needed context. **C:** PrioritizeRecovery read-only; Mitigating; Red + forecast **unchanged** (BR-006). |
| Visual states | Loading skeleton in surface; empty Decision on A; error inline. |
| Light / Dark | Status tokens both themes; no green wash on C. |
| Responsive | Stack columns; keep Δ strip full width first. |
| Navigation / interactions | DOC-UX-019 §10; Snapshot §4. |
| Traceability | DOC-UX-004/012/018; REQ-IMPCT; BR-004/006; C-01/C-05. |

```text
┌ PageHeader: Project · asOf · Snapshot echo ─────────────────┐
│ ┌ Δ strip: Delivery Δ | PS Δ (separate captions) ─────────┐ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌ Story (primary) ─────────────┐ ┌ Rail (secondary) ──────┐ │
│ │ Causal viz (direct edges)    │ │ DecisionPanel          │ │
│ │ Exceptions preview (typed)   │ │ Schedule peek (compos.)│ │
│ └──────────────────────────────┘ └────────────────────────┘ │
│ KPI group (≥4 justified) OR omit                            │
│ Optional discrete A/B/C PS comparison OR omit               │
└─────────────────────────────────────────────────────────────┘
```

**Anti:** KPI gallery as hero; EQ—MS edge; connected A/B/C forecast line; recovery progress on C.

### 4.3 P2 — Schedule

| Field | Spec |
|-------|------|
| Purpose | Control-point schedule for Milestone + Equipment delivery (D10/D11); not a scheduler. |
| Primary user | Both. |
| Entry points | Sidebar Schedule; Dashboard compact peek; detail back. |
| Information hierarchy | 1) Table of control points 2) Toolbar filters/view 3) Optional Gantt/Split secondary. |
| Layout regions | Toolbar → primary table (default) → optional Split/Gantt pane. |
| Grid (`approved UI Design decision`) | Table 100% default; Split ~55% table / ~45% timeline; Gantt full pane. |
| Components | PageHeader, TableToolbar, FilterControl, DataTable, GanttSurface, StatusIndicator, VarianceDelta, EntityLink, Empty/Loading/Error. |
| Data mapping | **Milestone rows:** `baselineDate`, `forecastDate`, rag; **Milestone Δ** = forecastDate − baselineDate (derived). **Equipment rows:** `baselineDelivery`, `forecastDelivery`, status, isCritical; **Delivery Δ** = forecastDelivery − baselineDelivery (derived). Optional Decision.dueDate only if separately decided — default **omit**. Never present delivery dates as Milestone/PS dates. |
| Snapshot | A: EQ OnTrack / Delivery Δ 0; MS Green / Milestone Δ 0. B/C: EQ Delayed / Delivery Δ +21d; MS Red / Milestone forecast 2027-10-06 (PS-aligned); C same date fields as B. |
| Visual states | Empty if no rows; loading; error; Gantt never sole access path. |
| Light / Dark | Table sunken; markers per DOC-UX-018. |
| Responsive | Horizontal scroll; hide Gantt before table on narrow; keep Type + status/RAG + typed date/Δ columns. |
| Navigation / interactions | DOC-UX-019 §6–7; row → Detail. |
| Traceability | DOC-UX-005/018; REQ-EQPT/MILE; D10–D12. |

**Column semantics (`approved UI Design decision`):** one shared Schedule table; headers use **type-qualified** labels. Cell meaning depends on `Type`:

| Column header | Equipment row | Milestone row |
|---------------|---------------|---------------|
| Type | Equipment | Milestone |
| Baseline (delivery / milestone) | Delivery Baseline (`baselineDelivery`) | Milestone Baseline (`baselineDate`) |
| Forecast (delivery / milestone) | Delivery Forecast (`forecastDelivery`) | Milestone Forecast (`forecastDate`) |
| Δ (delivery / milestone) | **Delivery Δ** | **Milestone Δ** (≠ Production Start Δ label on Dashboard; for MS-PS may equal PS slip numerically per BR-004 fixtures, but caption remains Milestone/PS subject — never «Delivery») |
| Status / RAG | Equipment status (OnTrack/Delayed) | Milestone RAG (Green/Red) |
| Critical | `isCritical` only | — (blank; not a Domain field) |

```text
┌ Toolbar: Table | Split | Gantt · filters (type/status/Δ≠0) ──┐
│ DataTable (primary)                                          │
│ Type · ID · Name · Baseline · Forecast · Δ · Status · Crit  │
│ EQ row → Delivery Baseline / Delivery Forecast / Delivery Δ │
│ MS row → Milestone Baseline / Milestone Forecast / MS Δ     │
└──────────────────────────────────────────────────────────────┘
```

Selection/pagination **off** by default (DOC-UX-016). D12 deferred.

### 4.4 P3 — Equipment register

| Field | Spec |
|-------|------|
| Purpose | Scan critical equipment delivery posture (C-03). |
| Primary user | Both. |
| Entry points | Sidebar Equipment; Dashboard exceptions; Links. |
| Information hierarchy | 1) Status + Delivery Δ 2) Delivery Forecast / Delivery Baseline 3) Name/id/critical. |
| Layout regions | PageHeader → TableToolbar → DataTable. |
| Grid (`approved UI Design decision`) | Full-width table; sticky header. |
| Components | PageHeader, TableToolbar, FilterControl, DataTable, StatusIndicator(`equipment`), VarianceDelta (delivery), EntityLink, Empty/Loading/Error. |
| Data mapping | id, name, isCritical, baselineDelivery, forecastDelivery, status OnTrack\|Delayed; projectId context. |
| Snapshot | A OnTrack Δ0; B/C Delayed +21d diamond marker. |
| Column priority (`approved UI Design decision`) | Status · Delivery Δ · Delivery Forecast · Delivery Baseline · Name · ID · Critical. |
| Visual states | Empty/loading/error; no Closed. |
| Light / Dark | Per foundations. |
| Responsive | H-scroll; do not drop Status / Delivery Δ / Delivery Forecast. |
| Navigation / interactions | DOC-UX-019 §6; row → D-EQ. |
| Traceability | REQ-EQPT-001; Domain Equipment. |

### 4.5 P4 — Issues & Risks register

| Field | Spec |
|-------|------|
| Purpose | Exception register for Issues and Risks (C-04). |
| Primary user | Both. |
| Entry points | Sidebar; Dashboard exceptions. |
| Information hierarchy | 1) Type + status/RAG 2) Title 3) Key links meta. |
| Layout regions | PageHeader → Toolbar → **single table** (V1). |
| Grid (`approved UI Design decision`) | Full-width table. |
| Components | Same table stack; StatusIndicator(`issue`\|`risk`); Type column. |
| Data mapping | **Shared columns only** (`assumption` V1): Type (Issue\|Risk), ID, Title, Status/RAG. Optional shared link-id display only if the same column meaning applies to both types without Issue-only or Risk-only placeholders. **Owner is not a shared column** — show on Issue Detail Overview when present in sources. Do **not** force-unify Issue-only / Risk-only fields. |
| Snapshot | A: may show Risk Green without Open delay Issue; B: ISS Open + RISK Red; C: ISS Mitigating + RISK Red. |
| Visual states | Empty/loading/error. |
| Light / Dark | Per foundations. |
| Responsive | H-scroll; keep Type + Status/RAG + Title. |
| Navigation / interactions | Row → D-ISS or D-RSK by Type. |
| Traceability | BA-OQ-006 **closed** (single table + Type); REQ-RISK; BR-002. |

```text
┌ Type | ID | Title | Status/RAG ─────────────────────────────┐
│ Issue | ISS-001 | … | Open / Mitigating (outline/half-fill) │
│ Risk  | RISK-001 | … | Green / Red (filled disc)            │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 P5 — Milestones register

| Field | Spec |
|-------|------|
| Purpose | Milestone readiness / RAG scan (C-02). |
| Primary user | Both. |
| Entry points | Sidebar Milestones; Schedule; Dashboard. |
| Information hierarchy | 1) RAG 2) Milestone Forecast / Baseline / Milestone Δ 3) Name (MS-PS emphasis presentation-only). |
| Layout regions | Header → Toolbar → Table. |
| Components | DataTable stack; StatusIndicator(`milestone`); VarianceDelta (PS/MS dates — **not** delivery caption). |
| Data mapping | id, name, baselineDate, forecastDate, rag Green\|Red. No Domain `critical` field — MS-PS visual emphasis only. |
| Snapshot | A Green Δ0; B/C Red, forecast 2027-10-06. |
| Column priority (`approved UI Design decision`) | RAG · Milestone Δ · Milestone Forecast · Milestone Baseline · Name · ID. |
| Visual states | Empty/loading/error. |
| Responsive | Keep RAG / Milestone Δ / Milestone Forecast. |
| Navigation / interactions | Row → D-MS. |
| Traceability | REQ-MILE-001; BR-003/004. |

### 4.7 D-\* — Entity Detail (shared pattern)

| Field | Spec |
|-------|------|
| Purpose | Inspect one entity: attributes, direct Links, derived Impact (D4). |
| Primary user | Both. |
| Entry points | Registers, Schedule, Dashboard, EntityLink. |
| Information hierarchy | 1) Header identity + status 2) Active tab content 3) Optional metrics (≥4 or omit). |
| Layout regions | Breadcrumbs → EntityDetailHeader → optional KpiGroup → DetailTabs. |
| Grid (`approved UI Design decision`) | Single column; tabs full width; Links quieter than Impact callouts (VD-A). |
| Components | Breadcrumbs, EntityDetailHeader, StatusIndicator(family), KpiGroup?, DetailTabs, RelationshipList, ImpactCallout, DecisionSummary/Panel (Issue Impact / C), EntityLink, Empty/Loading/Error. |
| Data mapping | Per entity Overview fields from Domain/REQ/mock; Links = DOC-BA-015 only; Impact = BR-004/006 derived. **No** EQ—MS, Issue—Decision, Risk—Decision, Equipment—Decision links. |
| Snapshot | Entity missing after switch → EmptyState on same route + register CTA (DOC-UX-019). A/B/C field values from fixtures. |
| Visual states | Tab empty Links valid; loading; error. |
| Light / Dark | Impact stronger tonal callout; Links quieter. |
| Responsive | Tabs scroll; stack header. |
| Navigation / interactions | DOC-UX-019 §8–9. |
| Traceability | DOC-UX-006/018; DOC-BA-015. |

```text
Breadcrumb: Section / EntityId
┌ Header: title · StatusIndicator(family) ───────────────────┐
│ [KpiGroup ≥4 or omit]                                      │
│ Tabs: Overview | Links | Impact                            │
│  Overview: fields                                          │
│  Links: RelationshipList (direct) or EmptyState            │
│  Impact: ImpactCallout / Δ / Decision honesty (derived)    │
└────────────────────────────────────────────────────────────┘
```

**Family notes:** D-EQ delivery StatusIndicator; D-ISS Open/Mitigating; D-RSK/D-MS RAG; Issue Impact may embed DecisionPanel read-only on C.

### 4.8 M-DEC — Decision surface

| Field | Spec |
|-------|------|
| Purpose | Present management Decision context / recorded PrioritizeRecovery **without** implying recovery execution (D6 intent; BR-006). |
| Primary user | Director primary. |
| Entry points | Dashboard Decision rail; Issue Impact on C. |
| Information hierarchy | 1) Honesty / outcome 2) Decision type + meta 3) Related Issue Mitigating cue. |
| Layout regions | **Must Demo v1:** DecisionPanel region (Dashboard rail and/or Issue Impact) — **not** a separate interactive write modal. |
| Grid (`approved UI Design decision`) | Raised panel in Dashboard rail (~full rail width); on Detail, callout under Impact. |
| Components | DecisionPanel, DecisionSummary, ImpactCallout (honesty), StatusIndicator(issue=Mitigating on C). Dialog **not** used to write Decision in Must (DOC-UX-016/019). |
| Data mapping | A: none. B: no Decision record — problem context copy. C: DEC-001 type PrioritizeRecovery; owner SH-006; due 2027-03-20; note per fixture; Issue Mitigating; forecasts/RAG unchanged. |
| Snapshot | A empty; B needed-context; C recorded read-only. |
| Visual states | Empty / context / recorded; never success-green recovery. |
| Light / Dark | Honesty strip high contrast text. |
| Responsive | Rail stacks under story on narrow. |
| Navigation / interactions | Read-only; DOC-UX-019 §10–11. |
| Traceability | BR-006; REQ-IMPCT-002; DOC-UX-004/016. |

> **certainty:** open_question
>
> DOC-UX-003 / DOC-UX-012 describe **M-DEC modal to record** PrioritizeRecovery. DOC-UX-016/019 Must path locks **read-only** DecisionPanel + fixture DEC-001 on C (no interactive write). This screen spec follows the **Must UI Design** path. Interactive recording remains outside Must UI Design until separately decided — do not treat as Domain change.

```text
┌ DecisionPanel (surface-raised) ────────────────────────────┐
│ A: Neutral empty — no Decision                             │
│ B: Problem context — Decision not recorded (not "Pending") │
│ C: DEC-001 PrioritizeRecovery · due 2027-03-20             │
│    Honesty: forecast & Risk/MS RAG unchanged · Issue Mitig.│
└────────────────────────────────────────────────────────────┘
```

---

## 5. Cross-screen consistency rules (`approved UI Design decision`)

1. One global Snapshot; never mix A/B/C fields (DOC-UX-018/019).
2. Status geometry locked: Delayed diamond; Open outline; Mitigating half-filled; RAG filled disc (+ Red rail) (DOC-UX-018).
3. Delivery Δ ≠ Production Start Δ captions.
4. Links = direct DOC-BA-015 only; Impact = derived.
5. No EQ—MS edge; narrative ≠ edge list.
6. KPI group ≥4 or omit.
7. Selection/pagination/bulk off unless confirmed scenario.
8. BR-006: C does not “heal” forecast/RAG.
9. Table primary for dense data; Gantt secondary.
10. Shell chrome unchanged across pages.

## 6. Responsive behavior (`approved UI Design decision`)

| Width | Behavior |
|-------|----------|
| ≥1280 | Full shell; Dashboard two-column |
| 1024–1279 | Sidebar icons; gutters 16; Dashboard stack |
| &lt;1024 | Best-effort; not product target |
| Tables | Horizontal scroll over dropping Status/Δ/dates |
| Gantt | Hide before table on narrow |

Min content width **target** ≥720px when full shell shown (DOC-UX-015) — not a device guarantee.

## 7. Snapshot A/B/C screen matrix

| Surface | A (2027-02-15) | B (2027-03-01) | C (2027-03-02) |
|---------|----------------|----------------|----------------|
| Shell | Snapshot=A | Snapshot=B | Snapshot=C |
| Dashboard | Calm; RISK links; Decision empty | Delayed/Open/Red; PS 2027-10-06; Decision needed | Decision recorded; Mitigating; Red/forecast same as B |
| Schedule | EQ OnTrack / Delivery Δ0; MS Green / Milestone Δ0 | EQ Delayed / Delivery Δ+21d; MS Red / Milestone forecast 2027-10-06 | Same typed dates as B |
| Equipment | OnTrack | Delayed diamond | Delayed |
| Issues&Risks | Risk Green; no Open delay Issue | ISS Open + RISK Red | ISS Mitigating + RISK Red |
| Milestones | Green | Red / 2027-10-06 | Same as B |
| Detail | Entity fields for A | B fields + Links with Issue | C fields; Impact honesty |
| M-DEC | Empty | Context | DEC-001 read-only |

## 8. Screen-to-component mapping (summary)

| Component | Shell | P1 | P2 | P3 | P4 | P5 | Detail | M-DEC |
|-----------|:-----:|:--:|:--:|:--:|:--:|:--:|:------:|:-----:|
| AppShell / nav / Snapshot / Theme | ● | ● | ● | ● | ● | ● | ● | ● |
| DataTable / Toolbar | | | ● | ● | ● | ● | | |
| StatusIndicator | | ● | ● | ● | ● | ● | ● | ● |
| VarianceDelta | | ● | ● | ● | | ● | ● | |
| DecisionPanel | | ● | | | | | ○ | ● |
| GanttSurface | | ○ | ● | | | | | |
| DetailTabs / RelationshipList / ImpactCallout | | ○ | | | | | ● | ○ |
| ChartContainer | | ○ | | | | | | |

● primary ○ optional/embedded

## 9. Traceability matrix (screen → sources)

| Screen | UX / VD | UI Design | BR/REQ / data |
|--------|---------|-----------|---------------|
| Shell | D2/D7/D9; DOC-UX-002 | 015–019 | — |
| Dashboard | D1/D3/D5/D6/D8; DOC-UX-004 | 016–019 | BR-004/006; DOC-PROD-012; C-01/C-05 |
| Schedule | D10–D12; DOC-UX-005 | 016–018 | REQ-EQPT/MILE |
| Equipment | DOC-UX-003 P3 | 016 | REQ-EQPT; Domain EQ |
| Issues&Risks | P4; BA-OQ-006 closed | 016 single table+Type | REQ-RISK; BR-002 |
| Milestones | P5 | 016 | REQ-MILE |
| Detail | D4; DOC-UX-006 | 016–019 | DOC-BA-015 |
| M-DEC | D6 intent | 016/019 Must read-only | BR-006; REQ-IMPCT-002 |

## 10. Open questions and constraints

| Item | Status |
|------|--------|
| BA-OQ-006 layout | **closed**; single table+Type = Demo v1 decision (DOC-BA-010) |
| D12 Gantt lib | **deferred** |
| Interactive M-DEC / PrioritizeRecovery recording outside Must | **open_question** (Must path = read-only DecisionPanel + fixture DEC-001 on C — decided for Demo v1 Must; DOC-UX-003 modal journey remains outside Must) |
| Shell DOM Sidebar vs TopBar order | **open_question** (DOC-UX-019) |
| Filter persistence | MVP non-restore `assumption` |
| Closed / Amber / AcceptDateSlip Must UI | not in scope |
| Pagination on Schedule from older VD note | superseded by DOC-UX-016 default off |

## 11. Related documents

- [demo-v1-ui-design-overview.md](./demo-v1-ui-design-overview.md) · [demo-v1-ui-foundations.md](./demo-v1-ui-foundations.md) · [demo-v1-component-specification.md](./demo-v1-component-specification.md) · [demo-v1-ui-data-viz.md](./demo-v1-ui-data-viz.md) · [demo-v1-ui-interactions.md](./demo-v1-ui-interactions.md)
- [demo-v1-dashboard.md](./demo-v1-dashboard.md) · [demo-v1-schedule-workspace.md](./demo-v1-schedule-workspace.md) · [demo-v1-entity-detail.md](./demo-v1-entity-detail.md) · [demo-v1-screen-compositions.md](./demo-v1-screen-compositions.md)
- Mock: [`docs/03-product/demo-v1-mock-narrative-data.md`](../03-product/demo-v1-mock-narrative-data.md)
- Plan: `.cursor/plans/ui-design-spec-demo-v1.md`
