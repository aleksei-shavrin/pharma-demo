---
id: DOC-PHASE-BAPD-001
title: "Фаза: Business Analysis & Product Definition"
type: delivery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-BA-README-001
  - DOC-HANDOFF-DISC-001
  - DOC-PROD-001
---

# Фаза: Business Analysis & Product Definition

План исполнения фазы BA & Product Definition для **Pharma Project Control**. Методология: `.cursor/plans/business-analysis-product-definition.md` (вне портала docs).

## Цель фазы

Проверяемая бизнес- и продуктовая модель Demo v1 + draft REQ/AC по narrative **SCN-001 → SCN-007**, достаточные для отдельной фазы Requirements Specification & OpenSpec.

## Входы

- Discovery completed + PO HIP-001/006/008 ([discovery-summary](../01-discovery/discovery-summary.md)).
- Handoff Discovery: [`2026-10-30-discovery.md`](./handoffs/2026-10-30-discovery.md).
- Demo v1 architecture / persistence-transition (не переопределять).
- `AGENTS.md`, documentation-standard, G0.

## Вне scope

- Код apps; PostgreSQL / ORM / auth ADR.
- Любые изменения `openspec/specs/` и `openspec/changes/`.
- Полный inventory PROC-001…011; SCN-006 как Must; GMP/CSV theater; UX layouts.
- `status: approved` силами AI; enterprise-`fact` без эксперта.

## Работы (BA0–PD4)

| # | Работа | Результат | Owner |
|---|--------|-----------|-------|
| BA0 | Charter | phase plan, ba-registers, BA README | BA lead |
| BA1 | Context & problems | business-context-and-problems | BA |
| BA2 | Needs & processes | stakeholder-needs; process-specs (обоснованные) | BA |
| BA3 | Rules & domain | business-rules; domain-model | BA |
| PD1 | Capabilities | demo-v1-capabilities (C-01…C-05) | PD |
| PD2 | Scope + mock data | functional-scope; mock-narrative-data | PD |
| PD3 | REQ + walkthrough | REQ-* + acceptance walkthrough | PD |
| PD4 | Trace + handoff | matrix, summary, handoff | lead |

## Quality gates

См. план §8: G0, BA-Narrative, BA-Process-Justify, BA-No-Fake-GMP, BA-BR-Testable, BA-Certainty, BA-No-Dup, BA-Demo-Constraints, BA-Mock-Integrity, BA-Behavior-REQ, BA-Testable-REQ, BA-No-OpenSpec, BA-Docs-Tests, BA-Handoff.

## Definition of Done

См. план §9 (кратко): обоснованные process-specs; BR-канон; C-01…C-05; scope freeze PO **или** paused; mock integrity; behavior REQ+AC; business-outcome walkthrough; traceability; handoff → OpenSpec phase; `openspec/**` не изменён; `npm run test:docs` зелёный.
