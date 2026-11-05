---
id: DOC-RPT-REQOS-001
title: 'Отчёт: аудит готовности требований (OpenSpec Stage 0)'
type: delivery
status: draft
version: 0.1.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-HANDOFF-BAPD-001
  - DOC-BA-010
  - DOC-BA-017
  - DOC-PROD-011
  - DOC-PROD-010
  - DOC-PROD-012
  - DOC-BA-014
  - DOC-BA-015
  - DOC-BA-016
  - DOC-REQ-README-001
---
# Report: Requirements readiness audit (OpenSpec phase Stage 0)

Дата: **2026-10-31**. Этап 0 фазы Requirements Specification & OpenSpec.  
OpenSpec / apps / commit **не** выполнялись в рамках этого отчёта.

> **certainty:** fact
>
> Источники аудита: handoff BA/PD, `docs/04-requirements/*`, capabilities, functional scope (BA-OQ-001), BR, domain, process specs, mock narrative, traceability, Demo v1 architecture / persistence. OpenSpec CLI **1.15.0**; `openspec/specs/` и `openspec/changes/` без living/active changes (только README).

> **certainty:** assumption
>
> Оценки «ready / needs clarification» — суждение по согласованности артефактов Demo v1; не enterprise validation.

## 1. Вердикт Stage 0

| Вопрос | Ответ |
|--------|--------|
| Можно ли начинать OpenSpec change для Must Demo v1? | **Да** — для primary path Snapshots A/B/C + PrioritizeRecovery |
| Есть ли жёсткие блокеры всего Must-scope? | **Нет** |
| Есть ли зоны, которые нельзя домысливать в specs? | **Да** — post-state после AcceptDateSlip (BA-OQ-004/005); UI layout (BA-OQ-006); messaging/horizon/framing (BA-OQ-002 / HIP-003/004/007); enterprise applicability (HIP-005) |

**Рекомендация следующей итерации:** один OpenSpec change на согласованный Demo v1 (C-01…C-05), с явным **out of scope** для AcceptDateSlip state machine и UI layout; NFR как отдельные constraints, не как новые ADR.

## 2. Инвентарь требований

| ID | Capability | BR / источник | Вердикт Stage 0 |
|----|------------|---------------|-----------------|
| REQ-PROJ-001 | C-01 | BR-004, BR-006 | **Ready** (с замечанием Phase) |
| REQ-MILE-001 | C-02 | BR-003, BR-004, BR-006 | **Ready** |
| REQ-EQPT-001 | C-03 | BR-004 | **Ready** (с уточнением write-path) |
| REQ-RISK-001 | C-04 | BR-001, BR-002, NC-001 | **Ready** (AcceptDateSlip post-state out) |
| REQ-IMPCT-001 | C-05 | BR-005, BR-007 | **Ready** |
| REQ-IMPCT-002 | C-05 | BR-006 | **Ready** (AcceptDateSlip post-state out) |
| REQ-NFR-001 | architecture | DOC-PROD-003 | **Ready** |
| REQ-NFR-002 | architecture | DOC-PROD-003/004 | **Ready** (не раздувать в ADR) |

## 3. Проверка критериев аудита (чеклист)

| # | Критерий | Результат |
|---|----------|-----------|
| 1 | Однозначный смысл + проверяемые AC | **Pass** для Must-path; AcceptDateSlip post-state явно исключён |
| 2 | Нет внутренних противоречий REQ↔REQ | **Pass** (см. §5 soft notes) |
| 3 | Нет дублей с разным смыслом | **Pass** — EQPT vs RISK разведены; IMPCT-001 aggregate vs IMPCT-002 Decision |
| 4 | Связь Capability / BR | **Pass**; integrity BR-007 через IMPCT-001 + mock |
| 5 | Snapshots A/B/C ↔ REQ | **Pass** |
| 6 | Delivery ≠ production-start dates | **Pass** (EQPT, IMPCT-001, mock matrix) |
| 7 | Issue ≠ Risk, linked | **Pass** (Domain, RISK-001, BA-OQ-003 closed) |
| 8 | Activity не сущность Demo v1 | **Pass** |
| 9 | Нет скрытого CPM / recovery execution / auto-reforecast | **Pass** |
| 10 | NFR без необоснованных ADR | **Pass** — NFR-002 не обещает auto-compatible swap |

## 4. Готовые к формализации (OpenSpec)

Формализовать как нормативное поведение Demo v1 (не копипаст Discovery):

1. **Project overview** — PRJ-01 поля; A/B/C forecast dates; C без сдвига после PrioritizeRecovery.
2. **Milestone MS-PS** — dates + rag fixture; link RISK-001 на B/C; integrity vs BR-003 expectation; без runtime RAG engine.
3. **Equipment EQ-HVAC-01** — critical, delivery dates, OnTrack/Delayed, Δ=+21; driver для impact.
4. **Issue + Risk** — отдельные сущности; BR-001 capability регистрации; NC-001 ISS-001 в B/C; Mitigating только как следствие PrioritizeRecovery Decision; RAG fixture + integrity BR-002.
5. **Impact aggregate** — согласованность с исходными объектами; A без ISS-001; B/C с RISK+ISS; BR-007 A vs B/C.
6. **Decision** — типы AcceptDateSlip | PrioritizeRecovery; primary C = PrioritizeRecovery + Mitigating + no auto-reforecast; AcceptDateSlip = запись Decision + forecast unchanged **без** post-state Issue/Risk/MS.
7. **NFR** — FE только HTTP API; persistence port + mock adapter; PostgreSQL out of Demo v1.

Кандидатные capability names (из DOC-PROD-010, hypothesis):  
`project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report`.

## 5. Требуют уточнения (не блокеры Must; зафиксировать в OpenSpec design / out)

| ID | Тема | Почему | Действие Stage 1 |
|----|------|--------|------------------|
| REQ-PROJ-001 / C-01 | Phase | Domain: Phase в модели, mock **не требует** экземпляров; REQ не даёт AC на Phase | В specs: Phase optional / не Must для narrative dataset |
| REQ-EQPT-001 | «поддерживать обновление forecastDelivery» | AC описывают snapshot states; write API vs seed/transition mock не детализирован | В design: допустим mock seed A→B или явная update-операция без CPM |
| REQ-RISK-001 | BR-001 capability vs NC-001 fixture | Различие «можно зарегистрировать» vs «в B есть ISS-001» уже в BR; OpenSpec не должен слить их | Два требования/сценария в spec |
| REQ-IMPCT-001 | Форма aggregate DTO | Поля перечислены прозой, без имени контракта | OpenSpec/API design назовёт контракт; не менять смысл |
| C-01 mapping | Capabilities: BR = «—»; REQ-PROJ ссылается на BR-004/006 | Документная мягкая рассинхронизация | Исправить mapping при sync docs **или** объяснить в design, что C-01 потребляет даты, а правила — в C-02/C-03/C-05 |
| Issue.status Closed | Когда Closed (кроме «не из AcceptDateSlip») | Смысл Closed = open_question в BR | Не проектировать Closed transitions в Must specs |
| AcceptDateSlip C' | Нет полного mock snapshot | Уже «не Must» | Out of Must scenarios; только запись Decision + forecast stable |

## 6. Противоречия

**Жёстких противоречий Must-path не найдено.**

Мягкие (не блокируют OpenSpec, не закрывать молча как «исправление факта»):

| # | Наблюдение | Оценка |
|---|------------|--------|
| S1 | Формулировка аудитории: BA-OQ-001 «директор проекта» vs HIP-001 «директор фармацевтического предприятия» | Framing; поведение Demo v1 одно и то же |
| S2 | C-01 BR «—» vs REQ-PROJ → BR-004/006 | Trace doc inconsistency |
| S3 | `docs/04-requirements/README.md` ещё говорит «OpenSpec после human review» | Устарело относительно BA-OQ-001 freeze — обновить при Stage 1 docs sync |

## 7. Пробелы

| Пробел | Блокирует Must OpenSpec? | Комментарий |
|--------|--------------------------|-------------|
| Полная state machine после AcceptDateSlip | Только эту ветку | BA-OQ-004/005 |
| UI layout Issue/Risk | Нет | BA-OQ-006 |
| Auth / User model | Нет | OwnerRef = roleId; auth out |
| Runtime compute RAG | Нет | Fixture + integrity — осознанно |
| Living OpenSpec specs | N/A | Пусто — создать на Stage 1 |
| HTTP resource paths / OpenAPI shapes | Нет для Stage 0 | Появятся в design/tasks; не выдумывать GMP |

## 8. Открытые вопросы → влияние на specs

| ID | Статус | Затрагивает | Правило для OpenSpec |
|----|--------|-------------|----------------------|
| **BA-OQ-004** | open | REQ-RISK-001 AC-I AcceptDateSlip; REQ-IMPCT-002; mock C' | Не проектировать Issue.status после AcceptDateSlip; не auto-Closed |
| **BA-OQ-005** | open | REQ-RISK-001 AC-R; REQ-MILE-001 (косвенно); REQ-IMPCT-002 | Не проектировать Risk/MS rag после AcceptDateSlip |
| **BA-OQ-006** | open | UX only | Не включать UI layout в OpenSpec; domain Issue≠Risk сохранять |
| **BA-OQ-002** / HIP-003/004/007 | open | Messaging, горизонт, framing | Не добавлять GMP/CSV claims, horizon, platform framing в Must REQ/specs |
| **HIP-005** | open | Применимость к предприятию | Не превращать demo assumptions в enterprise-fact |
| BA-OQ-001 / BA-OQ-003 | **closed** | Scope / Issue≠Risk | Опираться как на SoT границ |

**Не закрывать** перечисленные open вопросы только потому, что они обойдены в спецификации.

## 9. Snapshot / integrity alignment (кратко)

| Snapshot | Ключевые AC | Согласовано |
|----------|-------------|-------------|
| A | baseline dates; Green fixture; no Open delay Issue; aggregate без ISS-001; BR-007 A | Да |
| B | +21d EQ→MS/PRJ; ISS Open; RISK/MS Red fixture; impact refs | Да |
| C PrioritizeRecovery | Decision; Issue Mitigating; forecast unchanged; links preserved | Да |
| C' AcceptDateSlip | Decision + forecast; post-state open | Да — исключить из Must state specs |

## 10. Архитектура / NFR

- REQ-NFR-001/002 согласованы с DOC-PROD-003/004 и ADR направления стека.
- Не требуют нового ADR для формализации поведения.
- PostgreSQL, apps scaffold — вне фазы.

## 11. Что Stage 0 **не** делал

- Создание OpenSpec change / living specs.
- Правка REQ «по вкусу» без продуктового решения.
- Закрытие BA-OQ/HIP.
- Commit / push / apps.

## 12. Готовность к Stage 1

| Вход | Статус |
|------|--------|
| Scope freeze BA-OQ-001 | closed |
| REQ pack draft | ready for formalization |
| OpenSpec tooling | 1.15.0; schema `spec-driven`; root OK |
| Блокеры Must | нет |
| Ограничения specs | AcceptDateSlip post-state; UI; messaging HIP |

**Следующий шаг:** создать OpenSpec change для Demo v1 Must (C-01…C-05), proposal/design/tasks + delta specs; обновить матрицу трассируемости Scope→…→OpenSpec; не реализовывать apps.
