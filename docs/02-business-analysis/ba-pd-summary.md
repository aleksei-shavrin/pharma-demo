---
id: DOC-BA-017
title: "BA & Product Definition summary"
type: business
status: draft
version: "0.7.0"
created: 2026-10-30
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-PHASE-BAPD-001
  - DOC-BA-016
  - DOC-PROD-011
  - DOC-BA-010
  - DOC-HANDOFF-DISC-001
  - DOC-HANDOFF-BAPD-001
---

# BA & Product Definition summary

Синтез фазы BA/PD для Demo v1 narrative **SCN-001 → SCN-007**.

## Статус фазы

> **certainty:** fact
>
> **BA-OQ-001 закрыт 2026-10-31** — согласован freeze функционального объёма Demo v1 ([ba-registers](./ba-registers.md), [demo-v1-functional-scope](../03-product/demo-v1-functional-scope.md)). `openspec/**` / `apps/**` не изменялись в рамках фиксации решения.

> **certainty:** fact
>
> **BA-OQ-006 закрыт 2026-11-01** — единый Issues & Risks register + колонка `Тип`; Domain Issue/Risk остаются раздельными ([ba-registers](./ba-registers.md) § «Решение BA-OQ-006»).

> **certainty:** fact
>
> **BA-OQ-004/005 закрыты 2026-11-01** для Demo enrichment path — AcceptDateSlip post-state = fixture-authored ([ba-registers](./ba-registers.md) § «Решение BA-OQ-004/005»).

> **certainty:** open_question
>
> Остаются открытыми: **BA-OQ-002** / HIP-003/004/007. Scope-freeze критерий — **снят**.

## Что зафиксировано

| Тема | Итог |
|------|------|
| Scope freeze | Must C-01…C-05; SCN-001→007; mock A/B/C; +21 дн. EQ delay |
| Аудитория | Директор (primary); руководитель проекта (secondary) |
| PrioritizeRecovery / AcceptDateSlip | Decision record; recovery / auto-reforecast out; AcceptDateSlip post-state **fixture-authored** (BA-OQ-004/005 **closed** for Demo path) |
| Issue.status | Open / Mitigating / Closed; AcceptDateSlip = Decision type |
| Activity | **Не** сущность Demo v1 |
| BR-007 | State-based: RISK-001 Red ⇒ MS-PS not Green; A = baseline integrity |
| BR-004 | Sole PS driver EQ-HVAC-01 (enrichment R1) |
| Issue vs Risk | Отдельные сущности (BA-OQ-003 closed); UI — единый register + `Тип` (BA-OQ-006 **closed**) |
| Aggregate | Delivery dates ≠ production-start dates |

## Кандидатные OpenSpec capability names

> **certainty:** hypothesis
>
> `project-status-overview`, `milestone-readiness`, `equipment-delivery-status`, `risk-issue-impact`, `management-exception-report` — **не** созданы.

## Остаток для человека

- HIP-003, HIP-004, HIP-007 (через BA-OQ-002)

## Следующая фаза

**Requirements Specification & OpenSpec** — scope freeze снят; прочие open questions остаются blockers по смыслу, но не отменяют согласованный Must-объём.
