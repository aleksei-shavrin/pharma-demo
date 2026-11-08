# portfolio-program-project delta (WS absorb)

## MODIFIED Requirements

### Requirement: Seven programs and twenty-five analyst projects

Система SHALL сохранять семь программ `PRG-*` и каталог `AN-01`…`AN-25`. SHALL NOT создавать `PRG-GREENFIELD` и SHALL NOT схлопывать 7→1. Имя Greenfield в исходнике — provenance для portfolio `PRJ-01`.

#### Scenario: Programs list has seven rows

- **WHEN** открыт `/programs`
- **THEN** таблица содержит ровно 7 программ с code, name, status, owner (если известен), projectCount

### Requirement: Workstream is not a user-facing entity

User-facing навигация и фильтры SHALL использовать Программа/Проект. `WorkstreamId` MAY оставаться internal tag. `/workstreams/:id` SHALL redirect на соответствующую программу или проект по semantic mapping.

#### Scenario: Legacy workstream deep-link

- **WHEN** открыт `/workstreams/WS-CLN`
- **THEN** пользователь попадает на detail `AN-08` или `PRG-CON` с focus на связанные проекты
- **AND** руководитель и состав не теряются

### Requirement: Program detail is populated

Detail программы SHALL включать связанные проекты, руководителей/ответственных из mapping (без выдуманного first-person owner), агрегаты без double-count equipment/costs при many-to-many.

#### Scenario: Construction program has projects and responsibles

- **WHEN** открыт detail `PRG-CON`
- **THEN** `projectCount` ≥ 1 и список проектов включает `AN-06`…`AN-08`
- **AND** `responsiblePeople` не пуст, если есть authored owners или legacy WS leads
- **AND** `ownerPersonId` не выставляется автоматически из first person без источника
