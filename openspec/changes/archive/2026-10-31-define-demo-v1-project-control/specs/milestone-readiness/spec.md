# Spec Delta

## Purpose

Ведёт ключевую веху production start (MS-PS) с baseline/forecast dates и rag в согласовании с linked Risk и BR-004, без универсального runtime RAG engine и без полного каталога gates заказчика.

## ADDED Requirements

### Requirement: MS-PS dates present
Система SHALL вести Milestone MS-PS с `baselineDate` и `forecastDate` (REQ-MILE-001, C-02).

#### Scenario: MS-PS has baseline and forecast
- **WHEN** запрашивается веха production start Demo v1
- **THEN** MS-PS содержит baselineDate и forecastDate

### Requirement: Snapshot A milestone baseline
В Snapshot A система SHALL иметь MS-PS rag Green и forecastDate = baselineDate = 2027-09-15 как baseline fixture, не как runtime-вывод BR-003 (REQ-MILE-001; DOC-PROD-012).

#### Scenario: Snapshot A Green baseline
- **WHEN** активен Snapshot A
- **THEN** MS-PS.rag равен Green и forecastDate равен baselineDate 2027-09-15

### Requirement: Snapshot B milestone after slip
В Snapshot B система SHALL иметь MS-PS rag Red и forecastDate = 2027-10-06 (= baseline + 21d per BR-004), согласованные с mock fixture и integrity vs BR-003 expectation (REQ-MILE-001). Система SHALL NOT требовать runtime-пересчёта RAG сверх fixture/integrity.

#### Scenario: Snapshot B Red and shifted forecast
- **WHEN** активен Snapshot B
- **THEN** MS-PS.rag равен Red и forecastDate равен 2027-10-06

### Requirement: Milestone linked to RISK-001 on B and C
В Snapshot B и C система SHALL связывать MS-PS с RISK-001 для BR-003 path (REQ-MILE-001).

#### Scenario: MS-PS linked to RISK-001 after delay
- **WHEN** активен Snapshot B или C
- **THEN** MS-PS связан с RISK-001

### Requirement: Snapshot C milestone stable after PrioritizeRecovery
В Snapshot C система SHALL сохранять MS-PS rag и forecastDate как в Snapshot B; Decision alone SHALL NOT менять их (REQ-MILE-001; BR-006).

#### Scenario: No milestone change from Decision alone
- **WHEN** записан PrioritizeRecovery в Snapshot C
- **THEN** MS-PS.rag и forecastDate совпадают со Snapshot B
