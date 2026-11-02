## ADDED Requirements

### Requirement: Multi-snapshot project overview A through S

Система SHALL предоставлять Project overview для discrete snapshots A–S (DOC-PROD-024) без temporal engine. A–H semantics DOC-PROD-022 SHALL оставаться согласованными. Snapshot S SHALL представлять достигнутый Production Start с actual/forecast `2027-09-22`.

#### Scenario: Snapshot P remains Red under BR-007

- **WHEN** активен Snapshot P
- **THEN** RISK-001 rag = Red и projectStatus = Red
- **AND** MS-PS rag ≠ Green

#### Scenario: Snapshot Q is Yellow after spine leaves Red

- **WHEN** активен Snapshot Q (asOf 2027-09-15)
- **THEN** RISK-001 rag ≠ Red и MS-PS rag ≠ Red
- **AND** projectStatus = Yellow
- **AND** Production Start ещё не achieved

#### Scenario: Snapshot R remains Yellow before actual start

- **WHEN** активен Snapshot R
- **THEN** projectStatus = Yellow

#### Scenario: Snapshot S production start achieved

- **WHEN** активен Snapshot S (asOf 2027-09-22)
- **THEN** Production Start actual равен 2027-09-22 и projectStatus = Green
- **AND** RISK-001 rag = Green и MS-PS rag = Green
- **AND** EQ-HVAC-01 Δ согласован с PS Δ = +7 (BR-004)

#### Scenario: Snapshot O aligned recovery to plus seven

- **WHEN** активен Snapshot O
- **THEN** forecastProductionStart равен 2027-09-22
- **AND** EQ-HVAC-01 delivery delta равен +7

### Requirement: Dashboard cost signal

Dashboard overview SHALL включать compact project cost signal (BAC, EAC, VAC, contingency health) из backend cost measures без превращения Dashboard в finance wall.

#### Scenario: Cost signal present on C

- **WHEN** активен Snapshot C
- **THEN** overview содержит integer RUB BAC/EAC/VAC fields

### Requirement: Snapshot-aware executive milestones

Dashboard SHALL получать fixture-authored `executiveMilestoneIds` (8–12) для активного snapshot, всегда включая `MS-PS`. FE SHALL NOT использовать hardcoded enrichment-only six IDs как SoT.

#### Scenario: Late snapshot includes readiness milestones

- **WHEN** активен Snapshot M или S
- **THEN** executive subset включает MS-PS и релевантные commissioning/readiness milestones из каталога

### Requirement: Navigable workstream readiness

Workstream readiness entries на Dashboard SHALL быть navigable к Workstream detail (`/workstreams/:id`).

#### Scenario: Click HVAC readiness

- **WHEN** пользователь активирует WS-HVAC на Dashboard Snapshot C
- **THEN** клиент переходит к Workstream detail WS-HVAC

## MODIFIED Requirements

### Requirement: Sole BR-004 production start driver

Система SHALL сдвигать forecastProductionStart только по Δ EQ-HVAC-01 (sole critical driver) на всём A–S. Delayed non-HVAC critical equipment SHALL NOT автоматически менять Production Start. На любом snapshot `psDeltaDays` SHALL equal `EQ-HVAC-01` delta days. Состояние HVAC +7 при PS +14 SHALL NOT публиковаться.

#### Scenario: Snapshot B packaging delay does not shift PS

- **WHEN** активен Snapshot B с Delayed EQ-PKG-01 и без HVAC delay
- **THEN** forecastProductionStart остаётся 2027-09-15

#### Scenario: Snapshot N decisions leave residual plus fourteen

- **WHEN** активен Snapshot N с commissioning Decisions
- **THEN** forecastProductionStart остаётся 2027-09-29 и EQ-HVAC-01 Δ = +14
