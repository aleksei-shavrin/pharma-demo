# Spec Delta

## Purpose

Предоставляет данные одного Demo v1 Project для управленческого обзора narrative SCN-001→SCN-007, включая baseline и forecast production start без сущности Activity.

## ADDED Requirements

### Requirement: Project identity and production-start fields
Система SHALL предоставлять для Demo v1 Project идентификатор, название, `baselineProductionStart` и `forecastProductionStart` (источник: REQ-PROJ-001, C-01). Экземпляры Phase не обязательны для Must narrative dataset.

#### Scenario: PRJ-01 fields available
- **WHEN** запрашиваются данные Project Demo v1
- **THEN** доступны id, name, baselineProductionStart и forecastProductionStart для PRJ-01

### Requirement: Snapshot A baseline production start
В Snapshot A система SHALL иметь `forecastProductionStart` равным `baselineProductionStart` = 2027-09-15 (REQ-PROJ-001; mock DOC-PROD-012).

#### Scenario: Snapshot A dates equal baseline
- **WHEN** активен Snapshot A (mock scenarioAsOfDate 2027-02-15 per DOC-PROD-012)
- **THEN** forecastProductionStart и baselineProductionStart равны 2027-09-15

### Requirement: Snapshot B and C forecast after equipment slip
В Snapshot B и C система SHALL иметь `forecastProductionStart` = 2027-10-06, согласованный с BR-004 (baseline + 21 календарный день) (REQ-PROJ-001).

#### Scenario: Snapshot B forecast shifted by BR-004
- **WHEN** активен Snapshot B (mock scenarioAsOfDate 2027-03-01 per DOC-PROD-012) после задержки critical equipment на 21 календарный день
- **THEN** forecastProductionStart равен 2027-10-06

#### Scenario: Snapshot C forecast unchanged after PrioritizeRecovery
- **WHEN** в Snapshot C (mock scenarioAsOfDate 2027-03-02 per DOC-PROD-012) записан Decision type PrioritizeRecovery
- **THEN** forecastProductionStart остаётся 2027-10-06 относительно Snapshot B (BR-006)
