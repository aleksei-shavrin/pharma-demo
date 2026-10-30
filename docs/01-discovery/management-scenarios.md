---
id: DOC-DISC-018
title: "Management scenarios catalog"
type: discovery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-012
  - DOC-DISC-015
  - DOC-DISC-016
  - DOC-DISC-010
---

# Management scenarios catalog

Каталог **гипотетических** управленческих сценариев (demo narratives) для Discovery Pharma Project Control. Это **не** SOP заказчика, **не** утверждённый scope Demo v1 и **не** нормативные GMP/FR.

Источники связей: [product-context](./product-context.md) (DOC-DISC-012), [stakeholders](./stakeholders.md) (DOC-DISC-015), [process-inventory](./process-inventory.md) (DOC-DISC-016), [registers](./registers.md) (DOC-DISC-010). Выбор приоритетного narrative — **HIP-006** / **OQ-015**.

## Назначение и границы

> **certainty:** assumption
>
> Для Discovery достаточно 6+ сценариев-кандидатов с участниками, информацией, решением и demo value, чтобы D4 (boundaries / MoSCoW) и D5 (narrative) опирались на явный каталог, а не на ad-hoc storytelling.

> **certainty:** open_question
>
> Какой сценарий (или связка) станет primary demo narrative? См. HIP-006, OQ-015; приоритет аудитории — HIP-001 / HIP-008.

## Правила certainty и трассировки

| Утверждение | Certainty |
|-------------|-----------|
| Сценарий как кандидат demo narrative | `hypothesis` |
| Связь SCN ↔ P-\* / PROC-\* / SH-\* | `hypothesis` **только** если обоснована DOC-DISC-012/015/016 / registers; иначе `open_question` |
| Customer-specific события / SOP / org RACI | **не** фиксируются как `fact` |

Слабые или опциональные рёбра (budget, contractors как first-class) **не** усиливаются искусственно — см. OQ-012, OQ-013.

---

## Сводка кандидатов

> **certainty:** hypothesis
>
> Ниже — отраслево-типичные управленческие ситуации facility-проекта, релевантные P-001…P-003 и H-002…H-004. Набор **не** утверждён как обязательный cast Demo v1.

| ID | Тема | Ядро процессов | Проблемы (обоснованные) | Слабые / OQ |
|----|------|----------------|-------------------------|-------------|
| SCN-001 | Задержка critical equipment | PROC-007, PROC-001, PROC-004, PROC-010, PROC-011 | P-001, P-002; косвенно P-003 | — |
| SCN-002 | Подрядчик отстаёт от графика | PROC-001, PROC-005, PROC-010, PROC-011 | P-001, P-002 (через schedule/issues) | PROC-006 → OQ-013 |
| SCN-003 | Cost overrun | PROC-002, PROC-011; опц. PROC-003 | *(не форсировать P-*)* | OQ-012 |
| SCN-004 | Риск ключевой вехи | PROC-004, PROC-010, PROC-001, PROC-011 | P-001, P-002 | — |
| SCN-005 | Docs не готовы к inspection | PROC-008, PROC-009, PROC-010, PROC-011 | P-001; косвенно P-002 | OQ-008, OQ-009; SH-009 → OQ-011 |
| SCN-006 | Конфликт readiness между units | PROC-009, PROC-001, PROC-005, PROC-011 | P-001, P-002 | — |
| SCN-007 | Угроза даты production start | PROC-001, PROC-007, PROC-008, PROC-009, PROC-010, PROC-011 | P-001, P-002; P-003 (narrative) | — |
| SCN-008 | Late change с impact на readiness | PROC-003, PROC-001, PROC-010, PROC-011 | P-002; косвенно P-001 | OQ-014 |

---

## SCN-001 — Задержка critical / long-lead equipment

> **certainty:** hypothesis
>
> **Начальная ситуация:** facility-проект на стыке Equipment и CQV; critical path даты запуска проходит через long-lead equipment (FAT/SAT / installation) — согласуется с HYP-002 / HYP-003. Дирекция ожидает сжатый обзор готовности к вехе, а не детальный vendor Gantt.
>
> **Участники:** SH-001 (director — audience), SH-002 (PM), SH-006 (procurement), SH-007 (equipment installation); опционально SH-003 (controls) — только если роль не совмещена (OQ-010).
>
> **Событие / проблема:** поставщик сообщает сдвиг FAT/поставки; устные статусы procurement и installation расходятся с «зелёным» summary для дирекции.
>
> **Нужная информация:** плановая vs прогнозная дата FAT/SAT / installation; связь пакета equipment с milestone «ready for production» / gate; top risk/issue; владельцы и RAG по критическому пути.
>
> **Последовательность действий:**
>
> 1. PM фиксирует отклонение в едином контуре (schedule + risk/issue), а не только в переписке.
> 2. Procurement / installation обновляют статус пакета и прогноз даты.
> 3. Система показывает impact на milestone / readiness (не отдельный «остров» Excel).
> 4. PM готовит exception-отчёт для директора (PROC-011).
> 5. Директор эскалирует приоритет / запрашивает corrective action.
>
> **Принятое решение:** принять сдвиг вехи **или** ускорить параллельные работы / alternate path с явным владельцем — на общей картине impact, а не по устным заверениям.
>
> **Ожидаемый управленческий исход:** ранняя видимость угрозы дате запуска; согласованный RAG и владельцы; меньше сюрпризов на статус-митинге.
>
> **Demo value:** показывает ядро ценности «единый контур» (P-001) и решений по отклонениям (P-002) на понятном драйвере critical path (equipment); сильный story для H-002 / HYP-003.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-001, P-002 | DOC-DISC-012; registers; equipment как драйвер даты запуска (DOC-DISC-016 PROC-007) |
| P-003 | косвенно — убедительный narrative без живого сценария слаб |
| PROC-007, PROC-001, PROC-004, PROC-010, PROC-011 | обосновано process-inventory |
| SH-001, SH-002, SH-006, SH-007 | DOC-DISC-015 + functional leads к equipment path |
| SH-003 | **open_question** — OQ-010 |

---

## SCN-002 — Подрядчик отстаёт от графика

> **certainty:** hypothesis
>
> **Начальная ситуация:** Construction (и/или specialty install): пакет работ подрядчика на критическом / near-critical пути; PM собирает статусы из отчётов подрядчика и leads.
>
> **Участники:** SH-002 (PM), SH-004 (construction lead), SH-001 (director — при эскалации impact на веху); SH-011 (contractor) — как источник статуса / объект контроля, не как primary persona UI. First-class «contractor management» как отдельный модуль — **OQ-013**.
>
> **Событие / проблема:** подрядчик систематически отстаёт; локальный статус «почти готово» не согласован с project schedule и punch/issues.
>
> **Нужная информация:** план–факт активностей пакета; связанные issues/punch; impact на milestone; владелец corrective action; (опционально) идентификатор contractor как атрибут activity/issue.
>
> **Последовательность действий:**
>
> 1. Construction lead обновляет прогресс / фиксирует issue.
> 2. PM связывает отставание со schedule и milestone RAG.
> 3. Формируется exception для директора при угрозе вехе.
> 4. Решение: recovery plan, перестановка приоритетов пакетов или эскалация контрактных рычагов **вне** детального contract admin в демо.
>
> **Принятое решение:** утвердить recovery plan с датой и владельцем **или** принять сдвиг связанной вехи — видимо в одном контуре.
>
> **Ожидаемый управленческий исход:** отставание подрядчика перестаёт быть «устным» — видно влияние на проектный RAG и вехи.
>
> **Demo value:** показывает интеграцию functional status → project milestones (H-003 / H-004) без необходимости полного contractor ERP.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-001, P-002 | через schedule / issues / reporting (PROC-001, PROC-005, PROC-011) — обосновано |
| PROC-006 | **open_question** — нужен ли first-class процесс в Demo v1 (OQ-013); до закрытия — contractor как атрибут activities/issues |
| SH-002, SH-004, SH-001 | обосновано DOC-DISC-015 |
| SH-011 | участник события; membership в P-* **не** форсируется (OQ-011) |

---

## SCN-003 — Cost overrun (перерасход бюджета)

> **certainty:** hypothesis
>
> **Начальная ситуация:** инвестиционный цикл Design→CQV; появляется variance план–факт / forecast overrun по пакету или проекту.
>
> **Участники:** SH-002 (PM); SH-001 (director) — при значимом overrun; SH-008 (financial controller) — **кандидат**, без зафиксированной связи с P-* в DOC-DISC-015.
>
> **Событие / проблема:** прогноз затрат превышает baseline; директор спрашивает «как это бьёт по запуску / приоритетам», а данные cost живут в соседнем Excel/ERP отдельно от readiness.
>
> **Нужная информация:** план / факт / forecast; variance; (если в scope) связь change с cost impact; **не** утверждается полный EVM заказчика.
>
> **Последовательность действий:**
>
> 1. Контролёр / PM фиксирует overrun в cost view (если контур в продукте).
> 2. PM сопоставляет с change / scope (PROC-003) при наличии.
> 3. Reporting для директора: cost exception **рядом** со статусом вех — только если OQ-012 закрыт «в narrative».
>
> **Принятое решение:** reforecast / cut scope / escalate funding — как управленческий исход narrative; детали finance workflow **вне** Discovery fact.
>
> **Ожидаемый управленческий исход:** overrun видим как управляемое исключение, а не сюрприз в конце периода.
>
> **Demo value:** **условный** — силён, если budget входит в primary narrative; иначе показывает соседний контур и риск расползания scope демо.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| PROC-002 | кандидат process-inventory |
| P-001…P-003 | **open_question** — OQ-012; **не** форсировать ребро |
| SH-008 | кандидат роли без P-*; OQ-011 |
| SH-001, SH-002 | audience/producer отчётности — условно, если cost в контуре |

---

## SCN-004 — Риск ключевой вехе (milestone at risk)

> **certainty:** hypothesis
>
> **Начальная ситуация:** приближается значимая веха / gate (напр. MC, FAT, IQ/OQ gate, ready for production — конкретный набор **OQ-006**); риск зарегистрирован, но impact на дату вехи не виден директору в одном месте.
>
> **Участники:** SH-001, SH-002; при необходимости functional lead-владелец риска (SH-004…SH-007 по контексту).
>
> **Событие / проблема:** риск повышается по вероятности/impact; без единого risk→milestone link решения идут по разрозненным реестрам.
>
> **Нужная информация:** risk register (описание, владелец, RAG); linked milestone(s); residual impact на schedule/readiness; предложенные mitigations.
>
> **Последовательность действий:**
>
> 1. PM / lead обновляет риск и связь с вехой.
> 2. Management report показывает «milestone at risk» как exception.
> 3. Директор утверждает mitigation или принимает сдвиг вехи.
>
> **Принятое решение:** запустить mitigation с владельцем и due date **или** формально принять риск со сдвигом gate.
>
> **Ожидаемый управленческий исход:** веха и риск в одном управленческом контуре; меньше «рисков в таблице, зелёных вех в презентации».
>
> **Demo value:** чистая демонстрация P-001/P-002 и H-002 без ухода в детальный QRM предприятия (project risk ≠ полный site QRM — см. DOC-DISC-016).

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-001, P-002 | registers + PROC-004/010/011 |
| PROC-004, PROC-010, PROC-001, PROC-011 | process-inventory |
| SH-001, SH-002 | DOC-DISC-015 |
| Конкретный набор milestone | **open_question** — OQ-006 |

---

## SCN-005 — Документация / TOP не готовы к inspection-readiness

> **certainty:** hypothesis
>
> **Начальная ситуация:** Construction→CQV→readiness; физический прогресс «почти зелёный», но handover / TOP / as-built / qualification docs отстают. Framing «inspection readiness» на этапе facility-проекта — HYP-004 (не полный Site Master File).
>
> **Участники:** SH-002 (PM), SH-010 (documentation owners), SH-001 (director — обзор doc risk к вехе); SH-009 (quality) — **опционально**, membership в P-002 не зафиксировано (OQ-011).
>
> **Событие / проблема:** перед ожидаемой проверкой / gate по документации пакеты не закрыты; статус docs не виден в том же контуре, что readiness/milestones.
>
> **Нужная информация:** статус пакетов документации / handover (TOP vs нейтральный «handover» — OQ-009); связь с milestone / readiness; открытые gaps; нужна ли явная метка inspection-ready в Demo v1 — OQ-008.
>
> **Последовательность действий:**
>
> 1. Documentation owners обновляют статус пакетов.
> 2. Readiness / milestone RAG учитывает doc lag (не только «железо»).
> 3. PM эскалирует exception директору.
> 4. Решение: ускорить закрытие пакетов / сдвинуть gate / сузить scope проверки.
>
> **Принятое решение:** приоритет закрытия критичных doc packages с владельцами **или** перенос вехи с явным обоснованием doc risk.
>
> **Ожидаемый управленческий исход:** документационный лаг видим как драйвер сдвига готовности (HYP-003), а не «бумага отдельно».
>
> **Demo value:** дифференцирует pharma facility narrative от «чистого стройконтроля»; усиливает P-001 через невидимый иначе драйвер.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-001 | PROC-008 в process-inventory; HYP-003/004 |
| P-002 | косвенно (решения по doc risk) — не форсировать как единственный драйвер |
| PROC-008, PROC-009, PROC-010, PROC-011 | обосновано |
| SH-002, SH-010, SH-001 | DOC-DISC-015 |
| SH-009; UI-термины TOP / inspection-ready | **open_question** — OQ-008, OQ-009, OQ-011 |

---

## SCN-006 — Конфликтующие статусы readiness между units

> **certainty:** hypothesis
>
> **Начальная ситуация:** несколько функциональных контуров (напр. construction vs equipment vs docs/CQV) отчитывают локальную готовность; агрегированный «проект готов» противоречив.
>
> **Участники:** SH-001 (нужен единый сигнал), SH-002 (сшивка), functional leads SH-004 / SH-007 / SH-010 (типовой конфликт «железо vs docs»); состав leads — гипотеза до HIP-009.
>
> **Событие / проблема:** один unit — green, другой — red/amber; без единого readiness model директор получает взаимоисключающие слайды.
>
> **Нужная информация:** readiness по dimensions/units; roll-up правила к project RAG; linked issues; владельцы расхождений.
>
> **Последовательность действий:**
>
> 1. Leads обновляют свои readiness signals в общем контуре.
> 2. PM видит конфликт roll-up и связанные issues.
> 3. Status meeting опирается на один экран, а не на три презентации.
> 4. Директор задаёт приоритет выравнивания (какой unit критичен к дате запуска).
>
> **Принятое решение:** выровнять критерии готовности / назначить owner на блокирующий unit / принять временный amber с планом.
>
> **Ожидаемый управленческий исход:** исчезновение «локально зелёных» противоречий; общее понимание блокиратора.
>
> **Demo value:** прямая иллюстрация P-001 («нет единого контура») и H-004 (связь deliverables leads с вехами); сильный anti-PowerPoint story для P-003.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-001, P-002 | ядро product-context |
| P-003 | narrative ценности единого статуса |
| PROC-009, PROC-001, PROC-005, PROC-011 | process-inventory |
| SH-001, SH-002, SH-004, SH-007, SH-010 | обоснованные кандидаты; полный cast — HIP-009 / OQ-011 |

---

## SCN-007 — Угроза дате production start / ready for production

> **certainty:** hypothesis
>
> **Начальная ситуация:** сквозной взгляд директора на дату запуска; critical path — пересечение schedule, equipment, CQV/docs и readiness (HYP-002, HYP-003). Это **композитный** сценарий (часто финал демо-турa после SCN-001/005/006).
>
> **Участники:** SH-001 (primary audience), SH-002 (producer), selected leads по драйверам отклонения.
>
> **Событие / проблема:** прогноз «ready for production» сдвигается; причины размазаны по контурам; без единого impact view нельзя решить, что чинить первым.
>
> **Нужная информация:** forecast даты vs baseline; contributing drivers (equipment / docs / construction / risks); top exceptions; owners.
>
> **Последовательность действий:**
>
> 1. Контур агрегирует драйверы сдвига (из PROC-001/007/008/009/004…).
> 2. Management report для директора — exceptions, не полный Gantt.
> 3. Директор выбирает приоритет recovery (какой драйвер гасить).
> 4. PM транслирует решение в actions leads.
>
> **Принятое решение:** утвердить recovery portfolio (1–2 драйвера) **или** официально перенести production start date с коммуникацией stakeholders.
>
> **Ожидаемый управленческий исход:** управляемый сдвиг или целевое восстановление даты; прозрачность trade-offs.
>
> **Demo value:** лучший end-to-end showcase P-001…P-003 и H-002; кандидат на primary narrative (HIP-006), если audience = director.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-001, P-002, P-003 | registers + reporting narrative |
| PROC-001, PROC-007, PROC-008, PROC-009, PROC-010, PROC-011 | ядро HYP-008 |
| PROC-004 / PROC-005 | часто как supporting |
| SH-001, SH-002 | DOC-DISC-012 §2.1–2.2 |

---

## SCN-008 — Late project change с impact на readiness

> **certainty:** hypothesis
>
> **Начальная ситуация:** поздний change baseline / deliverable на Design→CQV стыке; нужно понять impact на даты, docs и readiness до «тихого» выполнения в одном контуре.
>
> **Участники:** SH-002 (PM), затронутые functional leads, SH-001 (при значимом impact на готовность).
>
> **Событие / проблема:** change запрошен; оценки impact разрознены; риск спутать **project change** с site PQS/GMP change control — messaging **OQ-014** / HIP-003.
>
> **Нужная информация:** описание change; затронутые activities/milestones/docs; impact RAG; решение approve/reject/defer.
>
> **Последовательность действий:**
>
> 1. Initiator / PM регистрирует project change.
> 2. Leads дают impact на свои контуры в одном месте.
> 3. PM сводит impact для директора при необходимости.
> 4. Решение фиксируется; schedule/readiness обновляются.
>
> **Принятое решение:** approve с re-baseline / reject / defer до после вехи.
>
> **Ожидаемый управленческий исход:** изменение не «теряется» между письмами; impact на готовность явен до исполнения.
>
> **Demo value:** усиливает P-002 (решения по отклонениям/изменениям); осторожный messaging нужен, чтобы не выдать demo за полный GMP change SOP.

**Trace**

| Связь | Обоснование |
|-------|-------------|
| P-002 | PROC-003 в process-inventory |
| P-001 | косвенно (единый impact) |
| PROC-003, PROC-001, PROC-010, PROC-011 | обосновано |
| Граница vs GMP change | **open_question** — OQ-014 |

---

## Приоритизация для D4 / D5 (рабочая)

> **certainty:** hypothesis
>
> **Сильные кандидаты primary narrative (director-led):** SCN-007 (композит), SCN-001, SCN-006, SCN-005 — опираются на обоснованные P-001/P-002 и HYP-002…004.
>
> **Supporting / drill-down:** SCN-004, SCN-008, SCN-002 (без обязательного first-class PROC-006 до OQ-013).
>
> **Could / conditional:** SCN-003 — только после OQ-012 (budget в narrative vs ERP).

> **certainty:** open_question
>
> Итоговый выбор primary scenario — HIP-006 / OQ-015; framing platform vs MVP — HIP-007 / P-004.

## Связанные артефакты

| Артефакт | Роль |
|----------|------|
| [product-context.md](./product-context.md) | Проблемы и ценность ролей |
| [stakeholders.md](./stakeholders.md) | SH-* |
| [process-inventory.md](./process-inventory.md) | PROC-* |
| [registers.md](./registers.md) | P-*, HYP-*, OQ-*, Evidence |
| [human-input-pack.md](./human-input-pack.md) | HIP-006…HIP-009 |
| product-boundaries / demo-v1-scope-candidates | D4 — вне этого файла |
