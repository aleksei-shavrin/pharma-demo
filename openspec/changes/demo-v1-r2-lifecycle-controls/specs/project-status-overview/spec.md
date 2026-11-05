## ADDED Requirements

### Requirement: Multi-snapshot project overview A through S

Система SHALL предоставлять Project overview для discrete snapshots A–S (DOC-PROD-024) без temporal engine. A–H semantics DOC-PROD-022 SHALL оставаться согласованными. Snapshot S SHALL представлять достигнутый Production Start с actual/forecast `2027-09-22`.

#### Scenario: Snapshot P remains Red under BR-007

- **WHEN** активен Snapshot P
- **THEN** RISK-001 rag = Red и projectStatus = Red
- **AND** MS-PS rag ≠ Green

#### Scenario: Snapshot Q is Yellow after spine leaves Red

- **WHEN** активен Snapshot Q (asOf 2027-09-15)
- **THEN** RISK-001 rag ≠ Red и MS-PS rag ≠ Red
- **AND** projectStatus = Yellow
- **AND** Production Start ещё не achieved

#### Scenario: Snapshot R remains Yellow before actual start

- **WHEN** активен Snapshot R
- **THEN** projectStatus = Yellow

#### Scenario: Snapshot S production start achieved

- **WHEN** активен Snapshot S (asOf 2027-09-22)
- **THEN** Production Start actual равен 2027-09-22 и projectStatus = Green
- **AND** RISK-001 rag = Green и MS-PS rag = Green
- **AND** EQ-HVAC-01 Δ согласован с PS Δ = +7 (BR-004)

#### Scenario: Snapshot O aligned recovery to plus seven

- **WHEN** активен Snapshot O
- **THEN** forecastProductionStart равен 2027-09-22
- **AND** EQ-HVAC-01 delivery delta равен +7

### Requirement: Dashboard cost signal

Dashboard overview SHALL включать compact project cost signal (BAC, EAC, VAC, contingency health) из backend cost measures без превращения Dashboard в finance wall.

#### Scenario: Cost signal present on C

- **WHEN** активен Snapshot C
- **THEN** overview содержит integer RUB BAC/EAC/VAC fields

### Requirement: Stable curated executive milestones (A–S)

Dashboard SHALL получать fixture-authored `executiveMilestoneIds` as a **stable curated project-lifecycle map** (exactly **12** IDs, identical membership for every snapshot A–S), always including `MS-PS`. Snapshot switching SHALL change project state / RAG / chrome accents, **not** membership of the executive set. FE SHALL NOT invent a competing membership as SoT.

#### Scenario: Membership unchanged across snapshots

- **WHEN** активен Snapshot A и Snapshot S
- **THEN** `executiveMilestoneIds` совпадает по membership с нормативным stable set (включая early BLD EXC/FND/STR/ENCL и late COM-OQ / COM-GO / MS-PS)

#### Scenario: Late snapshot still shows early construction points

- **WHEN** активен Snapshot O или S
- **THEN** executive strip всё ещё включает early BLD points и MS-PS; меняется state/RAG/chrome, не состав точек

### Requirement: Navigable workstream readiness

Workstream readiness entries на Dashboard SHALL быть navigable к Workstream detail (`/workstreams/:id`). Yellow/Red readiness rows SHALL expose **persistent** semantic tint at rest; Green rows SHALL remain neutral (no persistent success fill) while keeping a green status indicator. Hover/focus is a separate interactive affordance. Frontend SHALL NOT recompute RAG.

#### Scenario: Click HVAC readiness

- **WHEN** пользователь активирует WS-HVAC на Dashboard Snapshot C
- **THEN** клиент переходит к Workstream detail WS-HVAC

#### Scenario: Attention surfaces vs green neutral

- **WHEN** Dashboard shows workstream readiness
- **THEN** Red/Yellow rows have persistent semantic tint and Green rows do not use a persistent ok background fill

### Requirement: Dashboard lower composition (R2-U1-R7)

Desktop Dashboard SHALL place Key Exceptions | Management Decisions and Management Attention | Snapshot Changes as equal **50/50** sibling pairs in two CSS grids with generated two-column rules.

#### Scenario: Aligned 50/50 lower rows

- **WHEN** desktop viewport (≥ lg) shows both lower rows
- **THEN** Exceptions and Decisions are direct siblings in one two-column grid
- **AND** Attention and Changes are direct siblings in a second two-column grid

#### Scenario: Tailwind class must be generated

- **WHEN** lower-row grid classes are authored
- **THEN** the two-column utility SHALL appear in a Tailwind content-scanned source path (not only an unscanned helper module)

#### Scenario: Paired Exceptions and Decisions height

- **WHEN** both panels render list content
- **THEN** they share equal outer height with bounded internal scroll (~three items)
- **AND** Management Attention MAY use a compact 2×2 matrix (quiet → single empty message)

### Requirement: Executive timeline presentation labels and lanes

Executive strip short labels SHALL be RU-first for the stable 12-set (Domain IDs unchanged). Marker X SHALL remain on true dates. Late-stage layout SHALL keep snapshot chrome and ordinary milestones (including MS-COM-GO) out of the Production Start annotation zone.

#### Scenario: RU short labels without Domain IDs as captions

- **WHEN** executive strip renders the stable set
- **THEN** visible short labels are director-facing RU (accepted industry acronyms such as HVAC/WFI/OQ allowed) and not raw `MS-*` ids or English Go/No-Go presentation

### Requirement: Production Start presentation cluster (R2-U1-R8/R9)

Production Start SHALL render as one consolidated executive timeline annotation cluster (presentation-only). Independent stacked PS text labels SHALL NOT appear simultaneously. Domain membership, API contracts, and BR-004 SHALL remain unchanged.

#### Scenario: Delayed O consolidated cluster

- **WHEN** Snapshot O is shown
- **THEN** one PS cluster shows plan 15.09.2027 → прогноз 22.09.2027 and +7
- **AND** MS-COM-GO remains a separate ordinary milestone label above the axis

#### Scenario: Achieved S consolidated cluster

- **WHEN** Snapshot S is shown
- **THEN** one PS cluster shows plan 15.09.2027 → факт 22.09.2027 and +7
- **AND** the cluster does not use the word «прогноз» for the achieved date
- **AND** +7 uses historical (non danger-active) presentation while project status remains Green

#### Scenario: Coincident baseline cluster

- **WHEN** baseline and forecast coincide
- **THEN** one compact PS cluster shows a single date with «По плану»
- **AND** no zero-length connector and no +0 days label

#### Scenario: Cluster geometry contracts

- **WHEN** baseline and current differ
- **THEN** true-date markers are linked by a neutral connector
- **AND** the vertical leader is attached to the current marker
- **AND** a single annotation block carries title, plan→current line, and delta

## MODIFIED Requirements

### Requirement: Sole BR-004 production start driver

Система SHALL сдвигать forecastProductionStart только по Δ EQ-HVAC-01 (sole critical driver) на всём A–S. Delayed non-HVAC critical equipment SHALL NOT автоматически менять Production Start. На любом snapshot `psDeltaDays` SHALL equal `EQ-HVAC-01` delta days. Состояние HVAC +7 при PS +14 SHALL NOT публиковаться.

#### Scenario: Snapshot B packaging delay does not shift PS

- **WHEN** активен Snapshot B с Delayed EQ-PKG-01 и без HVAC delay
- **THEN** forecastProductionStart остаётся 2027-09-15

#### Scenario: Snapshot N decisions leave residual plus fourteen

- **WHEN** активен Snapshot N с commissioning Decisions
- **THEN** forecastProductionStart остаётся 2027-09-29 и EQ-HVAC-01 Δ = +14
