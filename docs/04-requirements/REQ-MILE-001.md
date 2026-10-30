---
id: REQ-MILE-001
title: "REQ-MILE-001: Milestone RAG and dates"
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

# REQ-MILE-001: Milestone RAG and dates

## Формулировка

Система shall вести ключевую веху production start с baselineDate, forecastDate и rag, отражающими связанные риски critical equipment delay.

## Обоснование

> **certainty:** hypothesis
>
> C-02; PROC-010; BR-003/004; SCN-001/007.

## Acceptance criteria

- [ ] MS-PS имеет baselineDate и forecastDate.
- [ ] В Snapshot A: rag Green; forecast = baseline.
- [ ] В Snapshot B: rag ≠ Green; forecast = baseline + 21 days (согласовано с EQ slip).
- [ ] Не требуется полный каталог всех возможных gates заказчика (OQ-006 остаётся open).

## Трассировка

- Capability: C-02
- BR: BR-003, BR-004
- Walkthrough: steps 1, 4
