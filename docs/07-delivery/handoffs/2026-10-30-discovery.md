---
id: DOC-HANDOFF-DISC-001
title: 'Handoff: фаза Discovery'
type: handoff
status: draft
version: 0.2.0
created: '2026-10-30'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-DISC-021
  - DOC-DISC-011
  - DOC-PHASE-DISC-001
  - DOC-PROD-001
---
# Handoff: Discovery phase

## Мета

- **От:** Discovery D0–D5 (docs-engineering)
- **Кому:** **Business Analysis & Product Definition**; затем OpenSpec (отдельная фаза)
- **Дата:** 2026-10-30
- **Статус передачи фазы:** **completed** (ранее paused до HIP-006)
- **Область изменений:** `docs/01-discovery/**`, `docs/03-product/vision-and-scope.md`, `docs/07-delivery/**`, `docs/standards/documentation-standard.md`

## Цель волны

Выполнить Discovery L2: контекст, домен, роли, процессы, концепты, сценарии, границы, MoSCoW-кандидаты, summary; зафиксировать решения Product Owner; без apps и без OpenSpec writes.

## Сделано

- D0–D5 артефакты в `docs/01-discovery/`
- Phase plan `docs/07-delivery/discovery-phase-plan.md`
- План в `.cursor/plans/discovery-phase.md`
- Vision обновлён ссылками и направлением PO (certainty enterprise не повышалась)
- `type: discovery` в documentation-standard
- Evidence EV-001…010; сценарии SCN-001…008
- **PO decisions:** HIP-001, HIP-006, HIP-008 answered ([human-input-pack](../../01-discovery/human-input-pack.md))

## Утверждённое направление демо (PO)

> **certainty:** fact
>
> Решение Product Owner (не enterprise-process confirmation).

| Тема | Решение |
|------|---------|
| Primary audience | Директор фармацевтического предприятия |
| Secondary | PM / Project Controls; UX-приоритет — директор; PM — операционный пользователь контура |
| Value lead | H-002 ведущая; H-003 supporting (обе остаются `hypothesis` о ценности) |
| Primary narrative | **SCN-001 → SCN-007** (единая история) |
| Optional | SCN-006 без расширения Demo v1 ради сцены |

## Не сделано / вне scope

- Expert validation применимости к предприятию (HIP-005 и связанные OQ)
- Ответы HIP-002, HIP-003, HIP-004, HIP-007, HIP-009
- Любые `openspec/specs` / `openspec/changes`
- Код Demo v1 / REQ-* / BA artifacts

## Артефакты

| Путь | ID | Примечание |
|------|-----|------------|
| `docs/01-discovery/discovery-summary.md` | DOC-DISC-021 | Синтез + PO decisions |
| `docs/01-discovery/human-input-pack.md` | DOC-DISC-011 | HIP-001/006/008 answered |
| `docs/01-discovery/registers.md` | DOC-DISC-010 | OQ-001/015 closed; H-002/H-003 po_selected* |
| `docs/01-discovery/management-scenarios.md` | DOC-DISC-018 | SCN-001…008 |
| `docs/01-discovery/demo-v1-scope-candidates.md` | DOC-DISC-020 | MoSCoW ≠ FR |
| `docs/03-product/vision-and-scope.md` | DOC-PROD-001 | v0.3.0 |

## Certainty / риски (остаток)

> **certainty:** open_question
>
> Применимость процессов/ролей к заказчику (HIP-005, OQ-005…011 и др.) — open; выбор demo narrative **не** закрывает их.

> **certainty:** assumption
>
> Must C-01…C-05 и MoSCoW — предварительные кандидаты для BA, **не** backlog commitment / FR.

> **certainty:** open_question
>
> HIP-003 (GMP messaging), HIP-004 (горизонт), HIP-007 (platform vs MVP) — open для Product Definition.

## Блокеры следующей фазы

- **Нет блокеров Discovery Gate** для старта планирования BA.
- Для углубления BA желательны (не обязательны для старта плана): HIP-003, HIP-004, HIP-007; expert (HIP-002/005) — только если нужны enterprise-`fact`.

## Рекомендации следующей волне

1. **Business Analysis & Product Definition** по SCN-001→SCN-007 и audience директора / PM supporting.
2. Не расширять Demo v1 scope ради SCN-006.
3. **Отдельная фаза:** OpenSpec changes для 2–5 capabilities → human review → apply.
4. Не начинать Nest/Next scaffold до согласованного Demo v1 scope после OpenSpec/REQ минимума (или явного исключения от product owner).
5. Documentation First; не выдумывать GMP FR.
