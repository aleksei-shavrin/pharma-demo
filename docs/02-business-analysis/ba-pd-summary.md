---
id: DOC-BA-017
title: "BA & Product Definition summary"
type: business
status: draft
version: "0.3.0"
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

Синтез фазы BA/PD для Demo v1 narrative **SCN-001 → SCN-007** (корректировка domain/decision v0.3).

## Статус фазы

> **certainty:** fact
>
> Артефакты синхронизированы (domain cardinalities, Decision flow, RAG fixture vs BR, C-03/C-04 mapping). `openspec/**` / `apps/**` не изменялись.

> **certainty:** open_question
>
> **PO freeze** (BA-OQ-001) **не** подтверждён → DoD freeze **paused**. Пакет готов к PO review.

## Что зафиксировано

| Тема | Итог |
|------|------|
| Domain | Кардинальности + Phase optional; Decision ≠ recovery execution |
| Decision | PrioritizeRecovery полностью; AcceptDateSlip — Decision+forecast only; BA-OQ-004/005 |
| RAG | BR expectation vs mock fixture vs integrity; A Green = baseline |
| Capabilities | BR-001 только C-04; C-03 без BR-001 |
| Walkthrough | Primary C = PrioritizeRecovery; AcceptDateSlip ограниченно |

## Кандидатные OpenSpec capability names

> **certainty:** hypothesis
>
> `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report` — **не** созданы.

## Остаток для человека

- **BA-OQ-001** scope freeze
- **BA-OQ-004 / BA-OQ-005** AcceptDateSlip post-state
- HIP-003, HIP-004, HIP-007
- Expert HIP — только для enterprise-fact

## Следующая фаза

**Requirements Specification & OpenSpec** только после human review / freeze (отдельная волна).
