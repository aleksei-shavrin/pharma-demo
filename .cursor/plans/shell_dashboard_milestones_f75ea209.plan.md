---
name: Shell dashboard milestones
overview: "Два этапа в pharma-demo с обязательным распараллеливанием агентов: (1) F01–F06 и B10–B11 плюс /docs; (2) C09–C11 после выбора vis-timeline и/или ECharts. G07–G11 вне scope."
todos:
  - id: F01
    content: "F01: скрыть Next.js StaticIndicator; сверка API с next@15.1.0; проверка в dev"
    status: pending
  - id: F02
    content: "F02: «Документация» внизу сайдбара; проверка ссылки после интеграции F03"
    status: pending
  - id: F03
    content: "F03: вход /docs/; redirects /portal→/docs/ и /portal/docs/<slug>→/docs/<slug>; inventory; smoke local+server"
    status: pending
  - id: F04
    content: "F04: убрать длинный бейдж проекта/снимка из Application Bar"
    status: pending
  - id: F05
    content: "F05: порядок справа bell → theme → snapshot; тема меньше колокольчика"
    status: pending
  - id: F06
    content: "F06: замер после F04–F05; выровнять разделители; проверка узкого экрана"
    status: pending
  - id: B10
    content: "B10: «Обзор» → «Дашборд» в nav/крошках/page (+ UX docs)"
    status: pending
  - id: B11
    content: "B11: failing test пустой ячейки на A; auto-flow grid; порядок на снимке с 4 карточками"
    status: pending
  - id: C09
    content: "C09: два сторонних рендерера (после выбора libs); общий контракт данных"
    status: pending
  - id: C10
    content: "C10: переключатель 1/2/3 (интегратор этапа 2)"
    status: pending
  - id: C11
    content: "C11: протокол сравнения и запись выводов (интегратор)"
    status: pending
isProject: false
---

# План: F01–F06, B10–B11, C09–C11

Scope только эти ID. Источник: [docs/07-delivery/pharma-demo-call-work-plan.md](docs/07-delivery/pharma-demo-call-work-plan.md) (§12–14 и «Документация прежде кода»). **G07–G11 (страница «График»)** — отдельный этап, здесь не реализуются.

**До запуска агентов:** дождаться явного согласования этого плана. После согласования: скопировать файл в репозиторий [`.cursor/plans/`](.cursor/plans/) по [AGENTS.md §9](AGENTS.md) / [cursor-plans-in-git.md](docs/11-ai-engineering/cursor-plans-in-git.md); при смене роли — handoff в `docs/07-delivery/handoffs/`.

Каждый агент: сначала документация своей зоны → реализация → проверка. Для общих файлов (UX shell/dashboard specs при пересечении, `package.json` / lockfile) — один писатель.

---

## Документация прежде кода (по группам)

Правило из work-plan: сверить план и сборку → обновить docs → (OpenSpec + human review при смене поведения/контракта) → код → отметка чекбокса.

| Группа | Документы до кода | OpenSpec / ADR |
| --- | --- | --- |
| **F01** | Краткая запись в [demo-v1-shell-navigation.md](docs/05-ux-ui/demo-v1-shell-navigation.md) или в этом плане: индикатор Next.js не часть продукта; отключается в `next.config`. | OpenSpec не нужен (dev-only). |
| **F02** | [demo-v1-shell-navigation.md](docs/05-ux-ui/demo-v1-shell-navigation.md): пункт «Документация» внизу сайдбара, внешний переход на `/docs/`. | OpenSpec не нужен (навигация оболочки). |
| **F03** | [ADR-0003](docs/06-architecture/decisions/0003-local-dev-urls-and-proxy.md), [ADR-0005](docs/06-architecture/decisions/0005-server-single-origin-compose.md), [local-dev-and-demo.md](docs/10-operations/local-dev-and-demo.md), [server-compose-demo.md](docs/10-operations/server-compose-demo.md), README, при необходимости handoff server-compose. Таблица редиректов (ниже). | **ADR обязателен** (смена принятого URL `/portal`). OpenSpec living product API не меняется; отдельный OpenSpec change не требуется, если нет delta в `openspec/specs`. Human review ADR/ops до merge маршрутизации. |
| **F04–F06** | [demo-v1-shell-navigation.md](docs/05-ux-ui/demo-v1-shell-navigation.md): состав Application Bar, порядок контролов, выравнивание хедеров. | OpenSpec не нужен (локальная компоновка). Один писатель UX shell. |
| **B10–B11** | [demo-v1-dashboard.md](docs/05-ux-ui/demo-v1-dashboard.md); B10 также shell nav (подпись пункта); сценарий показа — только если там фигурирует «Обзор» как имя экрана. | OpenSpec: только если living specs жёстко фиксируют label «Обзор» или сетку 2×2 рядов — тогда draft change + human review до кода. Иначе UX-spec достаточно. |
| **C09–C11** | До выбора libs: заметка исследования в delivery (или appendix UX dashboard) с кандидатами и примерами. После выбора: UX dashboard — экспериментальный переключатель 1/2/3; критерии сравнения. ADR-0004 **не** менять (Schedule отдельно). | OpenSpec change для эксперимента **не** обязателен, пока toggle не объявлен частью Demo v1 Must. Установка зависимостей — только после ответа человека. G07–G11 — вне этого плана. |

---

## 1. Сайдбар и Application Bar (F01–F06)

### F01 — индикатор с молнией

Источник: Next.js 15.1 Dev Overlay `StaticIndicator` / `LightningBolt`, хост `nextjs-portal` (не app-код).

До кода: сверка с установленной версией `next@15.1.0` в `apps/web/package.json` и фактическим API `devIndicators` в `node_modules/next` (ключ `appIsrStatus` vs устаревшие имена).

Изменение: [apps/web/next.config.ts](apps/web/next.config.ts).

Проверка: `npm run dev` / Compose web — значок отсутствует на страницах приложения; в DOM нет `.nextjs-static-indicator-toast-wrapper`.

### F02 — «Документация» внизу сайдбара

Владелец файлов сайдбара: [sidebar.tsx](apps/web/src/components/shell/sidebar.tsx) (+ при необходимости константа href рядом). Не в `NAV_ITEMS`. Якорь `/docs/`, не `next/link`.

**Проверка ссылки — после интеграции F03** (иначе битый префикс). Сам пункт UI можно сверстать параллельно с заглушкой href, финальный smoke — с Integrator-1.

### F03 — вход `/docs/` и legacy `/portal`

Целевой контракт:

| Было | Стало |
| --- | --- |
| Вход `/portal/` | **`/docs/`** |
| `/portal`, `/portal/` | redirect → `/docs/` |
| `/portal/docs/<slug>` | redirect → `/docs/<slug>` |
| Контент без удвоения | `DOCUSAURUS_BASE_URL=/docs/` + `routeBasePath: '/'` для docs-плагина |

**Инвентаризация прочих старых маршрутов (обязательно закрыть редиректами или документировать):**

| Старый путь | Назначение сейчас | Целевой |
| --- | --- | --- |
| `/portal/openspec/…` | OpenSpec plugin (`routeBasePath: 'openspec'`) | `/docs/openspec/…` |
| `/portal/assets/…` | static Docusaurus | `/docs/assets/…` |
| `/portal/search` (если есть) | local search | `/docs/search` |
| Navbar `to: '/docs/…'` внутри сайта | relative to baseUrl | остаётся корректным при новом baseUrl |
| Host `docs.localhost` ([Caddyfile](Caddyfile) ADR-0003) | отдельный hostname | вне path-cutover; упомянуть в ADR как legacy/alt |
| Cross-ref registry `/docs/portal/…` | **контентные** пути плагина, не baseUrl | после `routeBasePath: '/'` становятся `/docs/portal/…` на новом base — сверить rebuild |

Файлы: `Caddyfile.dev`, `Caddyfile.server`, compose/env/Dockerfile, `website/docusaurus.config.ts`, nginx comments, README, ADR-0003/0005, ops guides.

Проверка (local `:3080` и server compose):

1. `GET /docs/` → 200  
2. Вложенная страница (напр. portal home / ADR) → 200  
3. Её ресурсы (`/docs/assets/…`) → 200  
4. Redirect `/portal` и `/portal/` → `/docs/`  
5. Redirect `/portal/docs/<slug>` → `/docs/<slug>`  
6. Сайдбар «Документация» (после F02+F03)  
7. `/portal/openspec/…` → `/docs/openspec/…` (или явная запись «out of inventory»)

### F04–F05 — Application Bar

[top-app-bar.tsx](apps/web/src/components/shell/top-app-bar.tsx): убрать бейдж; порядок Bell → Theme → Snapshot; Theme визуально меньше Bell.

### F06 — разделители

Сначала выполнить F04–F05. Затем замерить `bottom` brand-row сайдбара и Application Bar. Если ступенька осталась — выровнять (`h-[var(--topbar-height)]` / токен / убрать рост от `py-2`). Проверить узкий экран (wrap справа не ломает линию). Свёрнутого сайдбара нет.

---

## 2. Дашборд (B10–B11)

### B10

[navigation.ts](apps/web/src/lib/navigation.ts), [page.tsx](apps/web/src/app/page.tsx); entity-detail tab «Обзор» не трогать.

### B11

Причина: два отдельных `lg:grid-cols-2` ряда в [dashboard-view.tsx](apps/web/src/components/dashboard/dashboard-view.tsx); на снимке A `decisionPanelState === 'absent'` → дыра.

План теста: failing тест воспроизводит пустую ячейку на A (число детей первой сетки / отсутствие decisions при дыре); после фикса — 3 карточки dense; отдельный кейс снимка с четырьмя карточками (C/G) — порядок Exceptions → Decision → Attention → Changes.

---

## 3. C09–C11 — кандидаты (выбор и install после вашего ответа)

G07–G11 не входят. Schedule DHTMLX — только контекст.

Текущий рендерер: [ExecutiveMilestoneStrip](apps/web/src/components/dashboard/executive-milestone-strip.tsx) + [executive-timeline.ts](apps/web/src/lib/dashboard/executive-timeline.ts).

### Рабочие кандидаты (оставить оба)

**vis-timeline** (Apache-2.0 OR MIT)

- Живой пример маркера даты: https://visjs.github.io/vis-timeline/examples/timeline/other/customTimeBars.html  
- Маркеры: https://visjs.github.io/vis-timeline/examples/timeline/markers/customTimeMarkers.html  
- Документация point items / `addCustomTime`: https://visjs.github.io/vis-timeline/docs/timeline/  
- Доработки: DataSet из executive milestones; `type: 'point'`; `addCustomTime(scenarioAsOfDate)`; CSS под light/dark; disable drag customTime в демо; горизонт Feb–Sep 2027; PS band (два point или range); React через `useEffect` + `vis-timeline/standalone` (официальной React-обёртки нет).  
- ECharts React-обёртка: **не относится**.

**Apache ECharts** (Apache-2.0)

- Живой editor (value axis + series, база для markLine): https://echarts.apache.org/examples/en/editor.html?c=line-in-cartesian-coordinate-system  
- Scatter + markLine (тестовый образец репозитория): https://github.com/apache/echarts/blob/master/test/scatter-markline.html  
- Доработки: scatter точек вех на time/value axis; `markLine: { data: [{ xAxis: asOfMs }] }` для даты снимка; label/tooltip RAG; тема dark через `registerTheme` / CSS vars; resize; PS как две series или markArea.  
- **React-обёртка:** необязательна. Достаточно client component + `echarts/core` + `echarts.init` (как imperative pattern у vis). `echarts-for-react` — удобство (option/theme/resize), но лишняя зависимость; решение за интегратором после выбора «ставить ECharts».

Выбор двух библиотек и `npm install` — **только после вашего ответа**. Исследование кандидатов (ссылки, доработки) может идти параллельно этапу 1 без установки.

UI после выбора: переключатель 1/2/3; общий контракт данных до параллельных рендереров; протокол C11 (снимок, as-of, близкие вехи, узкий экран, темы).

---

## Распараллеливание агентов

### Волна 0 (после согласования плана, до кода apps)

1. Сохранить план в `.cursor/plans/` репозитория.  
2. Параллельно черновики docs по зонам агентов (см. таблицу).  
3. Human review ADR F03 (и OpenSpec B10/B11 — только если решено, что нужен).

### Волна 1 — параллельно (этап 1 + исследование C)

| Агент | Задачи | Файлы (владелец) | Зависимости | Критерий готовности |
| --- | --- | --- | --- | --- |
| **DocsProxy** | F03 | Caddyfiles, compose/env/Dockerfile docs, `website/docusaurus.config.ts`, nginx comments, ADR-0003/0005, ops guides, README (docs URL sections) | Волна 0 ADR review | `/docs/` 200; nested page + assets; redirects `/portal`→`/docs/`, `/portal/docs/<slug>`→`/docs/<slug>`; inventory openspec/assets закрыт; smoke **local и server** |
| **NextIndicator** | F01 | `apps/web/next.config.ts`; краткая UX/plan note | Сверка API next@15.1.0 | В **dev**-сборке молния отсутствует |
| **AppBar** | F04→F05→F06 | **Только** `top-app-bar.tsx`, `theme-toggle.tsx` (размер), shell tests App Bar, при необходимости `--topbar-height` в `globals.css`. **Не** трогает `sidebar.tsx` (сайдбар уже `h-[var(--topbar-height)]`). | F06 **после** F04–F05 в том же агенте | Нет бейджа; порядок bell→theme→snapshot; замер borders; узкий экран без ступеньки |
| **ShellNav** | F02 + **единственный** писатель UX shell | **Единственный** владелец `sidebar.tsx`; **единственный** писатель [demo-v1-shell-navigation.md](docs/05-ux-ui/demo-v1-shell-navigation.md) (включая F01 note, F04–F06 компоновку Bar — AppBar передаёт факты в handoff, ShellNav вносит в UX). | Финальная проверка href **после** merge F03 | Пункт внизу; UX shell обновлён; после интеграции — переход на `/docs/` |
| **Dashboard** | B10–B11 | `navigation.ts`, `page.tsx`, `dashboard-view.tsx`, `dashboard-layout.ts`, dashboard tests; UX dashboard (+ shell label B10 через navigation — координация с ShellNav: navigation.ts пишет Dashboard, ShellNav не дублирует rename) | Docs UX dashboard; OpenSpec review если был | B10 подписи; failing→green B11 на A; порядок на снимке с 4 карточками |
| **MilestoneResearch** | подготовка C09–C11 | Только docs/delivery заметка исследования; **без** package.json | Нет | Заметка: live examples, доработки, вывод по React-обёртке ECharts; libs не установлены |
| **LockOwner** | общие артефакты | При конфликте: единственный писатель `apps/web/package.json` + lockfile; единственный merge UX shell/dashboard при пересечении секций | По запросу Integrator | Нет гонок lockfile/UX |

**navigation.ts:** владелец **Dashboard** (B10). ShellNav не меняет label «Обзор».

### Волна 1b — интеграция этапа 1 (один агент)

| Агент | Задачи | Файлы | Зависимости | Критерий готовности |
| --- | --- | --- | --- | --- |
| **Integrator-1** | Сборка F01–F06 + B10–B11; проверка F02→docs; полный smoke оболочки, дашборда, `/docs/` | Merge веток/изменений; handoff | Все агенты волны 1 (кроме research может остаться open) | Один прогон: UI shell, dashboard A/C, `/docs/` + redirects + sidebar link; чекбоксы work-plan готовы к отметке |

### Волна 2 — после вашего выбора библиотек

| Агент | Задачи | Файлы | Зависимости | Критерий готовности |
| --- | --- | --- | --- | --- |
| **Contract** | Общий контракт данных для трёх рендереров | shared adapter module (напр. `executive-timeline-experiment.ts`) | Выбор libs человеком | Один тип входа = текущий derived set + asOf |
| **Renderer-A** | Один сторонний рендерер | свой wrapper component | Contract; deps уже добавлены LockOwner/Integrator-2 | Рендер на тех же вехах/снимке |
| **Renderer-B** | Второй сторонний рендерер | свой wrapper | Contract; deps | То же |
| **Integrator-2** | C10 toggle; C11 протокол и заметка; `package.json`/lock | обёртка секции, deps, delivery note | Contract + оба renderer | 1/2/3 работает; сравнение записано; без автозамены шкалы |

---

## Этапы реализации (сводка)

**Этап 1:** Волна 0 docs/ADR → Волна 1 параллельно → Integrator-1 smoke. Без chart-зависимостей.

**Этап 2:** Ответ человека по libs → LockOwner/Integrator-2 install → Contract → Renderer-A ∥ Renderer-B → Integrator-2 C10/C11.

---

## Нужен ваш ответ перед запуском агентов

1. Согласование **этого** плана (и копирование в `.cursor/plans/` репо).  
2. Для этапа 2 (можно позже): подтвердить **vis-timeline + ECharts** или иную пару; тогда же — ставить ли `echarts-for-react` или только `echarts`.  
3. При возражении по URL: иной контракт вместо `/docs/` + `routeBasePath: '/'`.
