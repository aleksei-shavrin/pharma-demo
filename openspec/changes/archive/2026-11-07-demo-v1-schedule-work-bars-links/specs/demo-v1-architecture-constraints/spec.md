# demo-v1-architecture-constraints Specification (delta)

## Purpose

Уточняет ограничение «нет Activity/WBS» относительно curated Schedule view-model rows (`work`) и display-only links для G07–G11 — без Domain scheduling engine и без PostgreSQL/CPM.

## RENAMED Requirements

- FROM: `### Requirement: No Activity or WBS entity in enrichment`
- TO: `### Requirement: No Activity or WBS domain entity; Schedule may include curated work view-model rows`

## MODIFIED Requirements

### Requirement: No Activity or WBS domain entity; Schedule may include curated work view-model rows

Demo v1 SHALL NOT добавлять Domain entities Activity, Task, WBS Item, Work Package как Must. Schedule MAY включать curated rows `kind: 'work'` и display-only typed dependency links между работами как **view-model / API presentation**, без CPM, auto-schedule и без объявления Domain Dependency engine. Control points Equipment delivery + Milestone остаются обязательной частью Schedule.

#### Scenario: Schedule items are only equipment and milestones

- **WHEN** запрашивается schedule PRJ-01 на снимке без curated works
- **THEN** каждый item — equipment delivery или milestone
- **AND** Activity entities отсутствуют

#### Scenario: Schedule may return work rows without Domain Activity

- **WHEN** запрашивается schedule PRJ-01 на снимке с curated works
- **THEN** items могут включать `equipment_delivery`, `milestone` и `work`
- **AND** Domain model не вводит entity Activity / Task / WBS
- **AND** `links` при наличии содержат только display-only зависимости между `work:` refs

#### Scenario: Schedule without works remains control-point only

- **WHEN** запрашивается schedule снимка без curated works
- **THEN** каждый item — equipment delivery или milestone
- **AND** `links` пуст или отсутствует по контракту пустого массива
