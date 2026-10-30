---
id: DOC-PROD-013
title: "Demo v1 acceptance walkthrough"
type: product
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-012
  - DOC-DISC-018
  - REQ-IMPCT-001
  - REQ-IMPCT-002
---

# Demo v1 acceptance walkthrough

Проверка **сквозного бизнес-результата** SCN-001 → SCN-007. Не тур по UI-layout.

Данные: [demo-v1-mock-narrative-data](./demo-v1-mock-narrative-data.md).

## Предусловия

- Mock narrative Snapshots A/B/C определены и проходят integrity matrix.
- Capabilities C-01…C-05 и REQ-* в draft scope.
- FE/API runtime — **позже**; на этапе BA/PD walkthrough валидирует требования и данные.

## Шаги (бизнес-результат)

### 1. Исходное состояние (Snapshot A)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| Project/Milestone/Equipment согласованы | Green RAG; forecast = baseline | REQ-PROJ-001, REQ-MILE-001, REQ-EQPT-001 |
| Нет Open Issue по EQ-HVAC-01 | чистое исходное | REQ-RISK-001 |

**Бизнес-результат:** директор/PM видят «на треке» к 2026-09-01.

### 2. Возникновение задержки (SCN-001 → Snapshot B)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| EQ-HVAC-01 Delayed +21d | forecastDelivery 2026-06-22 | REQ-EQPT-001 |
| Issue ISS-001 Open linked | BR-001 | REQ-RISK-001 |

**Бизнес-результат:** отклонение зафиксировано в контуре, не только «устно».

### 3. Изменение риска / статуса (Snapshot B)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| RISK-001 Red | BR-002 | REQ-RISK-001 |

**Бизнес-результат:** угроза вехе явно связана с equipment delay.

### 4. Влияние на контрольную точку и прогноз (SCN-007 data)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| MS-PS rag Red; forecast 2026-09-22 | BR-003/004 | REQ-MILE-001, REQ-PROJ-001 |
| Director aggregate: driver + RAG + dates | BR-005/007 | REQ-IMPCT-001 |

**Бизнес-результат:** одно отклонение согласованно отражено во всех представлениях цепочки.

### 5. Управленческая интерпретация / решение

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| Decision AcceptDateSlip или PrioritizeRecovery | BR-006 | REQ-IMPCT-002 |
| Director может обосновать выбор по aggregate | H-002 | REQ-IMPCT-001 |

**Бизнес-результат:** решение директора опирается на согласованную картину impact, а не на разрозненные отчёты.

## Вне walkthrough

- Раскладка экранов, цвета, карточки — UX-фаза.
- SCN-006, budget, docs/TOP — out of Must.
