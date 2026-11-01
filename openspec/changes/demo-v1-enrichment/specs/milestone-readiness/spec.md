# Spec Delta — milestone-readiness

## ADDED Requirements

### Requirement: Multi-milestone inventory with workstream

Система SHALL предоставлять inventory milestones (DOC-PROD-021) включая MS-PS и промежуточные gates с RU title, dates, rag, optional workstream.

#### Scenario: Inventory includes intermediate gates and MS-PS

- **WHEN** запрашивается список milestones PRJ-01
- **THEN** список содержит MS-PS и дополнительные milestones

### Requirement: No Equipment to Milestone direct edge

Система SHALL NOT предоставлять direct Equipment—Milestone edges. Milestone impact from equipment delay SHALL идти через Issue и/или Risk.

#### Scenario: Clean-room path uses Risk not EQ-MS edge

- **WHEN** активен Snapshot D с RISK-CLN-01 linked to MS-CLN-RDY and EQ-CLN-01
- **THEN** API не предоставляет Equipment→Milestone link

### Requirement: Snapshot C milestone after slip

В Snapshot C система SHALL иметь MS-PS rag Red и forecastDate = 2027-10-06.

#### Scenario: Snapshot C Red and shifted forecast

- **WHEN** активен Snapshot C
- **THEN** MS-PS.rag равен Red и forecastDate равен 2027-10-06

### Requirement: Milestone linked to RISK-001 on delay snapshots

В любом snapshot где RISK-001 Red на HVAC→PS path система SHALL связывать MS-PS с RISK-001 и SHALL NOT показывать MS-PS Green (BR-007 state-based).

#### Scenario: Snapshot G residual keeps MS-PS not Green

- **WHEN** активен Snapshot G с RISK-001 Red и EQ-HVAC-01 Δ=+14
- **THEN** MS-PS связан с RISK-001 и MS-PS.rag не равен Green

### Requirement: Snapshot F milestone stable after PrioritizeRecovery

В Snapshot F система SHALL сохранять MS-PS rag и forecastDate как в Snapshot C; Decision alone SHALL NOT менять их (BR-006).

#### Scenario: No milestone change from Decision alone

- **WHEN** записан PrioritizeRecovery DEC-001 в Snapshot F
- **THEN** MS-PS.rag и forecastDate совпадают со Snapshot C

## REMOVED Requirements

### Requirement: Snapshot B milestone after slip

**Reason:** Remapped to Snapshot C.

### Requirement: Milestone linked to RISK-001 on B and C

**Reason:** Replaced by state-based RISK-001 / MS-PS requirement covering C–H.

### Requirement: Snapshot C milestone stable after PrioritizeRecovery

**Reason:** PrioritizeRecovery teaching state remapped to Snapshot F.
