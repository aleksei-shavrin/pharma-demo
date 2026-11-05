---
id: DOC-PROD-022
title: Demo v1 enrichment — матрица снимков и причинности
type: product
status: draft
version: 0.3.2
created: '2026-11-01'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-PROD-012
  - DOC-PROD-020
  - DOC-PROD-021
  - DOC-GUIDE-001
---
# Demo v1 enrichment — snapshot and causal matrix

> **certainty:** hypothesis
>
> Discrete fixtures A–H after **R1**. Not event sourcing. Calendar **2027**.

## 1. Snapshot index

| ID | asOf | RU context | Sense |
|----|------|------------|-------|
| A | 2027-02-15 | Базовый план — спокойный старт | Baseline |
| B | 2027-02-28 | Первые локальные отклонения | PKG / BLD attention |
| C | 2027-03-01 | Критический прогноз сдвига AHU | ≈ current B (+21) |
| D | 2027-03-20 | Каскад на чистые зоны и HVAC IQ | S1+S2 |
| E | 2027-04-10 | Несколько параллельных проблем | Peak attention |
| F | 2027-04-20 | Зафиксированы управленческие решения | ≈ current C+ |
| G | 2027-05-15 | Частичная стабилизация | S4 primary recovered; WS-PKG Yellow residual; HVAC residual |
| H | 2027-06-01 | Обновлённый прогноз / остаточный риск | Residual honesty |

Live Presentation punch: **C**. Deep-dive D–H after Guide update (E7).

## 2. Per-snapshot changes

### A — Baseline

All EQ OnTrack; no open ISS; risks Green; MS Green; PS = 2027-09-15; no decisions.  
**Overall:** Green. **WS:** all Green.

### B — Local deviations

- ISS-BLD-01 Open; RISK-BLD-01 attention; EQ-BLD-02 Delayed +5  
- ISS-PKG-01 Open; EQ-PKG-01 +10; RISK-PKG-01 attention  
- HVAC / PS OK  
**Overall:** Yellow. **WS-PKG / WS-BLD:** Yellow.

### C — HVAC critical

- ISS-BLD-01 **Closed**; RISK-BLD-01 Green; EQ-BLD-02 OnTrack  
- **ISS-001 Open**; **EQ-HVAC-01 +21**; **RISK-001 Red**; **MS-PS Red**; PS **2027-10-06**  
- Packaging still Delayed (background)  
**Overall:** Red. **WS-HVAC:** Red.

### D — Cascade

- EQ-CLN-01 +14; ISS-CLN-01 Open; RISK-CLN-01 Red → MS-CLN-RDY  
- ISS-HVAC-02; RISK-HVAC-02; EQ-HVAC-02 +7  
- HVAC/PS path unchanged (+21, RISK-001 Red)  
**Overall:** Red.

### E — Parallel pressure

- UTL WFI +18 / ISS-UTL-01 / RISK-UTL-01 Red  
- ISS-UTL-02, ISS-QC-01, ISS-PRD-01, ISS-PKG-02, ISS-AUT-01, RISK-COM-01  
- Mix attention + few Reds — not all-Red plant  
**Overall:** Red (RISK-001).

### F — Decisions

- DEC-001, DEC-UTL-01, DEC-CLN-01 appear (`projectId` + `milestoneId`)  
- ISS-001 / ISS-UTL-01 / ISS-CLN-01 → **Mitigating**  
- Forecasts **unchanged** by Decision (BR-006); HVAC still +21 / RISK-001 Red / MS-PS Red  
**Overall:** Red.

### G — Partial recovery (coherence)

| Field | State |
|-------|--------|
| EQ-HVAC-01 | **+14** (fixture-authored progress, **not** DEC-001 auto-effect) |
| RISK-001 | **Red** |
| MS-PS | **Red**; forecast **2027-09-29** |
| ISS-001 | **Mitigating** |
| DEC-001 | present from F |
| Packaging (S4 primary) | EQ-PKG-01 Δ0; RISK-PKG-01 Green; ISS-PKG-01 **Closed**; DEC-PKG-01 present — primary recovery **fixture-authored** |
| Packaging (serialization residual) | EQ-PKG-03 Delayed and/or ISS-PKG-02 Open remain → **WS-PKG Yellow** under E1 rollup (primary story recovered ≠ workstream rollup Green) |
| WFI | residual +12; Mitigating |
| QC | DEC-QC-01; ISS-QC Mitigating |

**Overall:** Red (RISK-001 / MS-PS). **WS-PKG:** Yellow (serialization residual).

### H — Residual honesty

| Field | State |
|-------|--------|
| HVAC Δ / RISK-001 / MS-PS / PS | same residual as G (+14 / Red / Red / 2027-09-29) |
| ISS-001 | Mitigating |
| DEC-AUT-01 | freeze BMS/EMS |
| Packaging | same G semantics: S4 primary recovered; **WS-PKG Yellow** while serialization residual attention exists |
| Narrative | Decisions exist; execution incomplete |

**Overall:** Red. **WS-PKG:** Yellow (serialization residual).

## 3. Causal stories × snapshots

| Story | A | B | C | D | E | F | G | H |
|-------|---|---|---|---|---|---|---|---|
| S1 HVAC→PS | · | · | ● | ● | ● | ◆ | ◐ | ◐ |
| S2 Clean-room | · | · | · | ● | ● | ◆ | ◐ | ◐ |
| S3 WFI | · | · | · | · | ● | ◆ | ◐ | ◐ |
| S4 Packaging | · | ● | ● | ● | ● | ◆ | ✓ | ✓ |
| S5 QC | · | · | · | · | ● | · | ◆ | ◐ |

● active · quiet ◆ decision ✓ recovered (S4 **primary** packaging path) ◐ residual

**Note (S4 / WS-PKG):** ✓ on G/H means primary packaging recovery (EQ-PKG-01 / RISK-PKG-01 / ISS-PKG-01). It does **not** mean `workstreamStatus(WS-PKG) === Green`. While serialization residual (EQ-PKG-03 Delayed and/or ISS-PKG-02 Open) remains, E1 rollup keeps **WS-PKG Yellow**.

## 4. PS forecast

| Snap | Baseline | Forecast | Driver |
|------|----------|----------|--------|
| A–B | 2027-09-15 | 2027-09-15 | — |
| C–F | 2027-09-15 | 2027-10-06 (+21) | EQ-HVAC-01 |
| G–H | 2027-09-15 | 2027-09-29 (+14) | residual HVAC (fixture) |

## 5. Trend (fixture-authored read model)

Backend serves per snapshot compact arrays (RU strings). Not a diff engine.

| Snap | better[] | worse[] | unchangedCritical[] |
|------|----------|---------|---------------------|
| B | — | Упаковка: прогноз срыва FAT; Оболочка: замечания по дверям | — |
| C | Оболочка: замечания закрыты | **HVAC / старт производства: +21** | — |
| D | — | Чистые зоны; гейт HVAC (IQ) | HVAC / PS критичен |
| E | — | WFI; QC; автоматизация; эскалация упаковки | HVAC / PS критичен |
| F | Зафиксированы решения (HVAC, WFI, чистые зоны) | — | HVAC / PS без изменения прогноза |
| G | **Упаковка стабилизирована**; HVAC Δ снижен до +14 | — | HVAC / PS остаётся критичным; остаточное отклонение WFI |
| H | Зафиксирована заморозка точек BMS/EMS | — | Остаточный HVAC / старт производства |

## 6. Top Exceptions ordering (Dashboard read model only)

> **certainty:** assumption
>
> Ordering is **curated Demo management order** on `TopException` presentation / dashboard fixture — **not** a Domain field on Issue/Risk/Equipment/Milestone.

Intent order:

1. Production Start impact (HVAC→PS)  
2. Red Risk linked to milestone  
3. Other Red Risk  
4. Open/Mitigating Issue + delayed critical Equipment  
5. Remaining attention  

Example Snapshot E priorities (read-model `priority` 1…n): HVAC→PS, WFI, CLN, PKG, QC.

## 7. Workstream rollup spot-check

| Snap | Notable WS |
|------|------------|
| A | all Green |
| B | PKG/BLD Yellow |
| C | HVAC Red; PKG Yellow |
| F | HVAC Red (Mitigating Issue does not clear Red Risk) |
| G | HVAC Red; UTL likely Yellow/Red; **WS-PKG Yellow** (S4 primary recovered; serialization residual) |
| H | HVAC Red; **WS-PKG Yellow** (same packaging semantics as G); residual Yellow elsewhere possible |

## 8. Non-goals

No history engine; no arbitrary date playback; no continuous simulation; no scoring engine.
