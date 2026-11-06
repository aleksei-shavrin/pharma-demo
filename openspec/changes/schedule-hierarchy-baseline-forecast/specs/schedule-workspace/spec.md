# schedule-workspace Specification (delta)

## Purpose

Расширяет Schedule view-model группами, явным прогрессом и необязательным базовым интервалом. Не вводит Domain WBS и не заменяет прогнозную полосу.

## ADDED Requirements

### Requirement: Schedule tree rows keep stable identity

На снимке C Schedule SHALL содержать одну строку `project_group` с id `AN-08`, одну строку `stage_group` с id `8.2` и parentKey `project_group:AN-08`, работы `8.2.1` и `8.2.2` с parentKey `stage_group:8.2`. Веха `MS-CLN-PANEL` SHALL оставаться одной строкой с прежним id. На снимке C её parentKey SHALL быть `stage_group:8.2`, а wbs SHALL быть `8.2.3`. Система SHALL NOT создавать вторую строку с id `MS-CLN-PANEL`.

#### Scenario: Snapshot C nests the existing panel milestone

- **WHEN** клиент запрашивает schedule `PRJ-01` на снимке C
- **THEN** среди items ровно одна запись с id `MS-CLN-PANEL` и kind `milestone`
- **AND** её parentKey равен `stage_group:8.2`
- **AND** в ответе есть группы `AN-08` и `8.2` и работы `8.2.1`, `8.2.2`
- **AND** работы `WK-01`…`WK-05` присутствуют с parentKey `null`

#### Scenario: Snapshots A, D and F do not gain the tree

- **WHEN** клиент запрашивает schedule на снимке A, D или F
- **THEN** в items нет kind `project_group` и `stage_group`
- **AND** нет работ `8.2.1` и `8.2.2`
- **AND** у `MS-CLN-PANEL` parentKey пустой
- **AND** на A список links пуст

### Requirement: Progress zero is distinct from unknown progress

Поле `progressPct` SHALL быть числом или `null`. Значение `0` SHALL означать известное отсутствие хода. Значение `null` SHALL означать неизвестный ход и подпись «нет данных». Система SHALL NOT вычислять `progressPct` из статуса работы или из эмодзи исходника. У `project_group` и `stage_group` `progressPct` SHALL быть `null`.

#### Scenario: Group progress stays unknown

- **WHEN** отображается группа `8.2` или `AN-08`
- **THEN** прогресс показан как неизвестный
- **AND** в ячейке нет чисел 0 и 100

#### Scenario: Work progress zero is visible

- **WHEN** отображается работа `8.2.1`
- **THEN** пользователь видит 0%
- **AND** это состояние отличимо от строки с `progressPct` `null`

### Requirement: Optional baseline does not replace the forecast bar

Работа SHALL иметь прогнозный интервал `startDate` и включительный `endDate`. Базовый интервал SHALL задаваться парой `baselineStart` и `baselineEnd` либо отсутствовать целиком. Отсутствие базы SHALL оставлять прогнозную полосу, сводку группы, ромб вехи и стрелки. Система SHALL NOT хранить фактический интервал работы в этом change.

#### Scenario: Work without baseline still has a forecast bar

- **WHEN** у работы `8.2.1` нет базового интервала
- **THEN** прогнозная полоса отображается
- **AND** полоса базы не создаётся

#### Scenario: Group summary spans child forecast bounds

- **WHEN** группа `8.2` раскрыта и у детей есть прогнозные границы
- **THEN** сводная полоса покрывает диапазон от самой ранней до самой поздней прогнозной границы этих детей
- **AND** прогресс группы остаётся неизвестным

### Requirement: Schedule warning has an accessible name

Предупреждение SHALL быть компактной иконкой с текстовой расшифровкой. Если заданы и база, и прогноз, и интервалы различаются, текст SHALL сообщать, что прогноз отличается от базового плана. Иначе при статусе Delayed или при `sourceWeeks` текст SHALL сообщать об отставании и SHALL включать число недель только если оно записано на этой строке. Иначе иконки SHALL NOT быть.

#### Scenario: Stage warning uses its own week count

- **WHEN** отображается этап `8.2` с `sourceWeeks` 3
- **THEN** доступное имя предупреждения содержит отставание и 3 недели

### Requirement: Expand state is shared by table and chart

Один владелец SHALL хранить раскрытие и выбор. Раскрытие группы SHALL менять видимые строки таблицы и диаграммы одним списком. Номер строки SHALL быть порядковым номером видимой строки и SHALL NOT подменять wbs.

#### Scenario: Collapse hides children in both surfaces

- **WHEN** пользователь сворачивает `AN-08`
- **THEN** таблица и диаграмма скрывают `8.2` и её детей
- **AND** строка `AN-08` остаётся
- **AND** номера видимых строк пересчитываются

## MODIFIED Requirements

### Requirement: Work interval is a single forecast bar

Система SHALL кодировать основную полосу работы полями `startDate` и `endDate` как прогнозный интервал в календарных днях. Конец SHALL быть включительным. Если заданы оба конца базового интервала, базовая полоса SHALL рисоваться над прогнозной на той же логической строке. Система SHALL NOT заменять прогнозную полосу базовой. Отсутствие базы SHALL оставлять прогнозную полосу без узла базы. Система SHALL NOT рисовать фактическую полосу работы. Подвыборка снимка C SHALL NOT содержать строку, у которой одновременно есть базовый интервал и зависимость: крепление стрелки в этом сочетании не является сценарием продукта и остаётся только в лаборатории.

#### Scenario: Baseline bar sits above the forecast when both ends exist

- **WHEN** у работы заданы прогнозный интервал и оба конца базы
- **THEN** базовая полоса отображается над прогнозной на той же логической строке
- **AND** прогнозная полоса остаётся

#### Scenario: Inclusive end maps to visible span

- **WHEN** work имеет `startDate` = D1 и `endDate` = D2 (D2 ≥ D1)
- **THEN** прогнозная полоса покрывает календарные дни от D1 до D2 включительно

#### Scenario: Same-day work remains a one-day bar

- **WHEN** work имеет `startDate` равный `endDate`
- **THEN** UI показывает видимую прогнозную полосу длиной в один календарный день
- **AND** строка не рендерится как zero-duration milestone
