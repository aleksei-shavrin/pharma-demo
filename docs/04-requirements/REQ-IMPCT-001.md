---
id: REQ-IMPCT-001
title: "REQ-IMPCT-001: Director impact aggregate"
type: requirement
status: draft
version: "0.2.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-BA-014
---

# REQ-IMPCT-001: Director impact aggregate

## Формулировка

Система shall предоставлять агрегированные данные для директора: forecast vs baseline production start, milestone rag, contributing equipment id, ссылки на top risk и issue — **согласованные** с исходными объектами Equipment, Issue, Risk, Milestone и Project.

## Обоснование

> **certainty:** hypothesis
>
> C-05; H-002; PROC-011; BR-005/007; HIP-001.

## Acceptance criteria

- [ ] Snapshot B/C aggregate содержит: driver EQ-HVAC-01, MS-PS rag Red, forecastProductionStart 2027-10-06, refs RISK-001 и ISS-001.
- [ ] Значения aggregate **совпадают** с полями исходных объектов (не только «наличие id»): те же rag/даты, что у MS-PS, PRJ-01, EQ-HVAC-01.
- [ ] Нет состояния Green MS-PS при Red RISK-001 от того же delay (BR-007).
- [ ] AC не предписывает UI layout.

## Трассировка

- Capability: C-05
- BR: BR-005, BR-007
- Walkthrough: steps 6, 8
