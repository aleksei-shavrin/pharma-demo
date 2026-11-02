---
id: DOC-PROD-024
title: "Demo v1 R2 — lifecycle snapshot matrix A–S"
type: product
status: draft
version: "0.1.1"
created: 2026-11-02
updated: 2026-11-02
owner: "docs-engineering"
related:
  - DOC-PROD-022
  - DOC-PROD-023
  - DOC-PROD-025
  - DOC-PROD-026
  - DOC-BA-014
  - DOC-BA-018
---

# Demo v1 R2 — lifecycle snapshot matrix A–S

> **certainty:** assumption
>
> Normative **design** matrix for R2. A–H narrative core = DOC-PROD-022 (historical). I–S = R2 extension. Runtime fixtures A–S implemented in R2-L1.

## 1. Phase grouping (selector)

| Phase | Snapshots | Sense |
|-------|-----------|--------|
| Early | A–B | Baseline → local attention |
| Disruption | C–E | HVAC shock → cascade → parallel pressure |
| Management | F–H | Decisions → partial recovery → residual honesty |
| Installation | I–K | Utilities/AUT → PRD install → recovery progress (PS still +14) |
| Commissioning | L–N | BMS/EMS → demo IQ pressure → decisions (forecast unchanged) |
| Close-out | O–S | PS +7 fixture recovery → readiness → baseline date miss → Go/No-Go → **PS achieved** |

## 2. Production Start spine (all snapshots)

| Field | Value |
|-------|--------|
| Baseline PS | `2027-09-15` |
| Sole driver | `EQ-HVAC-01` (BR-004); no alternate PS driver in R2 |
| Worst forecast | C–F: `2027-10-06` (**+21**) |
| Residual | G–N: `2027-09-29` (**+14**) while HVAC driver Δ = +14 |
| Recovered forecast | O–R: `2027-09-22` (**+7**) with HVAC driver Δ = +7 **same fixture post-state** |
| Actual | S: `2027-09-22` (**+7**) |

> **certainty:** fact (product decision)
>
> Forbidden inconsistent state: HVAC Δ=+7 while PS Δ=+14 (or any mismatched driver Δ vs PS Δ) without a new PS driver (which R2 does **not** introduce).

### BR-004 late-stage (see DOC-BA-018 / BR-004)

- While driver path active: `psDeltaDays === eqHvac01DeltaDays`.
- K–M may show **operational** recovery signals (issues mitigating, secondary EQ improving) while **authoritative** HVAC Δ and PS remain **+14**.
- N: Decisions recorded; forecasts **unchanged** (BR-006).
- O: **single** fixture-authored post-state moves HVAC **and** PS to **+7**.
- S: actual PS = forecast; driver recovered; RISK-001 Green; MS-PS Green.

## 3. Snapshot index

| ID | asOf | Phase | Overall RAG | PS forecast/actual | PS Δ | Dominant WS |
|----|------|-------|-------------|--------------------|------|-------------|
| A | 2027-02-15 | Early | Green | 2027-09-15 | 0 | — |
| B | 2027-02-28 | Early | Yellow | 2027-09-15 | 0 | BLD, PKG |
| C | 2027-03-01 | Disruption | Red | 2027-10-06 | +21 | HVAC |
| D | 2027-03-20 | Disruption | Red | 2027-10-06 | +21 | HVAC, CLN |
| E | 2027-04-10 | Disruption | Red | 2027-10-06 | +21 | Multi + UTL/QC/PRD |
| F | 2027-04-20 | Management | Red | 2027-10-06 | +21 | HVAC (+ decisions) |
| G | 2027-05-15 | Management | Red | 2027-09-29 | +14 | HVAC residual; PKG Yellow residual |
| H | 2027-06-01 | Management | Red | 2027-09-29 | +14 | HVAC residual; AUT rising |
| I | 2027-06-20 | Installation | Red | 2027-09-29 | +14 | UTL recovery; AUT interface |
| J | 2027-07-05 | Installation | Red | 2027-09-29 | +14 | PRD install wave |
| K | 2027-07-20 | Installation | Red | 2027-09-29 | +14 | PKG residual closed; HVAC ops progress **but PS still +14** |
| L | 2027-08-01 | Commissioning | Red | 2027-09-29 | +14 | AUT BMS/EMS |
| M | 2027-08-12 | Commissioning | Red | 2027-09-29 | +14 | COM demo IQ gates |
| N | 2027-08-22 | Commissioning | Red | 2027-09-29 | +14 | Commissioning decisions; forecast unchanged |
| O | 2027-09-01 | Close-out | Red | 2027-09-22 | +7 | HVAC+PS fixture +7; OQ wave; not yet recovered overall |
| P | 2027-09-10 | Close-out | **Red** | 2027-09-22 | +7 | PQ / final readiness; RISK-001 still Red (BR-007) |
| Q | 2027-09-15 | Close-out | **Yellow** | 2027-09-22 | +7 | Baseline date passed without start; spine cleared of Red |
| R | 2027-09-18 | Close-out | **Yellow** | 2027-09-22 | +7 | Go/No-Go / final readiness |
| S | 2027-09-22 | Close-out | **Green** | **actual** 2027-09-22 | +7 | Production Start achieved |

> **certainty:** assumption
>
> **Late RAG (human R2-D0-R1):** P=Red, Q=Yellow, R=Yellow, S=Green. BR-007 **not** weakened: on P, RISK-001 remains Red ⇒ MS-PS not Green ⇒ overall Red. On Q/R, fixture-authored RISK-001 and MS-PS leave Red so overall can be Yellow under existing rollup rules. S: RISK-001 Green, MS-PS Green, overall Green.

## 4. Per-snapshot narrative (I–S detail; A–H = DOC-PROD-022)

### I — 2027-06-20 — Utilities recovery / AUT pressure

- UTL: WFI/PW path improving; prior UTL issues → Mitigating/Closed (fixture).
- AUT: new interface/integration Issue+Risk appear (BMS/EMS prep).
- HVAC/PS: still +14 / Red.
- Cost: commitments rising in UTL/AUT; EAC still elevated vs BAC.
- Notifications: utilities recovery; AUT attention.

### J — 2027-07-05 — Production installation wave

- PRD: install Issues/Risks peak; PRD milestones Yellow/Red as authored.
- BLD/CLN: largely quiet / Closed.
- HVAC/PS: +14 unchanged.
- Cost: PRD committed spike; Actual lagging.
- Notifications: PRD install pressure.

### K — 2027-07-20 — Recovery progress; PS still +14

- PKG serialization residual closed (EQ/ISS/RISK path Green/Closed).
- Operational HVAC progress visible (secondary units, mitigating notes) — **authoritative EQ-HVAC-01 Δ and PS remain +14**.
- Notifications: PKG recovered; residual PS honesty.

### L — 2027-08-01 — BMS/EMS integration

- AUT Red; EMS/BMS Issues open; MS-AUT-* under pressure.
- HVAC/PS: +14.
- Cost: AUT exposure up; contingency draw continuing.
- Notifications: critical AUT risk.

### M — 2027-08-12 — Commissioning / demo IQ readiness

- COM / HVAC IQ-style demo gates under pressure (wording: «демо-гейт готовности»).
- Multi-WS Yellow; drama shifted off sole HVAC narrative.
- PS still +14.
- Notifications: readiness / milestone.

### N — 2027-08-22 — Commissioning decisions; forecast unchanged

- New Decisions (PrioritizeRecovery / AcceptDateSlip as fitted); Issues → Mitigating where authored.
- **No** automatic PS/HVAC/EAC change (BR-006 + cost honesty).
- Notifications: decision recorded.

### O — 2027-09-01 — Fixture post-state +7

- **Atomic fixture:** EQ-HVAC-01 Δ=+7 **and** PS forecast=`2027-09-22`.
- RISK-001 still Red (or Mitigating path) until later snaps — BR-007 until Green.
- OQ readiness wave begins.
- Cost: schedule better; EAC not magically improved.
- Notifications: recovery / PS forecast update.

### P — 2027-09-10 — PQ / final readiness — **overall Red**

- Many early Issues Closed; residual AUT/QC attention.
- **RISK-001 still Red**; MS-PS not Green (BR-007); overall **Red**.
- PS forecast remains +7.
- Cost uncertainty shrinking (ETC down).
- Notifications: readiness.

### Q — 2027-09-15 — Baseline date without start — **overall Yellow**

- asOf = baseline PS date; **Production Start not achieved**.
- Forecast still `2027-09-22`.
- Fixture-authored: RISK-001 **not** Red; MS-PS **not** Red — so BR-007 no longer forces Red; overall **Yellow** (controlled readiness / residual attention).
- Director-facing honesty notification (baseline date missed).

### R — 2027-09-18 — Go / No-Go — **overall Yellow**

- Final Decision recorded; ISS-001 Closed fixture-authored.
- Spine remains non-Red; overall **Yellow** until actual start (not Green before S).
- Notifications: decision / go-forward.

### S — 2027-09-22 — Production Start achieved — **overall Green**

- Actual PS = `2027-09-22`; MS-PS Green; RISK-001 Green; EQ-HVAC-01 operationally OnTrack via fixture-authored status override (historical schedule variance +7 retained; `asOf` does **not** imply delivery).
- Actual = EAC; ETC = 0; final VAC −80M (DOC-PROD-026).
- Notifications: readiness / Production Start.

## 5. Executive milestone subset (snapshot-aware)

Backend/fixture-authored `executiveMilestoneIds[]` is a **stable curated project-lifecycle map** (exactly 12 IDs, identical for every snapshot A–S; R2-U1-R4). Always includes **MS-PS**. Snapshot switching changes project state and timeline accents, **not** membership of the executive set. FE must not invent a competing membership. Deliberate RU short labels required for executive-visible points.

## 6. Cost / notification columns

Per-snapshot cost integers: DOC-PROD-026. Notification highlights: taxonomy critical_risk / issue / milestone / cost / decision / recovery / readiness; ≤3 toasts on successful switch.

## 7. Non-goals

No continuous monthly filler snaps; no history engine; no post-start T; no rewrite of A–H without blocker.
