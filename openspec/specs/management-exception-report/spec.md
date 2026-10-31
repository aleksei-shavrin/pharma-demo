# management-exception-report Specification

## Purpose

Предоставляет директору согласованный impact aggregate и запись управленческого Decision. Основной Must workflow C-05 — PrioritizeRecovery; AcceptDateSlip не является обязательным пользовательским сценарием и не получает state machine.

## Requirements

### Requirement: Impact aggregate matches source objects

Система SHALL предоставлять агрегированные данные: baseline/forecast production start, milestone rag, contributing equipment id; для Snapshot B/C — ссылки на top risk и issue — согласованные с исходными объектами без смешения delivery dates и production-start dates (REQ-IMPCT-001; BR-005).

#### Scenario: Aggregate production-start fields match Project and Milestone

- **WHEN** запрашивается director impact aggregate
- **THEN** baselineProductionStart и forecastProductionStart совпадают с Project
- **AND** forecastProductionStart совпадает с MS-PS.forecastDate
- **AND** milestone rag совпадает с MS-PS.rag

#### Scenario: Aggregate equipment delivery separate from production start

- **WHEN** запрашивается director impact aggregate
- **THEN** aggregate содержит ссылку на EQ-HVAC-01 и отражает Equipment baselineDelivery и forecastDelivery
- **AND** delivery dates не трактуются как production-start dates

### Requirement: Aggregate Issue and Risk refs by snapshot

В Snapshot B/C aggregate SHALL содержать ссылки на RISK-001 и ISS-001, согласованные с исходными сущностями. В Snapshot A ссылка на ISS-001 SHALL NOT требоваться (REQ-IMPCT-001).

#### Scenario: Snapshot B C require RISK and ISS refs

- **WHEN** активен Snapshot B или C
- **THEN** aggregate содержит ссылки на RISK-001 и ISS-001

#### Scenario: Snapshot A does not require ISS-001

- **WHEN** активен Snapshot A
- **THEN** ссылка на ISS-001 не требуется

### Requirement: BR-007 integrity by snapshot

Для Snapshot B/C система SHALL удовлетворять causal-chain integrity BR-007 (нет Green MS-PS при Red RISK-001 от того же delay). Для Snapshot A — только baseline integrity (нет Open Issue delay; forecast = baseline; Green = fixture) (REQ-IMPCT-001; BR-007).

#### Scenario: Snapshot B C causal integrity

- **WHEN** активен Snapshot B или C с Red RISK-001 от delay
- **THEN** MS-PS не является Green для того же delay path

#### Scenario: Snapshot A baseline integrity only

- **WHEN** активен Snapshot A
- **THEN** полная Issue causal chain не требуется и baseline integrity соблюдается

### Requirement: Record PrioritizeRecovery Decision

Система SHALL позволять записать Decision type PrioritizeRecovery с опциональными ownerRole/dueDate. Основной Snapshot C: DEC-001 PrioritizeRecovery; forecast PRJ/MS = Snapshot B (2027-10-06); Issue → Mitigating отражает запись Decision, не исполнение recovery (REQ-IMPCT-002; BR-006).

#### Scenario: Primary Snapshot C PrioritizeRecovery

- **WHEN** директор фиксирует PrioritizeRecovery в Snapshot C
- **THEN** существует DEC-001 type PrioritizeRecovery
- **AND** forecast PRJ/MS остаётся 2027-10-06
- **AND** Issue переходит в Mitigating без моделирования recovery execution
- **AND** auto-reforecast не выполняется

### Requirement: AcceptDateSlip is known Decision type without Must workflow

Система SHALL допускать запись Decision type AcceptDateSlip как известный тип без обязательного Must user journey. Спецификация SHALL NOT определять Issue/Risk/Milestone post-state после AcceptDateSlip (BA-OQ-004/005 open). Если такой Decision записан, forecast PRJ/MS SHALL NOT меняться относительно Snapshot B только из факта записи (REQ-IMPCT-002).

#### Scenario: AcceptDateSlip not a Must user journey

- **WHEN** оценивается Must Demo v1 director workflow
- **THEN** обязательный путь — PrioritizeRecovery
- **AND** AcceptDateSlip не требует полноценных AC post-state Issue/Risk/MS

#### Scenario: AcceptDateSlip does not change forecast by itself

- **WHEN** записан Decision type AcceptDateSlip
- **THEN** forecast PRJ/MS остаётся как в Snapshot B
- **AND** Issue.status, Risk.rag и Milestone.rag после этого Decision не определяются этой спецификацией

### Requirement: No UI layout prescription

Requirements этой capability SHALL NOT предписывать UI layout Issue/Risk или impact screens (BA-OQ-006; REQ-IMPCT-001).

#### Scenario: Behavior without layout

- **WHEN** проверяются acceptance criteria impact/decision
- **THEN** критерии не требуют конкретного UI layout

### Requirement: No GMP change workflow for Decision

Запись Decision SHALL NOT требовать GMP change workflow (REQ-IMPCT-002).

#### Scenario: Decision without GMP workflow

- **WHEN** записывается PrioritizeRecovery
- **THEN** GMP change workflow не требуется
