---
id: DOC-UX-004
title: Demo v1 — Dashboard (исполнительный обзор)
type: product
status: draft
version: 0.4.13
created: '2026-10-31'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-UX-001
  - REQ-IMPCT-001
  - REQ-IMPCT-002
  - DOC-BA-014
  - DOC-PROD-012
---
# Demo v1 Dashboard

> **certainty:** hypothesis
>
> Композиция Dashboard — `approved UX decision` (D1, D3, D5, D6, D8). Данные и integrity — REQ-IMPCT / BR / mock. BA-OQ-006 **closed** (единый register + `Тип`, DOC-BA-010); Dashboard composition этим не подменяется.

## 1. Назначение

Director-first home (D3): состояние production start, драйвер отклонения, causal visualization по Domain links, Decision.

> **certainty:** assumption
>
> **Narrative vs Domain links.** Сюжетный порядок mock `EQ → ISS → RISK → MS → PS` (DOC-PROD-012) — storytelling sequence, **не** схема прямых рёбер и **не** layout causal viz. Рёбра viz = только прямые связи [DOC-BA-015](../02-business-analysis/domain-model-demo-v1.md): Equipment—Issue, Equipment—Risk, Issue—Risk, Issue—Milestone, Risk—Milestone (плюс Project ownership). **Нет** прямой Equipment—Milestone. Путь EQ→MS только через Issue и/или Risk. `PS` / Project.forecastProductionStart — alignment с MS-PS по BR-004 (атрибут/агрегат), не отдельное Domain-ребро EQ→PS. Опосредованные отношения в UI помечать как derived/indirect.

## 2. Page composition (внутри Page Surface)

| Block | User question | Data source |
|-------|---------------|-------------|
| Project header | Какой проект / asOf? | PRT-01; scenarioAsOfDate (mock) |
| KPI row | Каков PS и slip? | baselineProductionStart, forecastProductionStart; Δ derived; MS-PS.rag; EQ-HVAC-01.status (и агрегаты при расширении mock — hypothesis) |
| Causal viz | Почему угроза PS? | Только **прямые** Domain links (DOC-BA-015), присутствующие в snapshot; узлы EQ/ISS/RISK/MS (+ PS как label MS/Project aggregate). Не рисовать линейную цепочку narrative как рёбра; не рисовать EQ—MS |
| Δ strip | Как delay связан с PS? | BR-004; delivery dates ≠ PS labels (REQ-EQPT / REQ-IMPCT); Δ = derived math, не Domain edge |
| Decision panel | Какое решение зафиксировано? | Decision type; Issue Mitigating; honesty: forecast/RAG unchanged (BR-006) |
| Exceptions preview | Что открыть дальше? | Top ISS/RISK refs → Issues & Risks |
| Compact Schedule widget | Что ближайшее / slipping? | Subset control points → Schedule |
| Optional chart | Как двигался forecast 01/02/03? | Три точки mock snapshots (Recharts); не runtime forecast engine |

## 3. KPI rules

Только реальные поля или derived Δ (forecast−baseline). Приоритет — содержательная плотность, не декоративное заполнение.

**Правило группы метрик (`approved UX decision`):** если группа KPI/metric tiles показана — в ней **≥4** элемента на обоснованных данных; не изобретать метрики. Если честных ≥4 нет — группу не показывать (честная композиция без пустых плиток).

При расширении mock (`hypothesis`): агрегаты Dashboard **должны** совпадать со счётчиками реестров.

## 4. BA-OQ-006

> **certainty:** open_question
>
> Layout Issue vs Risk на полном реестре Issues & Risks — **closed** (BA-OQ-006 → единый register + `Тип`, DOC-BA-010). Композиция Dashboard (D8) принята отдельно. На Dashboard допустим typed preview (две колонки type или явные labels).

## 5. Имя экрана и навигация (B10)

> **certainty:** approved UX decision

Домашний экран director-first (маршрут `/`) в пользовательском UI называется **«Дашборд»**, не «Обзор».

| Surface | Подпись |
|---------|---------|
| Пункт primary nav + breadcrumb для `/` | **Дашборд** |
| Состояния загрузки / ошибки home (`page.tsx`) | **Дашборд** (заголовок и тексты ожидания данных) |

**Не менять:** вкладка **«Обзор»** на entity-detail (summary сущности) — это другой semantic scope, не home Dashboard.

## 6. Нижняя зона карточек (B11 → two independent columns)

> **certainty:** assumption — dashboard-two-columns 2026-11-09 (явный запрос пользователя; supersedes prior B11 single auto-flow packing)

Под executive timeline — **два равных desktop-столбца** (`lg:grid-cols-2`, `items-start`), каждый — независимая вертикальная стопка (`flex-col`). Карточки **не** растягиваются под высоту соседнего столбца; отсутствие Decision не оставляет дыру в левом столбце.

**Desktop (lg+), порядок в стопках:**

| Столбец | Порядок (сверху вниз) |
|---------|------------------------|
| Левый | 1. People focus (`people-focus`) — «Участники…» · 2. Management Attention / Сводка (`management-attention`) · 3. Snapshot Changes (`trend`) |
| Правый | 1. Key Exceptions (`top-exceptions`) — «Требует внимания» · 2. Decision (`decisions`) — «Прогноз и решение», только если панель не `absent` |

**Узкий экран (`grid-cols-1`):** сначала весь левый столбец, затем правый → Участники раньше «Требует внимания».

People focus: owners Open/Mitigating issues + critical Delayed EQ (дедуп по `equipmentId`). Summary: **Критичных → Новых критичных → Ответственных**; quiet / tip / unassigned — без изменения семантики.

**Visual (people, 2026-11-09):** header state pill — `attention` / `active` / `quiet`; **все** `people` в DOM (`max-h-[32rem]` scroll); без left accent / topN.

**Acceptance (visual / DOM):**

| Snapshot | Ожидание |
|----------|----------|
| **01** | 2 column wrappers; left: people → attention → trend; right: exceptions only (нет Decision) |
| **03** / **07** / **11** | left same; right: exceptions → decisions |

### Состояние блока решений (A08, B04–B05)

> **certainty:** assumption — dashboard-management-cards 2026-11-09
>
> Карточка «Прогноз и решение» — PS-driver сигнал (DEC-001), не реестр. `decisionPanelState`: `recorded` только при DEC-001; `needed` при отсутствии DEC-001 + Open/Mitigating PS issue + EQ Delayed; иначе `absent`. Исполнение — read-only demo observations (`unknown|not_started|in_progress|completed`, source.kind=demo). `decisionHonesty.recoveryExecuted` deprecated always-false; UI опирается на `forecastDeviation` + execution. BR-006: запись сама не устраняет отклонение.

| Снимок | Состояние блока | Что показано |
|--------|-----------------|--------------|
| C, D, E | `needed` | «Требуется решение»; DEC-001 нет |
| 06 | `recorded` + `not_started` | DEC-001; демо «Действия не начаты»; residual Δ |
| 07–14 | `recorded` + `in_progress` | «Действия начаты» (I не completed) |
| 15–19 | `recorded` + `completed` | «Действия закрыты»; residual/Δ может оставаться |

Подпись «Принято» не используется.

### Блок изменений (C04)

> **certainty:** assumption
>
> Тексты `better` / `worse` / `unchangedCritical` записаны в фикстуре снимка. Это не пересчёт от снимка, который был открыт перед этим. Сверка 01–19 показывает последовательный сюжет: каждая непустая запись читается как шаг от предыдущего снимка. Примеры: B добавляет замечания оболочки; C закрывает их и фиксирует HVAC +21; G снижает сдвиг HVAC с +21 до +14; S отмечает достигнутый старт после ожидания на R. Ни одна строка не называет несоседний снимок.

Для A предыдущего снимка нет. Заголовок — «Изменения по сценарию». Пустая фраза про базовый план остаётся.

Для 02–19 заголовок называет предыдущий снимок порядка 01–19: на 03 это «Изменения к снимку 02», на 06 — «Изменения к снимку 05». Скачок 01 → 06 показывает текст 06 и заголовок про 05, не разницу с A.

### Сравнение на платформе (C05)

> **certainty:** hypothesis
>
> В демосборке правила периода нет. Авторские тексты по-прежнему описывают соседний снимок сценария. Экраном `reference platform` этот раздел не подтверждён.

Чтением кода `reference platform` контракт сравнения снимков дашборда не найден. Ближайший отдельный экран — сравнение двух версий метаданных (`settings/data-model/version-history/compare`). Это не период портфеля и не дата снимка.

Рекомендуемое правило платформы, не решение продукта: база по умолчанию — предыдущий сохранённый снимок. Интерфейс всегда показывает «Сравнение с: …» и выбранную дату или идентификатор. Если за выбранный период данных нет, показывается пустая фраза. Последнее доступное сравнение вместо пустого периода не подставляется. «Дата снимка» и «База сравнения» — разные подписи. Неделя и месяц остаются примерами созвона, не спецификацией.

### Маркер даты и вертикальные линии (C01, C06)

Линия даты снимка стоит на `scenarioAsOfDate` во всех трёх рендерерах. Формула доли горизонта не сдвигается отдельно для 28 февраля. На снимке 02 эта дата совпадает с `MS-BLD-ENCL`, а деление «мар» стоит на следующий день, поэтому линия визуально рядом с мартом и с точкой контура здания.

Подпись «Дата снимка» варианта 3 выравнивается по той же горизонтальной области, что и линия графика, включая боковые отступы сетки. Линию из-за подписи не переносят.

Назначение вертикалей, снимок один и тот же для трёх рендереров:

| Элемент | Где | Назначение |
| --- | --- | --- |
| Ось и деления месяцев | вариант 1, шкала vis, ось ECharts | Ориентир времени. Остаются |
| Маркер даты снимка | пунктир варианта 1, `customTime` vis, `markLine` ECharts | Дата снимка. Остаётся различимым |
| Полоса запуска | вариант 1 | Интервал плана и прогноза старта. Остаётся |
| Стебли и уголки вех | вариант 1 | Связь точки с подписью. В этом этапе не убираются |
| Мелкая вертикальная сетка | `.vis-grid.vis-minor` варианта 2 | На обычной ширине это единственные вертикали месяцев (`vis-february`…`vis-september`), крупных `vis-major` нет. На узкой ширине месяцы делятся между `vis-minor` и `vis-major`. Отдельной более частой сетки нет |
| Крупная сетка vis | `.vis-grid.vis-major` | На узкой ширине это тоже граница месяца, не отдельный слой |
| Вертикальные split-линии ECharts | `splitLine.show: false` | Уже выключены |

Проверка 2026-11-06 на снимке 03, вариант 2, с `PRG-CON` и без неё, 1287px и 480px: временное скрытие `.vis-grid.vis-minor` убирает месячные границы. Подписи месяцев и линия «Дата снимка» остаются, вертикальные деления месяцев — нет. Вариант 1 не менялся. Правка в код не внесена. C06 остаётся открытым: убирать нечего, не задев деления времени.

### Уведомления при смене снимка (C02–C03)

После успешной смены снимка показываются короткие сообщения с тоном темы: критичное, внимание, восстановление, нейтральное. Первая загрузка страницы сообщения не вызывает. Переключатель в колокольчике выключает только эти сообщения. Селектор снимков и список колокольчика продолжают работать.

### Блок внимания (B06)

Заголовок блока исключений — «Требует внимания». Текст исключения описывает отклонение, проблему или последствие. Слова, которые только называют цвет маркера (`Red`, «красный риск»), в этом блоке не ставятся. Числа и смысл сценария сохраняются. Подписи реестров и карточек сущностей этим правилом не покрыты.

> **certainty:** assumption — dashboard-card-composition 2026-11-09
>
> Критичный пункт в списке «Требует внимания» рисуется **1px border внутри border-box** (или эквивалентный inset), на `bg-[var(--status-danger-bg)]` + `rounded`, **не** outer `ring` и **не** обычный `border-b` divider. У `<ol>` остаются gutters ~4px (`px-1 py-1`), чтобы first/last и боковые грани контура не клипались scrollport'ом; mid-scroll partial item допустим без sticky-масок. Pair surface (`max-h` + bounded list scroll) сохраняется.

### Блок изменений — ChangeTile chrome (card-composition)

> **certainty:** assumption — dashboard-card-composition 2026-11-09
>
> Плитки better / worse / unchangedCritical: существующий tone bg + **тонкая 1px** semantic border (`--status-ok|danger|warn-border`). Пустые плитки по-прежнему не рендерятся; outer ModuleSurface без тяжёлого второго контура.

### Карточка «Прогноз и решение» — композиция одного объекта контроля

> **certainty:** assumption — dashboard-card-composition 2026-11-09
>
> Один объект контроля «Запуск производства» (подпись один раз, без инженерных «кейс/PS-driver»). Метрика +N дн. + подписанные базовый/прогноз даты; короткое «Причина» + secondary ID links. При `recorded` — нейтральная группа «Связанное решение» (DEC-001 type/note, Исполнение badge, demo source + asOf) — не реестр и не три цветные card-in-card. Footer CTA на реальные маршруты; на 768 footer не прячется за `overflow-hidden` (inner body scroll при необходимости). Forecast deviation видим независимо от execution (BR-006).

## Портфель и программы на обзоре (B01–B03, B07–B09)

> **certainty:** assumption
>
> Контракт: [ADR-0006](../06-architecture/decisions/0006-portfolio-program-project-read-model.md), change `portfolio-program-project`. Код экрана появляется после review.

Состояние и дата запуска читаются как данные портфеля `PRT-01`. В блоке «Состояние портфеля» полное имя — «Строительство фармацевтической фабрики (Greenfield)». Рядом остаётся внутренний id `PRT-01`. Короткая подпись цепочки «Портфель 01» этим именем не заменяется. Правый блок называется «Состояние по программам».

> **certainty:** assumption — dashboard-program-people-layout 2026-11-09
>
> Строка программы: **название | статус-бейдж | прогресс** (shared column widths; без заливки всей строки и без линий таблицы). Бейдж читает только `status` + `--status-*` (Red → «Критично»); compact как people-focus: `rounded-[var(--radius-sm)]`, `px-1.5 py-0.5`, `leading-none`, однострочный «Требует внимания». Полоса прогресса — только `progressFillTone` + `--schedule-fill-*` (lag→danger, shift→warn). Оси независимы: Red+warn / Red+ok допустимы после audit 01–19 (`status` = worst child projects; fill = `fillToneForProgramProjects`). Подсказка прогресса: % выполнения ≠ календарное отклонение; у бейджа — «Статус программы». `SemanticProgressBar` compact (`text-xs`) + колонка процента в `ch` — «100%» без clipping; track bounds равны между строками.

Шкала без выбранной программы называется «Вехи портфеля» и по умолчанию показывает полный universe (**189** ID; фильтр «Обзор ключевых» сужает до 12). Клик по программе ставит `?program=` и переключает заголовок на «Вехи программы». Повторный клик снимает выбор. «Перейти к программе» — отдельная ссылка на `/programs/:id`, не сам клик по строке.

> **certainty:** assumption
>
> Densify 189 + program lanes согласованы с change `dashboard-pages-consistency` / `timeline-echarts-decisions-register`. Устаревшее «только 12 без фильтра» снято.

Принадлежность вехи не заменяет видимость. `MS-CLN-PANEL` входит и в 12 (обзор), и в `PRG-CON`. `MS-UTL-PWR` входит и в 12, и в `PRG-ENG`. `MS-PS` на портфельной шкале. У `PRG-DSN` вех нет: шкала показывает пустое состояние, подборка из 12 не подставляется.

Смена снимка не снимает `?program=` и не уводит со страницы программы. «Назад» возвращает предыдущий URL, включая query, и оставляет последний выбранный снимок.

## 7. Шкала вех портфеля (Apache ECharts)

> **certainty:** assumption
> **Решение 2026-11-08 (явный запрос пользователя):** единственный рендерер карточки «Вехи портфеля» — **Apache ECharts**. Переключатель 1/2/3 и реализации custom strip / vis-timeline **удалены**. Исторические отчёты C09–C14 остаются архивом эксперимента.

Карточка использует `resolveExecutiveTimelineExperimentModel` + ECharts lanes. Портфель: universe **189** с фильтрами объёма/программы; обзор ключевых — 12 ID из [DOC-UX-022](./demo-v1-r2-ux-delta.md). Резолвер не подменяет пустую программу портфельной подборкой. Смысловой горизонт API не меняется; **plot domain** расширяется/паддится, чтобы включить все рисуемые даты (ordinary + PS baseline/forecast + as-of).

Summary KPI: колонка 2 — заголовок **«Запуск производства»** (не «портфеля»). Колонка 3 «Стоимость»: видимые подсказки при hover/focus для EAC/VAC/BAC/Резерв (RU; EN допускается как дополнение) — см. [demo-v1-r2-cost-control.md](../03-product/demo-v1-r2-cost-control.md).

### Подписи (постоянные)

Chrome карточки (compact): заголовок слева; справа в том же ряду счётчик «Показано X/Y» и два select (объём / программа) без видимых labels «Объём»/«Программа» (имена — `aria-label`; на узкой ширине два select держатся парой, счётчик может переноситься отдельно). Ссылки «Календарный план» **внутри этой карточки нет** (пункт сайдбара и tooltip «Перейти» сохраняются). Отдельного meta-ряда (phase-context / PS legend «План / Прогноз / Δ») **нет** — ни на портфеле, ни при `?program=` (фильтры universe при program scope скрыты). Plot: **имена программ**, month ticks, «Дата снимка» (overlay; нижний край блока даты совпадает с нижним краем красной подписи прогноза у PS endpoint; на ~390px caption end-align к пунктиру + трёхстрочный forecast без X-overlap и без сдвига markLine/domain), PS endpoints + Δ на шкале, key `shortLabel` с lane-aware / `labelLayout`. Tooltip enterable: **один bold полный API title** (без дубля short+full), shared status pill, outline **«Перейти»** → `/schedule?focus=milestone:<id>` (`selectionKeyId`); HTML экранирован. Red вехи — лёгкая пульсация (`effectScatter`), с уважением `prefers-reduced-motion`.

### Ряд «Портфель»

> **certainty:** assumption  
> Lane key стабильный `none`. Подпись оси/фильтра — **«Портфель»** (не «/ без программы»). В режиме «Все программы» полоса lane получает лёгкий фон `--surface-sunken` через `yAxis.splitArea`; при явном фильтре программы `none` серая заливка **выключена** (одна строка на ordinary surface), жирный caption сохраняется. Порядок опций «Программа» = визуальный top→bottom шкалы (canonical helper; source order оси не мутируется). При `?program=` отсутствующий портфельный lane **не** добавляется искусственно.
