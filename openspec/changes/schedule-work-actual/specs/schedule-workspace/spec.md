# schedule-workspace Specification (delta)

## ADDED Requirements

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

В режиме факта работа SHALL иметь подпись «Факт», «Прогноз — факт не завершён» или «Прогноз — факта нет» соответственно закрытому факту, только началу и отсутствию факта. В режиме прогноза этих подписей SHALL NOT быть.

#### Scenario: Three captions follow the stored fields

- **WHEN** режим факта показывает закрытый факт, только начало и работу без факта
- **THEN** подписи равны «Факт», «Прогноз — факт не завершён» и «Прогноз — факта нет»

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
