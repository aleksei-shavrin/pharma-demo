---
id: REQ-IMPCT-002
title: "REQ-IMPCT-002: Record director decision outcome"
type: requirement
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-BA-014
---

# REQ-IMPCT-002: Record director decision outcome

## Формулировка

Система shall позволять зафиксировать исход управленческого решения по угрозе дате запуска: AcceptDateSlip или PrioritizeRecovery (с опциональным owner/due).

## Обоснование

> **certainty:** hypothesis
>
> C-05; SCN-007; BR-006; P-002.

## Acceptance criteria

- [ ] Snapshot C: Decision DEC-001 существует с type ∈ {AcceptDateSlip, PrioritizeRecovery}.
- [ ] При PrioritizeRecovery могут быть заданы ownerRole и dueDate.
- [ ] Решение связано с Project/Milestone narrative, не требует GMP change workflow.

## Трассировка

- Capability: C-05
- BR: BR-006
- Walkthrough: step 5
