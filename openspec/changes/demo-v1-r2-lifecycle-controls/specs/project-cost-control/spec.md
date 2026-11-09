## ADDED Requirements

### Requirement: Integer RUB project cost measures

Система SHALL представлять project cost measures только в целых рублях (`*Rub` integer): `approvedBudgetRub` (BAC), `actualCostRub`, `committedCostRub`, `etcRub`, `eacRub`, `vacRub`, `contingencyTotalRub`, `contingencyConsumedRub`, `contingencyRemainingRub`. Float money SHALL NOT допускаться. Director-facing currency SHALL быть RUB only.

#### Scenario: Project cost integers on snapshot 01

- **WHEN** запрошен cost overview Snapshot 01
- **THEN** все money поля — integers и `eacRub = actualCostRub + etcRub`
- **AND** `eacRub = approvedBudgetRub = 6200000000` и `vacRub = 0`
- **AND** `contingencyConsumedRub = 0` при `contingencyTotalRub = 350000000` (unused contingency ≠ automatic positive VAC)

### Requirement: Workstream control budgets and contingency

Project BAC SHALL equal sum of eight Workstream `approvedControlBudgetRub` plus project-level `contingencyTotalRub`. Contingency SHALL NOT быть девятым Workstream. VAC SHALL equal BAC − EAC. Contingency remaining SHALL equal total − consumed.

#### Scenario: CBS arithmetic holds

- **WHEN** любой snapshot 01–19 собран
- **THEN** integrity проверяет `BAC = Σ WS approved + contingencyTotal` и `vac = BAC − EAC`

### Requirement: Project EAC reconciles with Workstream forecasts plus project residual

Project `eacRub` SHALL equal `Σ Workstream.eacRub + projectLevelForecastRub`. Contingency residual SHALL NOT быть скрыто распределена в Workstream ETC/EAC. Costs overview SHALL expose reconciliation fields.

#### Scenario: Snapshot 01 unused contingency is project residual not WS overrun

- **WHEN** запрошен cost overview Snapshot 01
- **THEN** `Σ Workstream.approvedControlBudgetRub = 5850000000` и `Σ Workstream.eacRub = 5850000000`
- **AND** `projectLevelForecastRub = 350000000` и `Project.eacRub = 6200000000`
- **AND** Workstreams не показывают совокупный +350M overrun относительно control budgets из-за unused contingency

#### Scenario: Project EAC is not forced equal to sum of Workstream EAC

- **WHEN** любой snapshot 01–19 собран с `projectLevelForecastRub > 0`
- **THEN** `Σ Workstream.eacRub < Project.eacRub`
- **AND** `Project.eacRub = Σ Workstream.eacRub + projectLevelForecastRub`

### Requirement: Committed is not additive to EAC

`committedCostRub` SHALL быть parallel obligation signal. Система SHALL NOT вычислять EAC как Actual + Committed + ETC. ETC SHALL включать remaining committed-not-yet-actual и uncommitted remaining work без double count внутри ETC.

#### Scenario: Decision does not auto-change EAC

- **WHEN** Snapshot 14 содержит новые Decisions с `approvedCostImpactRub`
- **THEN** EAC остаётся равным значению предыдущего authoritative fixture state до отдельного fixture post-state (как 06→07 pattern)

### Requirement: Selective Equipment cost subset

Только выбранное значимое Equipment MAY иметь cost fields. Σ Equipment costs SHALL NOT требоваться равной Workstream approved budget. Equipment costs SHALL NOT double-count против Workstream Actual/Committed rollups.

#### Scenario: Workstream budget exceeds equipment subset

- **WHEN** запрошен `WS-HVAC` cost summary
- **THEN** WS approvedControlBudgetRub может превышать сумму selective Equipment approved costs того же WS
