---
id: DOC-PROD-019
title: Demo v1 enrichment — аудит текущего состояния
type: product
status: draft
version: 0.2.0
created: '2026-11-01'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-012
  - DOC-PROD-020
  - DOC-BA-015
  - DOC-UX-004
  - DOC-GUIDE-001
---
# Demo v1 enrichment — current-state audit

> **certainty:** fact (для описания реализованного Demo) / hypothesis (для gaps enrichment)
>
> Фактическая карта до enrichment. Не меняет apps в этом pass. **R1** исправляет ошибки audit относительно DOC-BA-015.

## 1. Entity map (as implemented / documented)

| Entity | Fields (core) | Relationships (direct) | API (examples) | Screens |
|--------|---------------|------------------------|----------------|---------|
| Portfolio container | id `PRT-01` (historical enrichment drafts: `PRJ-01`), name, baseline/forecast PS | owns MS/EQ/ISS/RISK/DEC | `GET /v1/projects/PRT-01` | Dashboard header |
| Equipment | id, critical, baseline/forecast delivery, status | ← Issue, ← Risk | `/equipment`, `/equipment/:id` | Equipment, Schedule, Detail |
| Milestone | id, baseline/forecast, rag | ← Risk, ← Issue, ← Decision (docs) | `/milestones`, `/milestones/:id` | Milestones, Schedule, Detail |
| Issue | id, status Open\|Mitigating (API); Closed in Domain | → EQ, → Risk, → **Milestone** | `/issues-risks`, `/issues/:id` | Issues&Risks, Detail |
| Risk | id, rag Green\|Red, links | → EQ, → MS, → Issue | `/issues-risks`, `/risks/:id` | Issues&Risks, Detail |
| Decision | id, type, ownerRole, dueDate, note | docs: → Project, → Milestone?; **code: no Decision edges yet** | dashboard / Impact | Dashboard |
| Snapshot | 01/02/03 discrete | owns fixture slice | `?snapshot=` | Switcher |
| Schedule item | EQ delivery \| MS | read model | `/schedule` | Schedule |

**DOC-BA-015 direct edges:**

| Edge | Status |
|------|--------|
| Issue → Milestone | **Allowed** (Domain + current code) |
| Equipment → Milestone | **Forbidden** |
| Decision → Project / Milestone? | **Allowed** (Domain); code incomplete (`milestoneId` missing) |
| Decision → EQ / Issue / Risk | **Forbidden** |

> **certainty:** fact
>
> Pre-R1 enrichment draft ошибочно запрещал Issue→Milestone. R1 restores BA-015.

## 2. Canonical singular spine

| Object | Role |
|--------|------|
| EQ-HVAC-01 | Sole critical equipment / PS driver |
| ISS-001 | Delay issue (→ EQ + MS-PS + Risk) |
| RISK-001 | Red→MS-PS |
| MS-PS | Production start milestone |
| DEC-001 | PrioritizeRecovery @ C (today); enriched @ F |
| Snapshots 01/02/03 | Baseline / delay / decision |

Calendar (DOC-PROD-012): narrative **2027**; PS baseline **2027-09-15**; Δ HVAC **+21** @ 02/03.

## 3. Business rules in force

| BR | Effect |
|----|--------|
| BR-004 | **Single** critical driver (EQ-HVAC-01); no max(Δ)/CPM |
| BR-006 | Decision ≠ auto-reforecast / ≠ recovery execution |
| BR-007 | No Green MS-PS while RISK-001 Red on same HVAC→PS path (**state-based**) |
| BR-001…003 | Issue/Risk/MS semantics; Closed is Domain status |

## 4. What scales without Domain entity change

- More EQ / MS / Issue / Risk / Decision instances  
- Discrete snapshots 04…08  
- Dashboard aggregates / top-N (**read-model** ordering, not Domain fields)  
- Register filters; Schedule grouping  
- RU presentation maps  

## 5. Limited by current assumptions (pre-enrichment apps)

| Assumption | Limit |
|------------|-------|
| Singular fixture objects | Arrays needed |
| Risk rag Green\|Red only | Yellow = presentation via attention conditions |
| Issue Closed in Domain but not in API enums | E1 must add Closed |
| No `workstream` field | Add grouping field (not entity) |
| OwnerRef listed in Domain; no Owner API | Keep SH-* as `ownerRole`/`owner` metadata |
| No overall project status derivation | Enrichment defines backend rule |
| Schedule = EQ+MS only | Keep; ~37 rows with filters |

## 6. UI at 1 record vs 20+

| Surface | At 1 | At 20+ |
|---------|------|--------|
| Dashboard one causal card | Strong teaching | Need top exceptions + workstreams |
| Registers | Fine | Search/filter/counts |
| Schedule timeline | Readable | Group/filter |
| Snapshot 01/02/03 radios | OK | 01–08 needs compact disclosure (not 8 radios) |

## 7–8. Keep list

Atomic snapshot switch; stale protection; BA-015 edges; baseline vs forecast; Issue≠Risk; combined register; no fake EQ—MS; Decision≠recovery; read-only schedule; Russian UI; light/dark; Table/Split/Timeline; API-driven FE; Nest-owned fixtures.
