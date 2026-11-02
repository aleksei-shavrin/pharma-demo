# demo-v1-architecture-constraints Specification

## Purpose

Фиксирует нормативные **ограничения архитектуры Demo v1** (не пользовательскую product capability): FE получает narrative-данные только через HTTP API; mock persistence за port; PostgreSQL вне Demo v1.

## Requirements

### Requirement: Frontend consumes narrative data only via HTTP API

Frontend Demo v1 SHALL получать бизнес-данные narrative исключительно через HTTP API backend. Локальный mock-слой данных во FE как замена API запрещён (REQ-NFR-001; DOC-PROD-003).

#### Scenario: No FE-local mock as API replacement

- **WHEN** Frontend отображает narrative-данные Demo v1
- **THEN** данные получены через HTTP API client
- **AND** локальный FE mock dataset не используется как замена API

### Requirement: Persistence port with mock adapter in Demo v1

Backend Demo v1 SHALL хранить narrative-данные через persistence adapter interface с mock-adapter в Demo v1 (REQ-NFR-002; DOC-PROD-003/004). PostgreSQL SHALL NOT входить в Demo v1.

#### Scenario: Mock adapter behind port

- **WHEN** Backend обслуживает Demo v1 narrative
- **THEN** данные обслуживаются mock-adapter за persistence port
- **AND** PostgreSQL не требуется для Demo v1

### Requirement: Future adapter swap preserves contracts by intent

Последующая замена mock-adapter на PostgreSQL-adapter SHALL сохранять существующие доменные и HTTP API-контракты Demo v1 без необходимости менять FE и HTTP API. Наличие port само по себе SHALL NOT считаться автоматической гарантией совместимости; требуются контрактные проверки при переходе (REQ-NFR-002; DOC-PROD-004).

#### Scenario: Port is not automatic compatibility proof

- **WHEN** планируется переход mock → PostgreSQL adapter
- **THEN** целью является сохранение domain и HTTP API контрактов без смены FE
- **AND** один только факт наличия port не объявляется доказательством совместимости без contract checks

### Requirement: Enrichment remains fixture-driven discrete snapshots

Система SHALL реализовывать enriched Demo через discrete fixture snapshots A–H; SHALL NOT вводить event sourcing, temporal DB, continuous simulation или arbitrary date playback.

#### Scenario: Snapshot switch loads self-contained state

- **WHEN** клиент переключает snapshot с F на G
- **THEN** сервер возвращает самодостаточное состояние G из fixtures

### Requirement: No Activity or WBS entity in enrichment

Demo v1 enrichment SHALL NOT добавлять Domain entities Activity, Task, WBS Item, Work Package, Dependency as Must. Schedule SHALL оставаться control points Equipment delivery + Milestone.

#### Scenario: Schedule items are only equipment and milestones

- **WHEN** запрашивается schedule PRJ-01
- **THEN** каждый item — equipment delivery или milestone
- **AND** Activity entities отсутствуют

### Requirement: Frontend still API-only with Nest-owned mock under enrichment

Система SHALL сохранять: FE data только через HTTP API; mock persistence только в NestJS; PostgreSQL вне Demo v1.

#### Scenario: Web does not embed enrichment fixtures

- **WHEN** web отображает equipment list
- **THEN** данные из API; web bundle не содержит Nest fixture modules

### Requirement: Direct link integrity under enrichment

Система SHALL запрещать Equipment→Milestone и Decision→Equipment / Decision→Issue / Decision→Risk. Система SHALL допускать Issue→Milestone и Decision→Milestone (optional) per DOC-BA-015. Decision ownership via Project.

#### Scenario: No equipment milestone or decision equipment edges

- **WHEN** клиент читает links для EQ-HVAC-01
- **THEN** response не содержит Equipment→Milestone
- **AND** Decision не появляется как Domain link target type equipment/issue/risk

#### Scenario: Issue may link to Milestone

- **WHEN** клиент читает links для ISS-001 в Snapshot C
- **THEN** links могут включать milestone MS-PS

### Requirement: No Domain managementPriority field

Система SHALL NOT добавлять managementPriority (или эквивалент) на Domain entities Issue, Risk, Equipment, Milestone. Curated Top Exception order MAY exist only on dashboard/read-model / snapshot presentation.

#### Scenario: Domain entities omit managementPriority

- **WHEN** читается Issue или Risk entity schema
- **THEN** поле managementPriority отсутствует
