---
id: DOC-RPT-MILESTONE-CAND-001
title: 'Отчёт: исследование кандидатов рендерера шкалы вех (C09–C11)'
type: delivery
status: draft
version: 0.2.0
created: '2026-11-06'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-DEL-001
  - DOC-UX-022
  - DOC-DEL-PHARMA-CALL-001
---
# Исследование кандидатов рендерера «Контрольные вехи» (C09–C11)

Дата: 2026-11-06. Агент **MilestoneResearch**. На момент исследования зависимости **не** устанавливались.

> **Update 2026-11-06:** libs установлены; эксперимент C09–C11 выполнен — см. [2026-11-06-c09-c11-timeline-renderer-compare.md](./2026-11-06-c09-c11-timeline-renderer-compare.md).

## Границы

| В scope | Вне scope |
|---------|-----------|
| C09–C11: два сторонних кандидата (vis-timeline, Apache ECharts), ссылки на живые примеры, оценка доработок под контракт данных | **G07–G11** (Schedule / DHTMLX Gantt, ADR-0004) |
| Подготовка к эксперименту §13 [pharma-demo-call-work-plan.md](../pharma-demo-call-work-plan.md) | **C10** (переключатель 1/2/3), **C11** (протокол сравнения) — только после выбора libs и установки |
| | **Выбор библиотек и `npm install`** — ждут явного решения человека |

Базовый рендерер (вариант «1»): [`ExecutiveMilestoneStrip`](../../../apps/web/src/components/dashboard/executive-milestone-strip.tsx) + [`executive-timeline.ts`](../../../apps/web/src/lib/dashboard/executive-timeline.ts).

Норматив UX: [demo-v1-r2-ux-delta.md](../../05-ux-ui/demo-v1-r2-ux-delta.md) — 12 стабильных ID, горизонт `01.02.2027–30.09.2027`, RAG, маркер снимка, кластер Production Start (baseline ↔ forecast).

---

## Общий контракт данных (до C09)

Источник — `DashboardOverview` (API). Единая точка подготовки презентации:

```487:524:apps/web/src/lib/dashboard/executive-timeline.ts
export function resolveExecutiveTimelinePresentation(
  data: DashboardOverview,
): ExecutiveTimelinePresentation {
  // … executiveMilestoneIds (12, обязателен MS-PS) …
  // points: forecastDate → ratio, rag, shortLabel, layout slots
  // band: productionStartVariance (baseline/forecast, Δ)
  // chrome: snapshot + зарезервированная зона PS cluster
}
```

**C09** должен подавать в оба рендерера **тот же снимок**, что и шкала «1»: результат `resolveExecutiveTimelinePresentation(data)` (или тонкий mapper поверх него), плюс `data.scenarioAsOfDate` для as-of. Логику integrity (`ExecutiveMilestoneIntegrityError`, порядок ID, `MS-PS`) **не дублировать** в адаптерах libs.

---

## 1. vis-timeline

**Лицензия:** Apache-2.0 OR MIT. **Официальной React-обёртки нет** — client component + `useEffect`, mount/unmount, `vis-timeline/standalone` (или peer `vis-data`).

### Живые примеры (официальная галерея visjs)

| Задача демо | URL |
|-------------|-----|
| **Точечная шкала (point items)** | https://visjs.github.io/vis-timeline/examples/timeline/items/pointItems.html |
| **Вертикальный маркер даты (as-of / customTime)** | https://visjs.github.io/vis-timeline/examples/timeline/other/customTimeBars.html |
| **Несколько перетаскиваемых customTime-маркеров** (поведение drag — для демо отключить) | https://visjs.github.io/vis-timeline/examples/timeline/markers/customTimeMarkers.html |
| Справка API: `type: 'point'`, `addCustomTime`, `setCustomTime` | https://visjs.github.io/vis-timeline/docs/timeline/ |

Для as-of в демо: `timeline.addCustomTime(new Date(scenarioAsOfDate), 'snapshot')`, подпись через `setCustomTimeTitle` / `setCustomTimeMarker`; `zoomable: false`, `moveable: false`, `showCurrentTime: false`, **editable customTime: false** (не давать таскать «дату снимка»).

### Доработки под executive milestones

| Элемент домена | Маппинг / custom work |
|----------------|------------------------|
| **12 ID** (`executiveMilestoneIds` или fallback из `executive-timeline-ids.ts`) | `vis.DataSet` items: `id`, `start: forecastDate`, `type: 'point'`, `content` / `title` = RU `shortLabel` + `name`; `className` по `rag` (Green/Red) |
| **forecastDate** | Ось X = время; `timeline.setWindow(TIMELINE_HORIZON_START, TIMELINE_HORIZON_END)` — без горизонтального скролла (UX) |
| **RAG** | CSS-классы `.vis-item.rag-green` / `.rag-red` под light/dark (токены приложения / DS, не литералы в компоненте фичи без исключений) |
| **scenarioAsOfDate** | Отдельный vertical bar: `addCustomTime` (см. customTimeBars), не смешивать с point items |
| **MS-PS band** (baseline + forecast, Δ, coincident) | **Не** один point: два item (`type: 'point'`) или один `type: 'range'` baseline→forecast + HTML overlay для «кластера PS» (как сейчас `ProductionStartCluster`); vis **не** даёт готовый `○───●` + consolidated annotation — нужен overlay или `template`/`group` кастом |
| **Подписи / коллизии** (`labelSide`, `labelLane`, `labelNudgePx`, `slots`) | Встроенный layout vis слабее R2-U1: либо **упрощённый** experiment layout, либо **поверх** canvas — HTML/SVG labels по координатам из `ExecutiveTimelinePresentation` (переиспользовать ratio → px) |
| **Месячные деления** | `format` / `timeAxis` options или фоновые `type: 'background'` на 1-е число месяца (Mar–Sep) |
| **Ссылки на сущности** | `click` / `select` на item → `entityDetailHref` (как в strip) |
| **a11y** | Сохранить `buildTimelineTextSummary(data)` рядом с canvas |
| **React** | Ref на контейнер, `ResizeObserver` → `timeline.redraw()`; cleanup `timeline.destroy()` |

**Риски для C11:** drag/zoom по умолчанию, плотность подписей в августе–сентябре, паритет PS cluster с вариантом «1».

---

## 2. Apache ECharts

**Лицензия:** Apache-2.0.

### Живые примеры (официальный Examples / Handbook)

| Задача демо | URL |
|-------------|-----|
| **Точки на горизонтальной оси (база для «вехи как точки»)** | https://echarts.apache.org/examples/en/editor.html?c=scatter-single-axis |
| **markLine (вертикальная/опорная линия — паттерн as-of)** | https://echarts.apache.org/examples/en/editor.html?c=line-markline |
| **markPoint на серии (альтернатива scatter для отдельных дат)** | https://echarts.apache.org/examples/en/editor.html?c=line-markpoint |
| **Time axis + markLine `xAxis: 'YYYY-MM-DD'`** (описание в доке option) | https://echarts.apache.org/handbook/en/concepts/axis/ + partial markLine (`xAxis` для `type: 'time'`) |

**Интеграция as-of для Demo:** `xAxis: { type: 'time', min, max }` (горизонт Feb–Sep 2027), серия `scatter` или `line` с `data: [[forecastDate, y], …]`, **`markLine` на той же series**: `{ xAxis: scenarioAsOfDate, name: 'Дата снимка' }`. MarkLine привязан к **series**, не к `xAxis` (типичная ошибка — см. FAQ/Stack Overflow). Строковые ISO-даты на time axis — OK в актуальных патчах (регресс 5.2.0 исправлен в 5.2.1+).

**Эталон time + markLine + markPoint** (не на echarts.apache.org, но официальный тест Apache): https://github.com/apache/echarts/blob/master/test/marker-case.html — полезен интегратору при первом spike.

### Доработки под executive milestones

| Элемент домена | Маппинг / custom work |
|----------------|------------------------|
| **12 ID + forecastDate** | `series[].data`: `[ms, laneY]` или одна ось Y=константа + `symbolSize` по RAG; цвет через `itemStyle` / `visualMap` discrete (Green/Red) |
| **RAG** | Два цвета series или `itemStyle.color` callback; tooltip: `shortLabel`, прогноз, «В норме» / «Критично» |
| **scenarioAsOfDate** | `markLine.data: [{ xAxis: data.scenarioAsOfDate, … }]` на основной series; `silent: true` при необходимости |
| **MS-PS band** | Два scatter/markPoint (baseline, forecast) + `markLine` connector или `markArea` между датами; текст «Запуск производства / План → прогноз» — `graphic` / rich `label` или **React overlay** (`ProductionStartCluster` логику переиспользовать) |
| **Коллизии подписей** | `labelLayout`, `hideOverlap`, или внешние labels из `ExecutiveTimelinePresentation` (как для vis) |
| **Темы light/dark** | `registerTheme` + CSS variables / palette приложения; `setOption` при смене темы |
| **Resize** | `echarts.init` + `ResizeObserver` → `chart.resize()` |
| **Tree-shaking** | `echarts/core` + регистрация только `ScatterChart`, `LineChart`, `GridComponent`, `TooltipComponent`, `MarkLineComponent`, … |

### Нужна ли `echarts-for-react`?

**Не обязательна.** Для C09 достаточно паттерна, симметричного vis-timeline:

- `'use client'` компонент;
- `useRef` на DOM;
- `useEffect`: `init` → `setOption(mapper(presentation))` → `dispose` на unmount;
- отдельный effect на `theme` / `width` / смену snapshot → `setOption(..., { notMerge: false })` + `resize`.

`echarts-for-react` даёт декларативный `option` и встроенный resize, но добавляет зависимость и слой абстракции. **Решение — после human go на ECharts** (Integrator-2); для эксперимента с тремя переключателями imperative API предсказуемее и согласован с отсутствием React-обёртки у vis.

---

## 3. Сводка для человека (блокер установки)

1. **Подтвердить пару** для вариантов «2» и «3»: vis-timeline + Apache ECharts (или замену одного из кандидатов).
2. **ECharts:** только `echarts` (+ tree-shaken imports) **или** дополнительно `echarts-for-react`.
3. После ответа — Integrator-2: install, общий mapper `ExecutiveTimelinePresentation → …`, два renderer-компонента, затем **C10** (toggle) и **C11** (протокол §13: снимки A–S, as-of, плотные вехи, узкий viewport, light/dark).

**G07–G11** (интервалы, стрелки, DHTMLX) в этом исследовании **не рассматриваются**.

---

## 4. Быстрые ссылки (для review)

### vis-timeline

- Точки: https://visjs.github.io/vis-timeline/examples/timeline/items/pointItems.html  
- As-of (customTime): https://visjs.github.io/vis-timeline/examples/timeline/other/customTimeBars.html  

### Apache ECharts

- Точки на оси: https://echarts.apache.org/examples/en/editor.html?c=scatter-single-axis  
- Mark line (as-of паттерн): https://echarts.apache.org/examples/en/editor.html?c=line-markline  
