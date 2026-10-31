# Spec Delta

## Purpose

Поддерживает отдельные связанные сущности Issue и Risk для critical equipment delay и вехи MS-PS: capability регистрации Issue, narrative fixture NC-001 и Risk rag как fixture с integrity vs BR-002 — без универсального risk engine и без UI layout. Переходы Issue в Closed не входят в Demo v1 Must (условия не согласованы в источниках).

## ADDED Requirements

### Requirement: Issue registration capability
Система SHALL позволять зарегистрировать Issue с links на Equipment и Milestone, когда critical equipment имеет forecast delivery позже baseline (BR-001; REQ-RISK-001 AC-I). Это capability, не тождественная наличию конкретного ISS-001 в mock.

#### Scenario: Register Issue linked to equipment and milestone
- **WHEN** critical equipment имеет forecastDelivery позже baselineDelivery
- **THEN** можно создать Issue, linked to Equipment и Milestone production start

### Requirement: Snapshot A has no open delay Issue
В Snapshot A система SHALL NOT иметь Open Issue по EQ-HVAC-01 (REQ-RISK-001; DOC-PROD-012).

#### Scenario: Snapshot A clean of open delay Issue
- **WHEN** активен Snapshot A
- **THEN** нет Open Issue, связанного с delay EQ-HVAC-01

### Requirement: Snapshot B Issue fixture NC-001
В Snapshot B система SHALL иметь Issue ISS-001 status Open, linked to EQ-HVAC-01 и MS-PS (NC-001; REQ-RISK-001). NC-001 — narrative fixture, не тождественный BR-001.

#### Scenario: ISS-001 open in Snapshot B
- **WHEN** активен Snapshot B
- **THEN** существует ISS-001 со status Open и links на EQ-HVAC-01 и MS-PS

### Requirement: Snapshot C Issue Mitigating after PrioritizeRecovery
В Snapshot C при Decision PrioritizeRecovery система SHALL иметь ISS-001 status Mitigating. Mitigating отражает запись управленческого Decision; recovery execution SHALL NOT моделироваться (REQ-RISK-001; BR-006).

#### Scenario: Mitigating means Decision recorded
- **WHEN** в Snapshot C записан PrioritizeRecovery
- **THEN** ISS-001 status равен Mitigating
- **AND** исполнение recovery не требуется и не моделируется

### Requirement: Risk baseline fixture Snapshot A
В Snapshot A система SHALL иметь RISK-001 rag Green как baseline fixture (не следствие BR-002), связанный с EQ-HVAC-01 и MS-PS, без open delay Issue (REQ-RISK-001 AC-R).

#### Scenario: Snapshot A RISK Green fixture
- **WHEN** активен Snapshot A
- **THEN** RISK-001.rag равен Green и RISK-001 связан с EQ-HVAC-01 и MS-PS
- **AND** открытого delay Issue нет

### Requirement: Risk Red fixture and integrity on B and C
В Snapshot B система SHALL иметь RISK-001 связанный с ISS-001, EQ-HVAC-01 и MS-PS, rag fixture Red с integrity vs expected BR-002 (Issue Open). В Snapshot C PrioritizeRecovery те же связи сохраняются; Issue Mitigating; rag fixture Red с integrity vs BR-002. Система SHALL NOT требовать runtime risk engine (REQ-RISK-001).

#### Scenario: Snapshot B RISK Red with links
- **WHEN** активен Snapshot B
- **THEN** RISK-001 связан с ISS-001, EQ-HVAC-01 и MS-PS и rag fixture равен Red, согласованный с BR-002 expectation

#### Scenario: Snapshot C RISK links preserved
- **WHEN** активен Snapshot C с PrioritizeRecovery
- **THEN** связи RISK-001 с ISS-001, EQ-HVAC-01 и MS-PS сохраняются и rag fixture Red проходит integrity vs BR-002 для Mitigating

### Requirement: AcceptDateSlip Issue and Risk post-state out of scope
Спецификация SHALL NOT определять Issue.status, Risk.rag или Milestone.rag после AcceptDateSlip. AcceptDateSlip не является Issue.status. BA-OQ-004 и BA-OQ-005 остаются open (REQ-RISK-001).

#### Scenario: No AcceptDateSlip post-state requirements
- **WHEN** рассматривается ветка AcceptDateSlip
- **THEN** post-state Issue/Risk/Milestone RAG не задаётся этими requirements
