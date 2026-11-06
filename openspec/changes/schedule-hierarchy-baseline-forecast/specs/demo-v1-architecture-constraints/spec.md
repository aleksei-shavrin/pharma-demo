# demo-v1-architecture-constraints Specification (delta)

## Purpose

Группы календарного плана остаются view-model Schedule. Domain WBS не вводится.

## ADDED Requirements

### Requirement: Schedule groups are not a domain WBS

Demo v1 SHALL NOT добавлять Domain entity WBS, Activity или Task ради групп календарного плана. Строки `project_group` и `stage_group` SHALL существовать только в Schedule view-model. Членство портфеля, программ и проектов SHALL оставаться прежним.

#### Scenario: Portfolio routes stay unchanged

- **WHEN** календарный план показывает дерево `AN-08`
- **THEN** маршруты `/`, `/programs`, `/projects` и `/schedule` не меняются
- **AND** контейнер снимка остаётся `PRJ-01`
