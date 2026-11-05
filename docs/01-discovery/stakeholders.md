---
id: DOC-DISC-015
title: Реестр и анализ заинтересованных сторон
type: discovery
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-012
  - DOC-DISC-013
  - DOC-DISC-010
  - DOC-DISC-011
---
# Stakeholder register and analysis

Реестр **кандидатных** ролей аудитории и участников контура project control для Discovery. Не org chart заказчика и не утверждённый RACI.

Реестры проблем: [registers.md](./registers.md). Вопросы человеку: [human-input-pack.md](./human-input-pack.md). Контекст ценности: [product-context.md](./product-context.md). Доменный lifecycle: [domain-overview.md](./domain-overview.md).

## 1. Назначение и границы

> **certainty:** assumption
>
> Ниже — **кандидатные роли** для демо-narrative и последующего BA, выведенные из product-context (директор / PM / functional leads) и типового facility-lifecycle (design → construction → equipment → CQV → readiness). Это **не** оргструктура конкретного предприятия.

> **certainty:** open_question
>
> Какие из кандидатных ролей реально критичны у заказчика и должны войти в demo personas? Подтверждение — **HIP-005** (expert/customer); уточнение набора и приоритета для демо — **HIP-009**.

> **certainty:** fact
>
> На фазе Discovery не утверждаются customer-specific FR/GMP и org chart заказчика (см. DOC-DISC-012 §4).

## 2. Реестр кандидатных ролей

> **certainty:** hypothesis
>
> Идентификаторы `SH-*` — рабочие ярлыки Discovery. Названия ролей — EN tech / отраслевые ярлыки; локальные должности заказчика могут отличаться.

| ID | Кандидатная роль (EN) | Рабочее имя (RU) | Источник кандидата |
|----|------------------------|------------------|--------------------|
| SH-001 | Enterprise director | Директор предприятия | DOC-DISC-012 §2.1; P-001/P-002 |
| SH-002 | Project manager | Руководитель проекта | DOC-DISC-012 §2.2; P-001/P-002 |
| SH-003 | Project Controls Manager | Руководитель project controls | Типовой контур AACE project control (EV-006) + gap к PM |
| SH-004 | Construction lead | Руководитель строительства | DOC-DISC-012 §2.3 (functional lead); domain construction |
| SH-005 | Design lead | Руководитель проектирования | DOC-DISC-012 §2.3; domain design |
| SH-006 | Procurement lead | Руководитель закупок | DOC-DISC-012 §2.3; long-lead equipment path |
| SH-007 | Equipment installation lead | Руководитель монтажа оборудования | DOC-DISC-012 §2.3; domain equipment/FAT–SAT |
| SH-008 | Financial controller | Финансовый контролёр | Типовой capital project controls (бюджет) — **без** привязки к P-* пока |
| SH-009 | Quality lead | Руководитель качества (проект / CQV-контекст) | Domain CQV / PQS context — membership в P-002 **не** зафиксировано |
| SH-010 | Documentation owners | Владельцы документации / handover (TOP) | Domain TOP / inspection readiness (EV-008) |
| SH-011 | Contractors | Подрядчики (строительство / монтаж / specialty) | Типовой execution layer facility-проекта |

## 3. Анализ по ролям (hypothesis)

Для каждой роли: цели, ответственность, решения, используемая информация, боли, потребности в отчётности — **рабочие гипотезы** до expert/customer.

### SH-001 — Enterprise director

> **certainty:** hypothesis
>
> **Цели:** видеть готовность к ключевым вехам и дате запуска / ввода без операционной детализации каждого контура (H-002, HYP-003).
>
> **Ответственность:** стратегические приоритеты завода/площадки; эскалации по отклонениям, влияющим на дату запуска и ресурсы.
>
> **Решения:** приоритет между проектами/пакетами при конфликтах ресурсов; принятие/отклонение крупных change с impact на готовность; запрос corrective action у PM.
>
> **Информация:** агрегированный статус проекта; RAG по вехам; топ-риски/issues; прогноз готовности к production readiness.
>
> **Боли:** нет единого управленческого контура (P-001); решения по устным и разрозненным отчётам (P-002).
>
> **Отчётность:** executive summary / dashboard готовности; исключения (exceptions), а не полный Gantt.

**Связь с проблемами:** P-001, P-002 — обосновано DOC-DISC-012 и registers.

### SH-002 — Project manager

> **certainty:** hypothesis
>
> **Цели:** единый контур статуса активностей, вех, рисков, issues, изменений со связью к артефактам (H-003).
>
> **Ответственность:** интеграция функциональных потоков; координация stakeholders; статус-репортинг дирекции; управление изменениями на уровне проекта.
>
> **Решения:** приоритизация issues/risks; эскалация к директору; согласование baseline/re-baseline вех с leads.
>
> **Информация:** schedule/milestones; risk/issue register; статус пакетов functional leads; связь deliverables ↔ вехи.
>
> **Боли:** ручная сборка статусов из разрозненных источников (P-001, P-002).
>
> **Отчётность:** статус проекта для директора и stewards; трассировка отклонений к владельцам.

**Связь с проблемами:** P-001, P-002 — обосновано DOC-DISC-012 и registers.

### SH-003 — Project Controls Manager

> **certainty:** hypothesis
>
> **Цели:** обеспечить измерение progress/performance против планов и оценку отклонений для corrective action (контекст EV-006); поддержать PM/директора данными, а не «отчётом ради отчёта».
>
> **Ответственность:** методология и качество данных project controls (schedule, cost при наличии, change impact, reporting cadence).
>
> **Решения:** правила измерения прогресса; состав KPI/вех в контуре контроля; качество baseline данных.
>
> **Информация:** планы vs факт; variance; forecast; change log; входные статусы от leads.
>
> **Боли:** *(кандидатно)* при отсутствии единого контура (P-001) роль вынуждена склеивать данные вручную — **вывод из определения роли**, не из явной формулировки P-001 в registers.
>
> **Отчётность:** control reports для PM/директора; drill-down по отклонениям.

> **certainty:** open_question
>
> Отдельна ли роль SH-003 от SH-002 у целевого заказчика, или совмещена в одном лице? См. OQ-010.

**Связь с проблемами:** условная гипотеза к P-001 (см. матрицу); не форсировать до подтверждения роли (HIP-009 / OQ-010).

### SH-004 — Construction lead

> **certainty:** hypothesis
>
> **Цели:** выполнить строительный/монтажный объём к согласованным вехам (в т.ч. mechanical completion); согласовать приоритеты с общим проектом (H-004).
>
> **Ответственность:** статус строительства, punch-list строительства, готовность к handover в commissioning.
>
> **Решения:** полевые приоритеты бригад/участков; эскалация блокеров (utilities, доступы, интерфейсы).
>
> **Информация:** план строительства; процент готовности / MC-критерии; punch; зависимости от design/equipment.
>
> **Боли:** конфликт «локально vs проект» при невидимости своих deliverables на общей картине вех (H-004 → контекст P-002 как functional lead).
>
> **Отчётность:** статус пакета construction → PM / project controls.

**Связь с проблемами:** P-002 — как экземпляр functional leads (DOC-DISC-012 §2.3; registers).

### SH-005 — Design lead

> **certainty:** hypothesis
>
> **Цели:** закрыть design / DQ-критерии в срок; снизить поздние design changes, бьющие по construction/equipment/CQV.
>
> **Ответственность:** статус пакетов проектирования, design freeze / DQ-related gates (кандидаты milestone — DOC-DISC-013).
>
> **Решения:** приём design package; эскалация открытых design issues с impact на дату.
>
> **Информация:** URS/design status; open design queries; связь с procurement long-lead.
>
> **Боли:** как у functional lead — непрозрачная связь deliverables с вехами проекта (H-004 / P-002).
>
> **Отчётность:** design readiness / open items → PM.

**Связь с проблемами:** P-002 — functional lead (DOC-DISC-012 §2.3).

### SH-006 — Procurement lead

> **certainty:** hypothesis
>
> **Цели:** обеспечить поставки (особенно long-lead) в согласованные окна под установку и FAT/SAT.
>
> **Ответственность:** статус закупок/поставок; vendor milestones; влияние задержек на критический путь (HYP-002).
>
> **Решения:** приоритизация заказов; эскалация vendor delays; альтернативы поставки.
>
> **Информация:** PO/vendor status; FAT dates; lead times; связь с installation windows.
>
> **Боли:** задержки поставок не видны директору/PM в одном контуре вовремя (контекст P-002 / HYP-002) — **как functional lead**, не отдельная проблема P-*.
>
> **Отчётность:** procurement/equipment supply status → PM / controls.

**Связь с проблемами:** P-002 — functional lead (DOC-DISC-012 §2.3).

### SH-007 — Equipment installation lead

> **certainty:** hypothesis
>
> **Цели:** установка и приёмка оборудования на сайте в окнах, согласованных с construction и CQV.
>
> **Ответственность:** статус installation / SAT; punch оборудования; готовность к commissioning/qualification.
>
> **Решения:** последовательность монтажа; эскалация site readiness / utility interfaces.
>
> **Информация:** FAT→поставка→SAT/installation; зависимости от construction MC; вход в CQV.
>
> **Боли:** как functional lead — разрыв между локальным статусом и общей картиной вех (H-004 / P-002).
>
> **Отчётность:** installation readiness → PM / quality/CQV stakeholders.

**Связь с проблемами:** P-002 — functional lead (DOC-DISC-012 §2.3).

### SH-008 — Financial controller

> **certainty:** hypothesis
>
> **Цели:** контроль бюджета / forecast капитального проекта; прозрачность cost impact от change и задержек.
>
> **Ответственность:** cost reporting; согласование финансовых последствий change (типовой capital controls).
>
> **Решения:** эскалация budget variance; вход в go/no-go по дорогостоящим change (совместно с PM/директором).
>
> **Информация:** budget vs actual / EAC; change cost; контрактные обязательства.
>
> **Боли / отчётность:** *не выведены* из P-001…P-004 — в текущем product-context акцент на статус/готовность, не на cost controls.

> **certainty:** open_question
>
> Входит ли Financial controller в боль единого status-контура демо и в P-001/P-002, или роль вне первого narrative? См. OQ-011.

**Связь с проблемами:** нет обоснованной связи с P-001…P-004 на текущих evidence — пробел (OQ-011).

### SH-009 — Quality lead

> **certainty:** hypothesis
>
> **Цели:** обеспечить, что C&Q / qualification gates и quality-related документация не блокируют «ready for production» неожиданно (контекст DOC-DISC-013 CQV; HYP-003).
>
> **Ответственность:** статус qualification/commissioning gates с quality-владением; отклонения/deviations с quality impact (типовой контекст, не FR заказчика).
>
> **Решения:** accept/reject по quality gates; эскалация unresolved deviations.
>
> **Информация:** статус IQ/OQ/PQ (или C&Q); open deviations; связь с TOP/handover.
>
> **Боли / P-*:** явно **не** поименованы в P-001/P-002 (там director, PM, functional leads без уточнения Quality).

> **certainty:** open_question
>
> Считать ли Quality lead экземпляром «functional leads» для P-002 / H-004, или отдельным контуром (PQS), слабо связанным с первым demo narrative? См. OQ-011, HIP-009.

**Связь с проблемами:** не зафиксирована — пробел.

### SH-010 — Documentation owners

> **certainty:** hypothesis
>
> **Цели:** комплектность и своевременность handover / TOP (и родственных пакетов) как enabler C&Q и inspection-oriented прослеживаемости (EV-008; HYP-004).
>
> **Ответственность:** статус документации по systems/packages; закрытие documental punch.
>
> **Решения:** готовность пакета к accept; эскалация missing as-built / manuals / drawings.
>
> **Информация:** checklist TOP/handover; трассировка design→as-built→commissioning docs.
>
> **Боли / P-*:** в registers нет отдельной проблемы «документационный разрыв»; связь с P-001 возможна только косвенно (документы как часть статуса готовности) — **не** утверждается.

> **certainty:** open_question
>
> Нужны ли Documentation owners как отдельная persona демо или достаточно статуса docs/TOP внутри milestone readiness? См. OQ-011; также OQ-008/OQ-009 в registers.

**Связь с проблемами:** не зафиксирована — пробел.

### SH-011 — Contractors

> **certainty:** hypothesis
>
> **Цели:** выполнить контрактный объём в срок и с требуемым качеством/документацией; получить приёмку пакетов.
>
> **Ответственность:** полевой прогресс, сдача работ, punch закрытие в зоне контракта.
>
> **Решения:** внутри контрактной зоны; эскалации через construction lead / PM.
>
> **Информация:** объём контракта, график пакета, punch, interface с другими подрядчиками.
>
> **Боли / P-*:** P-001/P-002 сформулированы про директора и stakeholders **заказчика**, не про подрядный контур.

> **certainty:** open_question
>
> Входит ли contractor view в Demo v1 narrative или подрядчики остаются «источником статуса» без отдельной persona? См. OQ-011.

**Связь с проблемами:** не зафиксирована — пробел.

## 4. Матрица роль ↔ проблема (только обоснованные)

> **certainty:** hypothesis
>
> Связи ниже — только там, где есть опора в DOC-DISC-012 / registers. Отсутствие строки ≠ «роль не важна»; ≠ искусственная полнота.

| Роль | P-001 | P-002 | P-003 | P-004 | Обоснование |
|------|:-----:|:-----:|:-----:|:-----:|-------------|
| SH-001 Enterprise director | ✓ | ✓ | — | — | DOC-DISC-012 §1–2.1; registers «director» |
| SH-002 Project manager | ✓ | ✓ | — | — | DOC-DISC-012 §2.2; registers «PM» |
| SH-003 Project Controls Manager | ? | — | — | — | Кандидатная поддержка контура P-001; роль не в исходной формулировке P-001 → OQ-010 |
| SH-004 Construction lead | — | ✓ | — | — | Functional lead, DOC-DISC-012 §2.3 |
| SH-005 Design lead | — | ✓ | — | — | Functional lead, DOC-DISC-012 §2.3 |
| SH-006 Procurement lead | — | ✓ | — | — | Functional lead, DOC-DISC-012 §2.3 |
| SH-007 Equipment installation lead | — | ✓ | — | — | Functional lead, DOC-DISC-012 §2.3 |
| SH-008 Financial controller | — | — | — | — | Нет обоснования в P-* → OQ-011 |
| SH-009 Quality lead | — | — | — | — | Не поименован в P-002 → OQ-011 |
| SH-010 Documentation owners | — | — | — | — | Нет P-* → OQ-011 |
| SH-011 Contractors | — | — | — | — | Нет P-* → OQ-011 |

P-003 / P-004 относятся к **product owner / demo framing**, не к customer-ролям этого регистра — в матрицу stakeholder-ролей не проецируются.

## 5. Пробелы и следующие шаги

> **certainty:** open_question
>
> 1. Подтвердить/сузить набор SH-* у заказчика (**HIP-005**, **HIP-009**).
> 2. Развести SH-002 vs SH-003 (**OQ-010**).
> 3. Решить membership SH-008…SH-011 (и SH-009) в боли P-001/P-002 и в demo cast (**OQ-011**).
> 4. После process-inventory (D2-Processes, другой агент) — только **обоснованные** связи роль↔процесс; здесь процессы намеренно не инвентаризируются.

## Связанные артефакты

| Артефакт | Роль |
|----------|------|
| [product-context.md](./product-context.md) | Ценность director / PM / functional leads |
| [domain-overview.md](./domain-overview.md) | Lifecycle-контекст ролей execution / CQV / docs |
| [registers.md](./registers.md) | P-001…P-004, OQ, HIP cross-links |
| [human-input-pack.md](./human-input-pack.md) | HIP-005, HIP-009 |
| [process-inventory.md](./process-inventory.md) | D2-Processes (параллельный агент; не редактируется здесь) |
