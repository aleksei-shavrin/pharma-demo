---
id: DOC-RPT-REQOS-002
title: "Report: OpenSpec Stage 1 formalization (Demo v1 Must)"
type: delivery
status: draft
version: "0.2.1"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-HANDOFF-REQOS-001
  - DOC-RPT-REQOS-001
  - DOC-BA-016
---

# Report: OpenSpec Stage 1 formalization (Demo v1 Must)

Дата: **2026-10-31**. Stage 1 propose/validate завершены; позже в тот же день — human APPROVE → sync living specs → archive → ограниченная post-archive docs sync (см. §10).

## 1. OpenSpec change (на момент formalization)

| Поле | Значение |
|------|----------|
| ID | `define-demo-v1-project-control` |
| Active path (исторический) | `openspec/changes/define-demo-v1-project-control/` — **снят** после archive |
| Archive path | `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/` |
| Artifacts | proposal.md, design.md, tasks.md, specs/** |
| Validate (до archive) | `openspec validate define-demo-v1-project-control` — **PASS** |
| Validate --strict (до archive) | **PASS** |
| Status (до archive) | 4/4 planning artifacts complete; tasks 14/14 |
| Sync / archive | **выполнено** 2026-10-31 (living specs + archive move); commit `7dd319c` |

## 2. Specs (delta → living)

| Capability path | Роль | Источник REQ | Living |
|-----------------|------|---------------|--------|
| `project-status-overview` | C-01 behavior | REQ-PROJ-001 | `openspec/specs/project-status-overview/spec.md` |
| `milestone-readiness` | C-02 behavior | REQ-MILE-001 | `openspec/specs/milestone-readiness/spec.md` |
| `equipment-delivery-status` | C-03 behavior | REQ-EQPT-001 | `openspec/specs/equipment-delivery-status/spec.md` |
| `risk-issue-impact` | C-04 behavior | REQ-RISK-001 | `openspec/specs/risk-issue-impact/spec.md` |
| `management-exception-report` | C-05 behavior (PrioritizeRecovery primary) | REQ-IMPCT-001, REQ-IMPCT-002 | `openspec/specs/management-exception-report/spec.md` |
| `demo-v1-architecture-constraints` | **Demo v1 constraints** (не product feature) | REQ-NFR-001, REQ-NFR-002 | `openspec/specs/demo-v1-architecture-constraints/spec.md` |

## 3. REQ → OpenSpec mapping

| REQ | OpenSpec living |
|-----|-----------------|
| REQ-PROJ-001 | `openspec/specs/project-status-overview/spec.md` |
| REQ-MILE-001 | `openspec/specs/milestone-readiness/spec.md` |
| REQ-EQPT-001 | `openspec/specs/equipment-delivery-status/spec.md` |
| REQ-RISK-001 | `openspec/specs/risk-issue-impact/spec.md` |
| REQ-IMPCT-001 | `openspec/specs/management-exception-report/spec.md` |
| REQ-IMPCT-002 | `openspec/specs/management-exception-report/spec.md` |
| REQ-NFR-001 | `openspec/specs/demo-v1-architecture-constraints/spec.md` |
| REQ-NFR-002 | `openspec/specs/demo-v1-architecture-constraints/spec.md` |

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

## 9. Next (на момент formalization; обновлено)

~~Human review change → apply living specs~~ — **сделано** (APPROVE → sync → archive).  
~~Ограниченная docs-синхронизация путей после archive~~ — **сделано** (шесть документов; см. §10).  
Apps implementation / Nest/Next — **только** по отдельному явному решению. Не закрывать BA-OQ/HIP «заодно».

## 10. Archive / living sync (post-Stage 1)

| Поле | Значение |
|------|----------|
| Human APPROVE | Must C-01…C-05; six specs; A→B→C; BR-004/006; PrioritizeRecovery semantics |
| Left open | AcceptDateSlip post-state; UI layout; messaging; BA-OQ/HIP open set |
| Living validate | `openspec validate --specs --strict` — 6/6 PASS |
| `npm run test:docs` (после living sync) | PASS |
| Git (living + archive) | `7dd319c` Sync approved Demo v1 OpenSpec deltas into living specs and archive the change |
| Content policy | Текст утверждённых требований/specs не менялся (только формат living + whitespace lint) |

### Post-archive docs sync

Ограниченная актуализация путей living/archive — **завершена** (не является следующей задачей).

| Документ | Роль sync |
|----------|-----------|
| `docs/02-business-analysis/traceability-matrix.md` | OpenSpec column → living paths; archive note |
| `docs/03-product/demo-v1-capabilities.md` | C-01…C-05 + NFR → living; archive history |
| `docs/04-requirements/README.md` | Living vs `changes/`/`archive/` |
| `docs/07-delivery/handoffs/2026-10-31-req-openspec.md` | Stage 1 + archive + docs sync complete |
| `docs/07-delivery/reports/2026-10-31-req-openspec-stage1.md` | Этот отчёт (§10) |
| `.cursor/plans/openspec-demo-v1-stage1.md` | Status Stage 1 completed; living/archive paths |

| Проверка | Результат |
|----------|-----------|
| `npm run test:docs` (после post-archive docs sync) | **PASS** |
| Git после docs sync (по инструкции волны) | изменения **оставлены unstaged** (без commit/push в рамках sync-волны) |
| Living specs / REQ / BR / mock / OQ/HIP | не менялись |
| Apps / ADR | не создавались |
