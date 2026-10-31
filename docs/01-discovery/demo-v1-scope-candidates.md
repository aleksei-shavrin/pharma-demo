---
id: DOC-DISC-020
title: "Demo v1 scope candidates (preliminary MoSCoW)"
type: discovery
status: draft
version: "0.2.1"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-DISC-018
  - DOC-DISC-019
  - DOC-PROD-003
  - DOC-DISC-011
  - DOC-DISC-021
---

# Demo v1 scope candidates (preliminary MoSCoW)

> **certainty:** assumption
>
> **Must / Should / Could / Won’t** ниже — **предварительная приоритизация кандидатов** для демо. Это **не** утверждённые функциональные требования и **не** обязательства по реализации. Утверждение scope — после BA/REQ и OpenSpec в **следующих** фазах; выбор narrative — **владелец продукта** (HIP-006).

Tech constraints: [demo-v1-architecture](../03-product/demo-v1-architecture.md). Сценарии: [management-scenarios](./management-scenarios.md). Границы: [product-boundaries](./product-boundaries.md).

## Rubric отбора

| # | Критерий | Вес |
|---|----------|-----|
| 1 | Демо-ценность для директора / PM | высокий |
| 2 | End-to-end связность данных (один narrative) | высокий |
| 3 | Реалистичность без GMP-compliance theater | высокий |
| 4 | Визуальная убедительность (статусы, timeline, impact) | средний |
| 5 | Сложность vs Demo v1 (FE+API+mock, без PG/auth) | высокий |
| 6 | Риск scope creep | высокий (штраф) |

## Рекомендуемый primary narrative (кандидат)

> **certainty:** hypothesis
>
> **Связка SCN-001 → SCN-007** (задержка long-lead equipment → угроза даты production start): сильный impact для директора (H-002), единый контур для PM (H-003), опирается на PROC-001/007/010/011 и P-001/P-002, хорошо ложится на mock данные (пакеты оборудования, вехи, риски).

> **certainty:** fact
>
> Product Owner утвердил primary narrative **SCN-001 → SCN-007** (HIP-006). SCN-006 — необязательная доп. сцена; **не** расширять Demo v1 только ради неё. См. [human-input-pack](./human-input-pack.md).

## Матрица сценарий × кандидат возможности

| Кандидат (capability sketch) | SCN-001 | SCN-002 | SCN-003 | SCN-004 | SCN-005 | SCN-006 | SCN-007 | SCN-008 | MoSCoW* |
|------------------------------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| C-01 Project + phases overview | x | x | x | x | x | x | x | x | Must |
| C-02 Milestones / gates + RAG | x | x | | x | | x | x | x | Must |
| C-03 Equipment / delivery status | x | | | | | | x | | Must |
| C-04 Risk & issue register + link to milestone | x | x | | x | | | x | x | Must |
| C-05 Impact view: delay → production start | x | | | x | | | x | | Must |
| C-06 Readiness status by area/system | | | | | x | x | x | | Should |
| C-07 Document / handover package status | | | | | x | | | | Should |
| C-08 Contractor performance snapshot | | x | | | | | | | Could |
| C-09 Budget vs actual strip | | | x | | | | | | Could |
| C-10 Formal change workflow (PQS-grade) | | | | | | | | x | Won’t |
| C-11 Full CQV protocol execution UI | | | | | | | | | Won’t |
| C-12 Auth / multi-tenant / PostgreSQL | | | | | | | | | Won’t |

\*MoSCoW = предварительный ранг для Demo v1 narrative, не backlog commitment.

## Must (предварительно)

> **certainty:** hypothesis
>
> C-01…C-05 достаточны для end-to-end narrative SCN-001→SCN-007 на mock API: проект, вехи, оборудование, риск/issue, impact на дату запуска.

## Should

> **certainty:** hypothesis
>
> C-06, C-07 усиливают SCN-005/006, если product owner выберет docs/readiness narrative или расширит primary.

## Could

> **certainty:** hypothesis
>
> C-08, C-09 — полезны, но слабее трассировка к P-* (OQ-012/013) и выше риск «ещё один модуль» в mock.

## Won’t (Demo v1)

> **certainty:** assumption
>
> - C-10…C-12 и любая полная регуляторная валидация / CSV как GxP system of record.
> - PostgreSQL, production auth (уже вне Demo v1 architecture).
> - Реализация всего PROC-001…011.

## Human gate

| ID | Решение | Адресат | Статус |
|----|---------|---------|--------|
| HIP-006 | Primary narrative SCN-001→SCN-007; SCN-006 optional | product owner | answered |
| HIP-001 / HIP-008 | Primary audience директор; H-002 leading / H-003 supporting | product owner | answered |

Discovery Phase — **completed**. Таблица MoSCoW выше — исторический Discovery-кандидат (**не** FR).

> **certainty:** fact
>
> Согласованный Demo v1 freeze Must **C-01…C-05** (без C-06/C-07 как Must) зафиксирован **BA-OQ-001** (2026-10-31) в [demo-v1-functional-scope](../03-product/demo-v1-functional-scope.md) / [ba-registers](../02-business-analysis/ba-registers.md). Это не повышает достоверность процессов предприятия.
