## ADDED Requirements

### Requirement: Integer RUB project cost measures

Система SHALL представлять project cost measures только в целых рублях (`*Rub` integer): `approvedBudgetRub` (BAC), `actualCostRub`, `committedCostRub`, `etcRub`, `eacRub`, `vacRub`, `contingencyTotalRub`, `contingencyConsumedRub`, `contingencyRemainingRub`. Float money SHALL NOT допускаться. Director-facing currency SHALL быть RUB only.

#### Scenario: Project cost integers on snapshot A

- **WHEN** запрошен cost overview Snapshot A
- **THEN** все money поля — integers и `eacRub = actualCostRub + etcRub`
- **AND** `eacRub = approvedBudgetRub = 6200000000` и `vacRub = 0`
- **AND** `contingencyConsumedRub = 0` при `contingencyTotalRub = 350000000` (unused contingency ≠ automatic positive VAC)

### Requirement: Workstream control budgets and contingency

Project BAC SHALL equal sum of eight Workstream `approvedControlBudgetRub` plus project-level `contingencyTotalRub`. Contingency SHALL NOT быть девятым Workstream. VAC SHALL equal BAC − EAC. Contingency remaining SHALL equal total − consumed.

#### Scenario: CBS arithmetic holds

- **WHEN** любой snapshot A–S собран
- **THEN** integrity проверяет `BAC = Σ WS approved + contingencyTotal` и `vac = BAC − EAC`

### Requirement: Committed is not additive to EAC

`committedCostRub` SHALL быть parallel obligation signal. Система SHALL NOT вычислять EAC как Actual + Committed + ETC. ETC SHALL включать remaining committed-not-yet-actual и uncommitted remaining work без double count внутри ETC.

#### Scenario: Decision does not auto-change EAC

- **WHEN** Snapshot N содержит новые Decisions с `approvedCostImpactRub`
- **THEN** EAC остаётся равным значению предыдущего authoritative fixture state до отдельного fixture post-state (как F→G pattern)

### Requirement: Selective Equipment cost subset

Только выбранное значимое Equipment MAY иметь cost fields. Σ Equipment costs SHALL NOT требоваться равной Workstream approved budget. Equipment costs SHALL NOT double-count против Workstream Actual/Committed rollups.

#### Scenario: Workstream budget exceeds equipment subset

- **WHEN** запрошен `WS-HVAC` cost summary
- **THEN** WS approvedControlBudgetRub может превышать сумму selective Equipment approved costs того же WS
