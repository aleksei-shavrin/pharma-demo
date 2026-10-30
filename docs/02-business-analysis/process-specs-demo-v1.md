---
id: DOC-BA-013
title: "Process specs (Demo v1 narrative)"
type: business
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-016
  - DOC-DISC-018
  - DOC-BA-011
  - DOC-BA-010
---

# Process specs (Demo v1 narrative)

Демонстрационная модель процессов для **SCN-001 → SCN-007**. Не SOP предприятия.

## 0. Обоснование включения / исключения

Цепочка: **equipment delay → фиксация отклонения → risk/issue → milestone RAG → forecast production start → director decision**.

| PROC (Discovery) | Вердикт | Вклад в SCN-001→007 |
|------------------|---------|---------------------|
| PROC-007 Equipment / supply | **in** | Инцидент и драйвер critical path (SCN-001) |
| PROC-001 Schedule | **in** | Плановые/прогнозные даты активностей и связь с вехой |
| PROC-005 Issue management | **in** | Фиксация отклонения как issue с владельцем |
| PROC-004 Risk management | **in** | Риск срыва вехи / даты запуска, связанный с delay |
| PROC-010 Milestones / gates | **in** | RAG ключевой вехи ready-for-production |
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

## PROC-007 — Equipment / supply (demo)

> **certainty:** hypothesis

**Вклад:** источник события задержки long-lead / critical equipment.

**Роли демо:** SH-006, SH-007; SH-002 координирует.

**Шаги:**

1. Зафиксировать плановую дату delivery/FAT (baseline).
2. Получить сигнал сдвига от поставщика / lead.
3. Обновить прогнозную дату и статус пакета (напр. Delayed).
4. Связать пакет с milestone production start / critical flag.

**Входы:** идентификатор пакета, baseline date, new forecast date, owner.  
**Выходы:** обновлённый Equipment/Delivery status.  
**Решение в контуре:** эскалация в risk/issue (не контрактный claim).

---

## PROC-001 — Schedule (demo)

> **certainty:** hypothesis

**Вклад:** держит даты активностей, связанных с equipment path и вехой.

**Роли:** SH-002.

**Шаги:**

1. Вести planned vs forecast dates для critical equipment activity.
2. При сдвиге delivery — обновить forecast activity/milestone link.
3. Не требует полного CPM-движка в Demo v1 — достаточно явных дат и связи.

**Входы/выходы:** Activity dates; link to Equipment, Milestone.

---

## PROC-005 — Issue management (demo)

> **certainty:** hypothesis

**Вклад:** отклонение поставки становится управляемым issue, а не «устным статусом».

**Роли:** SH-002 (owner), leads как contributors.

**Шаги:**

1. Создать Issue «Critical equipment delivery slip» linked to Equipment + Milestone.
2. Назначить owner и due date реакции.
3. Обновлять статус (Open / Mitigating / Accepted-slip / Closed).

---

## PROC-004 — Risk management (demo)

> **certainty:** hypothesis

**Вклад:** видимость угрозы вехе / дате запуска (RAG risk).

**Роли:** SH-002; просмотр SH-001.

**Шаги:**

1. Открыть/обновить Risk, связанный с Issue/Equipment.
2. Установить impact на Milestone (RAG).
3. Предложить mitigation (recovery) или принять residual (для решения директора).

---

## PROC-010 — Milestones / gates (demo)

> **certainty:** hypothesis

**Вклад:** ключевая контрольная точка «ready for production» / production start как объект RAG.

**Роли:** SH-001 (обзор), SH-002 (ведение).

**Шаги:**

1. Иметь baseline и forecast date вехи.
2. Пересчитать/установить RAG при изменении linked risk/issue/equipment.
3. Отразить влияние на director forecast view.

> **certainty:** open_question
>
> Точный набор имён вех заказчика — OQ-006; для демо достаточно одной ключевой вехи production start.

---

## PROC-011 — Management reporting (demo)

> **certainty:** hypothesis

**Вклад:** директор получает exceptions, не полный операционный detail.

**Роли:** SH-002 готовит; SH-001 потребляет.

**Шаги:**

1. Агрегировать: delayed equipment, open risk/issue, milestone RAG, forecast vs baseline date.
2. Показать contributing driver (equipment).
3. Зафиксировать решение директора (Accept date slip / Prioritize recovery) как исход narrative.

---

## Исключённые процессы

См. таблицу §0 и [ba-registers](./ba-registers.md). Не создавать specs для out-процессов в этой фазе.
