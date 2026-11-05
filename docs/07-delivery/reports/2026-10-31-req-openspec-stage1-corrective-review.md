---
id: DOC-RPT-REQOS-003
title: 'Отчёт: corrective semantic review OpenSpec Stage 1'
type: delivery
status: draft
version: 0.1.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-RPT-REQOS-002
  - DOC-HANDOFF-REQOS-001
  - DOC-BA-014
  - DOC-PROD-012
---
# Report: OpenSpec Stage 1 corrective semantic review

Дата: **2026-10-31**. Apply/archive/commit **не** выполнялись.

## 1. Замечания, проверенные

1. Избыточность ADDED Requirement «Issue Closed transitions not specified».
2. Роль `scenarioAsOfDate` Snapshot A/B/C vs DOC-PROD-012.
3. Соответствие Risk B/C формулировке BR-002 (в т.ч. Mitigating → Red).
4. Полный обзор содержимого Stage 1 change + synced docs (commit `65a466f` + текущий diff corrective).

## 2. Что изменено и почему

| Файл | Изменение | Почему |
|------|-----------|--------|
| `specs/risk-issue-impact/spec.md` | Удалены Requirement + Scenario про Closed; Purpose уточнён | Отсутствие правила не должно быть отдельным функциональным SHALL NOT; Closed не согласован |
| `design.md` | Non-Goals Closed; D8; Context table scenarioAsOfDate; D6 явно BR-002 Open\|Mitigating | Границы scope + первоисточник дат + подтверждение BR-002 |
| `specs/project-status-overview/spec.md` | WHEN A/B/C помечены mock scenarioAsOfDate per DOC-PROD-012 | Идентификация snapshot без нового Requirement «expose asOf» |
| этот report | создан | corrective review |

**Не менялись:** BR, REQ, mock snapshot values, BA-OQ statuses, living `openspec/specs/`, apps, ADR.

## 3. scenarioAsOfDate — результат

| Snapshot | Дата (DOC-PROD-012) | Вердикт |
|----------|---------------------|---------|
| A | 2027-02-15 | Утверждённые **mock metadata** / temporal identity snapshot |
| B | 2027-03-01 | то же |
| C | 2027-03-02 | то же |

**Первоисточник:** [demo-v1-mock-narrative-data.md](../../03-product/demo-v1-mock-narrative-data.md) (DOC-PROD-012) — заголовок каждого Snapshot; integrity matrix «Temporal frame 2027; A asOf < B ≤ C».

**Не** поля доменных сущностей в Domain Model / REQ (кроме опоры dueDate Decision относительно asOf C в REQ-IMPCT-002).

**Решение formalization:** не вводить отдельные ADDED Requirements на expose `scenarioAsOfDate`; зафиксировать канон в `design.md`; в `project-status-overview` scenarios A/B/C — ссылка на mock asOf как идентификатор snapshot. Остальные capabilities продолжают говорить «активен Snapshot X» без дублирования дат.

## 4. BR-002 сверка

**Источник:** [business-rules-demo-v1.md](../../02-business-analysis/business-rules-demo-v1.md) DOC-BA-014, § BR-002:

> если Issue … имеет status ∈ {Open, **Mitigating**}, то linked Risk.rag **обязан быть Red**

Также слой fixture vs integrity: Snapshot A Green — baseline fixture до open delay Issue.

**Соответствие `risk-issue-impact`:**

| Утверждение | Spec | BR-002 / mock |
|-------------|------|---------------|
| A: RISK Green fixture | да | да |
| B: Red при Issue Open + links | да | да |
| C: Red при Issue Mitigating + links | да | **прямо допускается** BR-002 `{Open, Mitigating}` |
| no runtime engine | да | да |

**Противоречий нет.** Правки BR-002 / Risk B/C requirements **не** потребовались.

## 5. Полный diff review (Stage 1 commit + corrective)

**Commit `65a466f` файлы:** только OpenSpec change, traceability, capabilities, REQ README, delivery/handoff/report, cursor plan — **в scope Stage 1**.

**Не в diff Stage 1:** BR-001…007 текст, REQ bodies, DOC-PROD-012 values, Discovery, ba-registers OQ statuses, `openspec/specs/` living, `apps/**`, новые ADR.

**Согласованность proposal ↔ design ↔ tasks ↔ 6 specs ↔ traceability:** после удаления Closed Requirement — Purpose/Non-Goals согласованы; AcceptDateSlip boundary сохранён; architecture constraints остаются constraints.

**Demo ≠ enterprise-fact:** сохранено в proposal/design/handoff.

## 6. Противоречия / human decisions

| ID | Статус |
|----|--------|
| BA-OQ-004/005/006 | open (не закрыты) |
| BA-OQ-002 / HIP-003/004/007 | open |
| HIP-005 | open |
| EQ snapshot mechanism | deferred impl (design) |
| Issue Closed conditions | остаётся вне Must; не выдумано |

**Новых обязательных product decisions для продолжения review нет.**

## 7. Quality gates

| Gate | Result |
|------|--------|
| `openspec validate define-demo-v1-project-control` | **PASS** |
| `openspec validate … --strict` | **PASS** |
| `openspec status --change …` | 4/4 artifacts complete |
| `npm run test:docs` | **PASS** |
| `apps/**` | отсутствует |
| new ADR | нет |
| apply / archive | не выполнялись |

## 8. Итоговый статус

**READY WITH OPEN QUESTIONS**

Обоснование: corrective semantic issues (Closed redundancy, asOf metadata, BR-002 alignment) закрыты или подтверждены; Must path готов к human review; известные BA-OQ/HIP остаются open и ограничивают AcceptDateSlip/UI/messaging, но не блокируют PrioritizeRecovery Must.
