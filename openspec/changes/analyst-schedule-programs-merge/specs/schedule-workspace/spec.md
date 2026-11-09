# schedule-workspace delta (analyst import)

## ADDED Requirements

### Requirement: Full analyst schedule import

Система SHALL импортировать все строки исходника аналитика (25 проектов, 145 этапов, 272 работы, 147 КТ) в schedule read-model. Частичное дерево 133/8 WS SHALL NOT выдаваться за полный импорт.

#### Scenario: Exact source coverage

- **WHEN** парсер читает pinned MD из repo
- **THEN** уникальных WBS ровно 564
- **AND** каждый source WBS встречается один раз с kind/name/status/rawDeps

### Requirement: Default expand all groups

При первом открытии и при смене snapshot/нового набора данных все `project_group` и `stage_group` keys из payload SHALL быть раскрыты. Ручной collapse сохраняется на обычных re-render/hover/retry.

#### Scenario: Fresh visit shows full height need

- **WHEN** пользователь открывает календарный план на снимке 03 без сохранённого collapse
- **THEN** видимы все строки payload (с учётом фильтров)
- **AND** счётчик не выглядит как пагинация: «Найдено N из T» и при collapse «Свёрнуто M»

### Requirement: Anchor 03 for source statuses

Source status tokens SHALL отображаться на снимке 03 как DEMO_ASSUMPTION. Даты и проценты SHALL NOT выдаваться за факты аналитика. Anchor asOf 03 SHALL быть `2027-03-01`. Система SHALL NOT назначать даты/проценты через hash/rank/random от WBS.

#### Scenario: Completed requires authored actualEnd on 03

- **WHEN** строка аналитика имеет ✅ и снимок 03
- **THEN** display status Completed
- **AND** actualEnd ≤ scenarioAsOfDate C
- **AND** даты помечены как supplementary assumption, не source fact

### Requirement: КТ as zero-duration control points

Все 147 source КТ SHALL публиковаться как `kind: milestone` с `sourceKind: controlpoint`, zero-duration и progress 0/100 по explicit completion (145 `KT-*` + 2 alias catalog MS). Alias SHALL нести raw `sourceStatus`/`sourceWeeks`/analyst name. Остальные catalog MS — `sourceKind=catalog_milestone` (42).

#### Scenario: Checkpoint type preserved

- **WHEN** schedule payload собран из analyst import
- **THEN** существует 147 строк `sourceKind=controlpoint`
- **AND** 42 catalog_milestone остаются отдельными
- **AND** UI counter/filter различает «Вехи» и «КТ»

### Requirement: Link coverage without silent drops

Каждый explicit source edge и critical seam SHALL иметь canonical representation или audit row с exact WBS и причиной. Alias MS WBS `8.2.3`/`24.1.3` SHALL резолвиться в catalog MS. Stage→leaves SHALL NOT разворачиваться в полный cartesian product всех листьев.

#### Scenario: Alias edges resolve

- **WHEN** source edge ссылается на `8.2.3` или `24.1.3`
- **THEN** link refs используют `milestone:MS-CLN-PANEL` / `milestone:MS-UTL-PWR`
- **AND** analyst display name для MS-CLN-PANEL — «Ограждающие конструкции C/D готовы»
