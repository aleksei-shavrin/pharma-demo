---
id: REQ-RISK-001
title: "REQ-RISK-001: Issue and risk linked to milestone"
type: requirement
status: draft
version: "0.3.0"
created: 2026-10-30
updated: 2026-10-30
owner: "docs-engineering"
related:
  - DOC-PROD-010
  - DOC-BA-014
---

# REQ-RISK-001: Issue and risk linked to milestone

## Формулировка

Система shall поддерживать Issue и Risk, связанные с critical equipment и вехой MS-PS. В компактной модели Demo v1 оба объекта входят в один REQ; AC ниже **независимы**.

## Обоснование

> **certainty:** hypothesis
>
> C-04; PROC-004/005; BR-001, BR-002; NC-001; SCN-001.

## Acceptance criteria

**Issue (AC-I)**

- [ ] Система позволяет зарегистрировать Issue с links на Equipment и Milestone (BR-001 / C-04).
- [ ] Snapshot A: нет Open Issue по EQ-HVAC-01.
- [ ] Snapshot B: ISS-001 существует (NC-001), status Open, linked to EQ-HVAC-01 и MS-PS.
- [ ] Snapshot C (**PrioritizeRecovery**): ISS-001 status **Mitigating** (смысл: Decision записан; execution не моделируется).
- [ ] Для **AcceptDateSlip**: Issue.status после решения **не** фиксируется этим REQ (**BA-OQ-004**); не требуется авто-Closed.

**Risk (AC-R)**

- [ ] Snapshot A: RISK-001 rag Green как **baseline fixture** (не следствие BR-002).
- [ ] Snapshot B: RISK-001 rag fixture = Red и проходит integrity vs expected BR-002 (Issue Open).
- [ ] Snapshot C PrioritizeRecovery: RISK-001 fixture Red; integrity vs BR-002 (Issue Mitigating).
- [ ] Для AcceptDateSlip: Risk.rag после решения — **BA-OQ-005**, если Issue уже не Open/Mitigating.

## Трассировка

- Capability: C-04
- BR: BR-001, BR-002
- Walkthrough: steps 1, 3–4, 7–8
