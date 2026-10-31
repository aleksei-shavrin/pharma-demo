---
id: DOC-UX-008
title: "Demo v1 mock data UX requirements"
type: product
status: draft
version: "0.1.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-001
  - DOC-PROD-012
  - DOC-BA-015
  - DOC-BA-010
---

# Demo v1 mock data UX requirements

> **certainty:** hypothesis
>
> Объёмы ниже — **hypothesis** для enterprise-плотности UI. **Этот документ не изменяет** [DOC-PROD-012](../03-product/demo-v1-mock-narrative-data.md). Расширение mock — отдельный human APPROVE / отдельная волна.

## 1. Current vs target

| | Сейчас (DOC-PROD-012) | Hypothesis для плотности UI |
|--|----------------------|------------------------------|
| Scale | Narrative-minimal (~1 EQ, 1 MS, 1 Issue, 1 Risk, 1 Decision) | См. таблицу §2 |
| Purpose | A→B→C integrity | Ambient realism вокруг той же narrative spine |

## 2. Volume hypothesis

| Набор | Диапазон |
|-------|----------|
| Equipment | 40–60 |
| Milestones | 15–20 |
| Issues | 15–30 |
| Risks | 15–25 |
| Decisions | 3–6 |
| Schedule rows | ≈ 55–80 (= MS + EQ) |

Не отраслевой норматив. Достаточно для sort/filter/pagination и агрегатов без фейкового WBS.

**Narrative spine (обязательна при любом расширении):** EQ-HVAC-01 → ISS-001 → RISK-001 → MS-PS → DEC-001 — **сюжетный порядок** storytelling. Это **не** список прямых Domain edges и **не** шаблон causal viz / Links tab. Прямые связи — только DOC-BA-015 (см. dashboard / entity-detail).

## 3. Integrity rules (при будущем расширении)

1. Одна популяция A/B/C; стабильные идентификаторы.
2. Связи только по Domain Model cardinality (DOC-BA-015); **нет** прямой Equipment—Milestone; без новых FK ради UI.
3. Dashboard counters = реестры.
4. baseline/forecast/variance математически согласованы; BR-004 на narrative driver.
5. PrioritizeRecovery не улучшает Risk/MS/PS forecast (BR-006).
6. Не создавать links только для заполнения виджетов.

## 4. Status / RAG allowlist

| Допустимо | Не использовать без отдельного решения |
|-----------|----------------------------------------|
| Equipment: OnTrack, Delayed | — |
| Issue: Open, Mitigating | **Closed** (Domain value exists; Must transitions / AcceptDateSlip — OQ) |
| Risk/MS rag: Green (A fixture), Red (B/C) | **Amber** (вне Must path) |

AcceptDateSlip post-state — BA-OQ-004/005; не проектировать Must screens C'.
