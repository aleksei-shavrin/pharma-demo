## ADDED Requirements

### Requirement: Decision register read model

Система SHALL предоставлять snapshot-aware read-model register списка Decision для Demo project через project-scoped HTTP API. Каждая строка SHALL содержать существующие поля Decision: id, projectId, milestoneId (optional), type, ownerPersonId, ownerFullNameRu, dueDate (optional), note. Register SHALL NOT добавлять Domain links Decision→Equipment|Issue|Risk, SHALL NOT требовать GMP change workflow, SHALL NOT предоставлять write/edit API в Demo v1.

#### Scenario: Snapshot 01 empty decisions register

- **WHEN** запрашивается Decision register для Snapshot 01
- **THEN** items пуст
- **AND** snapshotId и scenarioAsOfDate соответствуют 01

#### Scenario: Snapshot 06 lists recorded decisions

- **WHEN** запрашивается Decision register для Snapshot 06
- **THEN** items содержит DEC-001 и другие fixture-present decisions снимка
- **AND** каждая строка включает type и ownerPersonId без invented status field
