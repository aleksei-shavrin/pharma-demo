---
id: DOC-BA-014
title: "Business rules (Demo v1)"
type: business
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-BA-013
  - DOC-BA-015
  - DOC-DISC-018
  - DOC-BA-010
  - DOC-PROD-012
---

# Business rules (Demo v1)

Правила демонстрационной модели SCN-001→SCN-007. Канон полей: план BA/PD §3.2.

> **certainty:** assumption
>
> Правила ниже — **demo assumptions / hypotheses**, не отраслевые стандарты и не GMP. ID **BR-001…BR-007 сохранены**; v0.3.0 — Decision flow и RAG fixture vs expectation. Narrative ISS-001 — **NC-001** в mock, не отдельный BR.

---

## BR-001 — Issue registration capability (functional)

| Поле | Значение |
|------|----------|
| **ID** | BR-001 |
| **Описание** | Система поддерживает регистрацию Issue и связывание его с Equipment и Milestone (production start), когда critical equipment имеет forecast delivery позже baseline. |
| **Источник / обоснование** | SCN-001; PROC-007 + PROC-005; P-001/P-002 |
| **Certainty** | hypothesis |
| **Условия** | Equipment.isCritical = true; возможность зафиксировать slip (forecastDelivery > baselineDelivery) |
| **Ожидаемый результат** | Можно создать Issue с links на Equipment и Milestone; поведение доступно через API-контур |
| **Проверяемый пример** | После slip EQ-HVAC-01 оператор/PM может зарегистрировать Issue, linked to EQ-HVAC-01 и MS-PS |

**Не смешивать с narrative:** наличие конкретного ISS-001 в Snapshot B задаётся условием **NC-001** ([mock narrative](../03-product/demo-v1-mock-narrative-data.md)), а не этим BR.

---

## BR-002 — Risk RAG for open critical-delay Issue (deterministic demo)

| Поле | Значение |
|------|----------|
| **ID** | BR-002 |
| **Описание** | Для Demo v1 narrative SCN-001→007: если Issue, связанный с critical equipment delay и MS-PS, имеет status ∈ {Open, Mitigating}, то linked Risk.rag **обязан быть Red**. Уровень Amber **не используется** в обязательном Demo v1 path (нет отдельной шкалы). |
| **Источник** | SCN-001; PROC-004; H-002; минимальная детерминированность без enterprise risk methodology |
| **Certainty** | assumption (demo RAG mapping) |
| **Условия** | Issue linked to critical EQ + MS-PS; Issue.status ∈ {Open, Mitigating}; Risk linked to same Issue/Milestone |
| **Ожидаемый результат** | Risk.rag = Red |
| **Проверяемый пример** | ISS-001 Open ⇒ RISK-001.rag = Red |

**Значения Issue.status (Demo v1):**

| Status | Смысл | Certainty |
|--------|--------|-----------|
| Open | Зарегистрированное отклонение; Decision PrioritizeRecovery ещё не записан | hypothesis |
| Mitigating | После Decision **PrioritizeRecovery**; execution recovery **не** моделируется; forecast **не** авто-пересчитывается (BR-006) | assumption |
| Closed | Явное закрытие Issue; **не** следует автоматически из AcceptDateSlip | open_question |

**AcceptDateSlip** — тип **Decision**, не Issue.status. Post-state Issue после AcceptDateSlip — **BA-OQ-004**.

### RAG: правило vs fixture vs integrity (BR-002)

| Слой | Роль |
|------|------|
| **BR-002** | Задаёт **ожидаемое** Risk.rag = Red, когда Issue.status ∈ {Open, Mitigating} |
| **Mock fixture** | Snapshot хранит поле Risk.rag (например Red в B/C) |
| **Integrity check** | Сравнивает fixture с ожиданием BR-002 (spec-level; runtime compute **не** заявлен) |
| **Snapshot A Green** | Исходный baseline fixture **до** open delay Issue; **не** следствие BR-002 |

---

## BR-003 — Milestone RAG reflects linked Red risk

| Поле | Значение |
|------|----------|
| **ID** | BR-003 |
| **Описание** | Если у Milestone MS-PS есть linked Risk с rag = Red, то **ожидаемое** Milestone.rag = Red (Amber вне Must). |
| **Источник** | SCN-001/007; PROC-010 |
| **Certainty** | assumption (demo aggregation) |
| **Условия** | Milestone.id = MS-PS; exists Risk with rag Red linked to MS-PS |
| **Ожидаемый результат** | MS-PS.rag = Red |
| **Проверяемый пример** | RISK-001 Red ⇒ expected MS-PS.rag = Red |

### RAG: правило vs fixture (BR-003)

| Слой | Роль |
|------|------|
| **BR-003** | Ожидание MS-PS.rag при Red Risk |
| **Mock fixture** | Хранит MS-PS.rag |
| **Integrity** | Fixture == ожидание BR-003 |
| **Snapshot A Green** | Baseline fixture без Red Risk; не вывод BR-003 |

---

## BR-004 — Forecast production start tracks single critical delivery slip (demo)

| Поле | Значение |
|------|----------|
| **ID** | BR-004 |
| **Описание** | В Demo v1 при **одном** critical equipment driver прогноз production start сдвигается на ту же величину календарных дней, что и (equipment.forecastDelivery − equipment.baselineDelivery). |
| **Источник** | BA-A-003; SCN-007 |
| **Certainty** | **assumption** (явно demo; **не** отраслевая методика / CPM) |
| **Условия** | Ровно один critical driver в dataset; нет моделирования float, параллельного recovery calendar, компенсации задержки, multi-path CPM |
| **Ожидаемый результат** | `forecastProductionStart = baselineProductionStart + Δ`, где `Δ = forecastDelivery − baselineDelivery` (дней); то же Δ для MS-PS.forecastDate |
| **Проверяемый пример** | baselineDelivery 2027-05-15 → forecastDelivery 2027-06-05 (Δ=+21); baseline PS 2027-09-15 → forecast PS 2027-10-06 |

**Ограничение применимости:** только текущий демонстрационный набор ([mock narrative](../03-product/demo-v1-mock-narrative-data.md)). Не претендует на достоверный прогноз реального строительства.

---

## BR-005 — Director exception view lists contributing driver

| Поле | Значение |
|------|----------|
| **ID** | BR-005 |
| **Описание** | Агрегированные данные для директора включают: milestone RAG, forecast vs baseline production start, id contributing equipment driver, ссылки на top risk и issue — согласованные с исходными объектами. |
| **Источник** | HIP-001/008; PROC-011; SCN-007; H-002 |
| **Certainty** | hypothesis |
| **Условия** | Narrative state after delay recorded (Snapshot B/C) |
| **Ожидаемый результат** | Aggregate согласован с EQ, Issue, Risk, Milestone, Project (те же id/даты/rag) |
| **Проверяемый пример** | Aggregate: EQ-HVAC-01, MS-PS Red, forecast 2027-10-06, RISK-001, ISS-001 |

---

## BR-006 — Decision outcomes are recordable (no auto re-forecast)

| Поле | Значение |
|------|----------|
| **ID** | BR-006 |
| **Описание** | Система поддерживает фиксацию решения директора: **AcceptDateSlip** (принять прогнозную дату) или **PrioritizeRecovery** (инициировать recovery с опциональными owner/due). Demo v1 **фиксирует решение**, но **не** моделирует исполнение recovery actions и **не** пересчитывает автоматически forecast при PrioritizeRecovery. |
| **Источник** | SCN-007; P-002; scope C-05 |
| **Certainty** | hypothesis |
| **Условия** | После Snapshot B; decision step SCN-007 |
| **Ожидаемый результат** | Decision record с type; для PrioritizeRecovery — опционально ownerRole/dueDate; Project/Milestone forecast **остаются как в Snapshot B**, пока не задан отдельный будущий scope re-forecast |
| **Проверяемый пример** | DEC-001 PrioritizeRecovery; owner SH-006; due 2027-03-20; PRJ forecast остаётся 2027-10-06 |

### Ожидаемые состояния после Decision (Demo v1)

| Поле | PrioritizeRecovery (Snapshot C primary) | AcceptDateSlip |
|------|------------------------------------------|----------------|
| Decision | type=PrioritizeRecovery; owner/due опционально | type=AcceptDateSlip; due не обязателен |
| Issue.status | **Mitigating** (определено) | **open_question** (BA-OQ-004): не авто-Closed; не путать с типом Decision |
| Risk.rag | **Red** (BR-002: Mitigating) | **open_question** (BA-OQ-005), если Issue уже не Open/Mitigating |
| Milestone.rag | **Red** (BR-003, пока Risk Red) | **open_question** (BA-OQ-005), следует из Risk |
| Project/MS forecast | **Без изменения** vs Snapshot B | **Без изменения** vs Snapshot B (принят текущий forecast) |
| Recovery execution | **Не моделируется** | n/a |

> **certainty:** open_question
>
> **BA-OQ-004 / BA-OQ-005:** полное post-state Issue/Risk/MS после AcceptDateSlip не утверждено PO. Primary mock Snapshot C = PrioritizeRecovery. AcceptDateSlip остаётся **записываемым** типом Decision (BR-006) без выдуманной полной state-машины.

---

## BR-007 — Causal and temporal integrity (invariant)

| Поле | Значение |
|------|----------|
| **ID** | BR-007 |
| **Описание** | Integrity invariant с **разной применимостью** к Snapshot A vs B/C (см. ниже). Не требует полной цепочки Issue→Risk в Snapshot A. |
| **Источник** | Gate BA-Mock-Integrity |
| **Certainty** | assumption |
| **Условия** | Опубликованный snapshot A, B или C |
| **Ожидаемый результат** | Соответствующие проверки Pass на уровне спецификации |
| **Проверяемый пример** | См. [demo-v1-mock-narrative-data](../03-product/demo-v1-mock-narrative-data.md) |

### Применимость по snapshot

**Snapshot A — baseline integrity**

- Нет Open Issue по critical EQ delay fixture.
- baseline/forecast согласованы (forecast = baseline для EQ delivery и production start).
- Green Risk/Milestone — **исходные fixture values**, не результат BR-002/003.

**Snapshot B/C — causal-chain integrity**

- Связаны Equipment, Issue, Risk, Milestone, Project.
- Fixture Risk/MS rag соответствует ожиданиям BR-002/003.
- Forecast dates согласованы с BR-004 (Δ delivery).
- После PrioritizeRecovery (C): forecast не меняется от Decision alone (BR-006).
- Нет Green MS-PS при Red Risk от того же delay.
- Даты согласованы с scenarioAsOfDate.

**Классификация:** integrity invariant (не user-facing capability). Runtime compute не заявлен.

---

## Не-правила (явно out)

- Нет BR на budget, contractor scorecards, TOP/inspection-ready, multi-area readiness, Amber-шкалу Must.
- Нет BR «GMP change control».
- Нет BR автоматического пересчёта прогноза после PrioritizeRecovery.
