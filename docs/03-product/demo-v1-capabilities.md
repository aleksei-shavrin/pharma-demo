---
id: DOC-PROD-010
title: "Demo v1 capabilities"
type: product
status: draft
version: "0.5.1"
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
| **OpenSpec** | `openspec/specs/project-status-overview/spec.md` |

## C-02 — Milestones / gates + RAG

| | |
|--|--|
| **Intent** | Вести ключевую веху production start с baseline/forecast и RAG |
| **SCN** | SCN-001, SCN-007 |
| **PROC** | PROC-010 |
| **BR** | BR-003, BR-004 |
| **Entities** | Milestone |
| **OpenSpec** | `openspec/specs/milestone-readiness/spec.md` |

## C-03 — Equipment / delivery status

| | |
|--|--|
| **Intent** | Статус critical / long-lead equipment и прогноз поставки |
| **SCN** | SCN-001 → SCN-007 |
| **PROC** | PROC-007, PROC-001 |
| **BR** | BR-004 (Δ delivery → dates) |
| **Entities** | Equipment |
| **OpenSpec** | `openspec/specs/equipment-delivery-status/spec.md` |

## C-04 — Risk & issue register linked to milestone

| | |
|--|--|
| **Intent** | Issue и Risk, связанные с equipment delay и вехой |
| **SCN** | SCN-001, SCN-007 |
| **PROC** | PROC-005, PROC-004 |
| **BR** | **BR-001** (Issue registration), NC-001 (fixture ISS-001), BR-002 |
| **Entities** | Risk, Issue |
| **OpenSpec** | `openspec/specs/risk-issue-impact/spec.md` |

## C-05 — Impact view: delay → production start

| | |
|--|--|
| **Intent** | Согласованный director-facing impact: driver, RAG, forecast, decision support |
| **SCN** | SCN-007 (и исход SCN-001) |
| **PROC** | PROC-011 |
| **BR** | BR-004, BR-005, BR-006 (no auto-reforecast), BR-007 |
| **Entities** | Project forecast, Decision, aggregates |
| **OpenSpec** | `openspec/specs/management-exception-report/spec.md` |

## Out of mandatory Demo v1

| ID | Статус |
|----|--------|
| C-06 Readiness-by-area | Out (SCN-006 optional) |
| C-07 Document/handover | Out |
| C-08…C-09 | Could / out |
| C-10…C-12 | Won’t |

## OpenSpec (living + archive)

> **certainty:** fact
>
> Living SoT (на портале `/openspec`): `openspec/specs/project-status-overview/spec.md`, `openspec/specs/milestone-readiness/spec.md`, `openspec/specs/equipment-delivery-status/spec.md`, `openspec/specs/risk-issue-impact/spec.md`, `openspec/specs/management-exception-report/spec.md`, плюс `openspec/specs/demo-v1-architecture-constraints/spec.md` (**ограничения** Demo v1, не product feature). История change (не на портале): `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/` (human APPROVE → sync → archive, 2026-10-31).

| C | OpenSpec living |
|---|-----------------|
| C-01 | `openspec/specs/project-status-overview/spec.md` |
| C-02 | `openspec/specs/milestone-readiness/spec.md` |
| C-03 | `openspec/specs/equipment-delivery-status/spec.md` |
| C-04 | `openspec/specs/risk-issue-impact/spec.md` |
| C-05 | `openspec/specs/management-exception-report/spec.md` |
| NFR | `openspec/specs/demo-v1-architecture-constraints/spec.md` |
