---
id: DOC-DISC-012
title: "Product context"
type: discovery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-001
  - DOC-PROD-003
  - DOC-DISC-010
  - DOC-DISC-011
---

# Product context

Краткий контекст ценности **Pharma Project Control** на уровне Discovery. Не заменяет [vision-and-scope](../03-product/vision-and-scope.md) и не дублирует tech constraints Demo v1.

Реестры: [registers.md](./registers.md). Вопросы человеку: [human-input-pack.md](./human-input-pack.md).

## 1. Проблема, на которую нацелен продукт

> **certainty:** hypothesis
>
> На фармацевтическом предприятии директора завода и заинтересованные стороны проекта не имеют единого управленческого контура, в котором статус проектных активностей, готовность и связанные артефакты видны согласованно. Следствие — решения принимаются по разрозненным отчётам и устным статусам, а демонстрация ценности «project control» затруднена без живого showcase.

> **certainty:** hypothesis
>
> Ближайший практический фокус Discovery — **демо-narrative** для директора завода и project stakeholders как showcase возможностей low-code / platform-подхода (web UI + API), а не утверждённый заказчиковый FR/GMP-пакет. См. P-001…P-003, H-001 в [registers](./registers.md).

> **certainty:** open_question
>
> Является ли primary framing демо «showcase платформы / low-code» или «standalone product MVP project control»? См. HIP-007.

## 2. Ценность по ролям (рабочие гипотезы)

### 2.1 Директор предприятия (enterprise director)

> **certainty:** hypothesis
>
> Директор получает сжатый обзор хода проектов и готовности к ключевым вехам (в т.ч. к дате запуска / ввода) без погружения в операционную детализацию каждого функционального контура. Ценность — быстрее видеть отклонения и зоны риска на уровне завода. См. H-002.

### 2.2 Руководитель проекта (project manager)

> **certainty:** hypothesis
>
> PM ведёт единый контур статуса: активности, вехи, риски, issues, изменения — с прозрачной связью к артефактам и отчётности для стейкхолдеров. Ценность — меньше ручной сборки статусов из разрозненных источников. См. H-003.

### 2.3 Функциональные руководители (functional leads)

> **certainty:** hypothesis
>
> Функциональные руководители видят, как их deliverables и готовность связаны с проектными вехами и общим статусом, и согласуют приоритеты с PM / дирекцией на общей картине. Ценность — меньше конфликтов приоритетов «локально vs проект». См. H-004.

> **certainty:** open_question
>
> Какая из трёх гипотез ценности должна вести первый demo narrative? Связано с HIP-001 / HIP-006; уточнение приоритета — HIP-008.

## 3. Product (target) vs Demo v1

> **certainty:** fact
>
> Различие **целевого продукта** и **Demo v1**, а также зафиксированные tech constraints Demo v1, уже согласованы на уровне product seed и **не переопределяются** в Discovery. Источники SoT:
>
> - направление vision / scope: [vision-and-scope.md](../03-product/vision-and-scope.md) (`DOC-PROD-001`);
> - границы и правила Demo v1 (FE/BE, mock только в NestJS, FE только через API, без PostgreSQL): [demo-v1-architecture.md](../03-product/demo-v1-architecture.md) (`DOC-PROD-003`).

> **certainty:** assumption
>
> Discovery уточняет **контекст ценности, роли, процессы и кандидаты сценариев** для демо; engineering-ограничения Demo v1 считаются входным фактом плана и только **ссылаются**, не пересказываются как новые решения.

## 4. Границы на уровне контекста

| В зоне Discovery (исследуем) | Уже решено вне Discovery (ссылаемся) |
|------------------------------|--------------------------------------|
| Проблема и ценность для ролей (hypothesis) | Tech stack direction и Demo v1 architecture constraints |
| Кандидаты аудитории и demo narrative | ADR по локальным URL / proxy (не дублировать) |
| Связи роль ↔ процесс ↔ боль (позже D2–D3) | Запрет выдуманных FR/GMP как `fact` без источника |
| Предварительные boundaries / MoSCoW candidates (D4) | Изменения `openspec/**` — вне фазы Discovery |
| Применимость к конкретному предприятию | Код `apps/web`, `apps/api`, PostgreSQL — вне фазы |

> **certainty:** fact
>
> На текущей фазе Discovery **не** утверждаются customer-specific FR, GMP/CSV требования или org chart заказчика. Любая отраслевая лексика в демо — вопрос messaging (HIP-003), не нормативный факт.

> **certainty:** open_question
>
> Горизонт демо (один завод / один проект / multi-project) и наличие отраслевого эксперта — открыты; см. OQ-002, OQ-004 и HIP-002, HIP-004.

## Связанные артефакты

| Артефакт | Роль |
|----------|------|
| [vision-and-scope.md](../03-product/vision-and-scope.md) | Product seed: направление vision |
| [demo-v1-architecture.md](../03-product/demo-v1-architecture.md) | SoT tech boundaries Demo v1 |
| [registers.md](./registers.md) | Problems / Hypotheses / OQ / Evidence |
| [human-input-pack.md](./human-input-pack.md) | Вопросы product owner / expert |
| [discovery-phase-plan.md](../07-delivery/discovery-phase-plan.md) | План фазы Discovery |
