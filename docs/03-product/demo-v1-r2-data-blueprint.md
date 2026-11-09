---
id: DOC-PROD-025
title: Demo v1 R2 — blueprint данных и каталогов
type: product
status: draft
version: 0.1.2
created: '2026-11-02'
updated: '2026-11-06'
owner: docs-engineering
related:
  - DOC-PROD-021
  - DOC-PROD-023
  - DOC-PROD-024
  - DOC-PROD-026
  - DOC-BA-018
---
# Demo v1 R2 — data and catalogue blueprint

> **certainty:** hypothesis
>
> Target catalogues for implementation (R2-L1+). Counts are **story floors**, not quotas. 01–08 entity IDs from DOC-PROD-021 remain; R2 **adds** entities and 09–19 overlays.

## 1. Target scale

| Category | Enrichment (E8) | R2 target | Notes |
|----------|----------------:|----------:|-------|
| Workstreams | 8 | **8** | Same codes; now read-model entities |
| Milestones | 14 | **~40** | Executive + control |
| Equipment | 23 | **~52** | Selective cost-bearing subset |
| Issues | 11 | **~30** | Union; per-snapshot subset |
| Risks | 12 | **~30** | Union |
| Decisions | 6 | **~18** | Appear from F onward + late |
| People | 0 (SH-* only) | **~15** | `PER-*` |
| Snapshots | 8 (01–08) | **19 (01–19)** | |
| Notifications | 0 | story-driven | Per hot snapshot |

## 2. Workstream catalogue (8)

Each WS: `id`, RU name, `leadPersonId`, `sortOrder`, backend RAG, aggregates.

### WS-BLD — Строительство / оболочка

- **Purpose:** shell enclosure, risers, handover to clean fit-out.
- **EQ (~4):** structure/enclosure packages, clean riser kits (extend beyond EQ-BLD-02).
- **MS (~4):** enclosure closed; risers ready; BLD handover; weather-tight.
- **Story:** 02 Yellow early → Closed by 03/04; quiet later.
- **Cost share:** see DOC-PROD-026 CBS.
- **People:** BLD lead + shared PM oversight.

### WS-CLN — Чистые помещения

- **Purpose:** cleanroom envelope ready for HVAC.
- **EQ (~6):** panels, airlocks, pass-throughs.
- **MS (~5):** panel complete; HVAC-ready; clean balance; CLN ready.
- **Story:** 04 cascade → 06 decisions → 07 residual → closed by Installation.
- **People:** CLN lead.

### WS-HVAC — HVAC

- **Purpose:** AHU critical path (BR-004) + secondary HVAC.
- **EQ (~7):** EQ-HVAC-01 spine + AHU-2, duct modules, controls skids.
- **MS (~5):** AHU delivered/installed; HVAC demo IQ gate; balance.
- **Story:** 03–15 spine; must not remain sole drama after 12.
- **People:** HVAC lead; Director/PM on DEC-001.

### WS-UTL — Инженерные системы

- **Purpose:** PW/WFI/gases/power supporting process.
- **EQ (~8):** WFI, PW, compressed air, electrical.
- **MS (~6):** PW available; WFI available; black utilities; UTL ready.
- **Story:** 05 pressure → 06/07 residual → 09 recovery.
- **People:** UTL lead; Procurement on long-lead.

### WS-PRD — Технологическое оборудование

- **Purpose:** process train delivery/install readiness.
- **EQ (~8):** mixers, vessels, process skids (fictional).
- **MS (~5):** delivered; installed; process ready-for-commission.
- **Story:** 10 install wave peak; settles before 15–19.
- **People:** PRD lead.

### WS-PKG — Упаковка

- **Purpose:** packaging line FAT/SAT + serialization.
- **EQ (~7):** line, serialization, secondary modules.
- **MS (~5):** FAT; SAT; serialization ready.
- **Story:** 02–07 residual Yellow; 11 residual closed; quiet close-out.
- **People:** PKG lead.

### WS-QC — QC / лаборатория

- **Purpose:** lab readiness, instruments.
- **EQ (~6):** HPLC and lab support.
- **MS (~4):** lab ready; methods ready (demo wording only).
- **Story:** 05–07; late 16 residual possible.
- **People:** QC lead + QA project.

### WS-AUT — Автоматизация BMS/EMS

- **Purpose:** BMS/EMS + plant demo COM gates.
- **EQ (~6):** BMS, EMS, integration cabinets.
- **MS (~6):** BMS live; EMS live; COM IQ/OQ/PQ (демо-гейты).
- **Story:** 08–14 commissioning drama; critical for 13/12.
- **People:** AUT lead; Commissioning lead.

## 3. Milestone catalogue strategy (~40 → 43)

**Keep existing 14** (DOC-PROD-021). **Add ~26** control/executive gates across WS (install complete, cable trays, clean balance, serialization cleared, EMS live, OQ/PQ demo gates, Go/No-Go, etc.).

R2-U1-R2 additive early BLD story (distinct Domain events; not renames of `MS-BLD-ENCL`):

| ID | Name | Baseline |
|----|------|----------|
| MS-BLD-EXC | Котлован завершён | 2027-02-05 |
| MS-BLD-FND | Фундамент принят | 2027-02-12 |
| MS-BLD-STR | Каркас здания готов | 2027-02-20 |

Catalogue count after U1-R2: **43** milestones (still in ~40 class). A01–A05 adds **MS-UTL-PWR** → **44**.

**Classes:**

- **Executive:** fixture-authored **stable curated set of 12** across 01–19 (R2-U1-R4, состав пересмотрен 2026-11-06), always includes **MS-PS**. Membership does **not** change by snapshot; state/RAG/chrome do. Set: EXC→CLN-PANEL→UTL-PWR→ENCL→CLN-RDY→HVAC-IQ→WFI→PRD-INST→PKG-SAT→COM-OQ→COM-GO→MS-PS. `MS-BLD-FND` и `MS-BLD-STR` остаются в каталоге и реестре, не в обзоре. Baseline `MS-CLN-PANEL` = 2027-02-16; `MS-UTL-PWR` = 2027-02-18. На 01–02 delta 0 и Green. На 03–19 у панелей +21 / Red (прогноз 2027-03-09), у энергоснабжения +56 / Red (прогноз 2027-04-15): 04 продолжает 03 теми же числами, без отката к baseline. Подробности: [DOC-DEL-A01-A05](../07-delivery/reports/2026-11-06-a01-a05-analyst-mapping.md).
- **Control:** full Schedule + Workstream page + registers.

**Forbidden:** Equipment → Milestone edge (BA-015).

## 4. People catalogue (~15)

Fictional RU names (not real persons/orgs).

| ID | RoleTitleRu (illustrative) | Primary WS |
|----|----------------------------|------------|
| PER-01 | Директор проекта | — |
| PER-02 | Руководитель проекта (PM) | — |
| PER-03 | Планирование и контроль проекта | — |
| PER-04 | Закупки | — |
| PER-05 | Пусконаладка и готовность | — |
| PER-06 | Ведущий WS-BLD | WS-BLD |
| PER-07 | Ведущий WS-CLN | WS-CLN |
| PER-08 | Ведущий WS-HVAC | WS-HVAC |
| PER-09 | Ведущий WS-UTL | WS-UTL |
| PER-10 | Ведущий WS-PRD | WS-PRD |
| PER-11 | Ведущий WS-PKG | WS-PKG |
| PER-12 | Ведущий WS-QC | WS-QC |
| PER-13 | Ведущий WS-AUT | WS-AUT |
| PER-14 | Ответственный QA проекта | WS-QC |
| PER-15 | Заместитель по готовности | — |

Exact `fullNameRu` strings authored in R2-P1 (`apps/api/src/data/fixtures/person-catalog.ts`); R2-D0 froze **roles and PER-* namespace**.

### `SH-*` to `PER-*` cutover

| Legacy | Maps to (illustrative) |
|--------|------------------------|
| SH-DIR-01 | PER-01 |
| SH-PM-01 | PER-02 |
| SH-ENG-01 | PER-08 (illustrative HVAC lead namespace; not bulk ownership of all former ENG records) |
| SH-PKG-01 | PER-11 |
| SH-QC-01 | PER-12 |

> **certainty:** assumption
>
> Single cutover in R2-P1: Issue/Decision owner fields become `ownerPersonId`; no long dual-read. Presentation via Person RU name.
> `SH_TO_PER` is a legacy identity migration aid only. Authoritative Issue/Decision responsibility is fixture-authored in catalogues (story-driven; Workstream lead as default authoring rule — R2-P1-R1).

## 5. Issues / Risks / Decisions depth

- **~30 Issues / ~30 Risks:** each WS ≥1 non-HVAC arc across lifecycle; Closed states accumulate toward S.
- **~18 Decisions:** keep 6 enrichment decisions; add commissioning / Go-No-Go / cost-impact recorded decisions (still no auto-reforecast).

## 6. Notifications

Story-driven catalogue keyed by `snapshotId`; not 1:1 with every field. Hot snaps (03, 07, 12, 15, 17, 19) get richer sets.

## 7. Integrity expectations

Unique IDs; refs resolve; 01–19 chronology; BR-004/007; BA-015; cost invariants (DOC-PROD-026); Person refs; notification soft refs; executive milestone ⊆ catalogue.
