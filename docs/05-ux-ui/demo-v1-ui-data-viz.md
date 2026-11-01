---
id: DOC-UX-018
title: "Demo v1 UI Design — data visualization"
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
  - DOC-UX-007
  - DOC-UX-004
  - DOC-UX-005
  - DOC-UX-006
  - DOC-PROD-012
  - DOC-BA-015
---

# Demo v1 UI Design — data visualization

> **certainty:** hypothesis
>
> Правила визуализации данных Demo v1 поверх VD-A, Foundations (DOC-UX-015) и Components (DOC-UX-016). UI Design решения пакета — **`approved UI Design decision`** (human APPROVE UI Design pack Demo v1). Frontmatter `status: draft` = lifecycle. **Не** apps / не выбор Gantt lib (D12 deferred). Не меняет Domain / BR / REQ / OpenSpec / DOC-PROD-012. Не закрывает BA-OQ / HIP.

## 1. Purpose and scope

| In scope | Out of scope |
|----------|--------------|
| Status/RAG encoding in viz | Component anatomy (DOC-UX-016) |
| Snapshot A/B/C visual story | Screen grids (DOC-UX-017) |
| Links vs Impact presentation | Interaction flows detail (DOC-UX-019) |
| Baseline / forecast / Δ labeling | Invented metrics or series |
| Chart allow/deny (Recharts) | npm / CSS / library install |
| Gantt visual semantics (read-only) | D12 library choice |

Fixture values cited below = DOC-PROD-012 (`demo-v1-mock-narrative-data.md`). Do not alter numbers in this UI Design doc.

## 2. Status and RAG visual models (`approved UI Design decision`)

Inherit tokens/geometry from DOC-UX-015 §3.3/§6 and StatusIndicator rules from DOC-UX-016 §5.1. Color alone is never sufficient.

| Model | Values (Must) | Marker (`approved UI Design decision` — one each) | Label | Distinct from |
|-------|---------------|--------------------------------|-------|---------------|
| Equipment delivery | OnTrack | Filled disc | «On track» | — |
| Equipment delivery | Delayed | **Diamond** | «Delayed» | ≠ Risk/MS Red (disc + optional rail) |
| Issue status | Open | **Outline badge** | «Open» | ≠ Amber |
| Issue status | Mitigating | **Half-filled badge** | «Mitigating» | ≠ fixed / Green |
| Risk RAG | Green / Red | Filled disc (+ optional left rail on Red) | «Green» / «Red» | Context = Risk entity |
| Milestone RAG | Green / Red | Same RAG geometry as Risk | «Green» / «Red» | Context = Milestone entity |

> **certainty:** assumption
>
> DOC-UX-018 is the **source of concrete marker geometry**. DOC-UX-015/016/011 cite these locked shapes; do not reintroduce parallel geometries (bold bar / dashed) for the same status.

**Not Must UI:** Amber; Issue Closed chrome.

**BR-006 viz rule:** After PrioritizeRecovery (Snapshot C), do not show green wash, RAG upgrade, progress-to-recovered, or “schedule restored” metaphors. Mitigating means decision recorded, not recovery executed.

## 3. Snapshot A / B / C — visual story (`approved UI Design decision`)

Global SnapshotSelector switches the **entire** data context (DOC-UX-002). All surfaces must show one coherent snapshot — never mixed A/B/C fields.

### 3.1 Snapshot A — baseline (asOf 2027-02-15)

| Signal | Value (DOC-PROD-012) | Visual expectation |
|--------|----------------------|--------------------|
| EQ-HVAC-01 delivery baseline/forecast | 2027-05-15 / 2027-05-15 | OnTrack; Δ = 0 or calm |
| PS / MS-PS baseline/forecast | 2027-09-15 / 2027-09-15 | Green; Δ = 0 |
| RISK-001 | Green; linked EQ + MS | Calm RAG |
| Issue delay chain | none | No Open delay Issue; no Delayed EQ narrative |
| Decision | none | DecisionPanel neutral empty (DOC-UX-016) |

**Causal viz (Dashboard):** show **direct** Domain edges present in A — including RISK—EQ and RISK—MS when present in fixture. Do **not** invent Issue-driven delay chain. Do **not** draw EQ—MS. Do not present storytelling order as edge list.

### 3.2 Snapshot B — problem visible (asOf 2027-03-01)

| Signal | Value | Visual expectation |
|--------|-------|--------------------|
| EQ forecast delivery | 2027-06-05 (Δ = +21 calendar days) | Delayed marker; **Delivery Δ** labeled as equipment delivery |
| ISS-001 | Open | Issue status Open |
| RISK-001 / MS-PS | Red | RAG Red (Risk vs MS distinguished by context/label) |
| PS / MS forecast | 2027-10-06 | **Production Start Δ** labeled separately from delivery Δ |
| Decision | not recorded | DecisionPanel: problem context + need for management decision (**not** Domain status «Pending») |

**A→B story (must be readable):**

1. Equipment delivery forecast moved (+21d) and status → Delayed.
2. Issue Open participates in **direct** Links (EQ—Issue, Issue—MS, Issue—Risk, EQ—Risk, Risk—MS as applicable).
3. Production Start forecast moved to 2027-10-06 (aligned with BR-004 math in fixtures) — shown as PS/MS forecast change, **not** as an EQ—MS edge.
4. Risk/MS RAG → Red.

### 3.3 Snapshot C — decision recorded (asOf 2027-03-02)

| Signal | Value | Visual expectation |
|--------|-------|--------------------|
| DEC-001 | PrioritizeRecovery; due 2027-03-20; owner SH-006 | DecisionPanel shows recorded Decision (read-only Must) |
| ISS-001 | Mitigating | Issue status Mitigating — **not** resolved chrome |
| EQ / RISK / MS / PRJ forecasts & RAG | same as B (PS 2027-10-06; Red) | **No** improvement vs B |
| Recovery execution | not modeled | No progress bar / completion claim |

**B→C story:** only Decision record + Issue → Mitigating. Explicit honesty strip: forecast and Risk/Milestone RAG **unchanged** (BR-006).

### 3.4 What must never appear

- Green Risk/MS or OnTrack “recovery” after C as if schedule healed.
- AcceptDateSlip as Must primary C path (C' not Must mock).
- Mixing fields from different snapshots on one screen.

## 4. Links vs Impact (`approved UI Design decision`)

| Surface | Shows | Must not show |
|---------|-------|---------------|
| **Links** (RelationshipList) | Only direct DOC-BA-015 edges present in current snapshot | Narrative chain as edges; derived PS contribution as “link” |
| **Impact** (ImpactCallout / Δ / integrity notes) | Derived/indirect consequences, BR-004/006 honesty, aggregates | Fake FK chips |

### 4.1 Direct edges allowed in Links (DOC-BA-015)

Verify against Domain model; UX does not add edges:

| Edge | Links? |
|------|--------|
| Equipment — Issue | yes |
| Equipment — Risk | yes |
| Issue — Risk | yes (when `issueId` set) |
| Issue — Milestone | yes |
| Risk — Milestone | yes |
| Decision — Milestone | yes (via `milestoneId?`) |
| Equipment — Milestone | **no** |
| Issue — Decision | **no** (Mitigating / PrioritizeRecovery → Impact) |
| Risk — Decision | **no** |
| Equipment — Decision | **no** |
| Project ownership edges | overview/context, not detail RelationshipList chips |

**Snapshot-specific:** A has no ISS-001 → no Issue links involving ISS-001. B/C include Issue links. Empty Links → EmptyState (valid).

**Causal Dashboard viz:** same edge allowlist as Links; nodes may include PS as **label/aggregate** of MS/Project forecast, not as a Domain edge from EQ.

## 5. Baseline, forecast, variance (`approved UI Design decision`)

| Concept | Visual rule |
|---------|-------------|
| Baseline | Secondary/ghost in Gantt; explicit “Baseline” column/label in tables |
| Forecast | Primary date marker / column |
| Variance / Δ | Tabular numerals; sign + magnitude + **subject caption** |
| Delivery Δ | Caption e.g. «Equipment delivery»; uses delivery dates only |
| Production Start Δ | Caption e.g. «Production start»; uses PS/MS dates only |
| asOf | `AsOfMeta` / SnapshotEcho; scenarioAsOfDate per snapshot |

**Do not** present Equipment delivery date and Milestone/PS date as one field. Positive delay must be understandable from text (e.g. “+21 days”), not color/sign alone (VarianceDelta, DOC-UX-016).

## 6. Charts (Recharts) (`approved UI Design decision`)

Source allowlist: DOC-UX-007.

### 6.1 Snapshot A/B/C — discrete comparison (not a time series)

A/B/C are **three discrete snapshots**, not a continuous timeline and not output of a running forecast engine (DOC-PROD-012 fixtures).

| Rule | Detail (`approved UI Design decision`) |
|------|---------------------|
| Preferred | Compact **table** or discrete comparison of three independent PS forecast values (A / B / C), each labeled with snapshot letter + asOf date |
| If a chart is used | Show **unconnected** points/markers only — **no** connecting line, step bridge, interpolation, or smoothing between A→B→C |
| Labels | Explicit «Snapshot A/B/C» + corresponding asOf (2027-02-15 / 2027-03-01 / 2027-03-02) |
| Forbidden impression | Continuous dynamics, auto-forecast trajectory, or invented intermediate states |

Do not add fixture values beyond DOC-PROD-012.

### 6.2 Baseline vs Forecast Production Start (primary pattern)

Dates are **temporal positions**, not quantitative magnitudes.

| Rule | Detail (`approved UI Design decision`) |
|------|---------------------|
| **Primary** | Compact **table**: Baseline \| Forecast \| Δ (with subject caption «Production start») — or equivalent typed summary strip |
| **Allowed graphic (optional, not in addition to a decorative duplicate)** | Plot on a **time axis** with two explicitly labeled markers «Baseline» and «Forecast» (same subject). Do **not** use ordinary bar lengths that read as “size of a metric” |
| Disallowed | Category bars whose length encodes calendar dates as if they were amounts; stacking multiple decorative charts for the same pair |

Equipment **delivery** dates remain a separate subject (separate table/markers/Δ caption «Equipment delivery») — never one field with Production Start.

### 6.3 Other justified charts

| Chart | Data | When |
|-------|------|------|
| Distribution counts | Counts by allowlisted Equipment.status / Issue.status / Risk.rag | Only if meaningful categories and honest mock volume |

### 6.4 Prefer table instead

- Dense register comparison (Equipment, Issues&Risks, Milestones, Schedule control points).
- Exact baseline/forecast/Δ scan.
- Status allowlist filtering.
- Snapshot A/B/C PS comparison (§6.1) and Baseline/Forecast/Δ (§6.2).

### 6.5 Presentation rules

- Hierarchy: charts subordinate to narrative/Δ/Decision on Dashboard (VD-A / DOC-UX-004).
- Legend + axis labels required; tooltip supplements, not sole source.
- Light/Dark: series from neutrals + status tokens (DOC-UX-015); readable in both.
- Text alternative / adjacent data summary at implementation (requirement, not audit claim).
- KPI group still ≥4 or omit (not a chart loophole for fake metrics).
- One primary representation per question — no decorative duplicates.

### 6.6 Disallowed

- Burn-down, EVM, org heatmaps without data.
- Connected A/B/C lines/steps implying continuous forecast dynamics.
- Ordinary magnitude bars for calendar dates.
- Charts implying CPM, % complete recovery, or auto-reforecast.
- Decorative gauges / sparkline spam.

## 7. Gantt (read-only secondary) (`approved UI Design decision`)

| Rule | Detail |
|------|--------|
| Role | Secondary to Schedule **table** (D10); table = primary accessible data source |
| Rows | Milestone + Equipment delivery control points only (D11) |
| Markers | Forecast primary; baseline ghost; status marker per family rules |
| Forbidden | Activity/WBS/CPM; dependency arrows; drag-reschedule; fake duration bars without duration in model |
| Disclaimer | Control-point visualization — not calculated critical path |
| Library | **D12 resolved** — `dhtmlx-gantt` Community MIT `10.0.3` via [ADR-0004](../06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md); visual semantics remain normative here |
| Sync | Split view MAY share focused/hovered row cue with the table (**without** selection mode). Selection remains off by default; if selection is later added for a confirmed scenario, selected-row sync MAY be additional — not a prerequisite (normative: DOC-UX-019 §7) |

Component boundary: GanttSurface / ChartContainer (DOC-UX-016 §8). Interaction detail → DOC-UX-019.

## 8. Constraints and open questions

| Item | Status |
|------|--------|
| BA-OQ-006 register layout | **closed**; single table+Type (DOC-BA-010) |
| D12 Gantt lib | resolved (ADR-0004) |
| AcceptDateSlip C' visuals | not Must |
| Closed / Amber | not Must |
| Chart series exact HEX | use DOC-UX-015 roles; fine series table optional later |
| Mock volume density | hypothesis; do not edit DOC-PROD-012 |

## 9. Related documents

- [demo-v1-ui-foundations.md](./demo-v1-ui-foundations.md) · [demo-v1-component-specification.md](./demo-v1-component-specification.md)
- [demo-v1-data-viz-and-components.md](./demo-v1-data-viz-and-components.md) · [demo-v1-dashboard.md](./demo-v1-dashboard.md) · [demo-v1-schedule-workspace.md](./demo-v1-schedule-workspace.md) · [demo-v1-entity-detail.md](./demo-v1-entity-detail.md)
- Mock: [`docs/03-product/demo-v1-mock-narrative-data.md`](../03-product/demo-v1-mock-narrative-data.md)
- Domain: [`docs/02-business-analysis/domain-model-demo-v1.md`](../02-business-analysis/domain-model-demo-v1.md)
- Plan: `.cursor/plans/ui-design-spec-demo-v1.md`
