# Портфель и календарь

Статус: R1 и R2 согласованы 2026-11-06. Реализация идёт в pharma-demo. E02 открыт до репетиции другим участником.

Портфель, программы, проекты и их маршруты не меняются. Маршрут директора C → D → F — регрессия. Модель портфеля не меняется: дереву календаря не хватает полей строки Schedule, а не членства `PRG-*` / `AN-*`.

## Контракт

Не дублируется здесь. Источники:

- Change: [openspec/changes/schedule-hierarchy-baseline-forecast/](../../openspec/changes/schedule-hierarchy-baseline-forecast/)
- [UX календарного плана](../../docs/05-ux-ui/demo-v1-schedule-workspace.md) §1.6–§1.7
- [Narrative](../../docs/03-product/demo-v1-mock-narrative-data.md) — раздел подвыборки календаря
- [ADR-0004](../../docs/06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md) — addendum иерархии и необязательной базы

## Владельцы

| Трек | Только эти файлы | Готовность |
|------|------------------|------------|
| API и fixtures | `apps/api/src/schedule/**`, `apps/api/src/data/fixtures/schedule-works.ts`, типы schedule в `apps/web/src/lib/api-client.ts` | Снимок C: дерево AN-08 → 8.2, работы 8.2.1 и 8.2.2, одна строка MS-CLN-PANEL, прежние WK-01…WK-05. A, D, F без новых строк |
| Видимые строки | `apps/web/src/lib/schedule/visible-rows.ts`, `schedule-warning.ts`, `apps/web/src/components/schedule/schedule-view.tsx` | Одно состояние раскрытия и выбора для таблицы и диаграммы |
| Таблица | `apps/web/src/components/schedule/schedule-board.tsx` и его тесты | Колонки №, имя, предупреждение с текстом, прогресс; 0% и «нет данных» различимы |
| Основной Gantt | `dhtmlx-gantt-adapter.tsx`, его CSS, `to-gantt-presentation.ts` и их тесты | Сводка, контур при 0%, заливка 40 и 100, ромб, четыре стрелки, обе темы. Без полосы базы |
| Сравнение | `apps/web/scripts/gantt-interval-lab/**`, отчёт, модуль overlay не подключается к адаптеру до вердикта | База над прогнозом; разнос, короткий интервал, строка без базы, раскрытие, выравнивание, стрелка на строке с базой и зависимостью |
| Приёмка | walkthrough и отчёт сценария | Шаги C, регрессия календаря A/D/F, маршрут C → D → F. E02 не закрывать |
| Интегратор | план работ и включение overlay, если критерии пройдены | Синхронное раскрытие, порядок, 0/40/100, предупреждение, ромб, стрелки. Иначе одна прогнозная полоса и запись невыполненного критерия |
