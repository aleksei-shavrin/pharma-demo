## ADDED Requirements

### Requirement: Workstream read-model catalog

Система SHALL предоставлять каталог из ровно восьми Workstream read-model entities с стабильными id `WS-BLD`, `WS-CLN`, `WS-HVAC`, `WS-UTL`, `WS-PRD`, `WS-PKG`, `WS-QC`, `WS-AUT`, русским отображаемым именем, опциональным `leadPersonId`, и `sortOrder`. Workstream SHALL NOT быть Domain Aggregate с WBS/Activity ownership.

#### Scenario: Eight workstreams listed

- **WHEN** клиент запрашивает список Workstream проекта `PRJ-01`
- **THEN** ответ содержит ровно эти восемь id с RU names и sortOrder

### Requirement: Workstream detail aggregates

Система SHALL предоставлять Workstream detail read model для `/workstreams/:id` (API), включающий backend-owned RAG (правила enrichment rollup), сводки Equipment/Milestones/Issues/Risks/Decisions, cost summary полей Workstream, и lead Person projection. Membership SHALL происходить через существующее поле `workstream` на записях и SHALL NOT создавать causal edges.

#### Scenario: HVAC workstream shows RAG and lead

- **WHEN** активен Snapshot C и запрошен `WS-HVAC`
- **THEN** RAG = Red и detail включает EQ-HVAC-01 / ISS-001 / RISK-001 projections без Equipment→Milestone links
