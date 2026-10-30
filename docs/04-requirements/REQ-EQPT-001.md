---
id: REQ-EQPT-001
title: "REQ-EQPT-001: Critical equipment delivery status"
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

# REQ-EQPT-001: Critical equipment delivery status

## Формулировка

Система shall предоставлять статус critical equipment package с baseline и forecast delivery dates и признаком critical, а также поддерживать обновление прогноза при задержке.

## Обоснование

> **certainty:** hypothesis
>
> C-03; PROC-007; SCN-001.

## Acceptance criteria

- [ ] EQ-HVAC-01: isCritical true; baseline и forecast delivery доступны.
- [ ] Snapshot A: status OnTrack; forecast = baseline.
- [ ] Snapshot B: status Delayed; forecast = baseline + 21 days.
- [ ] Equipment идентифицируется как contributing driver в impact-данных (связь с C-05).

## Трассировка

- Capability: C-03
- BR: BR-001, BR-004
- Walkthrough: steps 1–2
