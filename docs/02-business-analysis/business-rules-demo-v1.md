---
id: DOC-BA-014
title: "Business rules (Demo v1)"
type: business
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-BA-013
  - DOC-BA-015
  - DOC-DISC-018
  - DOC-BA-010
---

# Business rules (Demo v1)

Правила демонстрационной модели SCN-001→SCN-007. Канон полей: план BA/PD §3.2.

> **certainty:** assumption
>
> Правила ниже — **demo assumptions / hypotheses**, не отраслевые стандарты и не GMP.

---

## BR-001 — Critical equipment delay creates Issue

| Поле | Значение |
|------|----------|
| **ID** | BR-001 |
| **Описание** | Если прогноз delivery/FAT critical equipment сдвигается относительно baseline на величину, значимую для демо (любой положительный сдвиг дней), система должна позволять (и в narrative — содержит) связанный Issue. |
| **Источник / обоснование** | SCN-001; PROC-007 + PROC-005; P-001/P-002 |
| **Certainty** | hypothesis |
| **Условия** | Equipment.isCritical = true; forecastDate > baselineDate |
| **Ожидаемый результат** | Существует Issue, linked to Equipment и к Milestone production-start |
| **Пример** | EQ-HVAC-01 baseline 2026-06-01 → forecast 2026-06-22 ⇒ Issue ISS-001 «HVAC long-lead slip» Open |

---

## BR-002 — Equipment delay elevates linked Risk RAG

| Поле | Значение |
|------|----------|
| **ID** | BR-002 |
| **Описание** | При Open Issue из BR-001 связанный Risk, влияющий на production-start milestone, имеет RAG не Green. |
| **Источник** | SCN-001; PROC-004; H-002 |
| **Certainty** | assumption (demo RAG mapping) |
| **Условия** | Linked Issue.status ∈ {Open, Mitigating}; Risk linked to same Milestone |
| **Ожидаемый результат** | Risk.rag ∈ {Amber, Red} |
| **Пример** | ISS-001 Open ⇒ RISK-001 rag = Red (threat to production start) |

---

## BR-003 — Milestone RAG reflects linked Red risk

| Поле | Значение |
|------|----------|
| **ID** | BR-003 |
| **Описание** | Если у Milestone «production start» есть linked Risk с rag = Red, то Milestone.rag ≠ Green. |
| **Источник** | SCN-001/007; PROC-010 |
| **Certainty** | assumption (demo aggregation) |
| **Условия** | Milestone.id = MS-PS; exists Risk with rag Red linked to MS-PS |
| **Ожидаемый результат** | MS-PS.rag ∈ {Amber, Red} |
| **Пример** | RISK-001 Red ⇒ MS-PS rag = Red |

---

## BR-004 — Forecast production start tracks critical delivery slip (demo)

| Поле | Значение |
|------|----------|
| **ID** | BR-004 |
| **Описание** | В Demo v1 прогноз даты production start сдвигается на ту же величину дней, что и сдвиг critical equipment forecast delivery (простое детерминированное правило). |
| **Источник** | BA-A-003; SCN-007; не отраслевая формула CPM |
| **Certainty** | **assumption** (явно demo; не выдавать за стандарт) |
| **Условия** | Single critical driver EQ package; no other Must drivers in Demo v1 dataset |
| **Ожидаемый результат** | forecastProductionStart = baselineProductionStart + (equipmentForecast − equipmentBaseline) in days |
| **Пример** | EQ slip +21d; MS-PS baseline 2026-09-01 ⇒ forecast 2026-09-22 |

---

## BR-005 — Director exception view lists contributing driver

| Поле | Значение |
|------|----------|
| **ID** | BR-005 |
| **Описание** | Агрегированное представление для директора включает: milestone RAG, forecast vs baseline date, идентификатор contributing equipment driver, top risk/issue. |
| **Источник** | HIP-001/008; PROC-011; SCN-007; H-002 |
| **Certainty** | hypothesis |
| **Условия** | Narrative state after delay recorded |
| **Ожидаемый результат** | Director view data contains driver EQ id + MS-PS forecast/RAG + RISK/ISSUE refs |
| **Пример** | View shows EQ-HVAC-01, MS-PS Red, forecast 2026-09-22, RISK-001 |

---

## BR-006 — Decision outcomes are recordable

| Поле | Значение |
|------|----------|
| **ID** | BR-006 |
| **Описание** | Система поддерживает фиксацию одного из исходов: AcceptDateSlip или PrioritizeRecovery (с owner). |
| **Источник** | SCN-007 decision; P-002 |
| **Certainty** | hypothesis |
| **Условия** | Director decision step in narrative |
| **Ожидаемый результат** | Decision record exists with type and optional owner/due for recovery |
| **Пример** | Decision = PrioritizeRecovery; owner = SH-006; due = 2026-05-15 |

---

## BR-007 — Consistent causal chain (integrity)

| Поле | Значение |
|------|----------|
| **ID** | BR-007 |
| **Описание** | В одном согласованном состоянии Demo v1 не допускается Green milestone RAG при Red risk от critical equipment delay (противоречие BR-002/003). |
| **Источник** | Gate BA-Mock-Integrity; P-001 |
| **Certainty** | assumption |
| **Условия** | Published mock narrative snapshot |
| **Ожидаемый результат** | Integrity matrix без противоречий equipment→issue→risk→milestone→forecast |
| **Пример** | См. demo-v1-mock-narrative-data (PD2) |

---

## Не-правила (явно out)

- Нет BR на budget variance, contractor scorecards, TOP/inspection-ready, multi-area readiness conflict.
- Нет BR «GMP change control».
