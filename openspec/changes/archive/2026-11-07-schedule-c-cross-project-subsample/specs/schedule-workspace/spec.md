# schedule-workspace Specification (delta)

## Purpose

Дерево снимка C показывает энергоснабжение и HVAC рядом с эпизодом AN-08. Связь вехи питания с работой подключения — отдельный вид, без типа FS/SS/FF/SF.

## ADDED Requirements

### Requirement: Snapshot C adds collapsed power and HVAC branches

На снимке C Schedule SHALL добавить `project_group` `AN-24` и `AN-09`, свёрнутые по умолчанию, и вложить единственную `MS-UTL-PWR` в `24.1` без смены id и дат. Новые работы SHALL нести синтетический прогноз и `progressPct` `null`. A, D и F SHALL сохранить прежний состав.

#### Scenario: Full expansion counts 113 rows

- **WHEN** клиент запрашивает schedule `PRJ-01` на снимке C и раскрыты все группы
- **THEN** в ответе 113 строк
- **AND** среди них ровно три `project_group`: `AN-08`, `AN-24`, `AN-09`
- **AND** этапы `24.1` и `9.3` присутствуют
- **AND** работы `24.1.1`, `24.1.2`, `9.3.1`, `9.3.2` присутствуют

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
