---
id: DOC-PROD-010
title: "Demo v1 capabilities"
type: product
status: draft
version: "0.5.0"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-DISC-020
  - DOC-BA-014
  - DOC-BA-015
  - DOC-BA-013
  - DOC-PROD-011
  - DOC-BA-010
---

# Demo v1 capabilities

Capability model для обязательного narrative **SCN-001 → SCN-007**. C-01…C-05 — Must freeze Demo v1; **не** FR / OpenSpec living specs.

> **certainty:** fact
>
> **BA-OQ-001 (2026-10-31):** C-01…C-05 входят в согласованный Must Demo v1; C-06/C-07 — вне обязательного объёма. См. [functional-scope](./demo-v1-functional-scope.md), [ba-registers](../02-business-analysis/ba-registers.md). Решение о демо ≠ enterprise-fact.

> **certainty:** hypothesis
>
> Детальные intent / entities / BR mapping ниже — demo model (из Discovery MoSCoW → BA/PD), не living OpenSpec.

## C-01 — Project overview

| | |
|--|--|
| **Intent** | Показать один Project (и опционально phases) как контейнер narrative |
| **SCN** | SCN-001, SCN-007 |
| **PROC** | контекст всех in-процессов |
| **BR** | BR-004, BR-006 (поля Project forecast/baseline; правила сдвига и no auto-reforecast согласованы с C-02/C-03/C-05; текст BR не менялся) |
| **Entities** | Project, Phase |
| **OpenSpec** | `project-status-overview` (change `define-demo-v1-project-control`) |

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
| **Entities** | Equipment |

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

## OpenSpec (Stage 1 change)

> **certainty:** fact
>
> Delta change `openspec/changes/define-demo-v1-project-control/` (не публикуется на портале): `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report`, плюс `demo-v1-architecture-constraints` (**ограничения** Demo v1, не product feature). Living `openspec/specs/` — после human review / apply.

| C | OpenSpec capability |
|---|---------------------|
| C-02 | `milestone-readiness` |
| C-03 | `equipment-delivery-status` |
| C-04 | `risk-issue-impact` |
| C-05 | `management-exception-report` |
