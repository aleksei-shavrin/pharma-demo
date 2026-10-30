---
id: DOC-PHASE-DISC-001
title: "Фаза: Discovery"
type: delivery
status: draft
version: "0.1.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-DISC-README-001
  - DOC-DEL-001
  - DOC-PROD-001
---

# Фаза: Discovery

План исполнения фазы Discovery для **Pharma Project Control**. Детали методологии: файл плана в репозитории `.cursor/plans/discovery-phase.md` (вне портала docs).

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

| # | Работа | Результат | Owner |
|---|--------|-----------|-------|
| D0 | Charter и каркас | phase plan, registers, HIP, README map | docs-engineering |
| D1 | Context + Domain | product-context, domain-overview, glossary | parallel agents |
| D2 | Stakeholders + Processes | stakeholders, process-inventory | parallel agents |
| D3 | Info + Scenarios | information-concepts, management-scenarios | parallel agents |
| D4 | Boundaries + Demo candidates | product-boundaries, demo-v1-scope-candidates | docs-engineering |
| D5 | Synthesis + handoff | discovery-summary, vision links, handoff | docs-engineering |

## Quality gates

- [ ] G0 Documentation
- [ ] DG-Evidence / DG-Applicability / DG-No-Fake-GMP / DG-Trace / DG-No-OpenSpec
- [ ] DG-Docs-Tests (`npm run test:docs`)
- [ ] DG-Handoff в D5

## Риски

> **certainty:** open_question
>
> Нет решения владельца продукта по demo narrative → фаза `paused`, не `done`.

> **certainty:** assumption
>
> Отсутствие отраслевого эксперта не блокирует демо-гипотезы, но блокирует `fact` применимости к предприятию.

## Definition of Done фазы

См. критерии завершения в плане Discovery §8 (кратко):

- [ ] Context, boundaries, domain overview, glossary, information-concepts
- [ ] Stakeholders, processes (обоснованные связи)
- [ ] Registers + ≥6 scenarios
- [ ] MoSCoW candidates как предварительная приоритизация (не FR)
- [ ] Narrative выбран product owner **или** formal pause
- [ ] Summary + handoff; `openspec/**` не изменён
