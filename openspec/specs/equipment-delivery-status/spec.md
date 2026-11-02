# equipment-delivery-status Specification

## Purpose

Предоставляет статус critical / long-lead equipment package (delivery dates и status) как драйвер Demo v1 narrative и вход BR-004, строго отделяя delivery dates от production-start dates.

## Requirements

### Requirement: Critical equipment delivery fields

Система SHALL предоставлять для EQ-HVAC-01 `isCritical` = true, `baselineDelivery`, `forecastDelivery` и status (REQ-EQPT-001, C-03).

#### Scenario: EQ-HVAC-01 fields available

- **WHEN** запрашивается critical equipment Demo v1
- **THEN** EQ-HVAC-01 имеет isCritical true и доступные baselineDelivery, forecastDelivery и status

### Requirement: Snapshot A equipment on track

В Snapshot A система SHALL иметь EQ-HVAC-01 status OnTrack и forecastDelivery = baselineDelivery = 2027-05-15 (REQ-EQPT-001; DOC-PROD-012).

#### Scenario: Snapshot A on track

- **WHEN** активен Snapshot A
- **THEN** status равен OnTrack и forecastDelivery равен baselineDelivery 2027-05-15

### Requirement: Equipment as contributing impact driver

Система SHALL позволять использовать EQ-HVAC-01 как contributing driver в director impact aggregate (REQ-EQPT-001; REQ-IMPCT-001). Регистрация Issue — вне этой capability (risk-issue-impact / BR-001).

#### Scenario: Equipment referenced from impact path

- **WHEN** формируется impact aggregate после delay
- **THEN** aggregate может ссылаться на EQ-HVAC-01 как contributing driver

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
