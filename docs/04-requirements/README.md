---
id: DOC-REQ-README-001
title: "Требования"
type: index
status: draft
version: "0.3.0"
created: 2026-10-30
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-TPL-REQ-001
  - DOC-TPL-NFR-001
  - DOC-STD-001
  - DOC-PROD-010
  - DOC-BA-010
---

# 04-requirements

Формальные draft-требования Demo v1. Behavior-only (без UI-layout).  
**Не** заменяют living OpenSpec specs: после BA-OQ-001 freeze формализация ведётся в change `openspec/changes/define-demo-v1-project-control/` (propose → human review → apply → archive; changes/ на портал не публикуются).

## AREA (выведены из capabilities / domain)

| AREA | Capability / фокус | Файлы | OpenSpec delta |
|------|--------------------|-------|----------------|
| PROJ | C-01 Project | [REQ-PROJ-001](./REQ-PROJ-001.md) | `project-status-overview` |
| MILE | C-02 Milestones | [REQ-MILE-001](./REQ-MILE-001.md) | `milestone-readiness` |
| EQPT | C-03 Equipment | [REQ-EQPT-001](./REQ-EQPT-001.md) | `equipment-delivery-status` |
| RISK | C-04 Risk & Issue | [REQ-RISK-001](./REQ-RISK-001.md) | `risk-issue-impact` |
| IMPCT | C-05 Impact / decision | [REQ-IMPCT-001](./REQ-IMPCT-001.md), [REQ-IMPCT-002](./REQ-IMPCT-002.md) | `management-exception-report` |
| NFR | Demo architecture **constraints** | [REQ-NFR-001](./REQ-NFR-001.md), [REQ-NFR-002](./REQ-NFR-002.md) | `demo-v1-architecture-constraints` |

Предварительные ярлыки плана подтверждены для Demo v1; объединение/добавление AREA — только с обоснованием в BA/PD.

## Правила

- Источник и certainty обязательны; AI не invent'ит GMP REQ.
- Шаблоны: [requirement-domain](../_templates/requirement-domain.md), [nfr](../_templates/nfr.md).
- Scope freeze: **BA-OQ-001** (2026-10-31). OpenSpec change активен; living specs появятся после human review / apply — не путать с «ожиданием ещё одного freeze».
