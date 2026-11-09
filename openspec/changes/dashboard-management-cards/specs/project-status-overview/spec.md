## ADDED Requirements

### Requirement: Dashboard program rows include schedule progress

Система SHALL отдавать в dashboard overview для каждой программы те же `progressPct` / `leafCompleted` / `leafTotal` / `progressFillTone`, что и `GET .../programs` для того же snapshot (sum of child analyst-project leaves; not mean). `status` SHALL оставаться canonical `programSummariesFor` / portfolio statusOf. UI SHALL показывать compact mid-row progress bar + % рядом с health; SHALL NOT добавлять attention chip в V1.

#### Scenario: Progress parity dashboard vs program list

- **WHEN** client requests dashboard overview and programs list for the same snapshot 01–19
- **THEN** for each program id, progress fields match exactly

### Requirement: Top exception critical is link-evidence only

Система SHALL подсвечивать top exception как critical только если linked entity в `ex.links` (resolved in snapshot collections) доказывает: risk Red, milestone Red, или critical equipment Delayed. Priority/index/regex SHALL NOT определять severity. PS Δ chip SHALL только для подтверждённого PS-driver link при positive productionStart variance.

#### Scenario: Broken link stays neutral

- **WHEN** exception link id отсутствует в snapshot collections
- **THEN** that link does not contribute criticalEvidence
