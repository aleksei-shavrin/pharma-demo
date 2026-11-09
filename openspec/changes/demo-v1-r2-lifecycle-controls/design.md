# Design

## Context

См. `proposal.md` — Why. Baseline apps: Nest mock 01–08 (`catalog` + `snapshot-states` + `build-snapshot`), FE SnapshotContext + portaled 01–08 selector, Dashboard without cost/people/workstream routes. Enrichment OpenSpec archived and synced `2026-11-02`. Normative product/BA/UX: DOC-PROD-023…026, DOC-BA-018, DOC-UX-022.

## Goals / Non-Goals

**Goals:**

- Extend discrete snapshot pipeline to 01–19 without history engine.
- Add read-model Workstream, Person, Cost integers, Notifications without ERP scope.
- Keep BA-015 / BR-004 / BR-006 / BR-007 intact with explicit late-stage BR-004 clarification.
- Scale selector UX via phase-grouped listbox; Dashboard remains executive.

**Non-Goals:**

- PostgreSQL, auth, Activity/CPM/EVM, Contractors/GL, HRIS, Demo v2, I9.
- Implementing fixtures/UI in R2-D0 (design/OpenSpec only).

## Decisions

1. **Snapshots 01–19, end at PS** — 19 management events; 19 actual `2027-09-22`; no T. Alternative monthly filler rejected.
2. **BR-004 alignment** — `psDelta === EQ-HVAC-01 Δ`; O updates both to +7 in one post-state. Alternative new PS driver rejected.
3. **Workstream = read-model entity** — catalog + aggregates + `/workstreams/:id`. Alternative Domain Aggregate / keep field-only rejected.
4. **Person = PER-* reference** — single SH→PER cutover. Dual-read long-term rejected.
5. **Cost = integer RUB; EAC = Actual + ETC** — Committed parallel obligation signal. Actual+Committed+ETC sum rejected.
6. **Contingency = project reserve** — not 9th WS. Alternative WS-CONT rejected by product freeze.
7. **Equipment cost selective subset** — not Σ EQ = WS BAC.
8. **Executive milestones** — fixture-authored snapshot-aware list on Dashboard DTO; FE hardcoded six IDs retired as SoT.
9. **Notifications storage** — localStorage popup pref; sessionStorage read; not SoT.
10. **Selector** — phase-grouped scrollable portaled listbox; no AppBar timeline.
11. **BAC frozen** — fictional **6_200_000_000 ₽** (DOC-PROD-026; R2-D0-R1). Not reopened for R2-M1.
12. **Baseline cost** — Snapshot 01 EAC=BAC, VAC=0; unused contingency ≠ forecast saving.
13. **Nav** — Люди + Стоимость top-level; Workstream drill-down only.
14. **Late RAG** — 16=Red, 17=Yellow, 18=Yellow, 19=Green; BR-007 preserved via fixture Risk/MS states.

## Risks / Trade-offs

- [01–08 rewrite temptation] → Treat DOC-PROD-022 as frozen unless blocker.
- [Cost double-count EQ vs WS] → Explicit subset rules + integrity tests.
- [Selector a11y with groups] → Preserve keyboard contract; test portal/scroll.
- [OpenSpec living lag] → Enrichment already archived/synced before R2 deltas.
- [CAPEX research uncertainty] → Documented; BAC still frozen as Demo assumption.

## Migration Plan

1. Human accept R2-D0-R1 design corrections.
2. R2-C1 contracts → L1 fixtures → M1 cost → W/P/N → U1/I1 → A1.
3. Rollback: Git tags `demo-v1.0.0` / `demo-v1-enrichment-baseline` remain restore points.

## Open Questions

None that block R2-C1. Remaining are implementation authoring details (exact fullNameRu strings, per-WS cost splits under frozen project totals, notification copy per snapshot) — not product open questions.
