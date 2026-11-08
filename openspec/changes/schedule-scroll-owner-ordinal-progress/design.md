## Context

Split сегодня: React table + DHTMLX hierarchical (`show_grid=false`) + `bindSchedulePaneScroll`. Community MIT 10.0.3; PRO baselines запрещены (ADR-0004).

## Goals / Non-Goals

**Goals:** один vertical scroll owner; колонка №; progress semantics; toolbar icons.

**Non-Goals:** Domain WBS; invented %; миграция на DHTMLX grid как обязательный путь; DS package; commit/push.

## Decisions

1. **Shared outer owner** — presentation `overflow-y-auto`; panes без собственного vertical scroll; DHTMLX host height = scale + N×row; hide/ignore `.gantt_ver_scroll`. Native `show_grid` sync не требуется, если outer owner надёжен.
2. **Sticky** — table header sticky к owner; scale sticky через CSS при цепочке без `overflow-y: hidden` на вертикали.
3. **№ vs ИСР** — `visibleOrdinal` в «№»; `wbs` в «ИСР»; не смешивать.
4. **Progress UI** — non-work dash + a11y; work unknown остаётся «нет данных».
5. **Toolbar** — одна строка фильтров; comparison Lucide icons.

## Risks

- Sticky scale внутри vendor DOM; fallback — header band вне scroll.
- Overlays/links при full-height host — проверить paint после setSizes.
- Perf N≈113: `smart_rendering` остаётся false (уже); full height ок для demo N.
