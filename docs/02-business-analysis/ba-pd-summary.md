---
id: DOC-BA-017
title: "BA & Product Definition summary"
type: business
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PHASE-BAPD-001
  - DOC-BA-016
  - DOC-PROD-011
  - DOC-HANDOFF-DISC-001
  - DOC-HANDOFF-BAPD-001
---

# BA & Product Definition summary

Синтез фазы BA/PD для Demo v1 narrative **SCN-001 → SCN-007** (corrective pass consistency).

## Статус фазы

> **certainty:** fact
>
> Corrective pass: process specs ↔ BR; Activity removed from Demo v1 domain; REQ-IMPCT-001 aggregate semantics; BR-007 A vs B/C; BA-OQ-003 closed (domain). `openspec/**` / `apps/**` не изменялись.

> **certainty:** open_question
>
> **PO freeze** (BA-OQ-001) **не** подтверждён → DoD freeze **paused**. Пакет **READY FOR PO FREEZE REVIEW**.

## Что зафиксировано

| Тема | Итог |
|------|------|
| Issue.status | Open / Mitigating / Closed; AcceptDateSlip = Decision type |
| Activity | **Не** сущность Demo v1 |
| BR-007 | A = baseline integrity; B/C = causal chain |
| Issue vs Risk | Отдельные сущности (BA-OQ-003 closed); UI layout — BA-OQ-006 |
| Aggregate | Delivery dates ≠ production-start dates |

## Кандидатные OpenSpec capability names

> **certainty:** hypothesis
>
> `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report` — **не** созданы.

## Остаток для человека

- **BA-OQ-001** scope freeze
- **BA-OQ-004 / BA-OQ-005** AcceptDateSlip post-state
- **BA-OQ-006** UI presentation Issue/Risk
- HIP-003, HIP-004, HIP-007

## Следующая фаза

**Requirements Specification & OpenSpec** только после human review / freeze (отдельная волна).
