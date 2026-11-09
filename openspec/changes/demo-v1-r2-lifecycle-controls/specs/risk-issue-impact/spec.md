## ADDED Requirements

### Requirement: Deeper issue risk decision catalogues

Система SHALL поддерживать union catalogues порядка ~30 Issues, ~30 Risks, ~18 Decisions across 01–19, с per-snapshot presence overlays. Issue lifecycle SHALL remain Open | Mitigating | Closed. Decision types SHALL remain PrioritizeRecovery | AcceptDateSlip without auto-reforecast of schedule or EAC.

#### Scenario: Closed issue does not auto-green risk

- **WHEN** Issue Closed на snapshot, где linked Risk ещё Red по fixture
- **THEN** Risk.rag остаётся fixture-authored и не вычисляется FE из Closed

### Requirement: Optional cost impact fields

Risk MAY включать `costExposureRub` / `mitigationCostRub`. Issue MAY включать `costImpactRub`. Decision MAY включать `approvedCostImpactRub`. Decision alone SHALL NOT мутировать EAC.

#### Scenario: Decision cost impact recorded without EAC change

- **WHEN** Decision с approvedCostImpactRub появляется на Snapshot 14
- **THEN** project EAC остаётся на prior authoritative value until later fixture post-state
