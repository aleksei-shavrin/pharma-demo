# schedule-workspace Specification

## Purpose

Контракт и поведение рабочего пространства Schedule Demo v1: контрольные точки, curated интервальные работы, семантические статусы и read-only типизированные зависимости. Не scheduling engine.

> Демо-контракт согласован 2026-11-06. Curated fixture rows — после ответа аналитика.

## Requirements

### Requirement: Schedule items include curated work rows

Schedule API SHALL допускать items с `kind: 'work'` наряду с `equipment_delivery` и `milestone`. Work SHALL NOT вводить Domain entity Activity / Task / WBS. Work `id` SHALL использовать исходный идентификатор аналитика, когда он уникален и стабилен; presentation / link refs SHALL использовать форму `work:<id>`.

#### Scenario: Work row shape

- **WHEN** клиент запрашивает schedule для снимка с curated works
- **THEN** ответ может содержать items с `kind: 'work'`
- **AND** каждый work имеет `id`, `name`, `startDate`, `endDate`, `status`
- **AND** Domain catalogue не добавляет Activity/Task/WBS entity

### Requirement: Work interval is a single forecast bar

Система SHALL кодировать основную (нижнюю) полосу работы полями `startDate` и `endDate` как прогнозный интервал в календарных днях. Конец SHALL быть включительным. Если заданы оба конца базы, базовая полоса SHALL рисоваться над прогнозной на той же строке. Система SHALL NOT заменять прогнозную полосу базовой. Отсутствие базы SHALL оставлять прогноз без узла базы. Запрет фактической полосы SHALL быть mode-qualified (сценарий Fact painting follows comparison mode).

#### Scenario: Fact painting follows comparison mode

- **WHEN** включён режим «Базовый план / прогноз»
- **THEN** фактическая полоса не рисуется
- **AND** в режиме «Базовый план / факт» закрытый факт MAY заменить только нижнюю полосу по Comparison uses at most two bars
- **AND** открытый факт не рисует отдельную фактическую полосу

#### Scenario: Snapshot C allows baseline with scheduling links on WK-01

- **WHEN** читается подвыборка снимка C для `WK-01`
- **THEN** у работы заданы оба конца базы, совпадающие с прогнозом
- **AND** существуют scheduling-связи SS и FS с участием `WK-01`
- **AND** крепление стрелок к нижней отображаемой полосе следует правилу Link edges follow the displayed lower bar

#### Scenario: Baseline bar sits above the forecast when both ends exist

- **WHEN** у работы заданы прогнозный интервал и оба конца базы
- **THEN** базовая полоса отображается над прогнозной на той же логической строке
- **AND** прогнозная полоса остаётся в режиме прогноза

#### Scenario: Inclusive end maps to visible span

- **WHEN** work имеет `startDate` = D1 и `endDate` = D2 (D2 ≥ D1)
- **THEN** прогнозная полоса покрывает календарные дни от D1 до D2 включительно

#### Scenario: Same-day work remains a one-day bar

- **WHEN** work имеет `startDate` равный `endDate`
- **THEN** UI показывает видимую прогнозную полосу длиной в один календарный день
- **AND** строка не рендерится как zero-duration milestone

### Requirement: Work status enum and visible text

Система SHALL использовать статус работы из множества `Waiting` | `OnSchedule` | `Delayed` | `Completed` с русскими подписями Ожидание / По графику / Отстаёт / Выполнено. Система SHALL NOT использовать параллельные коды `InProgress` и `OnTrack` в этом контракте. Статус SHALL быть задан в данных снимка (authored); система SHALL NOT требовать расчёта статуса от `scenarioAsOfDate` для G07–G11.

#### Scenario: Status readable without color alone

- **WHEN** пользователь смотрит строку work в таблице
- **THEN** отображается русская подпись статуса
- **AND** цвет полосы согласован с semantic tokens статуса

### Requirement: Typed display-only dependency links between works

Schedule API SHALL включать `links`. Для связей с явным `kind: scheduling` SHALL быть `id`, `sourceRef`, `targetRef`, `type` ∈ {`FS`,`SS`,`FF`,`SF`} с концами `work:<entityId>` того же ответа. Links SHALL быть read-only в UI. Scheduling-связи SHALL NOT иметь ends на `milestone` или `equipment_delivery`. Kind `cross_project_predecessor` SHALL следовать Milestone to work link is an untyped cross-project predecessor. Система SHALL NOT публиковать scheduling link без явного `kind`.

#### Scenario: Four link types present in demo fixture set

- **WHEN** загружен согласованный демо-снимок с scheduling-зависимостями
- **THEN** среди scheduling links представлены типы FS, SS, FF и SF
- **AND** каждый конец резолвится в work item
- **AND** у каждой scheduling-связи задан явный `kind: scheduling`

#### Scenario: Snapshot without works keeps control-point markers

- **WHEN** schedule снимка не содержит work items и scheduling links пуст
- **THEN** milestone и equipment_delivery продолжают отображаться точечными маркерами как до G07–G11

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

Работа SHALL иметь прогнозный интервал `startDate` и включительный `endDate`. Базовый интервал SHALL задаваться парой `baselineStart` и `baselineEnd` либо отсутствовать целиком. Отсутствие базы SHALL оставлять прогнозную полосу, сводку группы, ромб вехи и стрелки. Фактический интервал, если хранится, SHALL регулироваться требованиями Actual work dates are explicit and inclusive и Comparison uses at most two bars и SHALL NOT подменять определение прогнозной полосы в этом требовании.

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

Один владелец SHALL хранить раскрытие, выбор, фильтры и якорь прокрутки. Раскрытие группы SHALL менять видимые строки таблицы и диаграммы одним списком. Первая колонка SHALL показывать `wbs` строки. Пустой `wbs` SHALL отображаться как пустая ячейка или «—». Система SHALL NOT подменять `wbs` порядковым номером видимой строки. Наименование SHALL стоять в соседней колонке и SHALL NOT дублировать вид строки словами «работа», «веха» или «этап».

#### Scenario: Collapse hides children in both surfaces

- **WHEN** пользователь сворачивает `AN-08`
- **THEN** таблица и диаграмма скрывают `8.2` и её детей
- **AND** строка `AN-08` остаётся
- **AND** код ИСР оставшихся строк не перенумеровывается

#### Scenario: Row without a code shows an empty WBS cell

- **WHEN** у видимой строки нет `wbs`
- **THEN** ячейка ИСР пустая или содержит «—»
- **AND** наименование остаётся в соседней колонке

### Requirement: Actual work dates are explicit and inclusive

У работы SHALL быть `actualStart` и `actualEnd`: дата `YYYY-MM-DD` или `null`. Заданный конец SHALL быть включительным. Оба `null` SHALL означать отсутствие факта. Только `actualStart` SHALL означать начатый и не завершённый факт. Оба значения SHALL задавать закрытый факт, если конец не раньше начала.

#### Scenario: Closed actual interval is inclusive

- **WHEN** у работы `actualStart` равен `2027-02-18` и `actualEnd` равен `2027-02-23`
- **THEN** фактический интервал покрывает календарные дни от `2027-02-18` до `2027-02-23` включительно

#### Scenario: Open actual has no end

- **WHEN** у работы `actualStart` равен `2027-03-01` и `actualEnd` равен `null`
- **THEN** факт начат и не завершён
- **AND** фактического конца нет

### Requirement: Service checks actual dates against the scenario date

Сервис SHALL отвергать неразбираемую фактическую дату, `actualEnd` без `actualStart`, `actualEnd` раньше `actualStart` и любую заданную фактическую дату позже `scenarioAsOfDate` того же снимка. Дата, равная `scenarioAsOfDate`, SHALL быть допустима.

#### Scenario: Actual start on the scenario date is accepted

- **WHEN** снимок C имеет `scenarioAsOfDate` `2027-03-01` и `actualStart` равен `2027-03-01`
- **THEN** сервис принимает это начало

#### Scenario: Actual date after the scenario date is rejected

- **WHEN** заданная фактическая дата равна `2027-03-02`, а `scenarioAsOfDate` равен `2027-03-01`
- **THEN** сервис отвергает работу

### Requirement: Actual dates are not derived

Система SHALL NOT заполнять `actualStart` или `actualEnd` из `progressPct`, `status`, прогноза или базы.

#### Scenario: Completed status does not create actual dates

- **WHEN** у `WK-02` статус `Completed` и оба фактических поля пусты
- **THEN** в ответе оба фактических поля остаются пустыми

### Requirement: Comparison uses at most two bars

Пользователь SHALL видеть режим «Базовый план / прогноз» по умолчанию и SHALL мочь выбрать «Базовый план / факт». На строке SHALL быть не больше двух полос. Верхняя полоса SHALL быть базой, если заданы оба её конца. Нижняя полоса SHALL быть прогнозом, кроме закрытого факта в режиме факта: тогда нижняя полоса SHALL быть фактическим интервалом.

#### Scenario: Default mode keeps forecast under baseline

- **WHEN** пользователь не выбирал режим факта и у `8.2.2` заданы оба конца базы
- **THEN** базовая полоса находится над прогнозной
- **AND** фактическая полоса не рисуется

#### Scenario: Closed fact replaces only the lower bar

- **WHEN** пользователь выбирает режим факта и у работы заданы оба фактических конца
- **THEN** нижняя полоса равна фактическому интервалу
- **AND** базовая полоса остаётся над ней, если заданы оба конца базы
- **AND** третьей полосы прогноза нет

### Requirement: Open actual start stays in the table

В режиме факта система SHALL NOT рисовать полосу и SHALL NOT рисовать отметку для одного `actualStart`. Начало SHALL быть в таблице. Пустой конец SHALL отображаться как «—». Нижняя полоса SHALL оставаться прогнозом.

#### Scenario: Snapshot C work 8.2.2 keeps the forecast bar

- **WHEN** режим факта показывает `8.2.2` с `actualStart` `2027-03-01` и пустым `actualEnd`
- **THEN** на диаграмме остаются прогнозная и базовая полосы
- **AND** подпись строки равна «Прогноз — факт не завершён»
- **AND** таблица показывает фактическое начало `2027-03-01` и «—» в фактическом конце

### Requirement: Fact mode names the row

В режиме факта работа SHALL иметь подпись «Факт», «Прогноз — факт не завершён» или «Прогноз — факта нет» соответственно закрытому факту, только началу и отсутствию факта. Подпись SHALL быть доступна через accessible name / `title` / поле presentation `factCaption` и/или таблицу. Система SHALL NOT рисовать эти подписи текстом на полосе, ромбе или стрелке. В режиме прогноза этих подписей SHALL NOT быть.

#### Scenario: Three captions follow the stored fields

- **WHEN** режим факта показывает закрытый факт, только начало и работу без факта
- **THEN** подписи равны «Факт», «Прогноз — факт не завершён» и «Прогноз — факта нет»
- **AND** на фигурах диаграммы текстовых подписей факта нет

#### Scenario: Default mode has no fact caption

- **WHEN** включён режим прогноза
- **THEN** этих трёх подписей нет

### Requirement: Fact mode names forecast and actual columns

В режиме факта даты работы SHALL называться «Прогноз, начало», «Прогноз, окончание», «Факт, начало» и «Факт, окончание». Эти подписи SHALL NOT использовать заголовок «Базовая дата» для прогноза или факта работы. Пустое фактическое поле SHALL быть «—». В режиме прогноза прежние заголовки и значения SHALL оставаться.

#### Scenario: Work without fact shows empty actual cells

- **WHEN** режим факта показывает `8.2.1`
- **THEN** прогнозные колонки содержат `2027-02-25` и `2027-03-02`
- **AND** обе фактические колонки содержат «—»

### Requirement: Snapshot C stores one open actual

На снимке C работа `8.2.2` SHALL иметь `actualStart` `2027-03-01` и `actualEnd` `null`. Работы `8.2.1` и `WK-02` SHALL иметь оба фактических поля пустыми. Прогноз, база, статус, прогресс и связи этих строк SHALL не меняться. Снимки A, D и F SHALL NOT получать работы `8.2.1` и `8.2.2`.

#### Scenario: Open actual does not rewrite the forecast

- **WHEN** клиент запрашивает schedule снимка C
- **THEN** у `8.2.2` фактическое начало `2027-03-01`, конец пуст, прогноз `2027-03-04`…`2027-03-18`, база `2027-02-26`…`2027-03-08`

#### Scenario: Two works stay without fact

- **WHEN** читается тот же ответ
- **THEN** у `8.2.1` и `WK-02` оба фактических поля пусты

### Requirement: Snapshot C stores a closed fact on WK-01

На снимке C работа `WK-01` SHALL хранить прогноз `2027-02-20`…`2027-02-24`, базу `2027-02-20`…`2027-02-24` и факт `2027-02-18`…`2027-02-23`. Это синтетические демоданные. В режиме прогноза нижняя полоса SHALL оставаться прогнозом, а верхняя база SHALL рисоваться общим правилом обоих концов. Система SHALL NOT иметь отдельного правила для id `WK-01`.

#### Scenario: Default mode shows a coincident baseline bar

- **WHEN** снимок C открыт в режиме прогноза
- **THEN** у `WK-01` нижняя полоса равна `2027-02-20`…`2027-02-24`
- **AND** верхняя полоса равна тому же интервалу

#### Scenario: Fact mode shows baseline over the closed actual

- **WHEN** снимок C открыт в режиме факта
- **THEN** нижняя полоса `WK-01` равна `2027-02-18`…`2027-02-23`
- **AND** верхняя полоса равна `2027-02-20`…`2027-02-24`
- **AND** подпись строки равна «Факт»

### Requirement: Link edges follow the displayed lower bar

Связь SHALL адресовать id работы. У закрытого факта край source или target SHALL лежать на соответствующем конце нижней фактической полосы. У открытого факта и у работы без факта край SHALL оставаться на прогнозной полосе. Приёмка SHALL сверять положение краёв source и target для SS, FS, FF и SF, а не только id связи.

#### Scenario: FS and SS leave the closed actual bar

- **WHEN** режим факта показывает снимок C, где у `WK-01` закрытый факт, а у `WK-02` и `WK-03` факта нет
- **THEN** SS встречается с `WK-01` в начале `2027-02-18` и с `WK-02` в начале прогноза
- **AND** FS встречается с `WK-01` в конце `2027-02-23` и с `WK-03` в начале прогноза

#### Scenario: FF and SF stay on forecast ends

- **WHEN** у `WK-03`, `WK-04` и `WK-05` фактических дат нет
- **THEN** FF встречается с прогнозами `WK-03` и `WK-04` в их концах
- **AND** SF встречается с началом прогноза `WK-04` и концом прогноза `WK-05`

#### Scenario: Switching mode moves only WK-01 edges

- **WHEN** пользователь переключает снимок C с режима прогноза на режим факта
- **THEN** края SS и FS на стороне `WK-01` переходят с прогноза `2027-02-20` и `2027-02-24` на факт `2027-02-18` и `2027-02-23`
- **AND** края FF и SF не меняются
- **AND** края `WK-02` и `WK-03` остаются на их прогнозе

### Requirement: Collapse hides fact chrome with the row

Сворачивание группы SHALL скрывать в таблице и на диаграмме детей вместе с их нижней полосой, верхней полосой и подписью режима факта.

#### Scenario: Collapse hides the open-fact work

- **WHEN** пользователь сворачивает `AN-08` в режиме факта
- **THEN** `8.2.2` скрыта в таблице и на диаграмме
- **AND** её базовая полоса и подпись факта скрыты

### Requirement: Fact versus baseline has no new color

Этот change SHALL NOT вводить отдельный цвет отклонения факта от базы.

#### Scenario: Closed comparison uses the existing bar tones

- **WHEN** режим факта показывает закрытый факт под базой
- **THEN** отдельный цвет отклонения не рисуется

### Requirement: Snapshot C adds collapsed power and HVAC branches

На снимке C Schedule SHALL добавить `project_group` `AN-24` и `AN-09`, свёрнутые по умолчанию, и вложить единственную `MS-UTL-PWR` в `24.1` без смены id и дат. Новые работы SHALL нести синтетический прогноз и `progressPct` `null`. A, D и F SHALL сохранить прежний состав. При раскрытии по умолчанию (открыты `AN-08` и `8.2`, ветки `AN-24`/`AN-09` свёрнуты) видимых строк SHALL быть 106; полный ответ при полном раскрытии SHALL содержать 113 строк.

#### Scenario: Full expansion counts 113 rows

- **WHEN** клиент запрашивает schedule `PRJ-01` на снимке C и раскрыты все группы
- **THEN** в ответе 113 строк
- **AND** среди них ровно три `project_group`: `AN-08`, `AN-24`, `AN-09`
- **AND** этапы `24.1` и `9.3` присутствуют
- **AND** работы `24.1.1`, `24.1.2`, `9.3.1`, `9.3.2` присутствуют

#### Scenario: Default expansion shows 106 visible rows

- **WHEN** на снимке C открыт календарный план с раскрытием по умолчанию
- **THEN** видимы 106 строк
- **AND** полный ответ Schedule по-прежнему содержит 113 элементов

#### Scenario: Power milestone keeps its identity inside stage 24.1

- **WHEN** клиент запрашивает schedule на снимке C
- **THEN** ровно одна строка имеет id `MS-UTL-PWR` и kind `milestone`
- **AND** её parentKey равен `stage_group:24.1`, а wbs равен `24.1.3`
- **AND** baselineDate равен `2027-02-18`, forecastDate равен `2027-04-15`

#### Scenario: New works use synthetic forecasts and unknown progress

- **WHEN** отображаются новые работы снимка C
- **THEN** `24.1.1` имеет прогноз `2027-02-08`…`2027-03-19`, статус Delayed и `sourceWeeks` 8
- **AND** `24.1.2` имеет прогноз `2027-02-15`…`2027-03-12` и статус OnSchedule
- **AND** `9.3.1` имеет прогноз `2027-02-22`…`2027-03-19` и статус OnSchedule
- **AND** `9.3.2` имеет прогноз `2027-04-16`…`2027-04-30` и статус Waiting
- **AND** у каждой из этих работ `progressPct` равен `null`, а базовый интервал отсутствует
- **AND** у этапа `24.1` `sourceWeeks` равен 8, у этапа `9.3` недели не заданы

#### Scenario: New project groups start collapsed

- **WHEN** календарный план снимка C открыт с раскрытием по умолчанию
- **THEN** открыты `AN-08` и `8.2`
- **AND** `AN-24` и `AN-09` свёрнуты, их дети не видны

#### Scenario: Existing episode and other snapshots stay

- **WHEN** клиент сравнивает снимок C с A, D и F
- **THEN** на C сохранены дерево `AN-08`, база `8.2.2` и четыре связи WK
- **AND** на A, D и F нет групп и работ `AN-24`, `24.1`, `AN-09`, `9.3`
- **AND** на A, D и F у `MS-UTL-PWR` parentKey пустой

### Requirement: Milestone to work link is an untyped cross-project predecessor

Связь SHALL иметь явный `kind`. `scheduling` SHALL требовать work↔work и type из FS, SS, FF, SF. `cross_project_predecessor` SHALL идти от `milestone:MS-UTL-PWR` к `work:9.3.2` без типа планирования. Оба конца SHALL быть в том же ответе Schedule.

#### Scenario: Scheduling links still require a planning type

- **WHEN** связь имеет kind `scheduling`
- **THEN** оба конца имеют вид `work:<id>`
- **AND** type равен одному из FS, SS, FF, SF
- **AND** четыре связи WK остаются этим видом

#### Scenario: Cross-project predecessor has no planning type

- **WHEN** связь имеет kind `cross_project_predecessor` и id `LNK-X-PWR-HVAC`
- **THEN** sourceRef равен `milestone:MS-UTL-PWR`
- **AND** targetRef равен `work:9.3.2`
- **AND** поле типа планирования отсутствует

#### Scenario: Both ends must exist in the same schedule

- **WHEN** конец связи не найден среди строк этого ответа Schedule
- **THEN** ответ Schedule не отдаётся
- **AND** связь с концом из другого снимка не принимается

#### Scenario: Line is drawn when both ends are visible

- **WHEN** на диаграмме видны и веха `MS-UTL-PWR`, и работа `9.3.2`
- **THEN** линия идёт от ромба вехи к началу прогнозной полосы работы
- **AND** подпись или подсказка сообщает межпроектное предшествование без указанного типа

#### Scenario: Line is hidden when either end is hidden

- **WHEN** скрыт хотя бы один конец связи `LNK-X-PWR-HVAC`
- **THEN** этой линии нет

#### Scenario: Missing end, wrong direction, or a planning type is rejected

- **WHEN** у `cross_project_predecessor` нет одного конца в этом ответе, источник не веха, цель не работа, или задан тип планирования
- **THEN** ответ Schedule не отдаётся

#### Scenario: Snapshot C stores the predecessor next to the four scheduling links

- **WHEN** клиент запрашивает schedule на снимке C после review
- **THEN** среди links есть `LNK-X-PWR-HVAC` вида `cross_project_predecessor`
- **AND** четыре связи WK остаются видом `scheduling`
- **AND** на A, D и F связи `LNK-X-PWR-HVAC` нет

#### Scenario: Fact mode keeps the line on an unfacted forecast bar

- **WHEN** режим факта показывает `9.3.2` без фактического интервала и обе строки видны
- **THEN** линия встречается с началом прогнозной полосы «Подключение к сетям»

#### Scenario: Fact mode hides the line when the forecast bar is gone

- **WHEN** режим факта не рисует прогнозную полосу цели, потому что у неё закрытый факт
- **THEN** линии `LNK-X-PWR-HVAC` нет
- **AND** в режиме прогноза при видимых концах линия остаётся

### Requirement: Table and chart share one row pitch and header band

В «Разделении» таблица и диаграмма SHALL использовать один шаг строки 32px и одну высоту шапки 40px. Нижний край шапки таблицы и нижний край шкалы дат SHALL совпадать. Легенда и служебные подписи SHALL NOT занимать место над первой строкой диаграммы. Высота видимой области диаграммы SHALL совпадать с видимой областью таблицы. Выбор, фокус, раскрытие и вторая полоса SHALL NOT менять высоту коробки строки.

#### Scenario: First rows share a vertical origin

- **WHEN** на снимке C открыто «Разделение» и прокрутка в начале
- **THEN** верх первой строки таблицы и верх первой строки диаграммы совпадают
- **AND** шаг соседних строк в обеих частях равен 32px

#### Scenario: Scrolled rows stay paired

- **WHEN** пользователь прокручивает список в «Разделении»
- **THEN** строка таблицы и соответствующая строка диаграммы сохраняют общий верх
- **AND** середина списка не накапливает отдельный шаг диаграммы

### Requirement: View and comparison changes keep the scroll anchor

Смена режима представления и смена сравнения SHALL сохранять верхнюю видимую строку и её смещение, дату у левого края диаграммы и горизонтальную позицию таблицы. После перерисовки система SHALL восстановить позицию в пределах доступного диапазона. Снимок, фильтры, выбор и раскрытие SHALL сохраняться. Режим по умолчанию SHALL оставаться «Разделением».

#### Scenario: Comparison toggle restores the same row and date

- **WHEN** пользователь прокрутил план и переключает прогноз на факт и обратно
- **THEN** верхняя видимая строка и дата у левого края возвращаются
- **AND** данные снимка не запрашиваются заново из-за этого переключения

#### Scenario: Hidden pane keeps its position

- **WHEN** пользователь уходит из «Разделения» в «Таблицу» или «Временную шкалу» и возвращается
- **THEN** скрытая часть показывает прежнюю вертикальную и горизонтальную позицию
- **AND** режим по умолчанию при первом открытии страницы — «Разделение»

### Requirement: Chart marks stay compact and unlabeled

Полоса работы SHALL иметь высоту 8px и длину календарного интервала. Ромб вехи SHALL иметь высоту 8.49px. Сводная полоса SHALL быть компактнее прежней полосы 26px. Базовая полоса SHALL рисоваться над основной с зазором **2px**, без пересечения. Текст SHALL NOT рисоваться на полосе, ромбе или стрелке. Ствол, поворот и треугольный наконечник одной стрелки SHALL быть одного цвета. Типы SS, FS, FF и SF и линия `LNK-X-PWR-HVAC` SHALL сохранять прежние точки крепления и правило скрытия в режиме факта.

#### Scenario: Progress text stays off the bar

- **WHEN** у работы известный прогресс 40%
- **THEN** заливка занимает соответствующую долю полосы
- **AND** на полосе нет текстовой подписи процента
- **AND** процент доступен в таблице или подсказке

#### Scenario: Closed fact hides the cross-project line

- **WHEN** сравнение — факт и у целевой работы заданы оба фактических конца
- **THEN** межпроектная линия на эту работу не рисуется
- **AND** в режиме прогноза та же линия видна, если видны обе строки
