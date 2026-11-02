# Spec Delta — equipment-delivery-status

## ADDED Requirements

### Requirement: Multi-equipment inventory with workstream

Система SHALL предоставлять inventory Demo equipment (target DOC-PROD-021, 23 items) с id, RU name, workstream, critical, baselineDelivery, forecastDelivery, status. Building shell construction items SHALL NOT appear as Equipment.

#### Scenario: Inventory includes spine and excludes pure construction shell

- **WHEN** запрашивается список equipment PRJ-01
- **THEN** список содержит EQ-HVAC-01 и EQ-BLD-02 как procured package
- **AND** не содержит former EQ-BLD-01 каркас/ограждения as Equipment
- **AND** каждый item имеет непустое presentation name

### Requirement: Mixed delivery states in enriched snapshots

Система SHALL допускать одновременно OnTrack и Delayed equipment в одном snapshot.

#### Scenario: Snapshot E has Delayed and OnTrack equipment

- **WHEN** активен Snapshot E
- **THEN** существует Delayed critical equipment помимо EQ-HVAC-01
- **AND** существует OnTrack equipment в том же snapshot

### Requirement: Snapshot C delayed delivery plus twenty-one days

В Snapshot C система SHALL иметь EQ-HVAC-01 status Delayed и forecastDelivery = baseline + 21 календарный день (2027-06-05 при baseline 2027-05-15). Delivery dates SHALL NOT трактоваться как production-start dates.

#### Scenario: Snapshot C HVAC delayed by twenty-one days

- **WHEN** активен Snapshot C
- **THEN** EQ-HVAC-01 status равен Delayed и forecastDelivery равен 2027-06-05

### Requirement: Reproducible approved equipment snapshots A through H

Система SHALL воспроизводить equipment-состояния A–H из DOC-PROD-021.

#### Scenario: Approved equipment states A through H are reproducible

- **WHEN** выбирается Snapshot A…H
- **THEN** equipment fields соответствуют DOC-PROD-021

## REMOVED Requirements

### Requirement: Snapshot B delayed delivery plus twenty-one days

**Reason:** Teaching HVAC +21 remapped to Snapshot C.

### Requirement: Reproducible Snapshots A B and C for equipment

**Reason:** Replaced by A–H reproducible requirement.
