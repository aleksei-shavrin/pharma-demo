---
id: DOC-UX-003
title: Demo v1 — экраны и потоки
type: product
status: draft
version: 0.2.0
created: '2026-10-31'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-001
  - DOC-PROD-013
  - DOC-PROD-012
---
# Demo v1 screens and flows

> **certainty:** hypothesis
>
> Screen inventory (P1–P5, detail) — `approved UX decision` (D1/D2/D4/D7/D9). Бизнес-ожидания A/B/C — из walkthrough и living OpenSpec.

## 1. Screen inventory

### Страницы навигации (approved UX decision)

Колонка Capabilities — трассировка к living OpenSpec C-01…C-05 (утверждённая Must-классификация capabilities **не** меняется этим inventory). P1–P5 — IA Demo v1 (`approved UX decision`), не переименование Must.

| ID | Screen | Audience | Capabilities |
|----|--------|----------|--------------|
| P1 | Dashboard | Director primary; PM secondary | C-01 + C-05 aggregate |
| P2 | Schedule | Both | Control points MS + EQ (D10–D11) |
| P3 | Equipment | Both | C-03 |
| P4 | Issues & Risks | Both | C-04; BA-OQ-006 closed (single register + Type) |
| P5 | Milestones | Both | C-02 |

### Detail / modal

| ID | Surface | Notes |
|----|---------|-------|
| D-EQ | Equipment detail | Full Page + Tabs |
| D-ISS | Issue detail | Full Page + Tabs |
| D-RSK | Risk detail | Full Page + Tabs |
| D-MS | Milestone detail | Full Page + Tabs |
| M-DEC | Record PrioritizeRecovery | Modal/dialog; управленческая Decision, не execution (D6); AcceptDateSlip не Must journey |

## 2. Flow A → B → C (обязательный narrative)

Опора: [demo-v1-acceptance-walkthrough](../03-product/demo-v1-acceptance-walkthrough.md), DOC-PROD-012, living specs.

| Step | Snapshot | Пользователь видит (UX) | Данные (requirement source) |
|------|----------|-------------------------|------------------------------|
| 0 | — | Открывает Dashboard | Shell entry (D1) |
| 1 | **A** | PS = baseline 2027-09-15; MS Green; EQ OnTrack; нет Open delay Issue | REQ-PROJ/MILE/EQPT/RISK; walkthrough §1 |
| 2 | **B** | EQ Delayed +21d; ISS Open; RISK/MS Red; PS/MS forecast 2027-10-06 | BR-004; NC-001; walkthrough §2–6 |
| 3 | B | Drill по **прямым** Domain links (EQ↔ISS, EQ↔RISK, ISS↔RISK, ISS↔MS, RISK↔MS); порядок кликов может совпасть с narrative, но не равен схеме рёбер | DOC-BA-015; **нет** прямой Equipment—Milestone; PS — не ребро Links |
| 4 | B→**C** | Record PrioritizeRecovery (M-DEC) | REQ-IMPCT-002 |
| 5 | **C** | Issue Mitigating; DEC-001; **forecast и RAG Risk/MS без улучшения** | BR-006; OpenSpec Snapshot C |

**Явно не показывать как «график восстановлен»:** Green MS/Risk, откат PS, progress bar recovery execution.

## 3. PM paths

Те же экраны: Equipment / Issues & Risks / Milestones / Schedule для сканирования реестров; Dashboard для сводки директору. Отдельного PM app нет (D7).

> **certainty:** open_question
>
> Живая регистрация Issue (BR-001 capability) vs только fixture NC-001 в UI — отдельное решение; не блокирует inventory.
