# Tasks

> R2-D0 design COMPLETE (awaiting human review). Implementation starts only after human accept. Namespace **R2-*** (not I9). Same Demo v1.

## R2-D0 — Design freeze

- [x] Research project controls + CAPEX comps; document uncertainty
- [x] Archive/sync `demo-v1-enrichment` → living specs
- [x] DOC-PROD-023…026, DOC-BA-018, DOC-UX-022, Cursor plan
- [x] OpenSpec change `demo-v1-r2-lifecycle-controls` artifacts
- [x] Human design acceptance — **APPROVED WITH R1** (2026-11-02)
- [x] R2-D0-R1: freeze BAC 6.2B; fix 01–19 cost arithmetic; nav People+Costs; P/Q/R/S RAG

## R2-C1 — Contracts

- [x] Snapshot id 01–19 types/pipes; DTOs Workstream/Person/Cost/Notification
- [x] OpenAPI update; FE api-client types
- [x] Contract tests without full fixture depth
- [x] R2-C1-R1: PersonId/WorkstreamId tightening on public R2 contracts (no handlers)

## R2-L1 — Lifecycle fixtures

- [x] Expand catalogues (MS/EQ/ISS/RISK/DEC)
- [x] 09–19 snapshot overlays; preserve 01–08 core
- [x] BR-004/007 integrity 01–19; executiveMilestoneIds
- [x] R2-L1-R1: Equipment.status = delta semantics + authored eqStatus (no asOf inference)

## R2-M1 — Cost

- [x] Integer RUB project/WS/selective EQ fields
- [x] CBS + contingency invariants; 01–19 cost story
- [x] `/costs` API
- [x] R2-M1-R1: Project↔WS reconciliation — contingency residual not hidden in WS EAC

## R2-W1 — Workstream

- [x] Workstream catalog + detail API
- [x] `/workstreams/:id` page; Dashboard links
- [x] R2-W1-R1: Workstream Detail visual correction (preview sections, RU summary/contingency, compact cost, no duplicate title) — final human screenshot review pending; not marked human-approved yet
- [x] R2-W1-R2: Page scroll ownership — PageFrame/PageHeader/PageContent (`page` vs `workspace`); Workstream scrolls in PageContent; Schedule keeps internal board scroll; root cause was `overflow-hidden` shell without page scroll owner; awaiting human scroll review; not human-approved yet

## R2-P1 — People

- [x] PER-* catalog; SH→PER cutover
- [x] `/people`, `/people/:id`
- [x] Workstream leads; Issue/Decision ownerPersonId; optional EQ responsible; integrity — human visual review pending; not human-approved yet
- [x] R2-P1-R1: semantic ownership correction (WS-led Issue/Decision owners; RU-only roleTitleRu; SH_TO_PER = migration aid only) — awaiting human visual re-review; not human-approved yet

## R2-N1 — Notifications

- [x] Notification fixtures + API (`GET …/notifications?snapshot=`) — authored 01–19; not SoT
- [x] AppBar bell/popover/toasts; read=`sessionStorage` (`ppc.demo.notificationRead`); popup pref=`localStorage` (`ppc.demo.notificationPopup`, default on); ≤3 toasts only after successful atomic commit — **APPROVED / CLOSED**
- [x] R2-N1-R1: RU-only director notification copy + taxonomy «Проблема»; full soft entityRef integrity (7 types); Decision remains unroutable — **APPROVED / CLOSED**

## R2-U1 — Dashboard / selector — **APPROVED / CLOSED**

Human visual acceptance 2026-11-02: O LIGHT, S LIGHT, S DARK, O timeline zoom — PASS. No further U1 corrective iteration.

- [x] Cost signal; phase-grouped 01–19 selector (19); timeline horizon → 30.09.2027
- [x] Snapshot-aware executive milestones (`executiveMilestoneIds`); Dashboard IA reorder
- [x] R2-U1-R1: authoritative `executiveMilestoneIds` integrity; cost signal invalidate-on-switch + stale/mismatch guard; FE `projectCostFixture` ↔ DOC-PROD-026 parity
- [x] R2-U1-R2: executive overview row (Status+Cost | compact RAG-sorted readiness); timeline raised; early BLD story + short labels
- [x] R2-U1-R3: late-stage multi-lane timeline label/chrome policy; RU-only director Trend/Exceptions narrative
- [x] R2-U1-R4: overview full-height stretch; readiness; **stable** executive milestone map (12) 01–19
- [x] R2-U1-R5: persistent RAG readiness; Attention 2×2; Decisions scroll; toasts; timeline stems/RU labels — interim **REJECTED** (superseded)
- [x] R2-U1-R6: lower IA 50/50 + Green readiness neutral + unified slots — interim **REJECTED** (two-col CSS miss; superseded by R7)
- [x] R2-U1-R7: actual two-column lower grid (`lg:grid-cols-2` scanned) — accepted into final pack
- [x] R2-U1-R8: Production Start consolidated annotation cluster
- [x] R2-U1-R9: PS cluster geometry (connector / leader / active vs historical +N / coincident) — final visual PASS
- [x] Stage closed: executive IA, 50/50 lower rows, workstream readiness, stable 01–19 set + navigation, late collision policy, PS cluster, light/dark parity

## R2-I1 — Integration (NOT STARTED)

- [ ] Registers/Schedule/Detail cost & people fields
- [ ] Route smoke 01–19

## R2-A1 — Acceptance (NOT STARTED)

- [ ] Full integrity + gates
- [ ] Human visual pack
- [ ] Tracking APPROVED only after human

## R2-R0 — Release (on ask)

- [ ] Local tag only when requested; no Demo v2
