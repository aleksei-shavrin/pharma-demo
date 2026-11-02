---
title: Demo v1 enrichment (continuing)
status: draft
created: 2026-11-01
updated: 2026-11-01
---

# Demo v1 enrichment

> **Demo v1 continues.** Не Demo v2. Не tag `demo-v1.0.0`.
> **Не I9** — iterations **E1…E8**.
> **R1 design pack APPROVED** (2026-11-01).
> **E1 + E1-R1 APPROVED** (2026-11-01) — contracts/read models established.
> **E2 + E2-R1 APPROVED** (full A–H fixtures + integrity).
> **E3-R1 implemented / awaiting human visual review** (Dashboard visual hierarchy). Not AI-APPROVED.
> **E4–E8 pending.**

## Context

- Baseline I1–I8 exhausted: [demo-v1-implementation.md](./demo-v1-implementation.md).
- Design: DOC-PROD-019…022, DOC-UX-021, OpenSpec `demo-v1-enrichment`.
- Scale (R1): **23** EQ · 14 MS · 11 ISS · 12 RISK · 6 DEC · A–H · 8 WS · 5 stories.

## Product decisions (closed — R1)

1. **BR-004:** sole PS driver `EQ-HVAC-01` / `RISK-001` (no max(Δ)/CPM).
2. **Issue lifecycle Must:** Open | Mitigating | **Closed** (effects fixture-authored).
3. **AcceptDateSlip:** post-state fixture-authored; Decision alone changes nothing (BA-OQ-004/005 closed for Demo path).

## Development workflow

- Dev: `docker-compose.dev.yml` + `npm run dev` / `dev:down`
- Prod-like: `docker compose --profile app`

## Design artifacts

| Doc | ID |
|-----|-----|
| Audit | DOC-PROD-019 |
| Scope | DOC-PROD-020 |
| Fixture blueprint | DOC-PROD-021 |
| Snapshot matrix | DOC-PROD-022 |
| UX delta | DOC-UX-021 |
| OpenSpec | `openspec/changes/demo-v1-enrichment/` |

## Implementation iterations (after final design approval)

### E1 — Contracts / read models — **APPROVED** (E1 + E1-R1)

- Array-shaped DTOs/OpenAPI; `workstream`; RU names/titles
- Issue status **Closed**; Decision `projectId` / `milestoneId`
- Dashboard: `projectStatus`, WS rollups, `topExceptions[]` (read-model `priority` only), `trend` fixture shape
- Relationship contracts per BA-015 (Issue→MS yes; Decision→EQ/ISS/RISK no)
- Unit tests with **small multi-record stubs**; **no** long-lived singular+array dual public API
- **Exclusions:** full A–H fixtures; UI polish
- **Gates:** api unit + e2e; web contract-compat tests; OpenSpec validate

### E2 — Fixture expansion — **APPROVED** (E2 + E2-R1)

- Full A–H per DOC-PROD-021/022; remove E1 stubs
- Integrity: BR-004/006/007 state-based; Closed; Decision links; G/H residual
- **Gates:** api tests; fixture coherence
- **AC:** A calm; C=+21/RISK-001 Red; F=DEC-001 Mitigating +21; G PKG Closed + HVAC +14; H residual

### E3 — Dashboard — **E3-R1 implemented / awaiting human visual review**

- Hierarchy: above-fold Status + Top Exceptions; secondary Attention; below WS / Trend / Decisions
- E3-R1: Production Start executive emphasis; less nested boxes; compact Attention/WS/Trend; human exception links
- Honesty: Decision ≠ recovery

### E4 — Registers

- Search/filter/sort/counts incl. Closed; no pagination

### E5 — Schedule

- Group/filter/compact/fit; ~37 control points; **no** Activity; visual checkpoint

### E6 — Detail density

- Overview/Links/Impact; BA-015 links only

### E7 — Snapshot narrative / selector / Guide

- Compact current-snapshot trigger + disclosure A–H (letter, asOf, RU context)
- **One** valid ARIA pattern (listbox **or** radio popover **or** other) — **no mixed patterns**
- Atomic switch + stale protection; Live Guide C punch + optional D–H

### E8 — Acceptance

- Walkthrough + regression; `test:apps` / e2e / docs gates
- No Demo v2 / I9

## Order

E1 → E2 → E3 → E4 → E5 → E6 → E7 → E8 (unchanged; E7 owns selector a11y choice).

## Out of scope

Demo v2; Activity/WBS/CPM; PostgreSQL; Domain `managementPriority`; Owner entity; I9; implementing apps in design passes.
