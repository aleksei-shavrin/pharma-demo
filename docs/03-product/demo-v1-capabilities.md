---
id: DOC-PROD-010
title: "Demo v1 capabilities"
type: product
status: draft
version: "0.2.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-020
  - DOC-BA-014
  - DOC-BA-015
  - DOC-BA-013
---

# Demo v1 capabilities

Capability model для обязательного narrative **SCN-001 → SCN-007**. Кандидаты C-01…C-05 из Discovery; **не** FR / OpenSpec living specs.

> **certainty:** hypothesis
>
> MoSCoW Discovery → capability descriptions для BA/PD. Утверждение scope — [functional-scope](./demo-v1-functional-scope.md) (PO freeze).

## C-01 — Project overview

| | |
|--|--|
| **Intent** | Показать один Project (и опционально phases) как контейнер narrative |
| **SCN** | SCN-001, SCN-007 |
| **PROC** | контекст всех in-процессов |
| **BR** | — |
| **Entities** | Project, Phase |

## C-02 — Milestones / gates + RAG

| | |
|--|--|
| **Intent** | Вести ключевую веху production start с baseline/forecast и RAG |
| **SCN** | SCN-001, SCN-007 |
| **PROC** | PROC-010 |
| **BR** | BR-003, BR-004 |
| **Entities** | Milestone |

## C-03 — Equipment / delivery status

| | |
|--|--|
| **Intent** | Статус critical / long-lead equipment и прогноз поставки |
| **SCN** | SCN-001 → SCN-007 |
| **PROC** | PROC-007, PROC-001 |
| **BR** | BR-004 (Δ delivery → dates) |
| **Entities** | Equipment, Activity |

## C-04 — Risk & issue register linked to milestone

| | |
|--|--|
| **Intent** | Issue и Risk, связанные с equipment delay и вехой |
| **SCN** | SCN-001, SCN-007 |
| **PROC** | PROC-005, PROC-004 |
| **BR** | **BR-001** (Issue registration), NC-001 (fixture ISS-001), BR-002 |
| **Entities** | Risk, Issue |

## C-05 — Impact view: delay → production start

| | |
|--|--|
| **Intent** | Согласованный director-facing impact: driver, RAG, forecast, decision support |
| **SCN** | SCN-007 (и исход SCN-001) |
| **PROC** | PROC-011 |
| **BR** | BR-004, BR-005, BR-006 (no auto-reforecast), BR-007 |
| **Entities** | Project forecast, Decision, aggregates |

## Out of mandatory Demo v1

| ID | Статус |
|----|--------|
| C-06 Readiness-by-area | Out (SCN-006 optional) |
| C-07 Document/handover | Out |
| C-08…C-09 | Could / out |
| C-10…C-12 | Won’t |

## Candidate OpenSpec names (hypotheses only)

`project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report` — **не** созданы в `openspec/`.
