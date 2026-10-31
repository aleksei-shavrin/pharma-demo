---
id: DOC-HANDOFF-REQOS-001
title: "Handoff: Requirements Specification & OpenSpec Stage 1"
type: handoff
status: draft
version: "0.2.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-HANDOFF-BAPD-001
  - DOC-RPT-REQOS-001
  - DOC-PROD-011
  - DOC-BA-010
---

# Handoff: Requirements Specification & OpenSpec Stage 1

## Мета

- **От:** Requirements Specification & OpenSpec Stage 1 (formalization → archive)
- **Кому:** Следующая волна (docs sync после archive / затем apps implementation по явному старту)
- **Дата:** 2026-10-31
- **Статус передачи:** Stage 1 **завершён**. OpenSpec change **`define-demo-v1-project-control`**: human APPROVE → sync в living `openspec/specs/` → archive; validate / `test:docs` PASS; apps **не** создавались

## Сделано

- Stage 0 readiness audit (DOC-RPT-REQOS-001)
- OpenSpec change: proposal, design, tasks, delta specs (C-01…C-05 + architecture **constraints**)
- Docs sync (propose): traceability OpenSpec column; C-01 BR mapping; requirements README; Stage 1 report
- `openspec validate define-demo-v1-project-control` (+ `--strict`) PASS (на active change до archive)
- Human APPROVE Must C-01…C-05 + six specs + A→B→C + BR-004/006 + PrioritizeRecovery
- Sync deltas → living specs; archive → `openspec/changes/archive/2026-10-31-define-demo-v1-project-control/`
- Commit living+archive: `7dd319c` (docs path sync после archive — отдельный шаг)

## Не сделано / блокеры

- BA-OQ-004/005/006; BA-OQ-002 / HIP-003/004/007; HIP-005 — **остаются open**
- EQ snapshot switch mechanism — deferred impl
- Apps scaffold / API / UI
- Полная актуализация всех docs-ссылок на archive (эта волна — ограниченный набор файлов)

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
2. Не начинать Nest/Next без явного старта implementation phase.
3. Не закрывать BA-OQ/HIP «заодно» с docs sync или apps scaffold.
4. AcceptDateSlip / UI layout / messaging — вне Must до отдельных решений.

## Certainty

> **certainty:** fact
>
> Formalization Stage 1 + sync/archive living specs выполнены; demo decisions ≠ enterprise-fact.

> **certainty:** open_question
>
> BA-OQ-004/005/006; BA-OQ-002 / HIP-003/004/007; HIP-005; EQ switch mechanism (impl).
