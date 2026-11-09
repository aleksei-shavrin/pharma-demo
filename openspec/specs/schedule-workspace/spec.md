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

#### Scenario: Snapshot 03 allows baseline with scheduling links on WK-01

- **WHEN** читается подвыборка снимка 03 для `WK-01`
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

На снимке 03 Schedule SHALL содержать одну строку `project_group` с id `AN-08`, одну строку `stage_group` с id `8.2` и parentKey `project_group:AN-08`, работы `8.2.1` и `8.2.2` с parentKey `stage_group:8.2`. Веха `MS-CLN-PANEL` SHALL оставаться одной строкой с прежним id. На снимке 03 её parentKey SHALL быть `stage_group:8.2`, а wbs SHALL быть `8.2.3`. Система SHALL NOT создавать вторую строку с id `MS-CLN-PANEL`.

#### Scenario: Snapshot 03 nests the existing panel milestone

- **WHEN** клиент запрашивает schedule `PRT-01` на снимке 03
- **THEN** среди items ровно одна запись с id `MS-CLN-PANEL` и kind `milestone`
- **AND** её parentKey равен `stage_group:8.2`
- **AND** в ответе есть группы `AN-08` и `8.2` и работы `8.2.1`, `8.2.2`
- **AND** работы `WK-01`…`WK-05` присутствуют с parentKey `null`

#### Scenario: Snapshots 01–19 share topology with overlay state

- **WHEN** клиент запрашивает schedule на любом populated snapshot 01–19
- **THEN** items содержат полные `project_group`/`stage_group` для всех workstream
- **AND** есть работы `8.2.1` и `8.2.2` с непустым `wbs`
- **AND** у `MS-CLN-PANEL` parentKey указывает на stage
- **AND** links содержат scheduling и cross_project_predecessor по всем workstream (не только CLN)
- **AND** progress/status/actuals MAY отличаться между снимками (authored overlays), без копирования одного frozen 03 state

### Requirement: Progress zero is distinct from unknown progress

Поле `progressPct` SHALL быть числом или `null`. Значение `0` SHALL означать известный ноль. Значение `null` у работы SHALL означать неизвестный ход и подпись «нет данных». Система SHALL NOT вычислять work `actualStart`/`actualEnd` из forecast. Система SHALL NOT выставлять equipment/milestone `progressPct` из сравнения `forecastDate`/`forecastDelivery` с `scenarioAsOfDate`. Equipment и milestone progress SHALL быть authored fixture facts (demo phase/overrides). У `project_group`/`stage_group` `progressPct` SHALL быть equal-weight rollup листьев с известным % (или null, если листьев с известным % нет). UI SHALL показывать progress control для work, equipment, milestone и групп с известным rollup.

#### Scenario: Group progress shows rollup when API provides a number

- **WHEN** API отдаёт `progressPct` для группы `8.2` или `AN-08`
- **THEN** таблица показывает числовой прогресс (полоса + %)
- **AND** значение не подменяется «—» только из-за kind группы

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
- **AND** прогресс группы следует API rollup (число или null)

### Requirement: Schedule warning has an accessible name

Предупреждение SHALL быть компактной иконкой с текстовой расшифровкой. Если заданы и база, и прогноз, и интервалы различаются, текст SHALL сообщать, что прогноз отличается от базового плана. Иначе при статусе Delayed или при `sourceWeeks` текст SHALL сообщать об отставании и SHALL включать число недель только если оно записано на этой строке. Иначе иконки SHALL NOT быть.

#### Scenario: Stage warning uses its own week count

- **WHEN** отображается этап `8.2` с `sourceWeeks` 3
- **THEN** доступное имя предупреждения содержит отставание и 3 недели

### Requirement: Expand state is shared by table and chart

Один владелец SHALL хранить раскрытие, выбор, фильтры и якорь прокрутки. Раскрытие группы SHALL менять видимые строки таблицы и диаграммы одним списком. Колонка «№» / `visibleOrdinal` SHALL NOT отображаться. Колонка ИСР SHALL показывать API `wbs`; для каждого item каждого populated snapshot `wbs` SHALL быть непустым. Система SHALL NOT подменять `wbs` порядковым номером. Наименование SHALL стоять после ИСР и SHALL NOT дублировать вид строки словами «работа», «веха» или «этап».

#### Scenario: Collapse hides children in both surfaces

- **WHEN** пользователь сворачивает `AN-08`
- **THEN** таблица и диаграмма скрывают `8.2` и её детей
- **AND** строка `AN-08` остаётся
- **AND** код ИСР оставшихся строк не перенумеровывается
- **AND** колонка «№» отсутствует

#### Scenario: Row without a code shows an empty WBS cell

- **WHEN** у видимой строки нет `wbs`
- **THEN** ячейка ИСР пустая или содержит «—»
- **AND** колонка «№» отсутствует
- **AND** наименование остаётся после ИСР

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

- **WHEN** снимок 03 имеет `scenarioAsOfDate` `2027-03-01` и `actualStart` равен `2027-03-01`
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

Пользователь SHALL видеть режим «Базовый план» (baseline-only) по умолчанию и SHALL мочь выбрать «Базовый план / прогноз» или «Базовый план / факт». В baseline-only на строке SHALL быть не больше одной основной полосы из границ базы, без серых comparison overlays. В режимах прогноза и факта на строке SHALL быть не больше двух полос: верхняя — база (если заданы оба конца), нижняя — прогноз либо закрытый факт.

#### Scenario: Default mode is baseline-only

- **WHEN** пользователь открывает календарный план без `comparison` в URL
- **THEN** выбран режим «Базовый план»
- **AND** у работы с обоими концами базы рисуется одна основная полоса по базе
- **AND** серый overlay / прогнозная полоса не рисуются

#### Scenario: Missing baseline is honest

- **WHEN** режим «Базовый план» и у работы нет обоих `baselineStart`/`baselineEnd`
- **THEN** прогнозная полоса не подставляется молча
- **AND** строка остаётся в списке с пустой полосой / подсказкой «Базовый план не задан»

#### Scenario: Baseline-only markers use primary baseline role

- **WHEN** режим «Базовый план» и у EQ/КТ задан `baselineDate`
- **THEN** primary marker использует `ppc-role-baseline` с видимой semantic geometry
- **AND** серый comparison ghost не рисуется

#### Scenario: Group summary follows comparison primary

- **WHEN** режим «Базовый план»
- **THEN** `summaryStart`/`summaryEnd` группы считаются по baseline children (не forecast range)

### Requirement: Split schedule virtualizes DOM under one Y owner

При большом числе строк split-режим SHALL сохранять логическую высоту всех видимых строк и полный link model, но SHALL ограничивать React- и DHTMLX-DOM окном viewport+overscan. Единственный vertical input owner — project scroll owner; vendor ver bar не является input owner. `clearAll`/`parse` SHALL NOT повторяться на scroll/hover.

#### Scenario: Bounded DOM at mid and end scroll

- **WHEN** snapshot 03 (~688 rows) в split и пользователь прокручивает mid/end
- **THEN** число React row DOM и Gantt task row DOM ≤ viewport/rowPitch + разумный overscan
- **AND** логический счётчик строк остаётся полным
- **AND** last row reachable с обеих pane

#### Scenario: Forecast mode keeps baseline over forecast

- **WHEN** пользователь выбирает «Базовый план / прогноз» и у `8.2.2` заданы оба конца базы
- **THEN** базовая полоса находится над прогнозной
- **AND** фактическая полоса не рисуется

#### Scenario: Closed fact replaces only the lower bar

- **WHEN** пользователь выбирает режим факта и у работы заданы оба фактических конца
- **THEN** нижняя полоса равна фактическому интервалу
- **AND** базовая полоса остаётся над ней, если заданы оба конца базы
- **AND** третьей полосы прогноза нет

### Requirement: Open actual start stays in the table

В режиме факта система SHALL NOT рисовать полосу и SHALL NOT рисовать отметку для одного `actualStart`. Начало SHALL быть в таблице. Пустой конец SHALL отображаться как «—». Нижняя полоса SHALL оставаться прогнозом.

#### Scenario: Snapshot 03 work 8.2.2 keeps the forecast bar

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

### Requirement: Snapshot 03 stores one open actual

На снимке 03 работа `8.2.2` SHALL иметь `actualStart` `2027-03-01` и `actualEnd` `null`. Работы `8.2.1` и `WK-02` SHALL иметь оба фактических поля пустыми. Прогноз, база, статус, прогресс и связи этих строк SHALL не меняться. Снимки 01, 04 и 06 SHALL NOT получать работы `8.2.1` и `8.2.2`.

#### Scenario: Open actual does not rewrite the forecast

- **WHEN** клиент запрашивает schedule снимка 03
- **THEN** у `8.2.2` фактическое начало `2027-03-01`, конец пуст, прогноз `2027-03-04`…`2027-03-18`, база `2027-02-26`…`2027-03-08`

#### Scenario: Two works stay without fact

- **WHEN** читается тот же ответ
- **THEN** у `8.2.1` и `WK-02` оба фактических поля пусты

### Requirement: Snapshot 03 stores a closed fact on WK-01

На снимке 03 работа `WK-01` SHALL хранить прогноз `2027-02-20`…`2027-02-24`, базу `2027-02-20`…`2027-02-24` и факт `2027-02-18`…`2027-02-23`. Это синтетические демоданные. В режиме прогноза нижняя полоса SHALL оставаться прогнозом, а верхняя база SHALL рисоваться общим правилом обоих концов. Система SHALL NOT иметь отдельного правила для id `WK-01`.

#### Scenario: Default mode shows a coincident baseline bar

- **WHEN** снимок 03 открыт в режиме прогноза
- **THEN** у `WK-01` нижняя полоса равна `2027-02-20`…`2027-02-24`
- **AND** верхняя полоса равна тому же интервалу

#### Scenario: Fact mode shows baseline over the closed actual

- **WHEN** снимок 03 открыт в режиме факта
- **THEN** нижняя полоса `WK-01` равна `2027-02-18`…`2027-02-23`
- **AND** верхняя полоса равна `2027-02-20`…`2027-02-24`
- **AND** подпись строки равна «Факт»

### Requirement: Link edges follow the displayed lower bar

Связь SHALL адресовать id работы. У закрытого факта край source или target SHALL лежать на соответствующем конце нижней фактической полосы. У открытого факта и у работы без факта край SHALL оставаться на прогнозной полосе. Приёмка SHALL сверять положение краёв source и target для SS, FS, FF и SF, а не только id связи.

#### Scenario: FS and SS leave the closed actual bar

- **WHEN** режим факта показывает снимок 03, где у `WK-01` закрытый факт, а у `WK-02` и `WK-03` факта нет
- **THEN** SS встречается с `WK-01` в начале `2027-02-18` и с `WK-02` в начале прогноза
- **AND** FS встречается с `WK-01` в конце `2027-02-23` и с `WK-03` в начале прогноза

#### Scenario: FF and SF stay on forecast ends

- **WHEN** у `WK-03`, `WK-04` и `WK-05` фактических дат нет
- **THEN** FF встречается с прогнозами `WK-03` и `WK-04` в их концах
- **AND** SF встречается с началом прогноза `WK-04` и концом прогноза `WK-05`

#### Scenario: Switching mode moves only WK-01 edges

- **WHEN** пользователь переключает снимок 03 с режима прогноза на режим факта
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

### Requirement: Full analyst import on populated snapshots 01–19

На populated snapshots 01–19 Schedule SHALL публиковать полный analyst import: 25 `project_group`, 145 `stage_group`, 272 source works (+ curated WK showcase), 44 catalog milestones, 145 imported КТ (`sourceKind=controlpoint`, zero-duration), 52 equipment — **688** items при полном раскрытии; links включают scheduling (в т.ч. 4 demo arrow types) и `cross_project_predecessor`. MS aliases `8.2.3`→`MS-CLN-PANEL`, `24.1.3`→`MS-UTL-PWR`. Группы SHALL нести equal-weight rollup; колонка «№» SHALL NOT отображаться. Equipment/milestone progress SHALL быть authored facts, не `forecast ≤ asOf`. Default UI SHALL expand all groups.

#### Scenario: Full expansion counts 688 rows

- **WHEN** клиент запрашивает schedule `PRT-01` на снимке 03 и раскрыты все группы
- **THEN** в ответе 688 строк
- **AND** среди них 25 `project_group` включая `AN-08`, `AN-24`, `AN-09`
- **AND** 145 `stage_group` и 145 КТ controlpoint
- **AND** работы `24.1.1`, `24.1.2`, `9.3.1`, `9.3.2` присутствуют

#### Scenario: Default expansion shows full tree

- **WHEN** на снимке 03 открыт календарный план без сохранённого collapse
- **THEN** все `project_group`/`stage_group` раскрыты
- **AND** полный ответ Schedule содержит 688 элементов

#### Scenario: Power milestone keeps its identity inside stage 24.1

- **WHEN** клиент запрашивает schedule на снимке 03
- **THEN** ровно одна строка имеет id `MS-UTL-PWR` и kind `milestone`
- **AND** её parentKey равен `stage_group:24.1`, а wbs равен `24.1.3`

#### Scenario: Existing episode and other snapshots stay

- **WHEN** клиент сравнивает снимок 03 с 01, 04 и 06
- **THEN** на 03 сохранены дерево `AN-08`, база `8.2.2` и связи WK
- **AND** populated snapshots 01–19 share the analyst import topology (688 items when fully expanded)
- **AND** progress/status overlays MAY differ by snapshot; equipment/milestone progress remains authored dates≤asOf (not live forecast≤asOf, not id-rank)

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

#### Scenario: Snapshot 03 stores the predecessor next to the four scheduling links

- **WHEN** клиент запрашивает schedule на снимке 03 после review
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

В «Разделении» таблица и диаграмма SHALL использовать один шаг строки 32px и одну высоту шапки 40px. Нижний край шапки таблицы и нижний край шкалы дат SHALL совпадать. Легенда и служебные подписи SHALL NOT занимать место над первой строкой диаграммы. Высота видимой области диаграммы SHALL совпадать с видимой областью таблицы. Выбор, фокус, раскрытие и вторая полоса SHALL NOT менять высоту коробки строки. Вертикальная прокрутка SHALL идти через один scroll owner; система SHALL NOT выравнивать две независимые vertical полосы ручной привязкой `scrollTop`. Горизонтальная прокрутка таблицы и диаграммы SHALL оставаться независимой.

#### Scenario: First rows share a vertical origin

- **WHEN** на снимке 03 открыто «Разделение» и прокрутка в начале
- **THEN** верх первой строки таблицы и верх первой строки диаграммы совпадают
- **AND** шаг соседних строк в обеих частях равен 32px

#### Scenario: Scrolled rows stay paired

- **WHEN** пользователь прокручивает список в «Разделении» (колесо над таблицей или диаграммой, либо scrollbar owner)
- **THEN** строка таблицы и соответствующая строка диаграммы сохраняют общий верх
- **AND** середина списка не накапливает отдельный шаг диаграммы
- **AND** вертикальный offset общий для обеих частей

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

### Requirement: Demo master dating is hybrid earliest-in-float (not pure ALAP)

> **certainty:** assumption — synthetic demo planning; source MD has no calendar dates (wave gantt-clarity / r3 hardgate).

Для analyst master fixture Demo v1 система SHALL строить единый canonical baseline через согласованный forward+backward расчёт:

1. Backward **ALAP latest** только из hard graph (FS/SS/FF/SF+lag+duration) и Production Start gate `2027-09-15` — **без** soft `preferredStart` внутри latest-pass.
2. Forward placement: `hardES` из already-placed preds (root — open lower bound); `preferredES` из soft phase window; **ES = max(hardES, min(preferredES, hardLS))**; EF = ES+dur.
3. Zero/low total float → у hardLS (critical); free float → earlier-in-float при сохранении hardES.

Soft phase MAY поставить раньше preferred window (audit `soft_phase_relax`); soft relax SHALL NOT cancel gate и SHALL NOT ставить ниже настоящего hardES. Все mandatory leaf `baselineEnd` SHALL быть ≤ `2027-09-15` (`soft_infeasible_vs_lf` count = 0 на реальном графе). Система SHALL NOT default-hide source scheduling links; UI SHALL highlight immediate pred/succ from shared selection (table или chart). Grid/chart/diamond status tone SHALL share one **runtime** presentation family derived from lifecycle (raw sourceStatus/emoji = provenance only; historical missed/delayed SHALL NOT вечно красить Completed в Red без активного риска). Progress % SHALL NOT replace Delayed/OnSchedule meaning. `planEarliestStart` (min any leaf / window assumption) SHALL NOT быть silently renamed в critical necessary start.

#### Scenario: Free-float early prep is not parked at the gate

- **WHEN** leaf в AN-01/02/03 имеет free float после hybrid dating
- **THEN** baselineStart лежит в/около preferred phase window (или documented soft relax earlier than window)
- **AND** baselineEnd ≤ Production Start gate `2027-09-15`
- **AND** все source FS/SS/FF/SF constraints остаются выполнены

#### Scenario: Soft floor relax keeps hard predecessors and gate

- **WHEN** preferredES > hardLS (synthetic phase window later than hard latest)
- **THEN** система ставит ES = max(hardES, hardLS) (earlier than preferred) с audit soft_phase_relax
- **AND** SHALL NOT превысить gate / SHALL NOT поставить ниже hardES
- **AND** hardES > hardLS на корректном графе считается bug (`hard_cpm_inconsistent`), не поводом отменять gate

#### Scenario: Runtime tone parity grid and chart

- **WHEN** leaf Completed по asOf, а raw sourceStatus был missed/delayed
- **THEN** grid StatusPill, bar/diamond CSS и tooltip используют один runtime tone (не eternal Red от emoji)
- **AND** активный Delayed (напр. HVAC problem) остаётся danger/Red на всех поверхностях

#### Scenario: Historical sourceWeeks is not current progress warning

- **WHEN** work Completed (или иначе не Delayed) имеет `sourceWeeks` из source ⚠️Nн
- **THEN** schedule warning tone = none (sourceWeeks = audit provenance only)
- **AND** `data-schedule-fill-tone` / progress fill не danger из‑за одних недель
- **AND** parent aggregation не поднимает lag только из historical weeks детей
- **AND** active `status===Delayed` по-прежнему даёт lag (weeks могут уточнять label)

#### Scenario: Source link coverage preserved

- **WHEN** клиент запрашивает schedule на populated snapshot
- **THEN** число unique scheduling+cross_project links в API соответствует fixture coverage (≈679)
- **AND** UI не удаляет links из payload ради «чистоты»
- **AND** selection refresh links без `gantt.parse` / `clearAll`

### Requirement: Dashboard milestone focus deep-link

`/schedule?focus=milestone:<id>` SHALL map once onto the existing `selectionKeyId` (`milestone:<id>`), expand ancestors so collapse/virtualization cannot hide the row, center vertically in the Gantt scroll owner (not the document), and set horizontal chart date from the item forecast/baseline without breaking fit. Invalid or unknown focus SHALL fail soft (no infinite effect/scroll). Snapshot letter in sessionStorage SHALL survive ordinary `<a>` navigation. Conflicting `?project=` that would hide the target MAY be dropped once while preserving `focus`.

#### Scenario: Focus selects and reveals a known milestone

- **WHEN** пользователь открывает `/schedule?focus=milestone:MS-HVAC-IQ` на populated snapshot
- **THEN** строка `milestone:MS-HVAC-IQ` выбрана
- **AND** предки раскрыты
- **AND** вертикальный центр выполняется через Gantt scroll owner

#### Scenario: Invalid focus is a no-op

- **WHEN** `focus` отсутствует в данных или не парсится как selection key
- **THEN** UI не зацикливается и не скроллит бесконечно
- **AND** остальной schedule остаётся usable

### Requirement: Split default is equal table and chart panes

В режиме «Разделение» начальная ширина таблицы SHALL быть **50%** контейнера (CSS), пока пользователь не изменил разделитель. Resize окна без ручного drag SHALL сохранять 50/50 (разница list/chart bbox ≤ 2px с учётом 1px divider). После явного drag/keyboard ширина MAY фиксироваться в px с clamp (min 320px, max 70%). Система SHALL NOT восстанавливать устаревший unequal default из storage.

#### Scenario: Fresh split opens at half

- **WHEN** пользователь открывает Календарный план в «Разделении» без предшествующего drag
- **THEN** ширина pane таблицы ≈ половине split row (±2px к chart с учётом divider)

### Requirement: Chart uses rich portal popover instead of native title

Hover/focus bar/diamond/summary SHALL открывать один React portal popover (dashboard tip semantics): имя, id/WBS, kind, status/progress если известны, даты текущего comparison; ссылка «Открыть» только при существующем entity route. Native browser `title` на chart triggers SHALL быть пуст. Popover SHALL поддерживать Escape, hover-bridge к ссылке, viewport clip, close на scroll/zoom/snapshot/unmount; SHALL NOT вызывать gantt.parse/clearAll. Click selection chain SHALL оставаться.

### Requirement: Schedule toolbar icon active state is color not frame

Active comparison/view/zoom icon SHALL быть синей (accent/info); inactive — серой. Shared group containers SHALL иметь border + sunken background (три различимые группы). Individual buttons SHALL NOT иметь own border/background/inset selection box. `aria-pressed` и focus-visible ring SHALL сохраняться (только для keyboard focus).

### Requirement: Scale and table headers share bold uppercase RU

Шапка таблицы и шкала дат диаграммы SHALL использовать bold UPPERCASE RU labels и одну высоту 40px (один tier). Zoom SHALL NOT ломать высоту/число рядов шапки относительно таблицы.

### Requirement: Community gantt.ext.zoom with month-density levels

При наличии `gantt.ext.zoom` (DHTMLX Community 10.x) система SHALL инициализировать уровни **unit=month** с `min_column_width` 48 / 96 / 192 / **384 (default)** / 768. Все уровни SHALL сохранять `smart_rendering` в fit/split mode (bounded DOM). Toolbar −/+ слева от comparison/view; min/max disabled; без Ctrl+wheel zoom по умолчанию. Initial X SHALL якорить first visible work/bar с padding (не пустой mid-horizon). Subsequent zoom SHALL центрировать selected-visible element (range intersection + midpoint для полос; точная дата для вех) или ближайший visible work/MS/EQ; SHALL NOT использовать пустую mid-canvas date и SHALL NOT сбрасывать Y. Table-only: zoom controls disabled/hidden.

### Requirement: Table-only columns fill available width

В режиме «Таблица» колонки name (и object) SHALL flex-grow так, чтобы крайняя правая колонка доходила до viewport (±2px), при сохранении minWidths/nowrap для id/дат/progress. Head и body SHALL делить одну geometry template.
