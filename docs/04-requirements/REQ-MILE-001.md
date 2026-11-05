---
id: REQ-MILE-001
title: 'REQ-MILE-001: RAG и даты вехи'
type: requirement
status: draft
version: 0.3.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-010
  - DOC-BA-014
  - DOC-PROD-012
---
# REQ-MILE-001: RAG и даты вехи

## Формулировка

Система shall вести ключевую веху production start (MS-PS) с baselineDate, forecastDate и rag в согласовании с linked critical-delay Risk (BR-003) и правилом прогноза (BR-004).

## Обоснование

> **certainty:** hypothesis
>
> C-02; PROC-010; SCN-001/007.

## Acceptance criteria

- [ ] MS-PS имеет baselineDate и forecastDate.
- [ ] Snapshot A: rag = Green; forecastDate = baselineDate = 2027-09-15.
- [ ] Snapshot B: rag = Red; forecastDate = 2027-10-06 (= baseline + 21d; согласовано с EQ slip BR-004).
- [ ] Snapshot B/C: MS-PS связан с RISK-001 (linked Risk для BR-003 path).
- [ ] Snapshot C: rag и forecastDate те же, что в B (нет авто-смены от Decision alone).
- [ ] AC не добавляет runtime-правил пересчёта RAG сверх BR-003 expectation vs fixture.
- [ ] Полный каталог gates заказчика не требуется (OQ-006 open).

## Трассировка

- Capability: C-02
- BR: BR-003, BR-004, BR-006
- Walkthrough: steps 1, 5, 8
