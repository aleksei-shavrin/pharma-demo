---
id: DOC-BA-011
title: "Business context and problems (Demo v1)"
type: business
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-012
  - DOC-DISC-021
  - DOC-DISC-010
  - DOC-BA-010
---

# Business context and problems (Demo v1)

Синтез контекста **только** для narrative **SCN-001 → SCN-007**. Не клон [product-context](../01-discovery/product-context.md); детали Discovery — по ссылкам.

## 1. Направление демо (PO)

> **certainty:** fact
>
> Primary audience — директор; secondary — PM / Project Controls; UX-приоритет — управленческий вид директора; PM — операционный пользователь контура. Primary story — SCN-001→SCN-007. Источник: [human-input-pack](../01-discovery/human-input-pack.md), [discovery-summary](../01-discovery/discovery-summary.md).

## 2. Проблемы в фокусе Demo v1

| ID | Проблема | Certainty | Связь с narrative |
|----|----------|-----------|-------------------|
| P-001 | Нет единого управленческого контура статуса | hypothesis | Director не видит согласованно equipment delay → веха → дата запуска |
| P-002 | Решения по отклонениям на разрозненных отчётах | hypothesis | SCN-001/007: выбор recovery vs сдвиг даты |
| P-003 | Сложно показать ценность без живого demo | hypothesis | Закрывается наличием связной истории (не FR) |

Источник формулировок: [registers](../01-discovery/registers.md), [product-context](../01-discovery/product-context.md).

## 3. Ценностные гипотезы (ведущие)

| ID | Гипотеза | Роль в Demo v1 | Certainty |
|----|----------|----------------|-----------|
| H-002 | Директор — целостное представление готовности, вех, угроз дате запуска | **Ведущая** (HIP-008) | hypothesis |
| H-003 | PM — единый контур вместо ручной консолидации | **Supporting** (HIP-008) | hypothesis |

## 4. Цель Demo v1 (бизнес)

> **certainty:** hypothesis
>
> Показать, что задержка critical / long-lead equipment, зафиксированная в едином контуре, согласованно влияет на RAG контрольной точки и прогноз даты production start, и поддерживает управленческое решение директора (принять сдвиг **или** приоритезировать recovery) — без претензии на GMP system of record.

## 5. Вне фокуса этой фазы

> **certainty:** assumption
>
> Budget first-class, contractor module, docs/TOP Must, readiness-by-area (SCN-006), multi-project, auth/PG — вне обязательного Demo v1 (см. Discovery MoSCoW / HIP-006).
