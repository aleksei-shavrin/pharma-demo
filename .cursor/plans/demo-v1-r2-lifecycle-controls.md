---
title: Demo v1 R2 — lifecycle and project controls
status: draft
created: 2026-11-02
updated: 2026-11-02
---

# Demo v1 R2 — lifecycle and project controls

> **Same Demo v1.** Not Demo v2. Not I9.
> Baseline tags: `demo-v1.0.0`, `demo-v1-enrichment-baseline` (historical checkpoints).
> Enrichment E1–E8 COMPLETE; OpenSpec `demo-v1-enrichment` archived `2026-11-02-demo-v1-enrichment` (specs synced).
> **R2-D0 / C1 / L1(+R1) / M1(+R1) / W1(+R1/R2) APPROVED** (checkpoint). **R2-P1 People** implemented (PER catalogue, SH→PER cutover, `/people`) — awaiting human visual review. R2-N1 not started.

## Normative docs

| Doc | ID |
|-----|-----|
| Scope | DOC-PROD-023 |
| Lifecycle A–S | DOC-PROD-024 |
| Data blueprint | DOC-PROD-025 |
| Cost / CAPEX | DOC-PROD-026 |
| BA extensions | DOC-BA-018 |
| UX delta | DOC-UX-022 |
| OpenSpec | `openspec/changes/demo-v1-r2-lifecycle-controls/` |

## Frozen decisions

- A–S (19); S = PS achieved `2027-09-22` (+7); no post-start T
- BR-004 sole driver; O moves HVAC+PS to +7 together
- Workstream = read-model entity; Person = PER-*; Cost = integer RUB
- Contingency = project reserve inside BAC; unused ≠ automatic +VAC
- Equipment cost = selective subset
- Notifications: localStorage prefs / sessionStorage read; not SoT
- No EVM / Activity / CPM / PG / auth / Demo v2
- **BAC 6_200_000_000 ₽** frozen (fictional) — not reopened for R2-M1
- Snapshot A: EAC=BAC, VAC=0
- Nav: Люди + Стоимость top-level; Workstream via drill-down
- Late RAG: P=Red, Q=Yellow, R=Yellow, S=Green (BR-007 via fixtures)

## Implementation stages (after D0 human accept)

| Stage | Scope | Commit boundary |
|-------|-------|-----------------|
| **R2-D0** | Design + OpenSpec propose | docs/openspec/plan only |
| **R2-C1** | Contracts/DTOs A–S, WS, Person, Cost ints, Notif | api+web types |
| **R2-L1** | Catalogues + I–S fixtures (schedule entities) | fixtures |
| **R2-M1** | Cost model + invariants + `/costs` API | money |
| **R2-W1** | Workstream API + page | workstream ← **current** |
| **R2-P1** | People + SH→PER cutover | people |
| **R2-N1** | Notifications + AppBar | notifications |
| **R2-U1** | Dashboard IA + selector phases + horizon | dashboard |
| **R2-I1** | Registers/Schedule/Detail integration | integration |
| **R2-A1** | Full A–S integrity + acceptance | acceptance |
| **R2-R0** | Human APPROVED + local tag on ask | release |

## Gates (D0)

docs checks · OpenSpec validate · `git diff --check` · **apps untouched**.

## Out of scope

Demo v2; I9; PostgreSQL; auth; Activity/CPM/deps; Contractors/GL; HRIS; fake GMP; full EVM.
