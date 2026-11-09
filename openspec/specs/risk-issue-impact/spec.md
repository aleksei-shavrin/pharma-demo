# risk-issue-impact Specification

## Purpose

Поддерживает отдельные связанные сущности Issue и Risk для critical equipment delay и вехи MS-PS: capability регистрации Issue, narrative fixture NC-001 и Risk rag как fixture с integrity vs BR-002 — без универсального risk engine и без UI layout. Переходы Issue в Closed не входят в Demo v1 Must (условия не согласованы в источниках).

## Requirements

### Requirement: Issue registration capability

Система SHALL позволять зарегистрировать Issue с links на Equipment и Milestone, когда critical equipment имеет forecast delivery позже baseline (BR-001; REQ-RISK-001 AC-I). Это capability, не тождественная наличию конкретного ISS-001 в mock.

#### Scenario: Register Issue linked to equipment and milestone

- **WHEN** critical equipment имеет forecastDelivery позже baselineDelivery
- **THEN** можно создать Issue, linked to Equipment и Milestone production start

### Requirement: Snapshot 01 has no open delay Issue

В Snapshot 01 система SHALL NOT иметь Open Issue по EQ-HVAC-01 (REQ-RISK-001; DOC-PROD-012).

#### Scenario: Snapshot 01 clean of open delay Issue

- **WHEN** активен Snapshot 01
- **THEN** нет Open Issue, связанного с delay EQ-HVAC-01

### Requirement: Risk baseline fixture Snapshot 01

В Snapshot 01 система SHALL иметь RISK-001 rag Green как baseline fixture (не следствие BR-002), связанный с EQ-HVAC-01 и MS-PS, без open delay Issue (REQ-RISK-001 AC-R).

#### Scenario: Snapshot 01 RISK Green fixture

- **WHEN** активен Snapshot 01
- **THEN** RISK-001.rag равен Green и RISK-001 связан с EQ-HVAC-01 и MS-PS
- **AND** открытого delay Issue нет

### Requirement: Multi issue and risk inventory

Система SHALL предоставлять множественные Issue и Risk (DOC-PROD-021) с RU titles, workstream, и allowed edges: Issue↔Equipment, Issue↔Risk, Issue→Milestone, Risk↔Equipment, Risk→Milestone.

#### Scenario: Snapshot 05 exposes parallel issues and risks

- **WHEN** активен Snapshot 05
- **THEN** register содержит более одной Issue и более одного Risk

### Requirement: Issue Closed status in Must lifecycle

Система SHALL поддерживать Issue.status ∈ {Open, Mitigating, Closed}. Closed effects SHALL be fixture-authored. Closed SHALL NOT автоматически делать Risk Green, менять Milestone, или reforecast.

#### Scenario: Snapshot 07 packaging issue Closed without healing HVAC

- **WHEN** активен Snapshot 07 с ISS-PKG-01 Closed и RISK-001 Red
- **THEN** ISS-PKG-01 status равен Closed
- **AND** RISK-001 остаётся Red
- **AND** forecastProductionStart остаётся согласованным с HVAC residual

### Requirement: Combined register remains typed at scale

Система SHALL сохранять единый Issues & Risks register с типом Issue vs Risk и фильтрами включая Closed, без обязательной pagination на Demo-объёме.

#### Scenario: Filter open issues in combined register

- **WHEN** фильтр Тип=Issue и status=Open
- **THEN** результат содержит только Open Issues текущего snapshot

### Requirement: Snapshot 03 Issue fixture NC-001

В Snapshot 03 система SHALL иметь ISS-001 status Open, linked to EQ-HVAC-01, RISK-001, и MS-PS (Issue→Milestone allowed).

#### Scenario: ISS-001 open in Snapshot 03

- **WHEN** активен Snapshot 03
- **THEN** существует ISS-001 Open с links на EQ-HVAC-01, RISK-001 и MS-PS

### Requirement: Snapshot 06 Issue Mitigating after PrioritizeRecovery

В Snapshot 06 при DEC-001 PrioritizeRecovery система SHALL иметь ISS-001 Mitigating; recovery execution SHALL NOT моделироваться.

#### Scenario: Mitigating means Decision recorded

- **WHEN** в Snapshot 06 записан PrioritizeRecovery
- **THEN** ISS-001 status равен Mitigating
- **AND** исполнение recovery не моделируется

### Requirement: Risk Red fixture and integrity on delay path

В любом snapshot где ISS-001 ∈ {Open, Mitigating} для HVAC delay path система SHALL иметь RISK-001 Red linked to ISS-001, EQ-HVAC-01, MS-PS (BR-002 integrity). Включая Snapshot 06 и residual 07/08.

#### Scenario: Snapshot 03 RISK Red with links

- **WHEN** активен Snapshot 03
- **THEN** RISK-001 Red и связан с ISS-001, EQ-HVAC-01, MS-PS

#### Scenario: Snapshot 07 RISK remains Red while Mitigating

- **WHEN** активен Snapshot 07 с ISS-001 Mitigating и residual HVAC delay
- **THEN** RISK-001 rag равен Red

### Requirement: AcceptDateSlip post-state is fixture-authored

Для Decision type AcceptDateSlip система SHALL NOT автоматически менять Issue/Risk/Milestone/forecast. Post-state в enriched Demo SHALL задаваться fixture snapshot (DOC-PROD-021 DEC-PKG-01 / Snapshot 07).

#### Scenario: AcceptDateSlip does not itself close issue

- **WHEN** записан DEC-PKG-01 AcceptDateSlip
- **THEN** факт записи Decision сам по себе не определяет Issue.status / Risk.rag / Milestone.rag
- **AND** Snapshot 07 может содержать fixture-authored Closed packaging Issue независимо от engine
