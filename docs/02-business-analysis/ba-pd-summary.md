---
id: DOC-BA-017
title: "BA & Product Definition summary"
type: business
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PHASE-BAPD-001
  - DOC-BA-016
  - DOC-PROD-011
  - DOC-HANDOFF-DISC-001
---

# BA & Product Definition summary

Синтез фазы BA/PD для Demo v1 narrative **SCN-001 → SCN-007**.

## Статус фазы

> **certainty:** fact
>
> Артефакты BA0–PD4 созданы. `openspec/**` не изменялся.

> **certainty:** open_question
>
> **PO freeze** functional scope (BA-OQ-001) ещё не подтверждён человеком → критерий DoD «scope frozen» формально **paused** до ответа PO. Пакет готов к review.

## Что зафиксировано

| Тема | Итог |
|------|------|
| Audience / value | HIP-001/008 сохранены (директор / H-002 leading) |
| Narrative | SCN-001→SCN-007; SCN-006 не Must |
| Processes in | PROC-007, 001, 005, 004, 010, 011 (обоснованы) |
| Processes out | 002, 003, 006, 008, 009 |
| BR | BR-001…007 с каноном полей |
| Domain | Суженный conceptual model |
| Capabilities | C-01…C-05 |
| Mock integrity | Snapshots A/B/C + matrix Pass (spec-level) |
| REQ | PROJ/MILE/EQPT/RISK/IMPCT/NFR behavior drafts |
| Walkthrough | Business-outcome steps 1–5 |

## Кандидатные OpenSpec capability names

> **certainty:** hypothesis
>
> `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report` — **не** созданы как changes/specs.

## Остаток для человека

- BA-OQ-001 scope freeze
- HIP-003, HIP-004, HIP-007
- Expert HIP-002/005/009 — только для enterprise-fact

## Следующая фаза

**Requirements Specification & OpenSpec** после human review этого пакета (отдельная волна; не смешивать с BA).
