---
id: DOC-RPT-BAPD-002
title: 'Отчёт: узкий corrective pass BA/PD (3 замечания)'
type: delivery
status: draft
version: 0.1.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-HANDOFF-BAPD-001
  - DOC-RPT-BAPD-001
  - REQ-IMPCT-001
  - DOC-BA-015
  - DOC-BA-013
---
# Report: BA/PD narrow corrective pass (3 remarks)

Дата: 2026-10-31. Узкий pass по трём замечаниям. OpenSpec / apps не трогались.

## 1. Изменённые файлы

| Файл | Суть |
|------|------|
| `docs/04-requirements/REQ-IMPCT-001.md` | AC Risk/Issue → Snapshot B/C; A без ISS-001; baseline A сохранён |
| `docs/02-business-analysis/domain-model-demo-v1.md` | Issue—Risk `0..1 — 0..1` как ограничение модели Demo v1 (assumption) |
| `docs/02-business-analysis/process-specs-demo-v1.md` | PROC-007 critical driver через causal chain Issue/Risk; без Equipment—Milestone |
| `docs/07-delivery/reports/2026-10-31-ba-pd-narrow-corrective.md` | Этот отчёт |

## 2. Изменения по замечаниям

1. **REQ-IMPCT-001:** ссылки RISK-001 + ISS-001 обязательны для **B/C**; для **A** ISS-001 не требуется; baseline aggregate + BR-007 A сохранены; B/C integrity не ослаблена.
2. **Domain:** кардинальность Issue—Risk остаётся `0..1 — 0..1` с явным пояснением: Demo v1 conceptual constraint, не универсальное BR.
3. **PROC-007:** critical driver = участие Equipment в chain к Milestone **через** Issue/Risk; прямая связь Equipment—Milestone не вводится.

## 3. Согласованность (проверка)

| Источник | Результат |
|----------|-----------|
| BR-005 (условия B/C; пример ISS/RISK) | Align с REQ-IMPCT-001 B/C |
| BR-007 A vs B/C | Align; смысл BR не менялся |
| Mock narrative (нет ISS в A; ISS+RISK в B/C; matrix BR-005 B/C) | Align |
| Domain mermaid / кардинальности (нет EQ—MS) | Align с PROC-007 |
| C-01…C-05 / mock dates / snapshots | Не изменялись |

## 4. `npm run test:docs`

**PASS** (frontmatter, ids, certainty, portal-excludes, markdownlint, docs:build).

## 5. Оставшиеся блокеры (не закрыты)

| ID | Статус |
|----|--------|
| BA-OQ-001 | open — PO freeze |
| BA-OQ-004 / BA-OQ-005 | open — AcceptDateSlip post-state |
| BA-OQ-006 | open — UI Issue/Risk |
| HIP-003 / 004 / 007 | open (Discovery HIP) |

## 6. Не делалось

OpenSpec; apps/; UX/implementation phase; изменение BR-001…007 смысла; mock snapshots/дат; scope C-01…C-05.
