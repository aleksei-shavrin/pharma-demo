---
id: DOC-HANDOFF-REQOS-001
title: 'Handoff: Requirements Specification и OpenSpec Stage 1'
type: handoff
status: draft
version: 0.2.1
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-HANDOFF-BAPD-001
  - DOC-RPT-REQOS-001
  - DOC-PROD-011
  - DOC-BA-010
---
# Handoff: Requirements Specification & OpenSpec Stage 1

## Мета

- **От:** Requirements Specification & OpenSpec Stage 1 (formalization → archive → post-archive docs sync)
- **Кому:** Получатель следующего этапа — **только** после отдельного явного решения о старте apps implementation (Nest/Next). Docs post-archive sync **не** является следующей задачей.
- **Дата:** 2026-10-31
- **Статус передачи:** Stage 1 **завершён**. OpenSpec change **`define-demo-v1-project-control`**: human APPROVE → sync в living `openspec/specs/` → archive; ограниченная post-archive синхронизация шести docs **завершена**; validate / `test:docs` PASS; apps **не** создавались и **не** стартуют без явного решения

## Сделано

- Stage 0 readiness audit (DOC-RPT-REQOS-001)
- OpenSpec change: proposal, design, tasks, delta specs (C-01…C-05 + architecture **constraints**)
- Docs sync (propose): traceability OpenSpec column; C-01 BR mapping; requirements README; Stage 1 report
- `openspec validate define-demo-v1-project-control` (+ `--strict`) PASS (на active change до archive)
- Human APPROVE Must C-01…C-05 + six specs + A→B→C + BR-004/006 + PrioritizeRecovery
- Sync deltas → living specs; archive → `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/`
- Commit living+archive: `7dd319c`
- Post-archive docs sync (пути living/archive) — **завершена** для шести файлов: `traceability-matrix.md`, `demo-v1-capabilities.md`, `docs/04-requirements/README.md`, этот handoff, Stage 1 report, `.cursor/plans/openspec-demo-v1-stage1.md`; `npm run test:docs` PASS

## Не сделано / блокеры

- BA-OQ-004/005/006; BA-OQ-002 / HIP-003/004/007; HIP-005 — **остаются open**
- EQ snapshot switch mechanism — deferred impl
- Apps scaffold / API / UI — **только** по отдельному явному решению (не следует автоматически из Stage 1 / archive / docs sync)

## Ключевые входы

| Артефакт | Путь |
|----------|------|
| Living OpenSpec specs | `openspec/specs/<capability>/spec.md` (C-01…C-05 + constraints) |
| Archived change | `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/` |
| Stage 0 audit | `docs/07-delivery/reports/2026-10-31-req-openspec-readiness-audit.md` |
| Stage 1 report | `docs/07-delivery/reports/2026-10-31-req-openspec-stage1.md` |
| Traceability | `docs/02-business-analysis/traceability-matrix.md` |
| BA/PD handoff | `docs/07-delivery/handoffs/2026-10-30-ba-pd.md` |

## Рекомендации

1. Опираться на living specs как SoT поведения Must; archive — история propose/review.
2. Apps implementation (Nest/Next) — **только** после отдельного явного решения; не начинать «по умолчанию» после archive.
3. Не закрывать BA-OQ/HIP «заодно» с apps scaffold.
4. AcceptDateSlip / UI layout / messaging — вне Must до отдельных решений.

## Certainty

> **certainty:** fact
>
> Formalization Stage 1 + sync/archive living specs + ограниченная post-archive docs sync выполнены; demo decisions ≠ enterprise-fact.

> **certainty:** open_question
>
> BA-OQ-004/005/006; BA-OQ-002 / HIP-003/004/007; HIP-005; EQ switch mechanism (impl).
