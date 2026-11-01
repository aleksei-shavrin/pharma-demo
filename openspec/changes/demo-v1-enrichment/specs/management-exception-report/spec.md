# Spec Delta — management-exception-report

## ADDED Requirements

### Requirement: Top management exceptions list

Система SHALL предоставлять упорядоченный список topExceptions (целевой размер 3–5) на dashboard/read model. Ordering MAY use read-model `priority` (curated Demo order). SHALL NOT добавлять managementPriority на Domain entities Issue/Risk/Equipment/Milestone.

#### Scenario: Snapshot E returns multiple exceptions with read-model order

- **WHEN** запрашивается director overview для Snapshot E
- **THEN** доступны ≥2 exception entries including HVAC→PS spine
- **AND** порядок соответствует curated read-model priority

### Requirement: Trend since previous snapshot

Система SHALL предоставлять fixture-authored trend: better[], worse[], unchangedCritical[] (или эквивалент) без temporal analytics engine. FE только отображает.

#### Scenario: Snapshot G trend reflects packaging recovery

- **WHEN** активен Snapshot G
- **THEN** better[] указывает улучшение packaging story
- **AND** unchangedCritical[] может содержать HVAC/PS residual

### Requirement: Multiple decisions with Project and Milestone only

Система SHALL допускать несколько Decision records с projectId и optional milestoneId. Decision SHALL NOT иметь Domain links to Equipment, Issue, or Risk. Decision alone SHALL NOT менять forecast (BR-006).

#### Scenario: Snapshot F has DEC-001 without forecast heal

- **WHEN** активен Snapshot F с DEC-001
- **THEN** forecastProductionStart остаётся 2027-10-06
- **AND** DEC-001 связан с Project PRJ-01 и Milestone MS-PS
- **AND** Decision links не включают Equipment, Issue или Risk as Domain edges

### Requirement: Aggregate Issue and Risk refs by enriched snapshots

В Snapshot C/F aggregate SHALL содержать ссылки на RISK-001 и ISS-001. В Snapshot A открытый ISS-001 не требуется.

#### Scenario: Snapshot C F require RISK and ISS refs

- **WHEN** активен Snapshot C или F
- **THEN** aggregate содержит ссылки на RISK-001 и ISS-001

#### Scenario: Snapshot A does not require ISS-001

- **WHEN** активен Snapshot A
- **THEN** ссылка на открытый ISS-001 не требуется

### Requirement: BR-007 state-based integrity

Если RISK-001 Red на HVAC→Production Start path, система SHALL NOT показывать MS-PS Green. Применимо к любому snapshot (включая G/H residual). Snapshot letters — examples/tests only.

#### Scenario: Snapshot G H causal integrity

- **WHEN** активен Snapshot G или H с RISK-001 Red
- **THEN** MS-PS не является Green

#### Scenario: Snapshot A baseline integrity only

- **WHEN** активен Snapshot A
- **THEN** полная Issue causal chain не требуется и baseline integrity соблюдается

### Requirement: Record PrioritizeRecovery Decision on Snapshot F

Система SHALL позволять DEC-001 PrioritizeRecovery на Snapshot F; Issue → Mitigating отражает запись Decision; forecast остаётся 2027-10-06 (BR-006).

#### Scenario: Primary Snapshot F PrioritizeRecovery

- **WHEN** директор фиксирует PrioritizeRecovery как DEC-001 в Snapshot F
- **THEN** существует DEC-001 type PrioritizeRecovery с projectId PRJ-01 и milestoneId MS-PS
- **AND** forecast PRJ/MS остаётся 2027-10-06
- **AND** ISS-001 Mitigating без recovery execution
- **AND** auto-reforecast не выполняется

## REMOVED Requirements

### Requirement: Aggregate Issue and Risk refs by snapshot

**Reason:** Remapped B/C → C/F; replaced by enriched aggregate refs.

### Requirement: BR-007 integrity by snapshot

**Reason:** Replaced by state-based BR-007 requirement covering residual snapshots.

### Requirement: Record PrioritizeRecovery Decision

**Reason:** Teaching PrioritizeRecovery remapped to Snapshot F.
