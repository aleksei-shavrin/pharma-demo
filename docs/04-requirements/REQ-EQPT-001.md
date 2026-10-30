---
id: REQ-EQPT-001
title: "REQ-EQPT-001: Critical equipment delivery status"
type: requirement
status: draft
version: "0.3.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-BA-014
---

# REQ-EQPT-001: Critical equipment delivery status

## Формулировка

Система shall предоставлять статус critical equipment package с isCritical, baselineDelivery, forecastDelivery и status, а также поддерживать обновление forecastDelivery при задержке.

## Обоснование

> **certainty:** hypothesis
>
> C-03; PROC-007; SCN-001; BR-004 Δ.

## Acceptance criteria

- [ ] EQ-HVAC-01: isCritical = true; baselineDelivery и forecastDelivery доступны.
- [ ] Snapshot A: status OnTrack; forecastDelivery = baselineDelivery = 2027-05-15.
- [ ] Snapshot B: status Delayed; forecastDelivery = 2027-06-05 (= baseline + 21d).
- [ ] Δ delivery (+21d) является входом для согласованного сдвига MS/Project forecast (BR-004); проверка сдвига дат запуска — в REQ-MILE-001 / REQ-PROJ-001.
- [ ] EQ-HVAC-01 выступает contributing driver в impact-агрегате (REQ-IMPCT-001).

Регистрация Issue — **C-04 / REQ-RISK-001 / BR-001**, не этот REQ.

## Трассировка

- Capability: C-03
- BR: BR-004
- Walkthrough: steps 1–2, 6
