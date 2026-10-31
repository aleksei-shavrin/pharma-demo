---
id: DOC-PROD-012
title: "Demo v1 mock narrative data"
type: product
status: draft
version: "0.4.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-011
  - DOC-BA-014
  - DOC-BA-015
  - DOC-DISC-018
---

# Demo v1 mock narrative data

Согласованный dataset для SCN-001→SCN-007. Certainty: **assumption** (демо-данные, не данные заказчика).

## Временная рамка

| Параметр | Значение |
|----------|----------|
| Дата подготовки пакета (документация) | 2026-10-30 |
| Календарь narrative | **2027** (будущее относительно подготовки) |
| Задержка critical equipment | **+21 календарный день** (Δ) |

> **certainty:** assumption
>
> История не описывает «уже прошедшие» относительно подготовки события сентября 2026; `scenarioAsOfDate` задаёт «сейчас» внутри демо-мира для каждого snapshot.

## Narrative condition (не BR)

| ID | Условие |
|----|---------|
| **NC-001** | В Snapshot B (и C) существует Issue **ISS-001**, status Open (B) / Mitigating (C при PrioritizeRecovery), linked to EQ-HVAC-01 и MS-PS. Это fixture narrative, опирающийся на capability **BR-001**, но не тождественный ему. |

## Snapshot A — Baseline (до задержки)

**scenarioAsOfDate:** 2027-02-15

| Object | Key fields | Rule source |
|--------|------------|-------------|
| Project PRJ-01 | name «Facility Expansion Alpha»; baselineProductionStart **2027-09-15**; forecastProductionStart **2027-09-15** | stored |
| Milestone MS-PS | «Ready for production»; baseline/forecast **2027-09-15**; rag **Green** (baseline fixture; **не** вывод BR-003) | stored baseline |
| Equipment EQ-HVAC-01 | critical true; projectId PRJ-01; baselineDelivery **2027-05-15**; forecastDelivery **2027-05-15**; status OnTrack | stored |
| Risk RISK-001 | rag **Green** (baseline fixture; **не** вывод BR-002); milestone MS-PS; equipment EQ-HVAC-01; no open delay issue | stored baseline |
| Issue | none open for EQ-HVAC-01 | — |
| Decision | none | — |

## Snapshot B — After delay (SCN-001 recorded)

**scenarioAsOfDate:** 2027-03-01

| Object | Key fields | Rule source |
|--------|------------|-------------|
| EQ-HVAC-01 | forecastDelivery **2027-06-05** (Δ=+21); status Delayed | stored |
| Issue ISS-001 | «HVAC long-lead delivery slip»; status **Open**; owner SH-002; links EQ-HVAC-01, MS-PS | **NC-001** + BR-001 capability |
| RISK-001 | rag **Red** (fixture); links ISS-001, MS-PS, EQ-HVAC-01 | fixture; integrity vs **expected** BR-002 |
| MS-PS | forecast **2027-10-06**; rag **Red** (fixture) | fixture; integrity vs BR-003 + BR-004 |
| PRJ-01 | forecastProductionStart **2027-10-06** | **must satisfy BR-004** |
| Decision | pending | — |

Проверка BR-004: baseline PS 2027-09-15 + 21d = 2027-10-06; EQ 2027-05-15 + 21d = 2027-06-05.

## Snapshot C — Director decision (SCN-007)

**scenarioAsOfDate:** 2027-03-02

| Object | Key fields | Rule source |
|--------|------------|-------------|
| EQ / ISSUE / RISK / MS / PRJ | **как в Snapshot B** (включая forecast 2027-10-06) | BR-006: no auto re-forecast |
| Issue ISS-001 | status **Mitigating** (recovery initiated) | consistent with PrioritizeRecovery |
| Decision DEC-001 | type **PrioritizeRecovery**; ownerRole SH-006; dueDate **2027-03-20**; note «Expedite vendor / alternate lane» | BR-006 |

**Alternative C' (AcceptDateSlip) — только подтверждённое:**

| Object | Confirmed | Open |
|--------|-----------|------|
| Decision DEC-001 | type **AcceptDateSlip**; forecast PRJ/MS **без изменения** (2027-10-06) | — |
| Issue.status | — | **BA-OQ-004** (не авто-Closed; AcceptDateSlip — тип Decision, не Issue.status) |
| Risk.rag / MS.rag | — | **BA-OQ-005** |

Отдельный полный mock snapshot для AcceptDateSlip **не** добавляется (не Must).

## Causal / temporal integrity matrix (BA-Mock-Integrity)

| Check | Snapshot | Expected | Spec Pass |
|-------|----------|----------|-----------|
| Temporal frame 2027; A asOf < B ≤ C | A/B/C | chronology | yes |
| BR-007 **A**: no Open Issue; forecast=baseline; Green = fixture | A | baseline integrity | yes |
| NC-001 ISS-001 | B, C | linked EQ+MS-PS | yes |
| BR-002 / BR-003 expected vs fixture | B, C | Risk/MS Red | yes |
| BR-004 Δ=+21 EQ → MS/PRJ (dates ≠ equal across meanings) | B, C | PS 2027-10-06; EQ delivery 2027-06-05 | yes |
| BR-005 aggregate: PS dates/RAG match PRJ/MS; EQ delivery dates separate; refs ISS/RISK | B, C | consistent | yes |
| BR-006 / BR-007 **C**: no auto-reforecast; no Green MS with Red Risk | C | forecast unchanged | yes |
| Causal chain EQ→ISS→RISK→MS→PRJ | B, C only | present | yes |
| No Activity entity in Demo v1 dataset | A/B/C | absent | yes |

> **certainty:** assumption
>
> Pass — логическая проверка **спецификации** mock data; runtime — later apps.
