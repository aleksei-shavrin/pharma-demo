# Spec Delta

## Purpose

Предоставляет статус critical / long-lead equipment package (delivery dates и status) как драйвер Demo v1 narrative и вход BR-004, строго отделяя delivery dates от production-start dates.

## ADDED Requirements

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

### Requirement: Snapshot B delayed delivery plus twenty-one days
В Snapshot B система SHALL иметь EQ-HVAC-01 status Delayed и forecastDelivery = 2027-06-05 (= baseline + 21 календарный день) (REQ-EQPT-001). Δ delivery является входом согласованного сдвига MS/Project forecast по BR-004; сами delivery dates SHALL NOT трактоваться как production-start dates.

#### Scenario: Snapshot B delayed by twenty-one days
- **WHEN** активен Snapshot B
- **THEN** status равен Delayed и forecastDelivery равен 2027-06-05
- **AND** delivery dates не равны production-start dates по смыслу полей

### Requirement: Reproducible Snapshots A B and C for equipment
Система SHALL обеспечивать воспроизведение утверждённых Snapshot A/B/C для equipment-состояний из DOC-PROD-012. Конкретный механизм перехода между snapshots — implementation detail вне нормативных требований этой capability.

#### Scenario: Approved equipment states are reproducible
- **WHEN** выбирается утверждённый Snapshot A, B или C
- **THEN** equipment fields соответствуют DOC-PROD-012 для этого snapshot

### Requirement: Equipment as contributing impact driver
Система SHALL позволять использовать EQ-HVAC-01 как contributing driver в director impact aggregate (REQ-EQPT-001; REQ-IMPCT-001). Регистрация Issue — вне этой capability (risk-issue-impact / BR-001).

#### Scenario: Equipment referenced from impact path
- **WHEN** формируется impact aggregate после delay
- **THEN** aggregate может ссылаться на EQ-HVAC-01 как contributing driver
