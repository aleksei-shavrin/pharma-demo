# Tasks

> R1 design APPROVED. E1 + E1-R1 APPROVED. E2 + E2-R1 APPROVED. **E3 APPROVED** (2026-11-02, after E3-R5). **E4 APPROVED** (2026-11-02). Namespace **E1…E8** (not I9). Next: E5.

## E1 — Contracts

- [x] Array DTOs/OpenAPI; workstream; RU names/titles
- [x] Issue status Closed; Decision projectId/milestoneId
- [x] Dashboard: projectStatus, workstreamRollups, topExceptions (read-model priority), trend shape
- [x] Edges: Issue→MS yes; Decision→EQ/ISS/RISK no; EQ→MS no
- [x] Derivation unit tests (WS rollup, overall status) + small multi stubs
- [x] No long-lived singular+array dual public API
- [x] E1-R1: A/B/C stub timeline aligned to DOC-PROD-021/022; spine no silent substitute; Decision tests via test-local fixture



## E2 — Fixtures A–H

- [x] DOC-PROD-021/022 full fixtures; remove stubs
- [x] Integrity BR-004/006/007 state-based; Closed; G/H residual honesty
- [x] Remap: C=+21; F=DEC-001; G PKG Closed + HVAC +14
- Status: **APPROVED** (E2 + E2-R1)

## E3 — Dashboard

- [x] Hierarchy above-fold Status + Top Exceptions; Attention; WS; Trend; Decisions
- [x] Decision honesty copy; RU presentation mappings
- [x] E3-R1 visual hierarchy: PS emphasis; less nested boxes; compact Attention/WS/Trend; human exception links
- [x] E3-R2 composition: ProjectControlSummary + ExecutiveMilestoneStrip + Management/Change grids
- [x] E3-R3 visual language: weaker outer cards; stronger PS/timeline/matrix/change tiles
- [x] E3-R4 dashboard canvas (no Page Surface) + module surfaces + interactive fixed-geometry timeline
- [x] E3-R5 targeted polish: surfaces, timeline collision/overlays a11y, Schedule AC recorded (not implemented)
- Status: **E3 — APPROVED** (human visual: A/B/C Light + C Dark). Tooltip/popover accepted on implementation/test evidence; dedicated overlay screenshots were not an E3 release blocker.


## E4 — Registers — APPROVED

- [x] Dense Equipment / Issues & Risks / Milestones with search, attention, workstream, counts
- [x] Issues & Risks: single typed table (BA-OQ-006); Closed; Issue→Milestone; RISK-COM-01 without Issue
- [x] Additive register DTO fields (workstream / links / related active Issue & Red Risk)
- [x] Human visual review — APPROVED (2026-11-02): Equipment A/C Light + C Dark; Issues & Risks C; Milestones C Light/Dark. No E4-R1.
- Status: **E4 — APPROVED**

## E5 — Schedule — PENDING / NOT STARTED

- [ ] Group/filter/compact/fit; no Activity; visual checkpoint
- [ ] Split View: shared row model + sticky headers + viewport-bounded vertical scroll (see plan E5 notes; not started)

## E6 — Details

- [ ] Overview/Links/Impact density; BA-015 links only

## E7 — Selector / Guide

- [ ] Compact trigger + A–H disclosure; one valid ARIA pattern (no mix)
- [ ] Atomic switch + stale protection; Guide C punch + D–H notes

## E8 — Acceptance

- [ ] Walkthrough + regression; apps/e2e/docs gates; no Demo v2 / I9
