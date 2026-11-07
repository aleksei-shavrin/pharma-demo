# demo-v1-architecture-constraints Specification (delta)

## MODIFIED Requirements

### Requirement: No Activity or WBS domain entity; Schedule may include curated work view-model rows

Demo v1 SHALL NOT добавлять Domain entities Activity, Task, WBS Item, Work Package как Must. Schedule MAY включать curated `kind: 'work'` и display-only links как **view-model / API presentation**, без CPM, auto-schedule и Domain Dependency engine. Scheduling MAY соединять `work:` refs (FS/SS/FF/SF); `cross_project_predecessor` MAY соединять `milestone:` → `work:` без типа планирования. Control points Equipment delivery + Milestone обязательны.

#### Scenario: Schedule items are only equipment and milestones

- **WHEN** запрашивается schedule PRJ-01 на снимке без curated works
- **THEN** каждый item — equipment delivery или milestone
- **AND** Activity entities отсутствуют

#### Scenario: Schedule may return work rows without Domain Activity

- **WHEN** запрашивается schedule PRJ-01 на снимке с curated works
- **THEN** items могут включать `equipment_delivery`, `milestone` и `work`
- **AND** Domain model не вводит entity Activity / Task / WBS
- **AND** `links` при наличии содержат display-only зависимости: scheduling между `work:` refs и/или `cross_project_predecessor` от milestone к work

#### Scenario: Schedule without works remains control-point only

- **WHEN** запрашивается schedule снимка без curated works
- **THEN** каждый item — equipment delivery или milestone
- **AND** `links` пуст или отсутствует по контракту пустого массива
