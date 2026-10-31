---
id: DOC-RPT-REQOS-002
title: "Report: OpenSpec Stage 1 formalization (Demo v1 Must)"
type: delivery
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-HANDOFF-REQOS-001
  - DOC-RPT-REQOS-001
  - DOC-BA-016
---

# Report: OpenSpec Stage 1 formalization (Demo v1 Must)

Дата: **2026-10-31**. Commit не выполнялся в рамках отчёта.

## 1. OpenSpec change

| Поле | Значение |
|------|----------|
| ID | `define-demo-v1-project-control` |
| Path | `openspec/changes/define-demo-v1-project-control/` |
| Artifacts | proposal.md, design.md, tasks.md, specs/** |
| Validate | `openspec validate define-demo-v1-project-control` — **PASS** |
| Validate --strict | **PASS** |
| Status | 4/4 planning artifacts complete |
| Apply / archive | **не** выполнялись |

## 2. Delta specs

| Capability path | Роль | Источник REQ |
|-----------------|------|--------------|
| `project-status-overview` | C-01 behavior | REQ-PROJ-001 |
| `milestone-readiness` | C-02 behavior | REQ-MILE-001 |
| `equipment-delivery-status` | C-03 behavior | REQ-EQPT-001 |
| `risk-issue-impact` | C-04 behavior | REQ-RISK-001 |
| `management-exception-report` | C-05 behavior (PrioritizeRecovery primary) | REQ-IMPCT-001, REQ-IMPCT-002 |
| `demo-v1-architecture-constraints` | **Demo v1 constraints** (не product feature) | REQ-NFR-001, REQ-NFR-002 |

## 3. REQ → OpenSpec mapping

| REQ | OpenSpec |
|-----|----------|
| REQ-PROJ-001 | project-status-overview |
| REQ-MILE-001 | milestone-readiness |
| REQ-EQPT-001 | equipment-delivery-status |
| REQ-RISK-001 | risk-issue-impact |
| REQ-IMPCT-001 | management-exception-report |
| REQ-IMPCT-002 | management-exception-report |
| REQ-NFR-001 | demo-v1-architecture-constraints |
| REQ-NFR-002 | demo-v1-architecture-constraints |

## 4. Docs изменены

- `docs/02-business-analysis/traceability-matrix.md`
- `docs/03-product/demo-v1-capabilities.md` (C-01 BR + OpenSpec links)
- `docs/04-requirements/README.md`
- `docs/07-delivery/handoffs/2026-10-31-req-openspec.md`
- `docs/07-delivery/handoffs/README.md`
- `docs/07-delivery/README.md`
- `.cursor/plans/openspec-demo-v1-stage1.md` (workspace copy)

## 5. Assumptions / deferred

| Тема | Статус |
|------|--------|
| EQ Snapshot A/B/C mechanism | deferred impl; норма — воспроизводимость состояний |
| DirectorImpactAggregate имя | design-only label |
| RAG | fixture + integrity; не runtime engine |
| Phase | не Must dataset |

## 6. Open questions (не закрыты)

BA-OQ-002 / HIP-003/004/007; BA-OQ-004; BA-OQ-005; BA-OQ-006; HIP-005.

## 7. Semantic checklist

| Check | Result |
|-------|--------|
| Snapshots A/B/C values from DOC-PROD-012 | Pass |
| Issue ≠ Risk | Pass |
| Delivery ≠ production-start | Pass |
| No CPM / recovery execution / auto-reforecast / RAG engine | Pass |
| AcceptDateSlip without Must SM / post-state | Pass |
| Architecture as constraints | Pass |
| apps/** created | No |
| New ADR | No |

## 8. `npm run test:docs`

**PASS** (frontmatter, ids, certainty, portal-excludes, markdownlint, docs:build).  
Примечание: ссылки на `openspec/changes/` в portal docs заменены на backtick-paths (changes не публикуются).

## 9. Next

Human review change → apply living specs → implementation phase (отдельно). Не scaffold apps до review/apply (или явного исключения).
