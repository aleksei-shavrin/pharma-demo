# Tasks

> R2-D0 design COMPLETE (awaiting human review). Implementation starts only after human accept. Namespace **R2-*** (not I9). Same Demo v1.

## R2-D0 — Design freeze

- [x] Research project controls + CAPEX comps; document uncertainty
- [x] Archive/sync `demo-v1-enrichment` → living specs
- [x] DOC-PROD-023…026, DOC-BA-018, DOC-UX-022, Cursor plan
- [x] OpenSpec change `demo-v1-r2-lifecycle-controls` artifacts
- [x] Human design acceptance — **APPROVED WITH R1** (2026-11-02)
- [x] R2-D0-R1: freeze BAC 6.2B; fix A–S cost arithmetic; nav People+Costs; P/Q/R/S RAG

## R2-C1 — Contracts

- [x] Snapshot id A–S types/pipes; DTOs Workstream/Person/Cost/Notification
- [x] OpenAPI update; FE api-client types
- [x] Contract tests without full fixture depth
- [x] R2-C1-R1: PersonId/WorkstreamId tightening on public R2 contracts (no handlers)

## R2-L1 — Lifecycle fixtures

- [ ] Expand catalogues (MS/EQ/ISS/RISK/DEC)
- [ ] I–S snapshot overlays; preserve A–H core
- [ ] BR-004/007 integrity A–S; executiveMilestoneIds

## R2-M1 — Cost

- [ ] Integer RUB project/WS/selective EQ fields
- [ ] CBS + contingency invariants; A–S cost story
- [ ] `/costs` API

## R2-W1 — Workstream

- [ ] Workstream catalog + detail API
- [ ] `/workstreams/:id` page; Dashboard links

## R2-P1 — People

- [ ] PER-* catalog; SH→PER cutover
- [ ] `/people`, `/people/:id`

## R2-N1 — Notifications

- [ ] Notification fixtures + API
- [ ] AppBar bell/toasts; localStorage/sessionStorage prefs

## R2-U1 — Dashboard / selector

- [ ] Cost signal; phase-grouped A–S selector; timeline horizon
- [ ] Snapshot-aware executive milestones

## R2-I1 — Integration

- [ ] Registers/Schedule/Detail cost & people fields
- [ ] Route smoke A–S

## R2-A1 — Acceptance

- [ ] Full integrity + gates
- [ ] Human visual pack
- [ ] Tracking APPROVED only after human

## R2-R0 — Release (on ask)

- [ ] Local tag only when requested; no Demo v2
