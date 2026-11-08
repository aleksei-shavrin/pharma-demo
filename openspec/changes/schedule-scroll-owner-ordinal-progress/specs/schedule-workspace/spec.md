## ADDED Requirements

### Requirement: Visible ordinal is a dedicated first column

Первая колонка таблицы SHALL быть «№» и SHALL показывать непрерывный порядковый номер видимых строк `visibleOrdinal` от 1 до N текущего списка (после фильтра и с учётом раскрытия). Колонка ИСР SHALL оставаться соседней и SHALL показывать authored `wbs`. Система SHALL NOT подменять `wbs` значением `visibleOrdinal`.

#### Scenario: Ordinal renumbers on filter without changing WBS

- **WHEN** пользователь фильтрует видимые строки
- **THEN** «№» показывает 1..N нового списка
- **AND** коды ИСР оставшихся строк не меняются

#### Scenario: Empty WBS stays empty beside ordinal

- **WHEN** у видимой строки нет `wbs`
- **THEN** «№» содержит порядковый номер
- **AND** ячейка ИСР пустая или содержит «—»

### Requirement: Split uses one vertical scroll owner

В режиме «Разделение» SHALL существовать один vertical scroll owner для строк таблицы и диаграммы. Система SHALL NOT поддерживать выравнивание двумя независимыми vertical scrollers через ручную привязку `scrollTop`. Горизонтальная прокрутка таблицы и диаграммы SHALL оставаться независимой. Шапка таблицы и шкала дат SHALL сохранять выравнивание при вертикальной прокрутке (sticky или общий header band).

#### Scenario: Wheel over either pane moves the same owner

- **WHEN** пользователь крутит колесо над таблицей или над диаграммой в «Разделении»
- **THEN** обе части смещаются одним вертикальным offset
- **AND** середина списка не накапливает рассинхрон шага

### Requirement: Non-work progress is not applicable

Для `project_group`, `stage_group`, `milestone` и `equipment_delivery` ячейка прогресса SHALL показывать «—» и SHALL NOT показывать «нет данных». Доступное имя MAY пояснять «Прогресс не применяется». Для `work` с `progressPct` `null` подпись SHALL оставаться «нет данных». Значение `0` у работы SHALL оставаться видимым 0%.

#### Scenario: Equipment shows not-applicable progress

- **WHEN** отображается строка оборудования
- **THEN** в прогрессе виден «—»
- **AND** нет подписи «нет данных»

#### Scenario: Work unknown stays no-data

- **WHEN** у работы `progressPct` равен `null`
- **THEN** в прогрессе видна подпись «нет данных»
- **AND** это отличимо от 0% и от «—»

### Requirement: View and comparison controls sit in the filter toolbar

Переключатели представления и сравнения SHALL стоять в одной toolbar-строке правее фильтра «Тип точки». Сравнение SHALL использовать иконки с доступным именем, подсказкой и состоянием selected (`aria-pressed`).

#### Scenario: Comparison control exposes accessible names

- **WHEN** на снимке с работами открыт календарный план
- **THEN** кнопки сравнения имеют имена «Базовый план / прогноз» и «Базовый план / факт»
- **AND** выбранная кнопка отмечена как pressed

## MODIFIED Requirements

### Requirement: Expand state is shared by table and chart

Один владелец SHALL хранить раскрытие, выбор, фильтры и якорь прокрутки. Раскрытие группы SHALL менять видимые строки таблицы и диаграммы одним списком. Первая колонка данных структуры SHALL быть «№» (`visibleOrdinal`). Колонка ИСР SHALL показывать `wbs` строки. Пустой `wbs` SHALL отображаться как пустая ячейка или «—». Система SHALL NOT подменять `wbs` порядковым номером видимой строки. Наименование SHALL стоять после ИСР и SHALL NOT дублировать вид строки словами «работа», «веха» или «этап».

#### Scenario: Collapse hides children in both surfaces

- **WHEN** пользователь сворачивает `AN-08`
- **THEN** таблица и диаграмма скрывают `8.2` и её детей
- **AND** строка `AN-08` остаётся
- **AND** код ИСР оставшихся строк не перенумеровывается
- **AND** «№» пересчитывается по видимому списку

#### Scenario: Row without a code shows an empty WBS cell

- **WHEN** у видимой строки нет `wbs`
- **THEN** ячейка ИСР пустая или содержит «—»
- **AND** наименование остаётся в соседней колонке после ИСР

### Requirement: Progress zero is distinct from unknown progress

Поле `progressPct` SHALL быть числом или `null`. Значение `0` SHALL означать известное отсутствие хода у работы. Значение `null` у работы SHALL означать неизвестный ход и подпись «нет данных». Система SHALL NOT вычислять `progressPct` из статуса работы или из эмодзи исходника. У `project_group` и `stage_group` `progressPct` SHALL быть `null`. Отображение «не применяется» для group/milestone/equipment регулируется требованием Non-work progress is not applicable и SHALL NOT трактоваться как известный ноль.

#### Scenario: Group progress stays not applicable

- **WHEN** отображается группа `8.2` или `AN-08`
- **THEN** прогресс показан как «—»
- **AND** в ячейке нет чисел 0 и 100
- **AND** нет подписи «нет данных»

#### Scenario: Work progress zero is visible

- **WHEN** отображается работа `8.2.1`
- **THEN** пользователь видит 0%
- **AND** это состояние отличимо от строки с `progressPct` `null`
