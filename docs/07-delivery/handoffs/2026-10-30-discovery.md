---
id: DOC-HANDOFF-DISC-001
title: "Handoff: Discovery phase"
type: handoff
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-021
  - DOC-PHASE-DISC-001
  - DOC-PROD-001
---

# Handoff: Discovery phase

## Мета

- **От:** Discovery D0–D5 (docs-engineering)
- **Кому:** Business Analysis / Product Definition; затем OpenSpec (отдельная фаза)
- **Дата:** 2026-10-30
- **Область изменений:** `docs/01-discovery/**`, `docs/03-product/vision-and-scope.md`, `docs/07-delivery/**`, `docs/standards/documentation-standard.md`

## Цель волны

Выполнить Discovery L2: контекст, домен, роли, процессы, концепты, сценарии, границы, MoSCoW-кандидаты, summary; без apps и без OpenSpec writes.

## Сделано

- D0–D5 артефакты в `docs/01-discovery/`
- Phase plan `docs/07-delivery/discovery-phase-plan.md`
- План в `.cursor/plans/discovery-phase.md`
- Vision обновлён ссылками (certainty не повышалась)
- `type: discovery` в documentation-standard
- Evidence EV-001…010; сценарии SCN-001…008

## Не сделано / вне scope

- Ответ product owner на HIP-006 (narrative) — фаза **paused** по критерию `done`
- Expert validation применимости к предприятию
- Любые `openspec/specs` / `openspec/changes`
- Код Demo v1 / REQ-*

## Артефакты

| Путь | ID | Примечание |
|------|-----|------------|
| `docs/01-discovery/discovery-summary.md` | DOC-DISC-021 | Синтез |
| `docs/01-discovery/product-context.md` | DOC-DISC-012 | |
| `docs/01-discovery/domain-overview.md` | DOC-DISC-013 | |
| `docs/01-discovery/domain-glossary.md` | DOC-DISC-014 | |
| `docs/01-discovery/stakeholders.md` | DOC-DISC-015 | |
| `docs/01-discovery/process-inventory.md` | DOC-DISC-016 | |
| `docs/01-discovery/information-concepts.md` | DOC-DISC-017 | отдельный от domain-overview |
| `docs/01-discovery/management-scenarios.md` | DOC-DISC-018 | SCN-001…008 |
| `docs/01-discovery/product-boundaries.md` | DOC-DISC-019 | |
| `docs/01-discovery/demo-v1-scope-candidates.md` | DOC-DISC-020 | MoSCoW ≠ FR |
| `docs/01-discovery/registers.md` | DOC-DISC-010 | |
| `docs/01-discovery/human-input-pack.md` | DOC-DISC-011 | |
| `docs/03-product/vision-and-scope.md` | DOC-PROD-001 | v0.2.0 links |

## Certainty / риски

> **certainty:** open_question
>
> HIP-006 не отвечен → Discovery не `done`, статус **paused** до решения владельца продукта.

> **certainty:** assumption
>
> Рекомендация narrative SCN-001→SCN-007 и Must C-01…C-05 — рабочие гипотезы для BA, не backlog commitment.

## Блокеры

- HIP-006 (и желательно HIP-001 / HIP-008) — product owner

## Рекомендации следующей волне

1. Получить решение product owner по demo narrative (HIP-006).
2. BA / Product Definition: уточнить выбранный narrative → epics/features **без** выдуманных GMP FR.
3. **Отдельная фаза:** OpenSpec changes для 2–5 capabilities → human review → apply (не делать «заодно» с BA без review).
4. Не начинать Nest/Next scaffold до согласованного Demo v1 scope после OpenSpec/REQ минимума (или явного исключения от product owner).
5. Documentation First сохраняется.
