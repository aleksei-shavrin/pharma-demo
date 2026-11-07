---
id: DOC-ADR-0004
title: 'ADR-0004: Рендерер timeline Schedule (D12) — dhtmlx-gantt Community'
type: adr
status: draft
version: 0.4.2-draft
created: '2026-11-01'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-UX-005
  - DOC-UX-018
  - DOC-ADR-0002
---
# ADR-0004: Рендерер timeline Schedule (D12) — dhtmlx-gantt Community

- **Статус решения:** accepted
- **Document lifecycle (`status` frontmatter):** `draft` — как у остальных ADR репозитория; решение D12 при этом **accepted** (не путать со `status: approved` документации).
- **Дата:** 2026-11-01

## Контекст

Demo v1 Schedule (D10/D11) needs a **read-only** secondary timeline for Milestone + Equipment delivery control points. Library choice was **D12 deferred**. I6 shipped Table + disabled Split/Timeline readiness. I7 resolves D12 and ships a real renderer without becoming a scheduling engine.

Spike checked npm/`LICENSE.md` for `dhtmlx-gantt@10.0.3`: **MIT** Community (`gantt.license === "mit"`). v9.x remains GPL — **not** used.

## Решение

> **certainty:** fact
>
> - **Renderer:** `dhtmlx-gantt` **Community Edition** pinned **`10.0.3`** (MIT).
> - **Integration:** core package + **project-owned React adapter** (`DhtmlxGanttAdapter`). No commercial React wrapper. No PRO/trial packages. No PRO APIs (`addTaskLayer`, built-in baselines, etc.).
> - **Boundary:** only the adapter imports `dhtmlx-gantt`. Schedule API/DTO, Domain, and Nest remain library-agnostic.
> - **Logical row model:** exactly **one** DHTMLX zero-duration `milestone` row per Schedule control point. Logical identity = `{ kind, entityId }` (presentation id `kind:entityId`). `deltaDays` **never** becomes DHTMLX `duration` / `type: 'task'`.
> - **Forecast:** `forecastDate` is the DHTMLX milestone `start_date` (primary marker; Equipment diamond / Milestone RAG geometry via CSS).
> - **Baseline:** when `baselineDate !== forecastDate`, a **project-owned overlay** ghost marker is painted on the **same** logical row. Baseline is **not** a second DHTMLX task/row. Overlay X from Community `posFromDate(baseline)`; Y from `getTaskPosition` of the logical row. Click maps to the same selection key.
> - **Fit-to-data / scale:** visible range = min/max of all baseline+forecast dates + modest padding; v10 `config.scales` month-only (`%F %Y`) with Russian locale; compact project-owned viewport height (`10.5rem`).
> - **Variance connector:** **not** implemented (would need PRO `addTaskLayer`, fake duration, or dependency link). Legend distinguishes forecast vs baseline.
> - **Theme:** adapter remaps vendor `--dhx-gantt-*` CSS variables to app design-system tokens under `.ppc-gantt-host` (Light/Dark).
> - **Selection:** Table ↔ Timeline sync at logical-row level; no horizontal auto-scroll that breaks fit-to-data.
> - **Read-only:** `readonly`, drag/link creation disabled; `links: []`.

## Разделение ответственности (Demo v1)

| Layer | Owns |
|---|---|
| **DHTMLX Community** | Logical row; forecast milestone; timeline scale/grid; row geometry |
| **Project adapter** | `ScheduleItem` → presentation row; baseline ghost overlay; logical selection; fit-to-data; design-system theme overrides |

This is a Demo v1 **presentation** compromise — not a general-purpose baseline/scheduling framework.

## Последствия

### Положительные

- MIT license fits closed Demo packaging.
- Point semantics match BA/UI (baseline/forecast are dates, not work bars).
- One visible row per control point (A/B/C = 2 rows for Demo fixtures).
- Multiple instances via `Gantt.getGanttInstance()` for React lifecycle.

### Отрицательные / компромиссы

- No PRO `addTaskLayer` / built-in baselines — baseline is a project overlay.
- No connector line between baseline and forecast.
- Vendor CSS requires scoped token remapping for shell Light/Dark.
- Height must stay project-owned (definite viewport) to avoid DHTMLX resize→render growth.

## Альтернативы

- **Fake duration task** styled as variance connector — **rejected** (encodes delta as work duration).
- **Dual DHTMLX rows** (`…:baseline` / `…:forecast`) — **rejected** for rendering (looked like two entities); legacy id parsing may remain for compatibility only.
- **SVAR React Gantt** / **Frappe Gantt** / **custom SVG** — not selected after DHTMLX GO.
- **dhtmlx-gantt ≤9.x (GPL)** — rejected (license).
- **DHTMLX PRO** — rejected (license/cost/scope).

## Addendum: расширение G07–G11 (works + links)

> **certainty:** fact (демо-контракт согласован 2026-11-06). Curated fixtures ещё открыты — [запрос аналитику](../../07-delivery/reports/2026-11-06-g07-g11-analyst-questions.md). Реализация API/FE — после подвыборки. Норматив UX: [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md) v0.3.1-draft. OpenSpec: demo-v1-schedule-work-bars-links (`openspec/changes/archive/2026-11-07-demo-v1-schedule-work-bars-links/proposal.md`).
>
> **G12** (переименование в «Календарный план») — **вне** этого addendum; см. DOC-UX-005 §7.

### Контекст addendum

I7 зафиксировал только control points (milestone / equipment_delivery). Этап G07–G11 ([§15 плана](../../07-delivery/pharma-demo-call-work-plan.md)) добавляет curated интервальные работы и read-only зависимости четырёх типов **без** превращения Schedule в scheduling engine и без PRO API.

### Согласованные решения (демо-контракт 2026-11-06)

1. **Логические строки:** control-point rows **плюс** строки `kind: 'work'`, в DHTMLX — `type: 'task'`. Identity = `{ kind, entityId }`; presentation id = `kind:entityId` (для работ: `work:<id>` с исходным ID аналитика, если уникален и стабилен). Расширить парсер selection key на `work`.
2. **Ось полосы:** одна полоса = **прогнозный** интервал `startDate`…`endDate` в **календарных** днях. Dual-bar plan+fact — вне addendum (C07–C08).
3. **Включительный конец:** календарные дни от start до end включительно. Map в Community: `start_date = startDate`, exclusive end = день после `endDate` (при равенстве дат — `startDate + 1 day`).
4. **Однодневная работа:** если `startDate === endDate`, UI показывает **видимую полосу длиной в один календарный день** (`duration ≥ 1`), **не** zero-duration milestone.
5. **Инвариант КТ сохранён:** `deltaDays` вехи/поставки **никогда** не становится `duration` работы; baseline ghost overlay для control points без изменений.
6. **Статус → `task_class`:** `Waiting` | `OnSchedule` | `Delayed` | `Completed` (+ RU Ожидание / По графику / Отстаёт / Выполнено) → CSS `ppc-work ppc-work-*` на `--status-warn|info|danger|ok-*`. Текст статуса — в таблице / tooltip. Статусы **authored в данных снимка** — адаптер не вычисляет просрочку из as-of.
7. **Links:** `gantt.parse({ data, links })`; `show_links: true`; create / `drag_links` выкл; `readonly` сохраняется. Доменные типы `FS` | `SS` | `FF` | `SF` → `gantt.config.links`. Концы только `work:<id>` ↔ `work:<id>` (стрелки к MS/EQ вне этапа).
8. **Fit-to-data:** в min/max окна входят также `startDate`/`endDate` работ выбранного снимка.
9. **Вне addendum:** PRO `addTaskLayer` / built-in baselines; dual bars; working calendar; CPM; полный импорт 272 работ; Domain entity Activity; G12 rename.

### Разделение ответственности (дополнение)

| Layer | Owns (G07–G11) |
|---|---|
| **DHTMLX Community** | Task bar geometry; link rendering; scale/grid |
| **Project adapter** | DTO → task/milestone rows; inclusive→exclusive date map; `task_class`; link type map; theme tokens; selection keys including `work` |
| **API / fixtures** | Curated works + authored statuses + typed links; validation существования концов |

### Последствия addendum

- Community MIT достаточен для полос и четырёх типов links в режиме просмотра.
- Нужна браузерная проверка фактического крепления стрелок к краям полос (интегратор).
- Снимок без works/links обязан сохранить поведение I7 (только маркеры КТ).

## Addendum: иерархия и необязательная база (R1/R2)

> **certainty:** assumption
>
> Контракт строк согласован 2026-11-06. Перенос базовой полосы в продукт зависит от лаборатории сравнения. Норматив: change (`openspec/changes/archive/2026-11-07-schedule-hierarchy-baseline-forecast/proposal.md`), [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md) §1.6–§1.7.

Группа календарного плана — view-model `type: "project"` без `render: "split"`. Сводная полоса покрывает прогнозный диапазон детей. Процент группы не вычисляется. Работа остаётся `type: "task"` на прогнозном интервале. `progressPct: 0` рисует контур без внутренней заливки; частичное и полное значения заливают долю полосы. Веха остаётся `type: "milestone"`. Стрелки по-прежнему крепятся к id прогнозной работы.

Необязательная база — overlay через `getTaskPosition` над прогнозной полосой, не PRO baselines и не split. Нет пары базовых дат — overlay-узла нет, и основной план остаётся одной прогнозной полосой. Адаптер принадлежит основному треку. Модуль базы подключается отдельно, только если лаборатория подтвердила вертикальный разнос, раскрытие, выравнивание строк и крепление стрелки к прогнозу на строке, где есть и база, и зависимость.

## Addendum: фактический интервал (C07, черновик)

> **certainty:** assumption
>
> Review 2026-11-06 принял подвыборку. Норматив: change (`openspec/changes/archive/2026-11-07-schedule-work-actual/proposal.md`), [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md) §1.8.

На работе по-прежнему одна задача DHTMLX. В режиме по умолчанию её интервал — прогноз. Если заданы оба конца базы, overlay рисует её и когда даты совпадают с прогнозом: так у `WK-01` на снимке C появляется верхняя полоса без ветки по id. В режиме «Базовый план / факт» интервал задачи равен закрытому фактическому интервалу. Открытый факт (`actualStart` без `actualEnd`) интервал задачи не подменяет: лаборатория отметки начала совпала с линией дня и в продукт не переносится. База остаётся overlay и не становится второй задачей. Split и PRO baselines не используются.

Связь адресует id работы. Край рисуется на показанной нижней полосе: у закрытого факта это фактический конец, иначе прогнозный. Приёмка измеряет края source и target, а не только id связи.

## Addendum: межпроектное предшествование

> **certainty:** assumption
>
> Review 2026-11-06 принял требование 2 change schedule-c-cross-project-subsample (`openspec/changes/archive/2026-11-07-schedule-c-cross-project-subsample/proposal.md`). Норматив UX: [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md) §1.9.

Пункт 7 addendum G07–G11 остаётся для вида `scheduling`: концы `work:<id>` и доменный тип `FS` | `SS` | `FF` | `SF`. Вид `cross_project_predecessor` этот пункт не расширяет типом. В ответе Schedule у `LNK-X-PWR-HVAC` нет поля типа. Источник `milestone:MS-UTL-PWR`, цель `work:9.3.2`, оба в том же ответе.

Адаптер может передать в `gantt.parse` технический код геометрии, чтобы линия вышла из ромба и вошла в начало прогнозной полосы. Этот код не сериализуется в API и не читается как тип планирования. Доступное имя линии: «Межпроектное предшествование, тип не указан».

В режиме факта цель без факта сохраняет прогнозную полосу, и линия крепится к ней. Если закрытый факт заменяет прогнозную полосу цели, адаптер не рисует эту линию в режиме факта. Свёрнутый конец тоже убирает линию.

## Ссылки

- [DOC-UX-005](../../05-ux-ui/demo-v1-schedule-workspace.md), [DOC-UX-018](../../05-ux-ui/demo-v1-ui-data-viz.md)
- Вопросы аналитику: [2026-11-06-g07-g11-analyst-questions.md](../../07-delivery/reports/2026-11-06-g07-g11-analyst-questions.md)
- OpenSpec change: demo-v1-schedule-work-bars-links (`openspec/changes/archive/2026-11-07-demo-v1-schedule-work-bars-links/proposal.md`), факт: schedule-work-actual (`openspec/changes/archive/2026-11-07-schedule-work-actual/proposal.md`), межпроектная связь: schedule-c-cross-project-subsample (`openspec/changes/archive/2026-11-07-schedule-c-cross-project-subsample/proposal.md`)
- npm `dhtmlx-gantt@10.0.3`, GitHub release v10.0.0 (Community MIT)
- DHTMLX: [task types](https://docs.dhtmlx.com/gantt/guides/task-types/), [task_class](https://docs.dhtmlx.com/gantt/api/template/task_class/), [links config](https://docs.dhtmlx.com/gantt/api/config/links/)
