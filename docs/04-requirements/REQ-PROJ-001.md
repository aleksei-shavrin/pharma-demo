---
id: REQ-PROJ-001
title: "REQ-PROJ-001: Project overview data for Demo v1"
type: requirement
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-BA-015
---

# REQ-PROJ-001: Project overview data for Demo v1

## Формулировка

Система shall предоставлять данные одного Demo v1 Project (идентификатор, название, baseline и forecast даты production start) через API контур, достаточные для управленческого обзора narrative.

## Обоснование

> **certainty:** hypothesis
>
> C-01; HIP-001 director overview; BA-A-001 one project.

## Acceptance criteria

- [ ] Для PRJ-01 доступны id, name, baselineProductionStart, forecastProductionStart.
- [ ] В Snapshot B forecastProductionStart согласован с BR-004 (+21d vs baseline).
- [ ] Данные не требуют локального FE mock store (FE только через API — архитектурное ограничение Demo v1).

## Трассировка

- Capability: C-01
- BR: BR-004, BR-005
- Walkthrough: steps 1, 4–5
