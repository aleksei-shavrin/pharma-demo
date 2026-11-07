# schedule-workspace Specification (delta)

## RENAMED Requirements

- FROM: `### Requirement: Work interval is a single forecast bar`
- TO: `### Requirement: Work interval is a single forecast bar (pre-reconcile)`

## REMOVED Requirements

### Requirement: Work interval is a single forecast bar (pre-reconcile)

**Reason:** OpenSpec не позволяет выкинуть сценарий через MODIFIED и не позволяет ADDED+REMOVED одного имени. Переименование → удаление снимает невозможный сценарий «Snapshot C does not combine baseline and a dependency»; исходный заголовок возвращается через ADDED с WK-01 и mode-qualified fact.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Typed display-only dependency links between works

Schedule API SHALL включать `links`. Для `kind: scheduling` (или ранний эквивалент без kind) SHALL быть `id`, `sourceRef`, `targetRef`, `type` ∈ {`FS`,`SS`,`FF`,`SF`} с концами `work:<entityId>` того же ответа. Links SHALL быть read-only в UI. Scheduling-связи SHALL NOT иметь ends на `milestone` или `equipment_delivery`. Kind `cross_project_predecessor` SHALL следовать Milestone to work link is an untyped cross-project predecessor.

#### Scenario: Four link types present in demo fixture set

- **WHEN** загружен согласованный демо-снимок с scheduling-зависимостями
- **THEN** среди scheduling links представлены типы FS, SS, FF и SF
- **AND** каждый конец резолвится в work item

#### Scenario: Snapshot without works keeps control-point markers

- **WHEN** schedule снимка не содержит work items и scheduling links пуст
- **THEN** milestone и equipment_delivery продолжают отображаться точечными маркерами как до G07–G11

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

### Requirement: Fact mode names the row

В режиме факта работа SHALL иметь подпись «Факт», «Прогноз — факт не завершён» или «Прогноз — факта нет» соответственно закрытому факту, только началу и отсутствию факта. Подпись SHALL быть доступна через accessible name / `title` / поле presentation `factCaption` и/или таблицу. Система SHALL NOT рисовать эти подписи текстом на полосе, ромбе или стрелке. В режиме прогноза этих подписей SHALL NOT быть.

#### Scenario: Three captions follow the stored fields

- **WHEN** режим факта показывает закрытый факт, только начало и работу без факта
- **THEN** подписи равны «Факт», «Прогноз — факт не завершён» и «Прогноз — факта нет»
- **AND** на фигурах диаграммы текстовых подписей факта нет

#### Scenario: Default mode has no fact caption

- **WHEN** включён режим прогноза
- **THEN** этих трёх подписей нет

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
