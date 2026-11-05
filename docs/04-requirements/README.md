---
id: DOC-REQ-README-001
title: Требования
type: index
status: draft
version: 0.3.1
created: '2026-10-30'
updated: '2026-10-31'
owner: docs-engineering
related:
  - DOC-TPL-REQ-001
  - DOC-TPL-NFR-001
  - DOC-STD-001
  - DOC-PROD-010
  - DOC-BA-010
---
# 04-requirements

Формальные draft-требования Demo v1. Behavior-only (без UI-layout).  
**Не** заменяют living OpenSpec specs. Living SoT: `openspec/specs/<capability>/spec.md` (публикуются на портале). Черновики и история: `openspec/changes/` и `openspec/changes/archive/` (на портал **не** публикуются). Change `define-demo-v1-project-control` после human APPROVE синхронизирован в living и архивирован в `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/`.

## AREA (выведены из capabilities / domain)

| AREA | Capability / фокус | Файлы | OpenSpec living |
|------|--------------------|-------|-----------------|
| PROJ | C-01 Project | [REQ-PROJ-001](./REQ-PROJ-001.md) | `openspec/specs/project-status-overview/spec.md` |
| MILE | C-02 Milestones | [REQ-MILE-001](./REQ-MILE-001.md) | `openspec/specs/milestone-readiness/spec.md` |
| EQPT | C-03 Equipment | [REQ-EQPT-001](./REQ-EQPT-001.md) | `openspec/specs/equipment-delivery-status/spec.md` |
| RISK | C-04 Risk & Issue | [REQ-RISK-001](./REQ-RISK-001.md) | `openspec/specs/risk-issue-impact/spec.md` |
| IMPCT | C-05 Impact / decision | [REQ-IMPCT-001](./REQ-IMPCT-001.md), [REQ-IMPCT-002](./REQ-IMPCT-002.md) | `openspec/specs/management-exception-report/spec.md` |
| NFR | Demo architecture **constraints** | [REQ-NFR-001](./REQ-NFR-001.md), [REQ-NFR-002](./REQ-NFR-002.md) | `openspec/specs/demo-v1-architecture-constraints/spec.md` |

Предварительные ярлыки плана подтверждены для Demo v1; объединение/добавление AREA — только с обоснованием в BA/PD.

## Правила

- Источник и certainty обязательны; AI не invent'ит GMP REQ.
- Шаблоны: [requirement-domain](../_templates/requirement-domain.md), [nfr](../_templates/nfr.md).
- Scope freeze: **BA-OQ-001** (2026-10-31). Living OpenSpec Must specs — SoT поведения; REQ остаются behavior drafts рядом с capabilities — не путать с «ожиданием ещё одного freeze».
