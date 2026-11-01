---
id: DOC-BA-010
title: "BA registers"
type: business
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-DISC-010
  - DOC-PHASE-BAPD-001
  - DOC-BA-README-001
  - DOC-PROD-011
  - DOC-PROD-012
  - DOC-PROD-001
  - DOC-UX-017
---

# BA registers

Реестр фазы BA & Product Definition. Не дублирует Discovery Evidence; ссылается на [registers Discovery](../01-discovery/registers.md).

Certainty: demo direction ≠ enterprise-`fact`.

## Assumptions (BA)

| ID | Утверждение | Certainty | Примечание |
|----|-------------|-----------|------------|
| BA-A-001 | Demo v1 = один facility-проект (один Project) до ответа HIP-004 | assumption | Boundaries Discovery |
| BA-A-002 | Messaging: избегать GMP/CSV как compliance theater до HIP-003 | assumption | OQ-003 |
| BA-A-003 | Сдвиг forecast production start в демо = сдвиг единственного critical equipment delivery (BR-004); без CPM/float/параллельного recovery calendar | assumption | demo only; см. DOC-BA-014 |
| BA-A-005 | Календарь mock narrative — 2027; scenarioAsOfDate на snapshot; prep docs 2026-10-30 | assumption | DOC-PROD-012 |
| BA-A-006 | PrioritizeRecovery не пересчитывает forecast автоматически (BR-006) | assumption | DOC-BA-014 |
| BA-A-004 | SCN-006 не входит в обязательный Demo v1 scope | fact | HIP-006 PO; подтверждено BA-OQ-001 |

## Hypotheses (BA)

| ID | Гипотеза | Статус |
|----|----------|--------|
| BA-H-001 | Для SCN-001→007 достаточны процессы equipment, schedule, risk, issue, milestones, management reporting | **accepted for Demo v1 model** (DOC-BA-013); не enterprise-fact |
| BA-H-002 | C-01…C-05 покрывают Must capabilities без C-06/C-07 | **accepted for Demo v1 freeze** (BA-OQ-001, DOC-PROD-011); не FR OpenSpec / не enterprise-fact |

## Open Questions (BA)

| ID | Вопрос | Адресат | Статус |
|----|--------|---------|--------|
| BA-OQ-001 | *(закрыт)* Freeze Demo v1 functional scope (PD2) | product owner | **closed** — 2026-10-31; см. § «Решение BA-OQ-001»; [demo-v1-functional-scope](../03-product/demo-v1-functional-scope.md) |
| BA-OQ-002 | HIP-003 / HIP-004 / HIP-007 (messaging, горизонт, framing) | product owner | open (Discovery HIP) |
| BA-OQ-003 | *(закрыт)* Концептуально Issue и Risk — отдельные связанные сущности | BA/PD | **closed** — Domain Model DOC-BA-015, BR-001/002, REQ-RISK-001 |
| BA-OQ-004 | Issue.status после AcceptDateSlip (не авто-Closed; AcceptDateSlip = Decision type) | product owner | open |
| BA-OQ-005 | Risk.rag / Milestone.rag после AcceptDateSlip, если Issue уже не Open/Mitigating | product owner | open |
| BA-OQ-006 | *(закрыт)* Как представлять Issue и Risk в UI (раздельные панели vs совместный вид) | product owner / UX | **closed** — 2026-11-01; см. § «Решение BA-OQ-006» |

## Решение BA-OQ-001 (2026-10-31)

> **certainty:** fact
>
> Product Owner подтвердил согласованный функциональный объём Demo v1. Это решение о **направлении демо и границах Demo v1**, а **не** подтверждение реальных процессов / org chart предприятия.

| Тема | Решение |
|------|---------|
| Аудитория | Основная — **директор проекта**; вторичная — **руководитель проекта** |
| Narrative | Основной демонстрационный сценарий — **SCN-001 → SCN-007** |
| Capabilities Must | **C-01…C-05** |
| Вне Must | **C-06 / C-07** не входят в обязательный объём Demo v1 |
| SCN-006 | Остаётся **дополнительным** сценарием (не Must) |
| Mock | Snapshots **A/B/C**; задержка поставки критического оборудования на **21 календарный день** |
| PrioritizeRecovery | Фиксирует управленческое решение; исполнение мероприятий по восстановлению графика и авто-пересчёт прогноза **не** моделируются |
| AcceptDateSlip | Допускается как тип управленческого решения; последующие статусы Issue / Risk / Milestone — **не определены** до отдельного согласования (BA-OQ-004/005) |
| Вне Demo v1 | Полноценный CPM; управление соответствием GMP/CSV; расширенная методология управления рисками; полноценное управление подрядчиками и бюджетом |

**Связанные документы:** [demo-v1-functional-scope](../03-product/demo-v1-functional-scope.md) (DOC-PROD-011), [demo-v1-capabilities](../03-product/demo-v1-capabilities.md), [demo-v1-mock-narrative-data](../03-product/demo-v1-mock-narrative-data.md), [vision-and-scope](../03-product/vision-and-scope.md), [business-rules-demo-v1](./business-rules-demo-v1.md) (BR-006), Discovery HIP-001/006 ([human-input-pack](../01-discovery/human-input-pack.md)).

## Решение BA-OQ-006 (2026-11-01)

> **certainty:** fact
>
> Product Owner подтвердил **presentation / register architecture** Demo v1 для Issues & Risks. Это решение о **директорском UI-реестре**, а **не** объединение Domain-сущностей Issue и Risk.

| Тема | Решение |
|------|---------|
| Register | **Единый** реестр Issues & Risks (один director-facing view) |
| Rationale | Директору нужен единый management-exception view, где проблемы и риски видны совместно |
| Domain | Issue и Risk остаются **отдельными** сущностями (BA-OQ-003); **нет** общей Exception / generic lifecycle entity |
| Колонка `Тип` | Обязательна; director-facing: **`Проблема`** / **`Риск`** |
| Issue lifecycle | Open / Mitigating / Closed (без общего lifecycle с Risk) |
| Risk status | Отдельный **RAG** (не общий status enum с Issue) |
| Detail routes | Раздельные: `/issues/:id`, `/risks/:id` |
| API / relationships | Остаются раздельными; решение не меняет DOC-BA-015 direct-links matrix |

**История:** ранее UI Design pack использовал V1 single table + Type как `assumption` при открытом OQ. С 2026-11-01 это **принятое Demo v1 decision** (бывшая working assumption → decision).

**Связанные документы:** [demo-v1-ui-screens](../05-ux-ui/demo-v1-ui-screens.md) (P4), Domain Model / BR-001/002, OpenSpec `management-exception-report` (capability по-прежнему не предписывает layout impact screens).

## Included processes (Demo v1 narrative)

Подтверждено BA2 ([process-specs-demo-v1](./process-specs-demo-v1.md)): PROC-007, PROC-001, PROC-005, PROC-004, PROC-010, PROC-011.

## Excluded processes (Demo v1 narrative)

| PROC | Причина исключения |
|------|-------------------|
| PROC-002 Budget | OQ-012; нет в SCN-001→007 |
| PROC-003 Change | SCN-008 не primary; OQ-014 |
| PROC-006 Contractor first-class | OQ-013; SCN-002 не primary |
| PROC-008 Documentation/TOP | SCN-005 не primary |
| PROC-009 Readiness-by-area | SCN-006 optional only (HIP-006) |
