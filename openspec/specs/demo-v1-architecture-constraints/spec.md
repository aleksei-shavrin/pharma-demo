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
