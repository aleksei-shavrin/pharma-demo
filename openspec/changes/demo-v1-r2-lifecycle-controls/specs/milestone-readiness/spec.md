## ADDED Requirements

### Requirement: Expanded milestone catalogue

Система SHALL поддерживать расширенный milestone catalogue порядка ~40 control points (DOC-PROD-025; Demo v1 authored count **43** after R2-U1-R2 early BLD EXC/FND/STR), включая enrichment set и additive install/commissioning/readiness gates. IQ/OQ/PQ labels SHALL оставаться формулировкой «демо-гейт готовности» без GMP/CSV claims. Early executive storytelling MAY include distinct Domain milestones `MS-BLD-EXC` / `MS-BLD-FND` / `MS-BLD-STR` (not renames of `MS-BLD-ENCL`).

#### Scenario: Schedule returns full catalogue

- **WHEN** запрошен schedule Snapshot 19
- **THEN** milestone control points включают полный catalogue, а не только executive subset

### Requirement: No Equipment to Milestone edge

Прямая связь Equipment → Milestone SHALL оставаться запрещённой (BA-015). Issue → Milestone и Risk → Milestone остаются allowed.

#### Scenario: Direct edges exclude equipment to milestone

- **WHEN** строятся direct edges для любого snapshot 01–19
- **THEN** отсутствует edge type Equipment→Milestone
