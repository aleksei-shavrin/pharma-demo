# Tasks

> R1 design APPROVED. **E1–E8 APPROVED** (2026-11-02). **Demo v1 — APPROVED / RELEASED** (`demo-v1.0.0`). Enrichment COMPLETE. Namespace **E1…E8** (not I9).

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

## E5 — Schedule — APPROVED (E5 + E5-R1)

- [x] Unified ScheduleBoard: shared row model Table/Split/Timeline; row-height 48; sticky headers; viewport scroll
- [x] Point markers + baseline/forecast geometry; filters/search; no Activity/WBS/CPM
- [x] Additive schedule DTO name/workstream
- [x] E5-R1: bounded `h-dvh` layout chain; Split Object|Status|Forecast (no Type); month cell spans; no row selection; portaled marker tooltip
- [x] Human visual review — **APPROVED** (2026-11-02)

## E6 — Details — APPROVED (2026-11-02)

- [x] Overview density; title hierarchy RU primary / ID secondary; OwnerRef «Ответственный»
- [x] Links BA-015 only; Issue→Milestone kept; no Equipment→Milestone; Impact Decision honesty
- [x] Human visual — **APPROVED** (2026-11-02): EQ-HVAC-01 C Overview/Links + G Impact; ISS-001 C; RISK-001 C; MS-PS G

## E7 — Selector / Guide — APPROVED (2026-11-02)

- [x] Compact trigger + portaled A–H listbox; one ARIA pattern; API date on committed trigger
- [x] Atomic switch + stale protection; sessionStorage A–H; Guide C punch + F/G/H
- [x] R1: meta contract test; pipe error copy A–H; test cast cleanup
- [x] Human visual — **APPROVED** (2026-11-02): Dashboard A/C/G Light + H Dark; selector portal accepted via impl + tests
- Status: **E6 + E7 + E6/E7-R1 — APPROVED**

## E8 — Final acceptance — APPROVED (2026-11-02)

- [x] Contract audit: scale, BA-015, BR-004/007, A–H, selector atomicity, screens
- [x] Director-facing RU polish for G/H Top Exceptions / Trend (retain HVAC/WFI/BMS/EMS/IQ)
- [x] Current-state docs sync; full gates + smoke
- [x] Final human acceptance — **APPROVED** (2026-11-02): Dashboard G Light; H Dark; selector OPEN A–H Light
- Status: **E8 — APPROVED**. **Demo v1 enrichment E1–E8 COMPLETE**. Local tag `demo-v1.0.0`. No Demo v2 / no I9.
