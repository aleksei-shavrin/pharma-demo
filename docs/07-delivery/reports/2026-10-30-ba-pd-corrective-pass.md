---
id: DOC-RPT-BAPD-001
title: 'Отчёт: corrective pass BA/PD (финальная согласованность)'
type: delivery
status: draft
version: 0.1.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-HANDOFF-BAPD-001
  - DOC-BA-017
  - DOC-PHASE-BAPD-001
---
# Report: BA/PD corrective pass (final consistency)

Дата: 2026-10-30. Corrective pass по замечаниям сквозного ревью. Коммит не выполнялся в рамках задачи.

## 1. Изменённые файлы

| Файл | Суть |
|------|------|
| `docs/02-business-analysis/process-specs-demo-v1.md` | PROC-001/005/010/007/004 alignment |
| `docs/02-business-analysis/domain-model-demo-v1.md` | Activity out; cardinality legend; Equipment.projectId |
| `docs/02-business-analysis/business-rules-demo-v1.md` | Issue statuses; BR-007 A vs B/C |
| `docs/02-business-analysis/ba-registers.md` | BA-OQ-003 closed; BA-OQ-006 UX |
| `docs/02-business-analysis/traceability-matrix.md` | PROC-001 / BR-007 sync |
| `docs/02-business-analysis/ba-pd-summary.md` | Status after pass |
| `docs/03-product/demo-v1-mock-narrative-data.md` | Remove ACT-EQ; integrity matrix |
| `docs/03-product/demo-v1-capabilities.md` | C-03 entities = Equipment only |
| `docs/03-product/demo-v1-functional-scope.md` | Out: Activity; proposed freeze explicit |
| `docs/04-requirements/REQ-IMPCT-001.md` | Aggregate AC semantics |
| `docs/07-delivery/handoffs/2026-10-30-ba-pd.md` | Handoff note |
| `docs/07-delivery/reports/2026-10-30-ba-pd-corrective-pass.md` | This report |

## 2. Исправленные замечания

1. **PROC-005:** Issue.status = Open / Mitigating / Closed; AcceptDateSlip = Decision type, не Issue status; нет авто-Closed.
2. **PROC-010:** только BR-002/003/004/006; без универсального RAG engine.
3. **PROC-001 / Domain:** Activity убрана как сущность Demo v1; даты EQ + MS/Project + BR-004.
4. **PROC-007/004:** без claim SOP, auto-reforecast, risk engine, recovery execution.
5. **REQ-IMPCT-001:** production-start dates ≠ delivery dates; BR-007 scoped A vs B/C.
6. **BA-OQ-003:** closed — Issue и Risk отдельные сущности; UX → **BA-OQ-006**.
7. **BR-007:** Snapshot A baseline integrity; B/C causal chain.
8. **Domain:** легенда кардинальности; Equipment.projectId как логический reference.

## 3. Открытые решения (не закрыты агентом)

| ID | Почему open |
|----|-------------|
| BA-OQ-001 | PO freeze — только Product Owner |
| BA-OQ-004 / BA-OQ-005 | AcceptDateSlip post-state Issue/Risk/MS |
| BA-OQ-006 | UI presentation Issue vs Risk |
| HIP-003/004/007 | Discovery / PO messaging & framing |

## 4. Quality gates

| Check | Result |
|-------|--------|
| `npm run test:docs` | **PASS** |
| No Activity entity in domain/REQ Must | Pass |
| No `Accepted-slip` as Issue status | Pass |
| No universal auto-RAG promise | Pass |
| Snapshot A/B/C + BR-007 applicability | Pass (spec) |
| REQ-IMPCT-001 aggregate semantics | Pass |
| `openspec/**` unchanged | Pass |
| `apps/**` unchanged | Pass |
| PO freeze not declared | Pass (BA-OQ-001 open) |

## 5. Подтверждения

- OpenSpec specs/changes **не** изменялись.
- Apps **не** изменялись.
- PO freeze **не** объявлен; DOC-PROD-011 остаётся **proposed freeze**.

## 6. Остаточные риски для PO

- Принять или отклонить proposed Must scope (BA-OQ-001).
- При необходимости уточнить AcceptDateSlip post-state (004/005) до OpenSpec.
- UX Issue/Risk (006) можно отложить в UX-фазу.

## Статус

**READY FOR PO FREEZE REVIEW**
