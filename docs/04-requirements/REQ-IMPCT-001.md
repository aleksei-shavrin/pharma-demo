---
id: REQ-IMPCT-001
title: "REQ-IMPCT-001: Director impact aggregate"
type: requirement
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-BA-014
  - DOC-PROD-012
---

# REQ-IMPCT-001: Director impact aggregate

## Формулировка

Система shall предоставлять агрегированные данные для директора: forecast vs baseline production start, milestone rag, contributing equipment id; для состояний после фиксации delay — ссылки на top risk и issue — согласованные с исходными объектами в пределах смысла полей (не смешивая delivery dates с production-start dates).

## Обоснование

> **certainty:** hypothesis
>
> C-05; H-002; PROC-011; BR-005/007; HIP-001. BR-005 условия — после delay (Snapshot B/C).

## Acceptance criteria

**Project / Milestone (все snapshots A/B/C)**

- [ ] Aggregate `baselineProductionStart` совпадает с Project.baselineProductionStart.
- [ ] Aggregate `forecastProductionStart` совпадает с Project.forecastProductionStart и Milestone MS-PS.forecastDate.
- [ ] Aggregate milestone RAG совпадает с MS-PS.rag.

**Equipment (все snapshots; не равенство дат с production start)**

- [ ] Aggregate содержит ссылку на EQ-HVAC-01.
- [ ] Aggregate отражает Equipment.baselineDelivery и forecastDelivery (смысл delivery, не production start).
- [ ] Для Snapshot **B/C**: связь Δ delivery → сдвиг production start соответствует BR-004 (в mock: +21 календарный день); сами даты delivery ≠ даты production start.
- [ ] Для Snapshot **A**: forecast delivery / production start = baseline (нет сдвига); delivery dates ≠ production-start dates по смыслу полей.

**Risk / Issue**

- [ ] Для Snapshot **B/C** (после фиксации delay / NC-001): aggregate содержит ссылки на **RISK-001** и **ISS-001**, согласованные с исходными сущностями (id и доступные статусы/rag). Согласованность исходных данных B/C **не** ослабляется.
- [ ] Для Snapshot **A**: ссылка на **ISS-001** **не** требуется (открытого Issue в snapshot нет). Наличие/отсутствие ссылки на baseline RISK-001 Green fixture не подменяет проверку ISS-001 для B/C.

**BR-007**

- [ ] Для Snapshot **B/C**: нет Green MS-PS при Red RISK-001 от того же delay; causal chain согласована (BR-007 B/C).
- [ ] Для Snapshot **A**: BR-007 применяется только как baseline integrity (нет Open Issue delay; forecast = baseline; Green = fixture); полная цепочка Issue не требуется.

- [ ] AC не предписывает UI layout.

## Трассировка

- Capability: C-05
- BR: BR-005, BR-007
- Walkthrough: steps 6, 8
