## ADDED Requirements

### Requirement: Executive timeline uses Apache ECharts only

FE executive timeline on the dashboard SHALL render with Apache ECharts only (program-category lanes, volume/program filters for the 189 universe, permanent phase/snapshot/PS cues, key shortLabels with overlap handling, full tooltip). The experimental renderer toggle (custom strip / vis-timeline / ECharts) SHALL NOT appear. vis-timeline SHALL NOT be required for this card.

#### Scenario: Dashboard mounts ECharts timeline without toggle

- **WHEN** dashboard executive timeline mounts
- **THEN** the active renderer is Apache ECharts
- **AND** no control offers alternate timeline renderers 1/2/3

#### Scenario: ECharts shows program names and PS dates

- **WHEN** portfolio scope has non-empty milestones
- **THEN** program row labels use director-facing program names
- **AND** production-start baseline, forecast, and delta are visible without opening tooltip
