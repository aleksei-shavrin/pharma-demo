---
id: DOC-PROD-026
title: "Demo v1 R2 — cost control, CAPEX research, and A–S money story"
type: product
status: draft
version: "0.1.1"
created: 2026-11-02
updated: 2026-11-02
owner: "docs-engineering"
related:
  - DOC-PROD-023
  - DOC-PROD-024
  - DOC-PROD-025
  - DOC-BA-018
  - DOC-UX-022
---

# Demo v1 R2 — cost control, CAPEX research, and A–S money story

> **certainty:** hypothesis
>
> Industry sources inform **Demo design**. They are **not** product requirements and **not** a real valuation of any specific plant. All director money = **integer RUB**.

## 1. External research (traceability)

### 1.1 Project Controls practices (industry-informed)

| Theme | Finding (paraphrased) | Source |
|-------|----------------------|--------|
| EAC | EAC is periodic appraisal of total cost for authorized work; common form **EAC = AC + ETC** | AACE RP **80R-13** Estimate at Completion |
| Contingency | Amount for uncertain in-scope items; typically **expected to be expended**; excludes major scope changes, disasters, escalation, management reserve | AACE **10S-90** terminology; RP **44R-08** |
| Committed cost | Obligation agreed (e.g. PO/contract) but not yet paid | AACE **10S-90** COMMITTED COST |
| Reserves | Owner contingency vs contractor management reserve are distinct in EVMS contexts; Demo collapses to **one project contingency** for simplicity | AACE RP **75R-13**; DOE PM-30 MR guidance (context only) |

**Demo translation (normative for our product, not AACE compliance):**

- Use BAC, Actual, Committed, ETC, EAC, VAC, Contingency.
- **Do not** implement full EVMS / EIA-748 / MR bureaucracy.
- **Do not** add PV/EV/CPI/SPI without time-phased WBS (explicitly out).

### 1.2 CAPEX order-of-magnitude (fictional plant class)

Public comps (expansions / CDMO / OSD capacity — **not** Russian greenfield appraisals):

| Signal | Approx | Source |
|--------|--------|--------|
| Farmak solid-dose site | ~EUR 20M | Farmak press (2018) |
| Aenova Tittmoning expansions | ~EUR 20–35M packages | Aenova PR 2023 |
| Rottendorf OSD phase / total | >EUR 30M phase; >EUR 100M total vision | pharmaceutical-technology project profile |
| Unispace continuous OSD concept | ~EUR 250M | Unispace case (China concept) |
| Nizhpharm packaging line | 158M ₽ | Kommersant (single line) |

> **certainty:** open_question
>
> Public sources do **not** yield a precise RUB CAPEX for our exact fictional 8-workstream Demo plant. FX and scope class are illustrative. Treat recommended BAC as **fictional Demo assumption**, not enterprise estimate.

### 1.3 Fictional plant class (assumption)

> **certainty:** assumption
>
> **Class:** mid-scale fictional pharmaceutical manufacturing suite (process + packaging + QC + clean utilities + HVAC + automation) on a campus with significant building/cleanroom scope — **larger than a single packaging line**, **smaller than a mega continuous OSD campus**.

Illustrative EUR band for that class from comps: ~**EUR 50–80M**. Illustrative Demo FX ~100 ₽/EUR → ~**5.0–8.0 млрд ₽**.

## 2. CAPEX scenarios (integer RUB)

| Scenario (research band) | BAC (₽) | Sense |
|--------------------------|--------:|-------|
| Lean (rejected) | 4_800_000_000 | Too tight for 8 WS + clean/HVAC/UTL depth |
| **Frozen Demo BAC** | **6_200_000_000** | Mid band (~EUR 62M class); human-accepted R2-D0-R1 |
| Rich (rejected) | 9_000_000_000 | Overstates Demo footprint |

> **certainty:** assumption
>
> **Demo BAC frozen at 6_200_000_000 ₽** (human R2-D0-R1). Fictional Demo assumption — **not** a real plant appraisal. Research limitations (FX illustrative; public comps ≠ this site) remain documented above; BAC is **no longer** an open product question for R2-M1.

## 3. Cost model (normative Demo)

### 3.1 Currency and storage

- Director-facing: **RUB / ₽** only.
- Storage: **integer rubles** (no float, no kopecks required for Demo).
- Integrity rejects non-integers.

### 3.2 Project fields

| Field | Meaning |
|-------|---------|
| `approvedBudgetRub` (BAC) | Approved project cost baseline including contingency |
| `actualCostRub` | Incurred/paid to date (fixture) |
| `committedCostRub` | Obligations placed (PO/contract-like) not fully actualized |
| `etcRub` | Estimate to complete remaining authorized work |
| `eacRub` | Estimate at completion |
| `vacRub` | `BAC − EAC` (forecast variance vs approved baseline) |
| `contingencyTotalRub` | Project-level reserve **included in BAC** (not a Workstream; not management reserve) |
| `contingencyConsumedRub` | Drawn to date |
| `contingencyRemainingRub` | `total − consumed` |

> **certainty:** assumption
>
> **Contingency ≠ automatic positive VAC.** Contingency is part of BAC and tracked as a reserve (consumed/remaining). Unused contingency alone does **not** mean the project is forecast cheaper than BAC. **EAC** is the current forecast total project cost; **VAC = BAC − EAC**. Do not invent a separate management reserve for Demo.

### 3.3 Workstream fields (authoritative control level)

`approvedControlBudgetRub`, `actualCostRub`, `committedCostRub`, `etcRub`, `eacRub`, `vacRub`.

WS budgets cover equipment **plus** installation, materials, engineering, integration, and other scope **not** represented as Equipment entities.

### 3.4 Selective Equipment cost

Optional on significant purchased EQ: `approvedCostRub?`, `committedCostRub?`, `actualCostRub?`, `forecastCostRub?`.

**Not required:** `Σ Equipment == Workstream budget`. Equipment is **detail subset**, not alternate CBS. Allocation rules must prevent double counting in rollups (EQ costs roll into WS Actual/Committed when tagged; WS approved budget is independent control total).

### 3.5 Risk / Issue / Decision money

| Entity | Fields | Semantics |
|--------|--------|-----------|
| Risk | `costExposureRub?`, `mitigationCostRub?` | Exposure **≠** BAC line; reported separately |
| Issue | `costImpactRub?` + realized/forecast flag | Fixture impact |
| Decision | `approvedCostImpactRub?` | Recorded intent; **does not** change EAC alone (BR-006 analogue) |
| Milestone / Person / Notification | — | **No** budget ownership |

### 3.6 Invariants

1. `Project.BAC = Σ WS.approvedControlBudgetRub + Project.contingencyTotalRub`
2. `vacRub = approvedBudgetRub − eacRub`
3. `contingencyRemainingRub = contingencyTotalRub − contingencyConsumedRub`
4. **`eacRub = actualCostRub + etcRub`** (authoritative)
5. **Never** `EAC = Actual + Committed + ETC` (Committed overlaps ETC)
6. **`Project.eacRub = Σ WS.eacRub + projectLevelForecastRub`** (contingency residual is Project-level; not forced into WS EAC)

### 3.7 Committed vs ETC (avoid double count)

> **certainty:** assumption
>
> **ETC** = remaining cost to complete from *now*, including (a) committed-but-not-yet-actual remaining obligation and (b) uncommitted remaining work — **netted once inside ETC**.
>
> **Committed** is a **parallel obligation signal** for directors, not an additive EAC term.
>
> Soft Demo checks: `actual ≥ 0`, `committed ≥ 0`, `etc ≥ 0`, `eac = actual + etc`; typically `actual ≤ eac`; `committed ≤ eac` unless explicitly authored over-commit (prefer avoid).

## 4. Frozen CBS (RUB)

**BAC = 6_200_000_000** (frozen R2-D0-R1)

| Node | approvedControlBudgetRub |
|------|-------------------------:|
| WS-BLD | 850_000_000 |
| WS-CLN | 740_000_000 |
| WS-HVAC | 880_000_000 |
| WS-UTL | 940_000_000 |
| WS-PRD | 1_100_000_000 |
| WS-PKG | 690_000_000 |
| WS-QC | 400_000_000 |
| WS-AUT | 250_000_000 |
| **Σ Workstreams** | **5_850_000_000** |
| **Project contingency** | **350_000_000** |
| **Project BAC** | **6_200_000_000** |

Contingency is **project reserve inside BAC**, shown as its own row on `/costs`, not WS-09.

## 5. A–S cost story (project level, integer RUB)

> **certainty:** assumption
>
> **Normative project totals for R2-M1.** Every row satisfies `EAC = Actual + ETC`, `VAC = BAC − EAC`, `contingencyRemaining = 350_000_000 − contingencyConsumed`. Committed is parallel only.
>
> **Project ↔ Workstream reconciliation (R2-M1-R1):** Contingency is a **Project-level reserve inside BAC**, not WS-09 and not silently distributed into Workstream ETC/EAC. Authoritative bridge:
>
> `Project.eacRub = Σ WS.eacRub + projectLevelForecastRub`
>
> where Demo `projectLevelForecastRub = min(contingencyRemainingRub, etcRub)` — unused contingency still expected in Project EAC mid-lifecycle (so unused ≠ automatic +VAC), and `0` at closeout when `ETC = 0` (leftover `contingencyRemaining` sits **outside** EAC). Therefore **`Σ WS.eacRub` SHALL NOT be forced equal to `Project.eacRub`**. On Snapshot A: Σ WS EAC = 5.85B (Σ WS BAC), projectLevelForecast = 350M, Project EAC = 6.2B. WS Actual/Committed still sum to Project Actual/Committed; WS ETC sums to `Project.etc − projectLevelForecast`.

| ID | Actual | Committed | ETC | EAC | VAC | Cont. consumed | Cont. rem. | Note |
|----|-------:|----------:|----:|----:|----:|---------------:|-----------:|------|
| A | 120_000_000 | 980_000_000 | 6_080_000_000 | 6_200_000_000 | 0 | 0 | 350_000_000 | Baseline; unused contingency ≠ saving |
| B | 180_000_000 | 1_050_000_000 | 6_030_000_000 | 6_210_000_000 | −10_000_000 | 0 | 350_000_000 | Local attention; slight EAC up |
| C | 210_000_000 | 1_120_000_000 | 6_060_000_000 | 6_270_000_000 | −70_000_000 | 40_000_000 | 310_000_000 | HVAC shock |
| D | 280_000_000 | 1_280_000_000 | 6_040_000_000 | 6_320_000_000 | −120_000_000 | 60_000_000 | 290_000_000 | Cascade |
| E | 360_000_000 | 1_520_000_000 | 6_020_000_000 | 6_380_000_000 | −180_000_000 | 90_000_000 | 260_000_000 | Parallel pressure |
| F | 390_000_000 | 1_560_000_000 | 5_990_000_000 | 6_380_000_000 | −180_000_000 | 90_000_000 | 260_000_000 | Decisions; **EAC unchanged vs E** |
| G | 520_000_000 | 1_780_000_000 | 5_880_000_000 | 6_400_000_000 | −200_000_000 | 120_000_000 | 230_000_000 | Recovery spend starts |
| H | 610_000_000 | 1_920_000_000 | 5_800_000_000 | 6_410_000_000 | −210_000_000 | 140_000_000 | 210_000_000 | Residual honesty |
| I | 780_000_000 | 2_180_000_000 | 5_620_000_000 | 6_400_000_000 | −200_000_000 | 160_000_000 | 190_000_000 | UTL/AUT |
| J | 980_000_000 | 2_520_000_000 | 5_430_000_000 | 6_410_000_000 | −210_000_000 | 180_000_000 | 170_000_000 | PRD install commitments |
| K | 1_180_000_000 | 2_760_000_000 | 5_230_000_000 | 6_410_000_000 | −210_000_000 | 190_000_000 | 160_000_000 | PKG residual closed |
| L | 1_360_000_000 | 2_980_000_000 | 5_050_000_000 | 6_410_000_000 | −210_000_000 | 210_000_000 | 140_000_000 | AUT exposure |
| M | 1_520_000_000 | 3_120_000_000 | 4_900_000_000 | 6_420_000_000 | −220_000_000 | 230_000_000 | 120_000_000 | Commissioning **peak EAC** |
| N | 1_580_000_000 | 3_160_000_000 | 4_840_000_000 | 6_420_000_000 | −220_000_000 | 230_000_000 | 120_000_000 | Decisions; EAC flat vs M |
| O | 1_820_000_000 | 3_380_000_000 | 4_560_000_000 | 6_380_000_000 | −180_000_000 | 250_000_000 | 100_000_000 | Schedule +7; cost not magically healed |
| P | 2_180_000_000 | 3_620_000_000 | 4_180_000_000 | 6_360_000_000 | −160_000_000 | 270_000_000 | 80_000_000 | Uncertainty down |
| Q | 2_360_000_000 | 3_700_000_000 | 3_980_000_000 | 6_340_000_000 | −140_000_000 | 280_000_000 | 70_000_000 | Baseline date miss |
| R | 2_520_000_000 | 3_760_000_000 | 3_800_000_000 | 6_320_000_000 | −120_000_000 | 290_000_000 | 60_000_000 | Go/No-Go |
| S | 6_280_000_000 | 6_280_000_000 | 0 | 6_280_000_000 | −80_000_000 | 320_000_000 | 30_000_000 | Final; Actual=EAC; ~1.3% overrun |

**Close:** schedule **+7d**; cost slight overrun (**VAC −80M**); better than peak EAC at M (**−220M**). EAC need not be monotonic; each move has narrative above.

## 6. Workstream cost narratives (summary)

- **HVAC:** recovery spend G–O links schedule residual improvement to Actual/Committed rise; EAC peak around commissioning.
- **UTL / PRD / AUT:** mid-late commitment waves (I–L).
- **PKG:** early B–G residual; K closes residual cost exposure.
- **BLD/CLN:** front-loaded Actual early; quiet late.
- **QC:** smaller absolute; instrument commitments mid.

No automatic causal engine: fixture state authoritative.

## 7. UI implications

Dashboard above-fold: BAC · EAC · VAC · contingency health. `/costs`: project controls view (DOC-UX-022). No accounting UI.
