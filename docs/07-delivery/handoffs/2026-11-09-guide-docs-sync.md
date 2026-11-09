---
id: DOC-HO-2026-11-09-GUIDE-DOCS-SYNC
title: 'Handoff: актуализация DOC-GUIDE-001 и active docs'
type: handoff
status: draft
version: '1.1.0'
created: '2026-11-09'
updated: '2026-11-09'
owner: docs-engineering
related:
  - DOC-DEL-RPT-2026-11-09-GUIDE-DOCS-SYNC
---

# Handoff — GUIDE + active docs sync

## Контекст

Пользователь: сценарий демонстрации отстал от реализации; сначала [DOC-GUIDE-001](../../guides/how-to/demo-v1-live-presentation.md), затем остальная active документация. Apps/API не менялись. Transient evidence: `/tmp/pharma-guide-docs-sync/`.

## Что сделано

1. Переписан GUIDE v0.3.0 по живому DX `:3080` (admin/admin): ordinals **01–19** ↔ A–S, Дашборд, карточка «Прогноз и решение», PS +21/+14, календарь controls, 189 вех / фильтр 12.
2. Синхронизированы rehearsal, walkthrough E01–E03 (current vs historical 2026-11-06), enrichment spine PRT-01, portal DX URLs, shell «Решения», R2 superseded presentation note, dashboard tooltip.
3. Durable audit: [2026-11-09-guide-docs-sync-audit.md](../reports/2026-11-09-guide-docs-sync-audit.md). Plan: `.cursor/plans/guide-docs-sync.md`.
4. Review-fix Codex: EAC `MetricAbbrTip` подтверждён; OQ cost tips закрыт; Портфель01/PRT — intentional.

## Проверки

Portal GUIDE + walkthrough/R2 labels; docs gates — см. отчёт и `/tmp/.../gates-summary.txt`.

## Ограничения

- `status: draft`; UI-сверка ≠ domain fact / ≠ approved.
- E02 открыт.
- BA/REQ/architecture — только spot coverage (см. отчёт).
