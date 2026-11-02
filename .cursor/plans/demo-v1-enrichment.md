---
title: Demo v1 enrichment (continuing)
status: draft
created: 2026-11-01
updated: 2026-11-02
---

# Demo v1 enrichment

> **Demo v1 continues.** Не Demo v2. Не tag `demo-v1.0.0`.
> **Не I9** — iterations **E1…E8**.
> **R1 design pack APPROVED** (2026-11-01).
> **E1 + E1-R1 APPROVED** (2026-11-01) — contracts/read models established.
> **E2 + E2-R1 APPROVED** (full A–H fixtures + integrity).
> **E3 — APPROVED** (2026-11-02) after E3-R5 human visual review (A/B/C Light + C Dark).
> **E4 — APPROVED** (2026-11-02) after human visual review (Equipment A/C Light + C Dark; Issues & Risks C; Milestones C Light/Dark).
> **E5 + E5-R1 — APPROVED** (2026-11-02). **E6 + E7 + E6/E7-R1 — APPROVED** (2026-11-02) after human visual review. **E8 PENDING / NOT STARTED.**

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
- **Nest `deleteOutDir: false`:** required with named volume `ppc_dev_api_dist` mounted at `/app/dist` (mount point cannot be `rmdir`'d; Nest `deleteOutDir:true` → EBUSY). Documented on the compose volume comment. Not a product/API semantics change.
- **`/tmp/`** (repo root): ignored project-local scratch for AI/review artifacts (diffs, screenshots). Not source of truth; not required for build/test/runtime.

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

### E3 — Dashboard — **APPROVED** (after E3-R5)

- Human visual acceptance: A Light, B Light, C Light, C Dark (2026-11-02)
- Dashboard = executive project-control briefing (not KPI wall)
- Hierarchy: Summary (Status / PS / Attention) → Executive Timeline → Exceptions + Workstreams → Changes + Decision
- Canvas without PageSurface; independent ModuleSurface; sparse A / local Yellow B / causal Red C; Light/Dark
- Fixed-geometry timeline; baseline → variance → forecast; backend-owned statuses/rollups/exception order
- E3 visual acceptance completed for A/B/C Light and C Dark. Timeline tooltip/popover interaction is accepted on implementation/test evidence; dedicated overlay screenshots were not required as an E3 release blocker.

### E4 — Registers — **APPROVED** (after human visual review)

- Dense Equipment / Issues & Risks / Milestones registers with PageSurface
- Client-side search + attention + workstream (+ type for Issues & Risks); compact counters; no pagination
- Additive register read-model fields: workstream, BA-015 link ids, related active Issue / Red Risk indicators
- Single Issues & Risks table + Тип (BA-OQ-006); Closed visible but not active attention
- Human visual: Equipment A/C Light + C Dark; Issues & Risks C Light (+ Risks filter); Milestones C Light/Dark — **APPROVED** (2026-11-02). No E4-R1.

### E5 — Schedule — **APPROVED** (after E5-R1)

Human AC (post–E3-R4) implemented as unified Schedule control board:

- One logical row model for Table / Split / Timeline (`ScheduleBoard`)
- Fixed row height 48px; sticky header band; single vertical scroll viewport (`min-h-0` / flex fill)
- Sticky left info rail + timeline in one scroll container (no dual `scrollTop` sync)
- Point markers (Equipment circle / Milestone diamond); baseline ghost + connector when Δ≠0
- Client filters: search, attention, workstream, kind; additive schedule DTO `name` + `workstream`
- Default view: Split. dhtmlx-gantt adapter retained in repo but **not wired** for E5 board (cannot share row geometry with left rail — ADR-0004 presentation superseded for enrichment Split/Timeline)

**E5-R1 corrective (visual):**
- Shell `h-dvh` + overflow chain so ScheduleBoard is height-bounded (page no longer scrolls away AppBar/controls)
- Split left rail: Object | Status | Forecast/Δ (no Type column); wider Object (`26rem`)
- Month headers as cell spans (not boundary-centered) — first/last labels not clipped
- Removed meaningless row-click selection; title link + marker tooltip only; tooltip portaled

Status: **E5 + E5-R1 — APPROVED** (2026-11-02) after human visual review.

### E6 — Detail density — **APPROVED** (2026-11-02)

- Overview density; RU title primary / ID secondary; Links BA-015 only; Impact Decision honesty
- R1: remove Overview status/as-of duplication; OwnerRef label «Ответственный»
- Human visual: EQ-HVAC-01 C Overview/Links + G Impact; ISS-001 C; RISK-001 C; MS-PS G Overview/Impact

### E7 — Snapshot narrative / selector / Guide — **APPROVED** (2026-11-02)

- Compact AppBar trigger + **portaled** listbox A–H (avoids shell overflow clip)
- Trigger date from committed API `scenarioAsOfDate`; option dates = narrative meta + contract test
- **One** ARIA pattern: button + listbox; atomic switch; sessionStorage A–H; Guide C punch + F/G/H
- Human visual: Dashboard A/C/G Light + H Dark. Selector portal/interaction accepted on implementation + automated test evidence; dedicated open-selector screenshot was not a release blocker.

**E6/E7-R1 — APPROVED** (2026-11-02). Non-blocking (deferred): short detail page whitespace; some English fixture/narrative strings on Dashboard G/H.

### E8 — Acceptance — PENDING / NOT STARTED

- Walkthrough + regression; `test:apps` / e2e / docs gates
- No Demo v2 / I9

## Order

E1 → E2 → E3 → E4 → E5 → E6 → E7 → E8 (unchanged; E7 owns selector a11y choice).

## Out of scope

Demo v2; Activity/WBS/CPM; PostgreSQL; Domain `managementPriority`; Owner entity; I9; implementing apps in design passes.
