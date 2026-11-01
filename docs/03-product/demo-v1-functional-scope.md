---
id: DOC-PROD-011
title: "Demo v1 functional scope"
type: product
status: draft
version: "0.2.0"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-PROD-012
  - DOC-DISC-019
  - DOC-PROD-003
  - DOC-BA-010
  - DOC-PROD-001
---

# Demo v1 functional scope

Согласованный **freeze** функционального объёма Demo v1. Tech SoT: [demo-v1-architecture](./demo-v1-architecture.md). Mock data: [demo-v1-mock-narrative-data](./demo-v1-mock-narrative-data.md). Реестр: [ba-registers](../02-business-analysis/ba-registers.md).

## PO freeze gate

> **certainty:** fact
>
> **BA-OQ-001 закрыт 2026-10-31.** Product Owner подтвердил freeze ниже как согласованный функциональный объём Demo v1. Решение о **направлении демо**, не подтверждение процессов / org chart предприятия. Детали: [ba-registers § Решение BA-OQ-001](../02-business-analysis/ba-registers.md).

## In (Must)

| Item | Notes |
|------|-------|
| Narrative SCN-001 → SCN-007 | HIP-006; BA-OQ-001 |
| Capabilities C-01…C-05 | [demo-v1-capabilities](./demo-v1-capabilities.md) |
| Processes PROC-007, 001, 005, 004, 010, 011 | [process-specs](../02-business-analysis/process-specs-demo-v1.md) |
| BR-001…007 | [business-rules](../02-business-analysis/business-rules-demo-v1.md) |
| Domain entities Demo v1 | [domain-model](../02-business-analysis/domain-model-demo-v1.md) |
| Primary UX priority | Директор проекта; вторично — руководитель проекта (HIP-001) |
| Mock Snapshots A/B/C | Задержка critical equipment **+21 календарный день** (DOC-PROD-012) |
| PrioritizeRecovery | Запись управленческого Decision; recovery execution и auto-reforecast **не** моделируются (BR-006) |
| AcceptDateSlip | Допустимый тип Decision; post-state Issue/Risk/Milestone — BA-OQ-004/005 |
| FE↔API only; mock NestJS; no PG | DOC-PROD-003 |

## Out (Won’t / not Must)

| Item | Reason |
|------|--------|
| SCN-006 as required scene | HIP-006; BA-OQ-001 — доп. сценарий |
| C-06, C-07 as Must | Не входят в обязательный объём Demo v1 |
| C-08…C-12 | Could/Won’t Discovery |
| Budget, contractor module, TOP/docs Must, change PQS | Excluded PROC |
| Auth, multi-tenant, PostgreSQL | Demo v1 architecture |
| UX layouts / page wireframes | UX phase later |
| GMP/CSV compliance features | BA-No-Fake-GMP |
| Activity as standalone Demo v1 domain entity | Removed from Demo v1 model (PROC-001 = explicit EQ/MS dates only) |
| Полноценный CPM / float | Out of Demo v1 |
| Расширенная методология управления рисками | Out of Demo v1 |
| Полноценное управление подрядчиками и бюджетом | Out of Demo v1 |
| Auto-reforecast / recovery execution | Out of Demo v1 (BR-006) |

## Оставшиеся open (не scope freeze)

- BA-OQ-004 / BA-OQ-005 — post-state после AcceptDateSlip
- ~~BA-OQ-006~~ — UI presentation Issue/Risk (**closed** 2026-11-01; единый register + `Тип`, DOC-BA-010)
- HIP-003 / HIP-004 / HIP-007 — messaging, горизонт, framing
