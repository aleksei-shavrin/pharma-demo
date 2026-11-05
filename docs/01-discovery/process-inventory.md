---
id: DOC-DISC-016
title: Инвентарь бизнес-процессов
type: discovery
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-010
  - DOC-DISC-012
  - DOC-DISC-013
  - DOC-DISC-014
  - DOC-DISC-015
  - DOC-PHASE-DISC-001
---
# Business process inventory

Инвентарь **кандидатных** бизнес-процессов project controls для Discovery Pharma Demo. Это **не** BPMN, **не** SOP заказчика и **не** нормативный перечень GMP-процедур.

Отраслевой lifecycle: [domain-overview.md](./domain-overview.md). Термины: [domain-glossary.md](./domain-glossary.md). Проблемы / Evidence: [registers.md](./registers.md). Роли-кандидаты: [stakeholders.md](./stakeholders.md) (параллельный D2; здесь — только ссылки на уже зафиксированные в product-context гипотезы ролей).

## Назначение и границы

> **certainty:** assumption
>
> Для Discovery достаточно перечня процессов-кандидатов с purpose / I-O / связями со стадиями lifecycle и ролями, чтобы позже строить сценарии (D3) и границы Demo v1 (D4). Наличие и границы процессов на конкретном предприятии **не** подтверждены (см. OQ-005, HIP-005).

> **certainty:** open_question
>
> Какие из процессов ниже реально критичны у целевого заказчика и входят в контур project controls vs остаются в смежных системах (ERP, QMS, planning tools)? (OQ-005 / HIP-005; новые: OQ-012…OQ-014 в registers)

## Правила certainty в этом документе

| Утверждение | Certainty |
|-------------|-----------|
| Парафраз EV-* (определения schedule, change control, milestone, C&Q, TOP, project control PDCA…) | `fact` относительно источника |
| Процесс как кандидат в контуре Pharma Demo / демо | `hypothesis` |
| Связь процесс ↔ стадия lifecycle / роль / проблема | `hypothesis` только если обоснована D1/product-context; иначе `open_question` |
| Customer SOP / site GMP procedure | **не** фиксируется как `fact` |

---

## Сводка кандидатов

> **certainty:** hypothesis
>
> Ниже — отраслево-типичный набор процессов project controls / facility-проекта, релевантный ценности «единый управленческий контур» (P-001…P-002, H-002…H-004). Набор **не** утверждён как scope продукта.

| ID | Процесс-кандидат | Краткий purpose | Стадии lifecycle (если обосновано) | Роли-кандидаты (если обосновано) | Проблемы (если обосновано) |
|----|------------------|-----------------|-------------------------------------|----------------------------------|----------------------------|
| PROC-001 | Schedule management | Планы и даты активностей / вех | все стадии (сквозной) | PM; director (обзор) | P-001, P-002 |
| PROC-002 | Budget / cost control | План–факт затрат и прогнозы | Design→CQV (инвестиционный цикл) | PM; director | OQ (см. OQ-012) |
| PROC-003 | Change control | Изменения baseline / deliverables | Design→CQV (+ docs) | PM; functional leads; director (impact) | P-002 |
| PROC-004 | Risk management | Идентификация и мониторинг рисков | все стадии | PM; director | P-001, P-002 |
| PROC-005 | Issue management | Учёт и закрытие issues / punch | Construction→readiness | PM; functional leads | P-001, P-002 |
| PROC-006 | Contractor management | Подрядчики, пакеты работ, статусы | Construction; частично Equipment | PM; functional leads | OQ (см. OQ-013) |
| PROC-007 | Equipment / supply | Поставка, FAT/SAT, установка | Equipment (+ стык Construction/CQV) | PM; functional leads | P-001 (через дату запуска) |
| PROC-008 | Documentation / handover | TOP / as-built / handover статус | Construction→CQV→readiness | PM; functional leads; director (обзор) | P-001 |
| PROC-009 | Readiness management | Готовность к вехам / старту | CQV→production readiness | director; PM; functional leads | P-001 |
| PROC-010 | Milestones / gates | Значимые точки и gate-критерии | все стадии | director; PM | P-001 |
| PROC-011 | Management reporting | Сжатая отчётность для стейкхолдеров | все стадии | director; PM; product owner (демо) | P-001, P-002, P-003 |

---

## PROC-001 — Schedule management

> **certainty:** fact
>
> По PMI Lexicon project schedule — linked activities с planned dates, durations, milestones и resources; baseline schedule изменяется через formal change control. (EV-007)

> **certainty:** hypothesis
>
> **Purpose:** вести согласованный план дат активностей и вех facility-проекта и видеть отклонения от baseline, влияющие на дату запуска / ключевые gates.
>
> **Типовые входы:** scope / WBS (рабочее), зависимости, ресурсы, baseline dates, фактический progress, impact от changes/risks/issues.
>
> **Типовые выходы:** актуальный schedule / milestone dates, forecast даты, список отклонений и critical-path сигналов (без утверждения метода EVA как обязательного).
>
> **Lifecycle:** сквозной Design → Construction → Equipment → CQV → production readiness; на pharma facility критический путь часто пересекает equipment (FAT/SAT) и CQV/docs (HYP-002 в registers / domain-overview).
>
> **Роли-кандидаты:** PM — ведение и согласование; director — обзор сдвига вех / даты запуска (H-002, H-003).
>
> **Проблемы:** напрямую поддерживает устранение «разрозненных статусов» (P-001) и решений по отклонениям без единой картины дат (P-002).

---

## PROC-002 — Budget / cost control

> **certainty:** fact
>
> AACE: project control — PDCA-цикл управления инвестированием ресурсов в создание / изменение актива на уровне проекта. (EV-006). PMI: cost baseline — approved version, изменяемая через change control. (EV-007)

> **certainty:** hypothesis
>
> **Purpose:** сопоставлять плановые и фактические затраты / commitments и прогнозировать перерасход относительно investment baseline.
>
> **Типовые входы:** budget baseline, commitments, actuals, change orders с cost impact.
>
> **Типовые выходы:** plan–fact, forecast at completion (рабочий смысл), alerts по отклонениям.
>
> **Lifecycle:** особенно Design → Equipment → CQV как инвестиционный контур; детальная привязка к стадиям — site-specific.
>
> **Роли-кандидаты:** PM (ведение); director (обзор инвестиционного здоровья) — **слабее** зафиксировано в product-context, чем schedule/readiness.

> **certainty:** open_question
>
> Входит ли budget/cost в первичный demo narrative и боли P-001…P-003, или это соседний контур ERP/finance? См. OQ-012.

---

## PROC-003 — Change control

> **certainty:** fact
>
> PMI Lexicon: change control — process, whereby modifications to documents, deliverables или baselines identified, documented, approved или rejected. (EV-007). ISPE Baseline C&Q среди ключевых тем указывает change management в контексте C&Q. (EV-001)

> **certainty:** hypothesis
>
> **Purpose:** формализовать изменения scope / design / baseline schedule-cost / конфигурации deliverables и оценивать impact на вехи и готовность — в **управленческом** контуре project controls, не как замена site PQS change control SOP.
>
> **Типовые входы:** запрос на изменение, описание impact (schedule, cost, quality/CQV, docs), решение approvers.
>
> **Типовые выходы:** approved/rejected change, обновлённые baselines, трассировка к затронутым milestones / documents / systems.
>
> **Lifecycle:** особенно Design (design freeze / DQ) и далее Construction→CQV, где late change бьёт по FAT/SAT, qualification и TOP (связь с HYP-002 / HYP-003).
>
> **Роли-кандидаты:** PM (координация); functional leads (оценка impact deliverables); director (крупный impact на дату запуска) — hypothesis по H-002…H-004.
>
> **Проблемы:** обоснованная связь с P-002 (решения по отклонениям / изменениям на разрозненных отчётах). Не утверждается как полный GMP change control предприятия.

> **certainty:** open_question
>
> Где граница «project change» vs «PQS/GMP change» в messaging демо (связано с OQ-003 / HIP-003)?

---

## PROC-004 — Risk management

> **certainty:** hypothesis
>
> **Purpose:** выявлять, ранжировать и мониторить риски, угрожающие вехам / дате запуска / бюджету / готовности, и связывать их с владельцами и mitigating actions в едином контуре статуса (H-003).
>
> **Типовые входы:** реестр рисков, триггеры из schedule/equipment/CQV/docs, экспертные оценки.
>
> **Типовые выходы:** risk register status, escalation к директору при угрозе ключевых вех, связь risk → milestone impact.
>
> **Lifecycle:** сквозной; на facility-проектах типичны риски long-lead equipment, contractor performance, CQV/documentation lag (согласуется с HYP-002 — без customer-specific списка).
>
> **Роли-кандидаты:** PM (ведение); director (обзор top risks к дате запуска) — H-002, H-003.
>
> **Проблемы:** P-001 (видимость зон риска), P-002 (решения без единого risk picture).

> **certainty:** assumption
>
> Здесь «risk» — **project** risk для project controls. Quality Risk Management (QRM) в смысле C&Q (EV-001) — смежный отраслевой контур; не смешиваем как один процесс продукта без явного решения (см. OQ-003).

---

## PROC-005 — Issue management

> **certainty:** hypothesis
>
> **Purpose:** фиксировать issues / punch / blockers, назначать владельцев и отслеживать закрытие до влияния на acceptance / вехи.
>
> **Типовые входы:** выявленный дефект или blocker, приоритет, связь с activity / system / contractor / document.
>
> **Типовые выходы:** issue status, aging, impact на milestone / readiness, закрытие с evidence ссылкой (без SOP закрытия).
>
> **Lifecycle:** особенно Construction → Equipment → CQV → readiness (punch list / handover — glossary hypothesis + контекст EV-008).
>
> **Роли-кандидаты:** PM; functional leads (H-003, H-004).
>
> **Проблемы:** P-001, P-002 — единый контур issues вместо устных статусов.

---

## PROC-006 — Contractor management

> **certainty:** hypothesis
>
> **Purpose:** вести пакеты работ подрядчиков, ответственных и статусы исполнения относительно schedule / milestones (без претензии на полный contract lifecycle / procurement SOP).
>
> **Типовые входы:** contractor / package, scope пакета, целевые даты, progress / issues.
>
> **Типовые выходы:** статус пакетов, отклонения, эскалации.
>
> **Lifecycle:** преимущественно Construction; стык с Equipment при installation packages.
>
> **Роли-кандидаты:** PM; functional leads — hypothesis.

> **certainty:** open_question
>
> Нужен ли отдельный процесс «contractors» в Demo v1 / первичном narrative, или достаточно contractor как атрибута activities/issues? См. OQ-013.

**Проблемы:** прямая связь с P-001…P-003 **не** утверждается — только косвенно через schedule delays (open_question).

---

## PROC-007 — Equipment / supply

> **certainty:** fact
>
> PIC/S Annex 15: для оборудования, особенно novel/complex, возможны FAT у vendor до поставки и SAT на manufacturing site; стадии qualification включают URS→DQ→FAT/SAT→IQ→OQ→PQ. (EV-003)

> **certainty:** hypothesis
>
> **Purpose:** отслеживать поставку long-lead / critical equipment, статусы FAT/SAT / installation и влияние на critical path даты запуска (HYP-002).
>
> **Типовые входы:** equipment package, planned ship/FAT/SAT/install dates, vendor/site results, punch после SAT.
>
> **Типовые выходы:** статус поставки/приёмки, forecast готовности к qualification, alerts сдвига.
>
> **Lifecycle:** стадия Equipment в domain-overview; перекрытия с Construction и вход в CQV.
>
> **Роли-кандидаты:** PM; functional leads (equipment / engineering) — H-003, H-004.
>
> **Проблемы:** обоснованно усиливает P-001 через видимость драйверов сдвига «ready for production» (HYP-002, HYP-003); не invents vendor SOP.

---

## PROC-008 — Documentation / handover (TOP)

> **certainty:** fact
>
> Turn Over Package (TOP) — организованный пакет документации по installed systems/equipment; критичен для C&Q и может поддерживать / leverage IQ; handover может быть при mechanical completion или позже — зависит от подхода. (EV-008). ISPE C&Q подчёркивает GEP documentation; PIC/S Part I — documented PQS. (EV-001, EV-009)

> **certainty:** hypothesis
>
> **Purpose:** в контуре project controls — статус комплектности и приёмки handover / TOP (или нейтрального «document package»), а не авторство содержимого SOP/QMS.
>
> **Типовые входы:** перечень требуемых docs per system/package, as-built, manuals, test records, статус review/acceptance.
>
> **Типовые выходы:** % / status completeness, blockers документации, связь с IQ/CQV и readiness.
>
> **Lifecycle:** накопление с Construction; критичность на CQV и production readiness (domain-overview § documentation).
>
> **Роли-кандидаты:** PM; functional leads; director — обзор документационного риска к вехе (HYP-003, HYP-004).
>
> **Проблемы:** P-001 (невидимость doc/TOP lag как драйвера сдвига). Messaging термина TOP vs handover — OQ-009.

> **certainty:** open_question
>
> Моделировать ли в демо inspection-ready document status отдельно от readiness/milestone? (OQ-008 / OQ-003)

---

## PROC-009 — Readiness management

> **certainty:** hypothesis
>
> **Purpose:** агрегировать готовность к ключевым вехам (в т.ч. ready for production / start) из статусов systems, CQV, docs, people/process signals — в сжатом виде для директора (H-002) и согласовании с PM (H-003).
>
> **Типовые входы:** статусы milestones/gates, CQV release signals, TOP/docs, open issues/risks, equipment complete.
>
> **Типовые выходы:** readiness status / rag, gap list до вехи, narrative для management reporting.
>
> **Lifecycle:** акцент CQV → production readiness (domain-overview §5); критерии release — site-specific (там же assumption).
>
> **Роли-кандидаты:** director (потребитель обзора); PM (сборка); functional leads (вклад deliverables) — H-002…H-004.
>
> **Проблемы:** ядро P-001 и H-002.

> **certainty:** fact
>
> Отраслевой контекст «готовности к регулируемой эксплуатации» опирается на documented PQS и suitable premises/equipment (EV-009, EV-010) — **не** как FR продукта и **не** как checklist заказчика.

---

## PROC-010 — Milestones / gates

> **certainty:** fact
>
> PMI: milestone — significant point or event; milestone schedule — milestones с planned dates. (EV-007)

> **certainty:** hypothesis
>
> **Purpose:** зафиксировать и отслеживать согласованный набор контрольных точек / gates (design freeze/DQ, MC, FAT/SAT, commissioning/IQ/OQ/PQ, TOP accepted, ready for production и т.д. — **кандидаты** из domain-overview) и критерии прохождения на уровне project controls.
>
> **Типовые входы:** определение milestone, planned/forecast date, entry/exit criteria (рабочие), evidence ссылки.
>
> **Типовые выходы:** milestone status, slippage, gate decision record (управленческий, не GMP batch release).
>
> **Lifecycle:** точки на всех стадиях; набор обязателен у заказчика — **неизвестен** (OQ-006).
>
> **Роли-кандидаты:** director (фокус на ключевых вехах); PM (ведение набора) — H-002, H-003.
>
> **Проблемы:** P-001.

---

## PROC-011 — Management reporting

> **certainty:** hypothesis
>
> **Purpose:** регулярно (или on-demand) собирать сжатый статус проекта для директора и stakeholders: вехи, readiness, top risks/issues, изменения с impact — вместо ручной склейки разрозненных отчётов (P-001, P-002).
>
> **Типовые входы:** выходы PROC-001…010 (по мере наличия в контуре).
>
> **Типовые выходы:** management pack / dashboard narrative, escalation list.
>
> **Lifecycle:** сквозной.
>
> **Роли-кандидаты:** director (audience); PM (producer); product owner — ценность живого demo narrative (P-003, H-001).
>
> **Проблемы:** P-001, P-002; косвенно P-003 (без убедительного reporting/status narrative сложно показать ценность project control).

> **certainty:** fact
>
> AACE описывает performance measurement и assessment как части PDCA project control — отраслевой каркас «измерять и оценивать отклонения», не UI-спека. (EV-006)

---

## Матрица процесс ↔ проблема (только обоснованное)

> **certainty:** hypothesis
>
> Связи ниже выведены из product-context (P-001…P-003, H-002…H-004) и domain-overview (HYP-002…HYP-004). Пустые / «—» = пробел, не искусственная полнота.

| Процесс | P-001 единый контур | P-002 решения по отклонениям | P-003 ценность без demo | Примечание |
|---------|---------------------|------------------------------|-------------------------|------------|
| PROC-001 Schedule | да | да (отклонения дат) | — | ядро статуса |
| PROC-002 Budget | OQ-012 | OQ-012 | — | не зафиксировано в P-* |
| PROC-003 Change | косвенно | да | — | не = site GMP change SOP; OQ-014 |
| PROC-004 Risk | да | да | — | project risk ≠ полный QRM |
| PROC-005 Issue | да | да | — | |
| PROC-006 Contractor | OQ-013 | OQ-013 | — | |
| PROC-007 Equipment | да (через дату запуска) | косвенно | — | HYP-002 |
| PROC-008 Documentation | да | косвенно | — | HYP-003/004; OQ-008 |
| PROC-009 Readiness | да | косвенно | — | H-002 |
| PROC-010 Milestones | да | косвенно | — | OQ-006 набор |
| PROC-011 Reporting | да | да | да (narrative) | P-003 |

---

## Что намеренно не фиксируется

- Детальные BPMN / RACI заказчика.
- Customer-specific SOP, Validation Master Plan contents, org chart.
- FR / MoSCoW Demo v1 (D4).
- Conceptual model сущностей (D3: `information-concepts.md`).

## Следующие шаги

1. Expert / customer: подтвердить критичные процессы (HIP-005) и закрыть OQ-012…OQ-014.
2. Сверка с `stakeholders.md` (D2-Stakeholders): уточнить роль↔процесс без искусственной полноты.
3. D3: сценарии на процессах с обоснованной связью к P-001…P-003; budget/contractor — только если OQ закрыты или явно как Could.
