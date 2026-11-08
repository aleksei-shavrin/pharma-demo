---
id: DOC-RPT-2026-11-07-SCHEDULE-DATA-CHROME
title: 'Inventory: schedule WBS/progress/links A–S'
type: report
status: draft
version: '0.2.0'
created: '2026-11-07'
updated: '2026-11-07'
owner: apps-demo
---

# Inventory matrix (demo assumption)

Machine artifacts: `/tmp/pharma-demo-artifacts/schedule-data-chrome-1c199ddd/` (`inventory-matrix.json`, `evidence.json`).

> **certainty:** assumption — measured after P1 remediation wave; before-baseline numbers from earlier draft where recoverable.

## Before (honest)

| Source | Note |
|--------|------|
| Prior draft in this file (v0.1) | C ≈113 partial WBS; A/B/D–S empty works |
| `git show` exact pre-wave fixture | **unavailable in this wave** as a clean single commit baseline (working tree mixed); do not invent exact before counts |

## After (measured API matrix)

Topology shared A–S: **133 items** (8 project + 8 stage + 21 work + 52 EQ + 44 MS), **133 unique WBS**, **17 links**.

| Snapshot | total | works | links | WK-01 | 8.2.1 | 8.2.2 | EQ-HVAC-01 |
|----------|------:|------:|------:|------:|------:|------:|----------:|
| A | 133 | 21 | 17 | 40 | 0 | 0 | 0 |
| C | 133 | 21 | 17 | 100 | 0 | 40 | 0 |
| S | 133 | 21 | 17 | 100 | 100 | 100 | 100 |
| B,D–R | 133 | 21 | 17 | (band overlays) | … | … | 0 until S |

### Links / works by workstream (same on all snaps)

| WS | works | link endpoints touching WS |
|----|------:|---------------------------:|
| WS-BLD | 2 | 4 |
| WS-CLN | 7 | 12 |
| WS-HVAC | 2 | 3 |
| WS-UTL | 2 | 3 |
| WS-PRD | 2 | 4 |
| WS-PKG | 2 | 4 |
| WS-QC | 2 | 2 |
| WS-AUT | 2 | 2 |

### Progress source assumptions (explicit)

- Works: `schedule-work-states.ts` band overlays + `clampWorkActualsToAsOf` + `reconcileWorkFacts` (positive progress requires actualStart≤asOf; 100 requires actualEnd).
- EQ/MS: `schedule-control-facts.ts` explicit deliveredOn/completedOn for all 52+44 catalogue ids; progress = date≤asOf → 100|0. Overrides: HVAC/MS-PS near S, MS-COM-GO 2027-09-18, MS-BLD-ENCL after BLD works. **Not** live forecast≤asOf; **not** sorted-id rank.
- Groups: equal-weight leaf rollup in `ScheduleService`; FE `visible-rows` keeps group numbers.

Full per-snapshot JSON: `inventory-matrix.json`.
