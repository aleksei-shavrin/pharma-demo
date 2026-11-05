---
id: REQ-IMPCT-002
title: 'REQ-IMPCT-002: Фиксация outcome решения директора'
type: requirement
status: draft
version: 0.4.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-010
  - DOC-BA-014
  - DOC-PROD-012
---
# REQ-IMPCT-002: Фиксация outcome решения директора

## Формулировка

Система shall позволять зафиксировать управленческое решение: AcceptDateSlip или PrioritizeRecovery (с опциональными ownerRole/dueDate). Demo v1 фиксирует выбор относительно текущего Project/Milestone; **не** моделирует исполнение recovery и **не** требует авто-пересчёта forecast.

## Обоснование

> **certainty:** hypothesis
>
> C-05; SCN-007; BR-006; P-002.

## Acceptance criteria

- [ ] Можно записать Decision с type ∈ {AcceptDateSlip, PrioritizeRecovery}.
- [ ] **PrioritizeRecovery (primary Snapshot C):** DEC-001 с type PrioritizeRecovery; опционально ownerRole/dueDate (due после scenarioAsOfDate C); forecast PRJ/MS = Snapshot B (2027-10-06); Issue → **Mitigating** (REQ-RISK-001). Переход в Mitigating отражает **запись управленческого Decision** и **не** подтверждает исполнение recovery.
- [ ] **AcceptDateSlip:** DEC-001 с type AcceptDateSlip; forecast PRJ/MS без изменения vs B; post-state Issue/Risk/MS RAG — **не** требуется этим REQ (**BA-OQ-004/005**).
- [ ] Решение не требует GMP change workflow.

## Трассировка

- Capability: C-05
- BR: BR-006
- Walkthrough: steps 7–8
