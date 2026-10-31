---
id: DOC-PROD-011
title: "Demo v1 functional scope"
type: product
status: draft
version: "0.1.1"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-PROD-012
  - DOC-DISC-019
  - DOC-PROD-003
  - DOC-BA-010
---

# Demo v1 functional scope

Предлагаемый **freeze** scope для Demo v1. Tech SoT: [demo-v1-architecture](./demo-v1-architecture.md). Mock data: [demo-v1-mock-narrative-data](./demo-v1-mock-narrative-data.md).

## PO freeze gate

> **certainty:** open_question
>
> **BA-OQ-001:** Product Owner подтверждает freeze ниже. До ответа артефакты считаются **proposed freeze**; формальный DoD фазы может быть `paused` по критерию freeze (см. handoff).

## In (Must)

| Item | Notes |
|------|-------|
| Narrative SCN-001 → SCN-007 | HIP-006 |
| Capabilities C-01…C-05 | [demo-v1-capabilities](./demo-v1-capabilities.md) |
| Processes PROC-007, 001, 005, 004, 010, 011 | [process-specs](../02-business-analysis/process-specs-demo-v1.md) |
| BR-001…007 | [business-rules](../02-business-analysis/business-rules-demo-v1.md) |
| Domain entities Demo v1 | [domain-model](../02-business-analysis/domain-model-demo-v1.md) |
| Primary UX priority | Director; PM operational (HIP-001) |
| FE↔API only; mock NestJS; no PG | DOC-PROD-003 |

## Out (Won’t / not Must)

| Item | Reason |
|------|--------|
| SCN-006 as required scene | HIP-006 |
| C-06, C-07 as Must | Discovery Should; not needed for causal chain |
| C-08…C-12 | Could/Won’t Discovery |
| Budget, contractor module, TOP/docs Must, change PQS | Excluded PROC |
| Auth, multi-tenant, PostgreSQL | Demo v1 architecture |
| UX layouts / page wireframes | UX phase later |
| GMP/CSV compliance features | BA-No-Fake-GMP |
| Activity as standalone Demo v1 domain entity | Removed from Demo v1 model (PROC-001 = explicit EQ/MS dates only) |
| CPM / float / auto-reforecast / recovery execution | Out of Demo v1 |

## Assumptions until HIP / PO answers

- BA-A-001 one project; BA-A-002 avoid GMP theater messaging; BA-A-003 forecast slip rule.
- Scope remains **proposed freeze** until **BA-OQ-001** (не объявлять approved).
