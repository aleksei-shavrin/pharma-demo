---
id: DOC-PHASE-DISC-001
title: "Фаза: Discovery"
type: delivery
status: draft
version: "0.2.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-README-001
  - DOC-DEL-001
  - DOC-PROD-001
  - DOC-HANDOFF-DISC-001
---

# Фаза: Discovery

План исполнения фазы Discovery для **Pharma Project Control**. Детали методологии: файл плана в репозитории `.cursor/plans/discovery-phase.md` (вне портала docs).

**Статус фазы:** **completed** (2026-10-30). Handoff: [`2026-10-30-discovery.md`](./handoffs/2026-10-30-discovery.md).

## Цель фазы

От идеи продукта — к документированной модели контекста, ролей, процессов, концептов, проблем и управленческих сценариев; предварительные кандидаты Demo v1; handoff в Business Analysis / Product Definition.

## Входы

- `AGENTS.md` (корень репозитория), стандарты документации, G0.
- Product seed: [`vision-and-scope.md`](../03-product/vision-and-scope.md), [`demo-v1-architecture.md`](../03-product/demo-v1-architecture.md).
- ADR-0001…0003 (не дублировать; ссылаться).
- Handoff W3 → product discovery.

## Вне scope

- Код Next.js / NestJS / PostgreSQL.
- Любые изменения `openspec/specs/` и `openspec/changes/`.
- Утверждённые FR/GMP без источника; `status: approved` силами AI.

## Работы (D0–D5)

| # | Работа | Результат | Owner | Статус |
|---|--------|-----------|-------|--------|
| D0 | Charter и каркас | phase plan, registers, HIP, README map | docs-engineering | done |
| D1 | Context + Domain | product-context, domain-overview, glossary | parallel agents | done |
| D2 | Stakeholders + Processes | stakeholders, process-inventory | parallel agents | done |
| D3 | Info + Scenarios | information-concepts, management-scenarios | parallel agents | done |
| D4 | Boundaries + Demo candidates | product-boundaries, demo-v1-scope-candidates | docs-engineering | done |
| D5 | Synthesis + handoff | discovery-summary, vision links, handoff + PO decisions | docs-engineering | done |

## Quality gates

- [x] G0 Documentation (frontmatter / ids / portal excludes — проверено `npm run test:docs`)
- [x] DG-Evidence / DG-Applicability / DG-No-Fake-GMP / DG-Trace / DG-No-OpenSpec (артефакты + git; OpenSpec без изменений в Discovery)
- [x] DG-Docs-Tests (`npm run test:docs` при закрытии фазы)
- [x] DG-Handoff в D5 ([`2026-10-30-discovery.md`](./handoffs/2026-10-30-discovery.md), статус **completed**)

## Риски

> **certainty:** fact
>
> Решение владельца продукта по demo narrative получено (HIP-006: SCN-001→SCN-007); фаза **completed**, не paused.

> **certainty:** assumption
>
> Отсутствие отраслевого эксперта не блокирует демо-гипотезы, но блокирует `fact` применимости к предприятию (HIP-005 и связанные OQ остаются open).

## Definition of Done фазы

См. критерии завершения в плане Discovery §8 (кратко):

- [x] Context, boundaries, domain overview, glossary, information-concepts
- [x] Stakeholders, processes (обоснованные связи)
- [x] Registers + ≥6 scenarios
- [x] MoSCoW candidates как предварительная приоритизация (не FR)
- [x] Narrative выбран product owner (HIP-006; SCN-006 optional)
- [x] Summary + handoff; `openspec/**` не изменён
