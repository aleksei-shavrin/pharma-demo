## ADDED Requirements

### Requirement: Expanded milestone catalogue

Система SHALL поддерживать расширенный milestone catalogue порядка ~40 control points (DOC-PROD-025), включая enrichment set и additive install/commissioning/readiness gates. IQ/OQ/PQ labels SHALL оставаться формулировкой «демо-гейт готовности» без GMP/CSV claims.

#### Scenario: Schedule returns full catalogue

- **WHEN** запрошен schedule Snapshot S
- **THEN** milestone control points включают полный catalogue, а не только executive subset

### Requirement: No Equipment to Milestone edge

Прямая связь Equipment → Milestone SHALL оставаться запрещённой (BA-015). Issue → Milestone и Risk → Milestone остаются allowed.

#### Scenario: Direct edges exclude equipment to milestone

- **WHEN** строятся direct edges для любого snapshot A–S
- **THEN** отсутствует edge type Equipment→Milestone
