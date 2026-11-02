# project-status-overview Specification

## Purpose

Предоставляет данные одного Demo v1 Project для управленческого обзора narrative SCN-001→SCN-007, включая baseline и forecast production start без сущности Activity.

## Requirements

### Requirement: Project identity and production-start fields

Система SHALL предоставлять для Demo v1 Project идентификатор, название, `baselineProductionStart` и `forecastProductionStart` (источник: REQ-PROJ-001, C-01). Экземпляры Phase не обязательны для Must narrative dataset.

#### Scenario: PRJ-01 fields available

- **WHEN** запрашиваются данные Project Demo v1
- **THEN** доступны id, name, baselineProductionStart и forecastProductionStart для PRJ-01

### Requirement: Snapshot A baseline production start

В Snapshot A система SHALL иметь forecastProductionStart равным baselineProductionStart = 2027-09-15.

#### Scenario: Snapshot A dates equal baseline

- **WHEN** активен Snapshot A (asOf 2027-02-15)
- **THEN** forecastProductionStart и baselineProductionStart равны 2027-09-15

### Requirement: Multi-snapshot project overview A through H

Система SHALL предоставлять Project overview для discrete snapshots A–H (DOC-PROD-022, календарь 2027) без temporal engine.

#### Scenario: Snapshot G residual forecast available

- **WHEN** активен Snapshot G
- **THEN** baselineProductionStart равен 2027-09-15 и forecastProductionStart равен 2027-09-29
- **AND** сдвиг согласован с sole BR-004 driver EQ-HVAC-01 residual Δ=+14

### Requirement: Workstream readiness rollups

Система SHALL предоставлять backend-derived workstream rollups (DOC-PROD-020): Red если любой Risk в WS rag=Red; Yellow если нет Red и (Delayed critical Equipment или Issue Open|Mitigating); иначе Green. Closed Issue не создаёт attention. FE SHALL NOT пересчитывать правило.

#### Scenario: Snapshot C HVAC workstream is Red

- **WHEN** активен Snapshot C с RISK-001 Red в WS-HVAC
- **THEN** rollup WS-HVAC равен Red

### Requirement: Overall project status

Система SHALL предоставлять backend-derived `projectStatus`: Red если MS-PS Red или RISK-001 Red; Yellow если не Red и есть management attention (WS≠Green или Open|Mitigating Issue или Delayed critical EQ); иначе Green. Без scoring engine.

#### Scenario: Snapshot A project status Green

- **WHEN** активен Snapshot A
- **THEN** projectStatus равен Green

#### Scenario: Snapshot C project status Red

- **WHEN** активен Snapshot C с RISK-001 Red
- **THEN** projectStatus равен Red

### Requirement: Sole BR-004 production start driver

Система SHALL сдвигать forecastProductionStart только по Δ EQ-HVAC-01 (sole critical driver). Delayed non-HVAC critical equipment SHALL NOT автоматически менять Production Start.

#### Scenario: Snapshot B packaging delay does not shift PS

- **WHEN** активен Snapshot B с Delayed EQ-PKG-01 и без HVAC delay
- **THEN** forecastProductionStart остаётся 2027-09-15

### Requirement: Snapshot C and F forecast after equipment slip

В Snapshot C–F система SHALL иметь forecastProductionStart = 2027-10-06 (baseline + 21) при EQ-HVAC-01 Δ=+21.

#### Scenario: Snapshot C forecast shifted by BR-004

- **WHEN** активен Snapshot C
- **THEN** forecastProductionStart равен 2027-10-06

#### Scenario: Snapshot F forecast unchanged after PrioritizeRecovery

- **WHEN** в Snapshot F записан DEC-001 PrioritizeRecovery
- **THEN** forecastProductionStart остаётся 2027-10-06 (BR-006)
