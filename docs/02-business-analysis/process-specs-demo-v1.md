---
id: DOC-BA-013
title: Спецификации процессов (narrative Demo v1)
type: business
status: draft
version: 0.3.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-016
  - DOC-DISC-018
  - DOC-BA-011
  - DOC-BA-010
  - DOC-BA-014
sidebar_label: Спецификации процессов
---
# Спецификации процессов (narrative Demo v1)

Демонстрационная модель процессов для **SCN-001 → SCN-007**. Не SOP предприятия.

## 0. Обоснование включения / исключения

Цепочка: **equipment delay → фиксация отклонения → risk/issue → milestone RAG → forecast production start → director decision**.

| PROC (Discovery) | Вердикт | Вклад в SCN-001→007 |
|------------------|---------|---------------------|
| PROC-007 Equipment / supply | **in** | Инцидент и драйвер critical path (SCN-001) |
| PROC-001 Schedule | **in** | Явные baseline/forecast даты Equipment и Milestone (без сущности Activity) |
| PROC-005 Issue management | **in** | Фиксация отклонения как Issue с владельцем |
| PROC-004 Risk management | **in** | Risk RAG, связанный с delay / Issue |
| PROC-010 Milestones / gates | **in** | RAG и даты ключевой вехи ready-for-production |
| PROC-011 Management reporting | **in** | Exception-сводка для директора (SCN-007) |
| PROC-002 Budget | **out** | Нет в causal chain primary; OQ-012 |
| PROC-003 Change | **out** | SCN-008 не primary; OQ-014 |
| PROC-006 Contractor first-class | **out** | SCN-002 не primary; OQ-013 |
| PROC-008 Documentation / TOP | **out** | SCN-005 не primary |
| PROC-009 Readiness-by-area | **out** | SCN-006 optional only (HIP-006) |

> **certainty:** hypothesis
>
> Набор **in** — демо-модель; не подтверждение процессов заказчика.

---

## PROC-007 — Оборудование / поставки (demo) {#proc-007}

> **certainty:** hypothesis

**Вклад:** источник события задержки long-lead / critical equipment.

**Роли демо:** SH-006, SH-007; SH-002 координирует.

**Шаги:**

1. Зафиксировать плановую дату delivery/FAT (baselineDelivery).
2. Получить сигнал сдвига от поставщика / lead.
3. Обновить forecastDelivery и status пакета (напр. Delayed).
4. Отметить пакет как **critical driver** narrative: Equipment входит в **causal chain** к Milestone production start **через Issue и/или Risk** (Domain: Equipment→Issue/Risk→Milestone; **нет** прямой связи Equipment—Milestone). Дальше — PROC-005/004 и demo-правило **BR-004** на forecast dates.

**Входы:** идентификатор пакета, baselineDelivery, new forecastDelivery, owner.  
**Выходы:** обновлённый Equipment status и даты.  
**Решение в контуре:** эскалация в Issue/Risk (**не** контрактный claim / претензионный SOP).

**Не подразумевается:** прямая доменная связь Equipment—Milestone; авто-обновление всех зависимых прогнозов «движком»; исполнение recovery; полноценный supply-chain module.

---

## PROC-001 — Даты Schedule (demo, без сущности Activity) {#proc-001}

> **certainty:** hypothesis

**Вклад:** явные baseline/forecast даты, нужные для narrative (Equipment delivery и Milestone / Project production start).

**Роли:** SH-002.

**Шаги:**

1. Вести baseline vs forecast для critical Equipment delivery dates.
2. При сдвиге delivery применять **только** демонстрационное правило **BR-004** к forecast production start (Milestone / Project) — без CPM, float, dependency graph.
3. Не вводить отдельную доменную сущность Activity в Demo v1.

**Входы/выходы:** Equipment.baselineDelivery / forecastDelivery; Milestone/Project baseline и forecast production-start dates.

---

## PROC-005 — Управление Issue (demo) {#proc-005}

> **certainty:** hypothesis

**Вклад:** отклонение поставки становится управляемым Issue, а не «устным статусом».

**Роли:** SH-002 (owner), leads как contributors.

**Шаги:**

1. Создать Issue (напр. critical equipment delivery slip), linked to Equipment + Milestone.
2. Назначить owner (и при необходимости due реакции).
3. Вести статус Issue только в определённых значениях (см. ниже).

**Issue.status (согласовано с BR-006 / Domain Model):**

| Status | Смысл |
|--------|--------|
| Open | Зарегистрированное отклонение |
| Mitigating | После Decision **PrioritizeRecovery** (execution recovery не моделируется) |
| Closed | Явное закрытие; **не** авто из AcceptDateSlip |

**Не статусы Issue:**

- **AcceptDateSlip** — тип **Decision** директора (BR-006), не Issue.status.
- Авто-переход Issue после AcceptDateSlip — **не определён** (BA-OQ-004).

---

## PROC-004 — Управление Risk (demo) {#proc-004}

> **certainty:** hypothesis

**Вклад:** видимость угрозы вехе / дате запуска через Risk.rag.

**Роли:** SH-002; просмотр SH-001.

**Шаги:**

1. Иметь Risk, связанный с Issue и/или Equipment и Milestone.
2. Для Demo v1 при Issue.status ∈ {Open, Mitigating} ожидать Risk.rag = Red (**BR-002**); mock хранит fixture, integrity сверяет с ожиданием.
3. Директор использует Risk в impact view; mitigation execution **не** моделируется.

**Не подразумевается:** полноценный risk management engine; авто-исполнение recovery; произвольная Amber-шкала Must.

---

## PROC-010 — Вехи / gates (demo) {#proc-010}

> **certainty:** hypothesis

**Вклад:** ключевая контрольная точка «ready for production» / production start как объект дат и RAG.

**Роли:** SH-001 (обзор), SH-002 (ведение).

**Шаги:**

1. Иметь baselineDate и forecastDate вехи MS-PS.
2. Применять **только** явные demo-правила:
   - **BR-002** — Open/Mitigating Issue → expected Risk Red;
   - **BR-003** — linked Red Risk → expected Milestone Red;
   - **BR-004** — ограниченный сдвиг forecast dates от Δ equipment delivery;
   - **BR-006** — Decision сам по себе **не** запускает auto-reforecast.
3. Отразить результат в director forecast / impact view (PROC-011).

**Не подразумевается:** универсальный rules engine / пересчёт RAG от «любого» изменения любого объекта.

> **certainty:** open_question
>
> Точный набор имён вех заказчика — OQ-006; для демо достаточно одной ключевой вехи production start.

---

## PROC-011 — Управленческая отчётность (demo) {#proc-011}

> **certainty:** hypothesis

**Вклад:** директор получает exceptions, не полный операционный detail.

**Роли:** SH-002 готовит; SH-001 потребляет.

**Шаги:**

1. Агрегировать: delayed equipment, risk/issue, milestone RAG, forecast vs baseline production start.
2. Показать contributing driver (equipment).
3. Зафиксировать Decision (**AcceptDateSlip** / **PrioritizeRecovery**) — без исполнения recovery.

---

## Исключённые процессы

См. таблицу §0 и [ba-registers](./ba-registers.md). Не создавать specs для out-процессов в этой фазе.
