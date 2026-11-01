# Proposal

## Why

Demo v1 proves the causal spine but singular fixtures feel empty as a plant project. Enrichment expands to a `small but believable` multi-workstream Demo **v1** (not v2), with R1 corrections aligning edges to DOC-BA-015 and closing BR-004 / Closed / AcceptDateSlip product decisions.

## What Changes

- Discrete snapshots **A–H**; remap teaching delay to **C**, decisions to **F**; preserve spine IDs and 2027 calendar.
- Multi-record inventories (~23 EQ, 14 MS, 11 ISS, 12 RISK, 6 DEC); `workstream` grouping field; RU names.
- Issue Must lifecycle includes **Closed** (fixture-authored effects).
- Decision contract: `projectId` + optional `milestoneId` only — **no** Decision→EQ/ISS/RISK.
- Restore **Issue→Milestone** per DOC-BA-015; keep Equipment→Milestone forbidden.
- BR-004 sole PS driver EQ-HVAC-01 / RISK-001; BR-007 **state-based** (RISK-001 Red ⇒ MS-PS not Green).
- Dashboard read models: overall status, WS rollups, topExceptions (curated `priority` on read model only), fixture-authored trend.
- UX: compact A–H snapshot disclosure (not 8 TopBar radios); Dashboard hierarchy.
- **BREAKING** for singular-only dashboard fields → list/top-N shapes (no external production consumers).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `project-status-overview`
- `equipment-delivery-status`
- `milestone-readiness`
- `risk-issue-impact`
- `management-exception-report`
- `demo-v1-architecture-constraints`

## Impact

- Docs DOC-PROD-019…022, DOC-UX-021, BA registers (OQ-004/005 Demo path), plan E1…E8.
- Later E1–E8 implementation — **not** this change apply yet.
- Out of scope: Demo v2, Activity/WBS/CPM, Owner entity, Domain managementPriority, PostgreSQL, I9.
