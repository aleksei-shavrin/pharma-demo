---
id: REQ-PROJ-001
title: 'REQ-PROJ-001: Данные обзора проекта для Demo v1'
type: requirement
status: draft
version: 0.2.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-010
  - DOC-BA-015
  - DOC-BA-014
---
# REQ-PROJ-001: Данные обзора проекта для Demo v1

## Формулировка

Система shall предоставлять данные одного Demo v1 Project (идентификатор, название, baselineProductionStart, forecastProductionStart), достаточные для управленческого обзора narrative SCN-001→SCN-007.

## Обоснование

> **certainty:** hypothesis
>
> C-01; HIP-001; BA-A-001 one project.

## Acceptance criteria

- [ ] Для PRT-01 доступны id, name, baselineProductionStart, forecastProductionStart.
- [ ] Snapshot A: forecastProductionStart = baselineProductionStart = 2027-09-15.
- [ ] Snapshot B и C: forecastProductionStart = 2027-10-06 (= baseline + 21d per BR-004).
- [ ] Snapshot C: forecastProductionStart не меняется относительно Snapshot B после PrioritizeRecovery (BR-006).

Архитектурное ограничение «FE только через API» проверяется **REQ-NFR-001** / architecture gate, не этим REQ.

## Трассировка

- Capability: C-01
- BR: BR-004, BR-006
- Walkthrough: steps 1, 5, 8
