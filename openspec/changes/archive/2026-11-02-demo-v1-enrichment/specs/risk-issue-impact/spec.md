# Spec Delta — risk-issue-impact

## ADDED Requirements

### Requirement: Multi issue and risk inventory

Система SHALL предоставлять множественные Issue и Risk (DOC-PROD-021) с RU titles, workstream, и allowed edges: Issue↔Equipment, Issue↔Risk, Issue→Milestone, Risk↔Equipment, Risk→Milestone.

#### Scenario: Snapshot E exposes parallel issues and risks

- **WHEN** активен Snapshot E
- **THEN** register содержит более одной Issue и более одного Risk

### Requirement: Issue Closed status in Must lifecycle

Система SHALL поддерживать Issue.status ∈ {Open, Mitigating, Closed}. Closed effects SHALL be fixture-authored. Closed SHALL NOT автоматически делать Risk Green, менять Milestone, или reforecast.

#### Scenario: Snapshot G packaging issue Closed without healing HVAC

- **WHEN** активен Snapshot G с ISS-PKG-01 Closed и RISK-001 Red
- **THEN** ISS-PKG-01 status равен Closed
- **AND** RISK-001 остаётся Red
- **AND** forecastProductionStart остаётся согласованным с HVAC residual

### Requirement: Combined register remains typed at scale

Система SHALL сохранять единый Issues & Risks register с типом Issue vs Risk и фильтрами включая Closed, без обязательной pagination на Demo-объёме.

#### Scenario: Filter open issues in combined register

- **WHEN** фильтр Тип=Issue и status=Open
- **THEN** результат содержит только Open Issues текущего snapshot

### Requirement: Snapshot C Issue fixture NC-001

В Snapshot C система SHALL иметь ISS-001 status Open, linked to EQ-HVAC-01, RISK-001, и MS-PS (Issue→Milestone allowed).

#### Scenario: ISS-001 open in Snapshot C

- **WHEN** активен Snapshot C
- **THEN** существует ISS-001 Open с links на EQ-HVAC-01, RISK-001 и MS-PS

### Requirement: Snapshot F Issue Mitigating after PrioritizeRecovery

В Snapshot F при DEC-001 PrioritizeRecovery система SHALL иметь ISS-001 Mitigating; recovery execution SHALL NOT моделироваться.

#### Scenario: Mitigating means Decision recorded

- **WHEN** в Snapshot F записан PrioritizeRecovery
- **THEN** ISS-001 status равен Mitigating
- **AND** исполнение recovery не моделируется

### Requirement: Risk Red fixture and integrity on delay path

В любом snapshot где ISS-001 ∈ {Open, Mitigating} для HVAC delay path система SHALL иметь RISK-001 Red linked to ISS-001, EQ-HVAC-01, MS-PS (BR-002 integrity). Включая Snapshot F и residual G/H.

#### Scenario: Snapshot C RISK Red with links

- **WHEN** активен Snapshot C
- **THEN** RISK-001 Red и связан с ISS-001, EQ-HVAC-01, MS-PS

#### Scenario: Snapshot G RISK remains Red while Mitigating

- **WHEN** активен Snapshot G с ISS-001 Mitigating и residual HVAC delay
- **THEN** RISK-001 rag равен Red

### Requirement: AcceptDateSlip post-state is fixture-authored

Для Decision type AcceptDateSlip система SHALL NOT автоматически менять Issue/Risk/Milestone/forecast. Post-state в enriched Demo SHALL задаваться fixture snapshot (DOC-PROD-021 DEC-PKG-01 / Snapshot G).

#### Scenario: AcceptDateSlip does not itself close issue

- **WHEN** записан DEC-PKG-01 AcceptDateSlip
- **THEN** факт записи Decision сам по себе не определяет Issue.status / Risk.rag / Milestone.rag
- **AND** Snapshot G может содержать fixture-authored Closed packaging Issue независимо от engine

## REMOVED Requirements

### Requirement: Snapshot B Issue fixture NC-001

**Reason:** Teaching Open ISS-001 remapped to Snapshot C.

### Requirement: Snapshot C Issue Mitigating after PrioritizeRecovery

**Reason:** Mitigating teaching state remapped to Snapshot F.

### Requirement: Risk Red fixture and integrity on B and C

**Reason:** Replaced by delay-path integrity covering C–H.

### Requirement: AcceptDateSlip Issue and Risk post-state out of scope

**Reason:** Demo enrichment path closes post-state as fixture-authored (ADDED requirement).
