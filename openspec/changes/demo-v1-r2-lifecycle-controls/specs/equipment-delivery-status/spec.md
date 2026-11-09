## ADDED Requirements

### Requirement: Expanded equipment catalogue

Система SHALL поддерживать расширенный Equipment catalogue порядка ~50–55 записей, распределённых по восьми Workstreams (DOC-PROD-025), сохраняя spine `EQ-HVAC-01` как sole BR-004 Production Start driver.

#### Scenario: All workstreams have equipment

- **WHEN** запрошен equipment register Snapshot 01
- **THEN** каждый из восьми Workstream id встречается хотя бы у одного Equipment

### Requirement: Selective equipment cost fields

Значимое закупаемое Equipment MAY иметь integer RUB cost fields. Σ Equipment costs SHALL NOT требоваться равной Workstream approved budget.

#### Scenario: Non-cost equipment allowed

- **WHEN** Equipment не помечено как cost-bearing
- **THEN** cost fields могут отсутствовать без нарушения integrity
