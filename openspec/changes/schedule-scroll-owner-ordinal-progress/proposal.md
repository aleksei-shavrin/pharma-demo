## Why

В «Разделении» остаются два вертикальных скроллера и визуальный зазор; колонка ИСР пуста у EQ без доменного кода; progress показывает «нет данных» на строках, где ход неприменим; toggles живут над фильтрами текстом сравнения.

## What Changes

- Один physical vertical scroll owner для таблицы и диаграммы в split; без ручной привязки двух vertical scrollers; независимые H-scroll; sticky headers.
- Первый столбец «№» = непрерывный `visibleOrdinal`; ИСР остаётся authored `wbs`.
- Progress: work `null` → «нет данных»; group/milestone/equipment → «—» («Прогресс не применяется»).
- Toolbar: view + comparison правее «Тип точки»; comparison — иконки с tooltip/aria/selected.
- Docs/UX/walkthrough/ADR addendum; тесты + browser acceptance.

## Capabilities

### Modified Capabilities

- `schedule-workspace`: scroll owner, ordinal column, progress display for non-work, toolbar placement.

## Impact

- FE: schedule-view/board/timeline/adapter/toggles, scroll helpers.
- BE: только при найденном mapping gap (ожидаемо нет).
- Docs: UX, ADR-0004, walkthrough, OpenSpec living via apply.
