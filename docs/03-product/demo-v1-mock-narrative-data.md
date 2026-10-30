---
id: DOC-PROD-012
title: "Demo v1 mock narrative data"
type: product
status: draft
version: "0.1.0"
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

## Snapshot A — Baseline (до задержки)

| Object | Key fields |
|--------|------------|
| Project PRJ-01 | name «Facility Expansion Alpha»; baselineProductionStart 2026-09-01; forecastProductionStart 2026-09-01 |
| Milestone MS-PS | «Ready for production»; baseline 2026-09-01; forecast 2026-09-01; rag Green |
| Equipment EQ-HVAC-01 | critical true; baselineDelivery 2026-06-01; forecastDelivery 2026-06-01; status OnTrack |
| Activity ACT-EQ-01 | linked EQ-HVAC-01; forecastFinish 2026-06-15 |
| Risk RISK-001 | rag Green; milestone MS-PS; equipment EQ-HVAC-01 |
| Issue | none open for EQ-HVAC-01 |
| Decision | none |

## Snapshot B — After delay (SCN-001 recorded)

| Object | Key fields |
|--------|------------|
| EQ-HVAC-01 | forecastDelivery 2026-06-22 (+21d); status Delayed |
| ACT-EQ-01 | forecastFinish 2026-07-06 |
| Issue ISS-001 | «HVAC long-lead delivery slip»; status Open; owner SH-002; links EQ-HVAC-01, MS-PS |
| RISK-001 | rag Red; links ISS-001, MS-PS, EQ-HVAC-01 |
| MS-PS | forecast 2026-09-22; rag Red |
| PRJ-01 | forecastProductionStart 2026-09-22 |
| Decision | pending |

## Snapshot C — Director decision (SCN-007)

| Object | Key fields |
|--------|------------|
| Same as B for EQ/ISSUE/RISK/MS/PRJ | causal chain unchanged until decision |
| Decision DEC-001 | type PrioritizeRecovery; ownerRole SH-006; dueDate 2026-05-15; note «Expedite vendor / alternate lane» |

Alternative C': DEC-001 type AcceptDateSlip (rebaseline communicated).

## Causal integrity matrix (BA-Mock-Integrity)

| Check | Snapshot B expected | Pass? |
|-------|---------------------|-------|
| Equipment delayed ⇒ Issue exists (BR-001) | ISS-001 Open | yes |
| Open Issue ⇒ Risk not Green (BR-002) | RISK-001 Red | yes |
| Red Risk ⇒ Milestone not Green (BR-003) | MS-PS Red | yes |
| EQ slip days = MS/Project forecast slip (BR-004) | +21d | yes |
| Director aggregate has driver + RAG + forecast (BR-005) | EQ-HVAC-01, Red, 2026-09-22 | yes |
| No contradictory Green MS with Red risk (BR-007) | consistent | yes |

> **certainty:** assumption
>
> Pass выше — логическая проверка спецификации данных; runtime mock появится в apps позже.
