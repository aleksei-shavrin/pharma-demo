---
id: REQ-IMPCT-001
title: "REQ-IMPCT-001: Director impact aggregate"
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

# REQ-IMPCT-001: Director impact aggregate

## Формулировка

Система shall предоставлять агрегированные данные для директора: forecast vs baseline production start, milestone rag, идентификатор contributing equipment driver, ссылки на top risk/issue — в согласованном состоянии narrative.

## Обоснование

> **certainty:** hypothesis
>
> C-05; H-002; PROC-011; BR-005/007; HIP-001.

## Acceptance criteria

- [ ] Snapshot B aggregate содержит EQ-HVAC-01, MS-PS rag Red, forecast 2026-09-22, RISK-001/ISS-001.
- [ ] Нет состояния, где milestone Green при Red risk от того же delay (BR-007).
- [ ] AC не предписывает layout UI (поведение данных).

## Трассировка

- Capability: C-05
- BR: BR-005, BR-007
- Walkthrough: steps 4–5
