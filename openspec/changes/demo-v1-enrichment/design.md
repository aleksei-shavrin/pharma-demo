# Design

## Context

See proposal.md. R1 design pack APPROVED. E1 + E1-R1 contracts/read models APPROVED. E2–E8 pending. Full A–H fixtures not yet applied.

## Goals / Non-Goals

**Goals**

- Array fixtures A–H; BA-015 edges; Closed status; Decision Project/MS only.
- Backend-owned overall status, WS rollup, topExceptions (read-model priority), trend fixtures.
- Compact A–H selector requirements; Dashboard hierarchy.

**Non-Goals**

- Activity/WBS/CPM; event sourcing; Domain `managementPriority`; Owner entity; `Issue.critical`; Demo v2; max(Δ); mixed ARIA patterns in selector design.

## Decisions

1. **BR-004** sole driver EQ-HVAC-01 / RISK-001 — closed.
2. **Closed** Issue Must — fixture-authored effects — closed.
3. **AcceptDateSlip** post-state fixture-authored — BA-OQ-004/005 closed for Demo path.
4. **Issue→Milestone** restored; **Decision→EQ/ISS/RISK** removed.
5. **TopException.priority** on dashboard/read-model only.
6. **Trend** fixture-authored arrays per snapshot.
7. **Snapshot selector:** compact trigger + disclosure; E7 picks one ARIA pattern.
8. **E1** array contracts + stubs; **E2** full fixtures — no long-lived dual singular API.
9. **Owner:** SH-* metadata only.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Live Guide / tests assume B=+21 | Remap to C; E7 Guide + E2 tests |
| Schedule density ~37 rows | E5 group/filter; Activity out |
| Decision without Links confusion | Impact/Dashboard show Decision; Links only BA-015 |

## Migration Plan

Design R1 approved → E1 contracts (acceptance) → E2 fixtures → … → E8. Rollback via git.

## Open Questions

None blocking for E1. E7 chooses concrete ARIA pattern from UI primitives.
