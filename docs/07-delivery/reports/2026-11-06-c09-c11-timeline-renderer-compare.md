---
id: DOC-RPT-C09-C11-001
title: 'Отчёт C09–C14: сравнение и доработка рендереров шкалы вех'
type: delivery
status: draft
version: 0.3.0
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-DEL-PHARMA-CALL-001
  - DOC-UX-004
  - DOC-RPT-MILESTONE-CAND-001
---

# C09–C14: сравнение рендереров «Контрольные вехи»

Дата: 2026-11-06. **G07–G11** вне scope этого эксперимента (отдельный этап Schedule).

## Контракт

`resolveExecutiveTimelineExperimentModel` — один набор вех, горизонт, as-of. Default = вариант **1**.

Доработка C12–C13: общие хелперы подписей — `executive-timeline-experiment-labels.ts`; chrome даты снимка — `ExecutiveTimelineSnapshotChrome`.

## Что видно без наведения (после C12–C13)

| Вариант | Видимые подписи | Где библиотека ограничивает |
|---------|-----------------|-----------------------------|
| **1** current | `shortLabel` + даты, PS-кластер, «Дата снимка» | Собственная геометрия — эталон |
| **2** vis | `shortLabel` в вертикальных **groups** (above/below × lane); PS range «+21 день»; chrome «Дата снимка» над шкалой | Нет HTML-маркеров уровня strip (точки слабее); правые подписи могут клипаться краем; нет per-item collision beyond groups; фон/оси библиотеки приходится глушить CSS |
| **3** ECharts | `shortLabel` с `position` top/bottom + distance по lane; PS «План» / Δ; chrome «Дата снимка» над шкалой; линия as-of без усечённого «Снимок» | Label overlap на canvas при очень плотных датах; на узкой ширине часть label скрывается правилом приоритета (полный name в tooltip) |

## Правило приоритета (узкая ширина &lt; 520px)

1. Дата снимка (chrome) + линия as-of  
2. PS / Δ  
3. Red RAG → вне плотного кластера → остальные (cap ~6)  
4. Скрытое — в tooltip с полным названием  

## Таблица сравнения (A и C, light/dark)

| Критерий | 1 | 2 vis | 3 ECharts |
|----------|---|-------|-----------|
| Маркер as-of | эталон | линия + chrome | линия + chrome |
| Близкие вехи | лучшая читаемость | улучшено groups; всё ещё плотнее 1 | stagger label; плотные пары читаются хуже 1 |
| PS на C | кластер | range + «+21 день» | markArea + План/Δ |
| Фон шкалы | card | transparent (без sunken fill) | canvas на card |
| Контраст light/dark | токены | text + text-shadow на surface | CSS vars + theme observer |
| Узкая ширина | коллапс меток | groups + priority | priority + tooltip |

## Скриншоты (раунд доработки)

Каталог: [assets/c09-c11-timeline-compare-v2/](./assets/c09-c11-timeline-compare-v2/).

| Файл | Содержание |
|------|------------|
| `A-light-1-current.png` | Эталон |
| `A-light-2-vis.png` / `A-light-3-echarts.png` | A light, 2 и 3 |
| `C-light-2-vis.png` / `C-light-3-echarts.png` | C light, близкие вехи + PS |
| `C-dark-2-vis.png` / `C-dark-3-echarts.png` | C dark |
| `C-tablet-3-echarts.png` | ~768px (частичный кадр) |

Первый раунд (до C12): [assets/c09-c11-timeline-compare/](./assets/c09-c11-timeline-compare/).

## Решение (2026-11-06)

**Принято человеком:**

| Решение | Деталь |
|---------|--------|
| Основной рендерер | **Вариант 1** — текущая шкала (`ExecutiveMilestoneStrip`) |
| Эксперимент | Переключатель **1 / 2 / 3** **сохраняется** (не Must Demo v1) |
| Замена | **Не** выполнять: варианты 2 и 3 остаются сравнительными |

Следующий этап работ по графику — **G07–G11** (интервалы работ, семантические цвета полос, четыре типа стрелок) на странице «График»; см. [pharma-demo-call-work-plan.md](../pharma-demo-call-work-plan.md) §15 и UX [demo-v1-schedule-workspace.md](../../05-ux-ui/demo-v1-schedule-workspace.md).
