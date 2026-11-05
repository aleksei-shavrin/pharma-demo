---
id: DOC-PROD-013
title: Demo v1 — приёмочный walkthrough
type: product
status: draft
version: 0.3.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-012
  - DOC-DISC-018
  - DOC-BA-014
  - REQ-IMPCT-001
  - REQ-IMPCT-002
---
# Demo v1 acceptance walkthrough

Проверка **сквозного бизнес-результата** SCN-001 → SCN-007. Не тур по UI-layout.

Данные: [demo-v1-mock-narrative-data](./demo-v1-mock-narrative-data.md) (scenarioAsOfDate, Snapshots A/B/C).

## Предусловия

- Mock Snapshots A/B/C и integrity matrix Pass (spec-level).
- Capabilities C-01…C-05; draft REQ-*.
- FE/API runtime — **позже**; здесь валидируются требования и согласованность данных.

## Шаги

### 1. Исходное состояние (Snapshot A, asOf 2027-02-15)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| PRJ/MS/EQ on track | forecast = baseline; MS-PS rag Green; EQ OnTrack | REQ-PROJ-001, REQ-MILE-001, REQ-EQPT-001 |
| Нет Open Issue по EQ-HVAC-01 | чистое исходное | REQ-RISK-001 |

**Бизнес-результат:** готовность к production start **2027-09-15** без отклонения.

### 2. Возникновение задержки (→ Snapshot B, asOf 2027-03-01)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| EQ-HVAC-01 Delayed | forecastDelivery 2027-06-05 (= baseline +21d) | REQ-EQPT-001 |

**Бизнес-результат:** известен сдвиг critical delivery.

### 3. Регистрация Issue (NC-001)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| ISS-001 Open | linked EQ-HVAC-01 и MS-PS | REQ-RISK-001 |
| Capability | регистрация Issue поддерживается (BR-001) | REQ-RISK-001 |

**Бизнес-результат:** отклонение в контуре, не «устный» статус.

### 4. Отражение Risk (BR-002)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| RISK-001 rag Red | linked ISS-001 / MS-PS / EQ | REQ-RISK-001 |

**Бизнес-результат:** угроза вехе явлена детерминированно.

### 5. Изменение Milestone и Project forecast (BR-003/004)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| MS-PS rag Red; forecast 2027-10-06 | baseline 2027-09-15 +21d | REQ-MILE-001 |
| PRJ forecastProductionStart 2027-10-06 | = MS forecast | REQ-PROJ-001 |

**Бизнес-результат:** контрольная точка и дата запуска сдвинуты согласованно с EQ.

### 6. Агрегированная картина для директора (BR-005/007)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| Aggregate согласован с EQ, ISS, RISK, MS, PRJ | те же id, Red, 2027-10-06 | REQ-IMPCT-001 |

**Бизнес-результат:** единый impact view без противоречий.

### 7. Фиксация решения (Snapshot C, asOf 2027-03-02)

**Основной путь — PrioritizeRecovery**

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| DEC-001 type PrioritizeRecovery | owner/due опционально | REQ-IMPCT-002 |
| ISS-001 status Mitigating | Decision записан; execution не моделируется | REQ-RISK-001 |

**Альтернатива — AcceptDateSlip (без второго Must-snapshot)**

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| Decision type AcceptDateSlip записывается | forecast без изменения vs B | REQ-IMPCT-002 |
| Issue / Risk / MS rag после AcceptDateSlip | **не проверяется как Must** (BA-OQ-004/005) | — |

**Бизнес-результат:** управленческий выбор зафиксирован; не подмена исполнения recovery.

### 8. Согласованность после PrioritizeRecovery (BR-006/007)

| Проверка | Ожидание | REQ |
|----------|----------|-----|
| Forecast PRJ/MS **без изменения** vs Snapshot B | 2027-10-06 | REQ-PROJ-001, REQ-MILE-001, REQ-IMPCT-002 |
| RISK fixture Red; integrity vs BR-002 (Mitigating) | Red | REQ-RISK-001 |
| MS fixture Red; integrity vs BR-003 | Red | REQ-MILE-001 |
| Aggregate согласован | EQ→ISS→RISK→MS→PRJ | REQ-IMPCT-001 |
| dueDate recovery после asOf C | 2027-03-20 > 2027-03-02 | REQ-IMPCT-002 |

**Бизнес-результат:** PrioritizeRecovery не пересчитывает прогноз; AcceptDateSlip (если выбран) только принимает текущий forecast без выдуманной полной state-машины Issue/Risk.

## Вне walkthrough

- UI layout / цвета / карточки — UX-фаза.
- SCN-006, budget, docs/TOP — out of Must.
- Runtime apps — later.
