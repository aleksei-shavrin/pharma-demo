---
id: DOC-BA-018
title: "Demo v1 R2 — domain extensions and control semantics"
type: business
status: draft
version: "0.1.1"
created: 2026-11-02
updated: 2026-11-02
owner: "docs-engineering"
related:
  - DOC-BA-014
  - DOC-BA-015
  - DOC-PROD-023
  - DOC-PROD-024
  - DOC-PROD-025
  - DOC-PROD-026
  - DOC-UX-022
---

# Demo v1 R2 — domain extensions and control semantics

> **certainty:** assumption
>
> Extends DOC-BA-015 / DOC-BA-014 for R2. Does **not** erase enrichment BA. AI must not mark approved.

## 1. Entities added / clarified

| Concept | Kind | Notes |
|---------|------|-------|
| Workstream | **Read-model entity** | Catalog + aggregates; not Domain Aggregate / WBS owner |
| Person | **Reference entity** (`PER-*`) | Not HRIS; replaces SH-* OwnerRef |
| ProjectCost / WorkstreamCost | Owned measures / projections | Integer RUB; DOC-PROD-026 |
| EquipmentCost (selective) | Optional attributes | Subset of WS scope |
| Notification | Read-model event | Not SoT; not causal |

Existing Domain: Project, Milestone, Equipment, Issue, Risk, Decision — preserved.

## 2. BR-004 late-stage clarification

> **certainty:** assumption
>
> Clarifies BR-004 for snapshots beyond H without introducing a new PS driver.

**Invariant (all A–S):** while Production Start forecast is driven by the HVAC path,

`psDeltaDays === equipmentDeltaDays(EQ-HVAC-01)`.

**Forbidden:** HVAC Δ = +7 with PS Δ = +14 (or any mismatch) without a **new** sole driver (R2 does not add one).

**Authoring pattern:**

| Phase | Authoritative HVAC Δ / PS Δ | Allowed narrative |
|-------|----------------------------|-------------------|
| C–F | +21 | Shock |
| G–N | +14 | Residual; K–M may show **operational** recovery progress **without** changing authoritative Δ |
| N | +14 | Decisions recorded; forecasts unchanged (BR-006) |
| O–R | +7 | **Single** fixture post-state updates HVAC Δ **and** PS together |
| S | +7 actual | Production Start achieved on forecast date |

Secondary workstream delays **never** auto-move MS-PS (unchanged enrichment rule).

## 3. BR-006 / BR-007 / Issue lifecycle

- Decision does not auto-reforecast schedule **or** EAC.
- Closed Issue does not auto-Green Risk / recover Milestone / restore forecast / improve EAC.
- BR-007: while RISK-001 Red ⇒ MS-PS not Green (extends through I–R as authored).

## 4. Relationship matrix R2

### 4.1 Preserved BA-015

**Allowed:** Project→EQ/MS/Issue/Risk/Decision; EQ→Issue/Risk; Issue→Risk; Issue→Milestone; Risk→Milestone; Decision→Project; Decision→Milestone optional.

**Forbidden:** EQ→Milestone; Decision→EQ/Issue/Risk.

### 4.2 Additive R2 relations

| Relation | Direction | Cardinality | SoT | Navigable | Kind |
|----------|-----------|-------------|-----|-----------|------|
| Project — Workstream | Project → WS | 1 — 8 | Catalog | yes (`/workstreams/:id`) | read-model membership |
| Workstream — Person (lead) | WS → Person | many — 0..1 | `leadPersonId` | yes | reference |
| Workstream — EQ/MS/Issue/Risk/Decision | via `workstream` field | projection | field on records | yes (lists) | projection (not new causal edge) |
| Project — Person | Project → Person | 1 — many | catalog | yes | reference |
| Person — Issue | Person ← Issue.ownerPersonId | many — 0..1 | Issue field | yes | responsibility metadata |
| Person — Decision | Person ← Decision.ownerPersonId | many — 0..1 | Decision field | yes | responsibility metadata |
| Person — Equipment | optional responsiblePersonId | many — 0..1 | EQ field | yes | responsibility metadata |
| Project/WS — Cost measures | owned attributes | 1 — 1 | fixture integers | yes | cost ownership |
| EQ — Cost measures | optional | 0..1 | fixture | yes | subset detail |
| Risk/Issue/Decision — cost fields | optional attrs | 0..1 | fixture | yes | exposure/impact (not CBS) |
| Notification — entityRefs | Notification → entities | 0..* | fixture soft refs | yes (href) | soft navigation only |

**Still not causal:** Workstream membership, Person responsibility, Notification refs.

## 5. Workstream RAG

Retain enrichment rollup (DOC-PROD-020 §7): Red if any Red Risk in WS; else Yellow if delayed critical EQ or Open|Mitigating Issue; else Green. Closed Issue does not create attention. Backend-owned.

## 6. Overall project status

Retain: Red if MS-PS Red OR RISK-001 Red; else Yellow if any WS≠Green OR active Issue OR delayed critical EQ; else Green.

**Late close-out (R2-D0-R1, fixture-authored under BR-007):** P=Red (RISK-001 Red); Q=Yellow (RISK-001 and MS-PS leave Red); R=Yellow; S=Green. BR-007 is **not** weakened.

## 7. Cost semantics pointer

Full arithmetic and CAPEX: DOC-PROD-026. Contingency = **project-level reserve inside BAC**. Unused contingency ≠ automatic positive VAC. Snapshot A: EAC=BAC, VAC=0. Frozen BAC **6_200_000_000 ₽**. WS = minimal authoritative cost-control level. Equipment cost ≠ full CBS.

## 8. Notifications semantics

- Not SoT; cannot mutate Risk/Issue/MS/Cost.
- Popup preference: **localStorage**.
- Read/unread: **sessionStorage**.
- Emit contextual toasts only after **successful** atomic snapshot commit (≤3); failed/stale → none.

## 9. People cutover

`SH-*` → `PER-*` explicit map (DOC-PROD-025). One implementation cutover; no permanent dual-read.

## 10. Explicitly out

Activity, CPM, deps, WBS engine, Contractors, GL, HRIS, EVM indices, fake GMP/CSV.
