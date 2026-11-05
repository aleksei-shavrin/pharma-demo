---
id: DOC-RPT-BAPD-003
title: 'Отчёт: финальный consistency pass BA/PD (cross-review)'
type: delivery
status: draft
version: 0.1.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-HANDOFF-BAPD-001
  - DOC-RPT-BAPD-002
  - REQ-RISK-001
  - REQ-MILE-001
  - REQ-IMPCT-002
  - REQ-NFR-002
  - DOC-PROD-012
---
# Report: BA/PD final consistency pass (cross-review)

Дата: 2026-10-31. Узкая корректировка по независимому cross-review. Commit / push / branch не выполнялись.

## 1. Изменённые файлы

| Файл | Суть |
|------|------|
| `docs/04-requirements/REQ-RISK-001.md` | AC-R: связи RISK-001 для A/B/C; fixture ≠ risk engine |
| `docs/03-product/demo-v1-mock-narrative-data.md` | Snapshot C: Mitigating без «recovery initiated» |
| `docs/04-requirements/REQ-MILE-001.md` | AC: MS-PS ↔ RISK-001 на B/C |
| `docs/04-requirements/REQ-IMPCT-002.md` | PrioritizeRecovery → Mitigating = запись Decision, не execution |
| `docs/04-requirements/REQ-NFR-002.md` | Adapter swap сохраняет domain/HTTP API/FE; port ≠ auto-гарантия |
| `docs/07-delivery/reports/2026-10-31-ba-pd-final-consistency-pass.md` | Этот отчёт |

## 2. Исправленные замечания

1. **REQ-RISK-001 AC-R:** A — EQ+MS, без open delay Issue; B — ISS+EQ+MS; C — те же связи + Mitigating; RAG/integrity BR-002 сохранены.
2. **DOC-PROD-012:** `Mitigating (Decision PrioritizeRecovery recorded; recovery execution is not modeled)`.
3. **REQ-MILE-001:** явная связь MS-PS с RISK-001 на B/C; без новых RAG engines.
4. **REQ-IMPCT-002:** Mitigating = управленческая запись Decision, не подтверждение recovery.
5. **REQ-NFR-002:** целевая замена mock→PostgreSQL adapter без ломки domain/HTTP API/FE; port alone не гарантирует совместимость; PostgreSQL вне Demo v1.

## 3. Semantic consistency review

| Источник | Результат |
|----------|-----------|
| `business-rules-demo-v1.md` (BR-002/003/006 Mitigating / no execution) | Align; BR текст **не** менялся |
| `domain-model-demo-v1.md` (Risk↔Issue/EQ/MS; Decision ≠ execution) | Align; Domain/cardinality **не** менялись |
| `process-specs-demo-v1.md` (PROC-005 Mitigating; no recovery exec) | Align |
| `demo-v1-mock-narrative-data.md` links A/B/C | Align с новыми AC-R / MILE |
| Walkthrough / BR-006 формулировки Mitigating | Уже без «execution»; «recovery initiated» убрано из mock |
| Traceability matrix | Обновление **не** требуется (те же REQ↔C↔BR рёбра) |

**Конфликтов** с утверждённым содержанием не обнаружено; правки уточняют AC/формулировки в рамках существующей модели.

## 4. `npm run test:docs`

**PASS** (frontmatter, ids, certainty, portal-excludes, markdownlint, docs:build).

## 5. OpenSpec / apps

- `openspec/**` — не изменялись (`git status` без изменений в openspec).
- `apps/**` — отсутствует / не создавался.

## 6. Не делалось

Изменение дат/статусов/состава Snapshot A/B/C; BR-001…007; Domain Model; scope C-01…C-05 / proposed freeze; закрытие BA-OQ/HIP; UX/implementation.

## 7. Оставшиеся открытые вопросы

| ID | Статус |
|----|--------|
| BA-OQ-001 | open — PO freeze |
| BA-OQ-004 / BA-OQ-005 | open — AcceptDateSlip post-state |
| BA-OQ-006 | open — UI Issue/Risk |
| HIP-003 / 004 / 007 | open |
