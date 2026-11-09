## ADDED Requirements

### Requirement: Person reference catalog

Система SHALL предоставлять reference entities Person с id namespace `PER-*`, полями `fullNameRu`, `roleTitleRu`, optional `primaryWorkstreamId`, и `active`. Person SHALL NOT моделировать HRIS (departments, payroll, contracts, permissions, org-chart engine).

#### Scenario: People list returns PER ids

- **WHEN** клиент запрашивает `/people` для `PRJ-01`
- **THEN** каждый элемент имеет `PER-*` id и непустые `fullNameRu` и `roleTitleRu`

### Requirement: Owner cutover from SH to PER

Issue и Decision owner references SHALL использовать `ownerPersonId` (`PER-*`) после R2 cutover. Legacy `SH-*` strings SHALL NOT оставаться public API после cutover. Mapping SH→PER SHALL быть явным и одноразовым.

#### Scenario: Issue owner is Person

- **WHEN** запрошен detail `ISS-001` на Snapshot 03 после cutover
- **THEN** owner ссылается на существующий `PER-*` и отображаемое имя берётся из Person catalog

### Requirement: Person detail projections

Person detail SHALL показывать responsibility projections (Issues, Decisions, optional Equipment, Workstream leadships) как навигационные списки без budget ownership.

#### Scenario: Workstream lead appears on Person

- **WHEN** Person является `leadPersonId` для `WS-PKG`
- **THEN** Person detail включает ссылку на `WS-PKG`
