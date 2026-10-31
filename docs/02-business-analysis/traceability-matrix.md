---
id: DOC-BA-016
title: "Traceability matrix (BA/PD Demo v1)"
type: business
status: draft
version: "0.5.1"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-BA-017
  - DOC-PROD-010
  - DOC-PROD-012
  - DOC-BA-014
  - DOC-BA-015
  - DOC-RPT-REQOS-001
---

# Traceability matrix (BA/PD Demo v1)

Цепочка: Problem → Process → BR/NC → Capability → REQ → **OpenSpec** → Walkthrough → Mock.

| Problem | Process | BR / NC | Capability | REQ | OpenSpec (living) | Walkthrough / Mock |
|---------|---------|---------|------------|-----|-------------------|--------------------|
| P-001, P-002 | PROC-007 | BR-004 | C-03 | REQ-EQPT-001 | `openspec/specs/equipment-delivery-status/spec.md` | Steps 1–2; EQ-HVAC-01 |
| P-001, P-002 | PROC-005 | BR-001, NC-001 | **C-04** | REQ-RISK-001 (AC-I) | `openspec/specs/risk-issue-impact/spec.md` | Steps 3, 7; ISS-001 |
| P-001, P-002 | PROC-004 | BR-002 | C-04 | REQ-RISK-001 (AC-R) | `openspec/specs/risk-issue-impact/spec.md` | Steps 4, 8; RISK fixture |
| P-001, H-002 | PROC-010 | BR-003, BR-004 | C-02 | REQ-MILE-001 | `openspec/specs/milestone-readiness/spec.md` | Steps 1, 5, 8; MS-PS |
| P-001, H-002 | PROC-001 (dates only; no Activity entity) | BR-004 | C-01 / C-03 | REQ-PROJ-001, REQ-EQPT-001 | `openspec/specs/project-status-overview/spec.md`, `openspec/specs/equipment-delivery-status/spec.md` | Steps 1, 5, 8 |
| P-002, H-002 | PROC-011 | BR-005 | C-05 | REQ-IMPCT-001 | `openspec/specs/management-exception-report/spec.md` | Step 6 |
| P-002 | PROC-011 | BR-006 | C-05 | REQ-IMPCT-002 | `openspec/specs/management-exception-report/spec.md` | Steps 7–8; DEC |
| integrity | — | BR-007 (A baseline; B/C causal) | — | REQ-IMPCT-001 + mock matrix | `openspec/specs/management-exception-report/spec.md` | Steps 1, 8 |
| architecture | — | DOC-PROD-003/004 | — | REQ-NFR-001/002 | `openspec/specs/demo-v1-architecture-constraints/spec.md` (**constraints**, не product feature) | architecture gate |

Living SoT: `openspec/specs/<capability>/spec.md`. История change (не на портале): `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/`.

**Убрано:** BR-001 ↔ C-03 / REQ-EQPT (искусственная связь).

## Decision variants

| Variant | Defined Must behavior | Open |
|---------|----------------------|------|
| PrioritizeRecovery | Decision + Issue Mitigating + Risk/MS Red (BR-002/003) + forecast unchanged | — |
| AcceptDateSlip | Decision type + forecast unchanged; **не** Must user journey / SM | BA-OQ-004/005 Issue/Risk/MS rag |

## Explicit non-edges

| Candidate | Status |
|-----------|--------|
| PROC-002/003/006/008/009 | out |
| C-06/C-07; SCN-006 Must | out |
| Amber Must-scale; auto-reforecast; auto-Closed on AcceptDateSlip | out / OQ |
| EQ snapshot switch mechanism | deferred impl (design); не Must AC |

> **certainty:** hypothesis
>
> Spec-level only; runtime не заявляется. OpenSpec Must C-01…C-05 (+ architecture constraints) зафиксированы в living specs после human APPROVE → sync → archive (2026-10-31).
