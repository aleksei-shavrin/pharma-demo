# portfolio-program-project (living)

## Requirements

### Requirement: Seven programs and twenty-five analyst projects

Система SHALL сохранять семь программ `PRG-*` и каталог `AN-01`…`AN-25`. SHALL NOT создавать `PRG-GREENFIELD` и SHALL NOT схлопывать 7→1. Имя Greenfield в исходнике — provenance для portfolio `PRJ-01`.

#### Scenario: Programs list has seven rows

- **WHEN** открыт `/programs`
- **THEN** таблица содержит ровно 7 программ с code, name, status, owner (если известен), projectCount

#### Scenario: Projects list has twenty-five rows

- **WHEN** открыт `/projects`
- **THEN** таблица содержит ровно 25 проектов `AN-01`…`AN-25`

### Requirement: Workstream is not a user-facing entity

User-facing навигация и фильтры SHALL использовать Программа/Проект. `WorkstreamId` MAY оставаться internal tag. `/workstreams/:id` SHALL redirect на соответствующую программу или проект по semantic mapping. UI SHALL NOT показывать «legacy tag WS…».

#### Scenario: Legacy workstream deep-link

- **WHEN** открыт `/workstreams/WS-CLN`
- **THEN** пользователь попадает на detail `AN-08`
- **WHEN** открыт `/workstreams/WS-QC`
- **THEN** пользователь попадает на detail `AN-20` (qualification supplement; нет QC-lab root в source 25)

### Requirement: Program and project detail share one owner model

`ownerPersonId` / `ownerLabel` SHALL быть одинаковы в list и detail. Если владелец не назначен — одинаковый honest state. `responsiblePeople` MAY перечислять ответственных отдельно, без выдуманного program leader из единственного child owner.

#### Scenario: Unassigned owner is consistent

- **WHEN** у программы нет explicit owner
- **THEN** list и detail показывают один и тот же unassigned label и `ownerPersonId = null`

### Requirement: Project composition from import

Project detail SHALL публиковать composition counts (этапы/работы/КТ/вехи каталога/оборудование) из analyst import + snapshot, без double-count alias MS как и КТ, и без broadcast EQ по всем WS. Drilldown на `/schedule?project=AN-xx` SHALL фильтровать дерево проекта.

#### Scenario: AN-08 composition

- **WHEN** открыт detail `AN-08`
- **THEN** composition.checkpoints включает source КТ проекта (включая alias MS-CLN-PANEL)
- **AND** catalogMilestones не дублирует этот alias
