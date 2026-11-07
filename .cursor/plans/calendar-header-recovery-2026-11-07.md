---
name: Calendar header recovery
overview: "Паритет X/width всех колонок шапки и тела (общий источник ширин) + читаемые подписи месяцев DHTMLX (RU short + yy, min 72). Без leadOnly, без ломки 32/40, scroll, C07, links."
todos:
  - id: docs-ux
    content: "UX §1.11: паритет шапка/тело из одного источника ширин; краткая шкала + tooltip"
    status: completed
  - id: fix-columns
    content: "schedule-column-geometry + board: фиксированные width шапка=тело; minWidth из суммы; actual +4×120+gaps"
    status: completed
  - id: fix-gantt
    content: "adapter: RU short+yy format/title, min_column_width=SCHEDULE_MONTH_COL_PX, ellipsis CSS"
    status: completed
  - id: verify
    content: "Failing→passing tests; browser numeric parity 1440/1766 A/C light/dark forecast/actual"
    status: completed
  - id: handoff
    content: "Handoff; без git commit до завершения recovery 7e6c7329"
    status: completed
isProject: false
---

# Calendar header recovery 2026-11-07

**Координация:** Codex review принят с уточнениями → Cursor executor. Сессия recovery `7e6c7329-4250-476e-a511-4394240325fb` пишет только page-surface / docs ops / status — **не** schedule UX §1.11 и не календарный код. Коммиты — та сессия; этот трек **не** делает `git add`/`commit` до её завершения.

Ссылаться: [DOC-UX-005](../../docs/05-ux-ui/demo-v1-schedule-workspace.md) §1.11, [calendar-unified-geometry](./calendar-unified-geometry.md). Не дублировать ADR/OpenSpec.

## Доказательства до фикса (Codex / Playwright, 1440×900, A, split, light)

| Метрика | До |
|--------|-----|
| Header «Наименование» | width **0**, minWidth **0**, overflow visible → overlap |
| Body «Наименование» | width **160** |
| Date header vs body | header **111.375** vs body **96** (текст шапки шире min) |
| Months `.gantt_scale_cell` | width **56**, scrollWidth **75–84**, format `%F %Y`, clip, без title |
| Геометрия строк | 32 / 40 OK |

## Уточнения Codex (обязательны)

1. Главный критерий — **одинаковые X и width** всех колонок шапки и первой строки тела (и после horizontal scroll), не только «нет overlap».
2. Общий источник размеров **или** одинаковый фиксированный `width`/`basis` у соответствующих ячеек. Одного `min-w-[160px]` у имени **недостаточно**, если заголовок даты раздувается текстом.
3. `min-width` board — **сумма реальных колонок + gaps + padding**, без произвольного 1264 в комментарии как «магии»; формула должна учитывать `actual` (`4×120` + gaps).
4. Все клетки — одна строка, ellipsis + `title` где нужно.
5. `leadOnly` в production **не** включать; полный набор столбцов Table=Split.
6. Gantt: RU сокращение + 2-digit year; `min_column_width = SCHEDULE_MONTH_COL_PX` (72); полное имя в tooltip; штатный `format`/template, без лишних post-render handlers.
7. Сначала docs и **failing** regression на конкретный баг, затем минимальные правки.
8. Не тестировать только наличие CSS-класса: numeric parity header/body.
9. Сохранить шаг 32 / header 40, scroll anchors, C07, cross-project links.

## Решение

### Колонки таблицы

Новый модуль `apps/web/src/lib/schedule/schedule-column-geometry.ts`:

- константы ширин (wbs 72, name 160, warn 48, progress 148, type 96, object 140, date 96, fact 120, delta 72, status 112, crit 80);
- `gap` = 12 (`gap-3`), горизонтальный padding rail = 12+12;
- `wideTableMinWidthPx(comparison)` = Σ widths + (n−1)×gap + pad;
- шапка и тело ставят **одинаковый** `width`/`minWidth`/`maxWidth` (fixed), `truncate`/`overflow-hidden`, `data-schedule-col=<id>`.

### Шкала DHTMLX

- `format` function → короткий RU + `yy`, HTML/`title` с полным «месяц YYYY»;
- `min_column_width = SCHEDULE_MONTH_COL_PX`;
- CSS ellipsis на `.gantt_scale_cell`.

### Docs / handoff

- §1.11: паритет ширин из одного источника; краткие подписи шкалы + tooltip. `status` не поднимать.
- Handoff `docs/07-delivery/handoffs/2026-11-07-calendar-header-recovery.md` после реализации.

## Приёмка

`http://localhost:3080/schedule`, «Разделение», снимок C; **1440 и 1766**; **light и dark**; стороны **A/C** (один Chromium допустим с пометкой); **forecast и actual**.

Критерии: numeric X/width parity всех колонок; месяцы не склеены; 32/40; hierarchy/links/C07 path без регрессии; typecheck + schedule tests зелёные.

## Вне scope

Page-surface / docker / recovery commits; OpenSpec archive; E02/C06/C07 галочки; мобильная доводка.
