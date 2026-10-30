---
id: REQ-RISK-001
title: "REQ-RISK-001: Issue and risk linked to milestone"
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

# REQ-RISK-001: Issue and risk linked to milestone

## Формулировка

Система shall поддерживать Issue и Risk, связанные с critical equipment и вехой production start, так чтобы после задержки существовал Open Issue и Risk с rag ≠ Green.

## Обоснование

> **certainty:** hypothesis
>
> C-04; PROC-004/005; BR-001/002; SCN-001.

## Acceptance criteria

- [ ] Snapshot B: ISS-001 exists, status Open, linked to EQ-HVAC-01 and MS-PS.
- [ ] Snapshot B: RISK-001 rag Red, linked to ISS-001 and MS-PS.
- [ ] Snapshot A: нет противоречащего Open issue для того же delay (исходное состояние чистое).

## Трассировка

- Capability: C-04
- BR: BR-001, BR-002
- Walkthrough: steps 2–3
