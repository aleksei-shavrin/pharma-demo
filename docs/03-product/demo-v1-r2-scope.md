---
id: DOC-PROD-023
title: "Demo v1 R2 — scope and acceptance boundaries"
type: product
status: draft
version: "0.1.1"
created: 2026-11-02
updated: 2026-11-02
owner: "docs-engineering"
related:
  - DOC-PROD-020
  - DOC-PROD-021
  - DOC-PROD-022
  - DOC-PROD-024
  - DOC-PROD-025
  - DOC-PROD-026
  - DOC-BA-018
  - DOC-UX-022
  - DOC-BA-014
  - DOC-BA-015
---

# Demo v1 R2 — scope and acceptance boundaries

> **certainty:** fact
>
> R2 продолжает **тот же Demo v1** после E1–E8 / local tags `demo-v1.0.0` и `demo-v1-enrichment-baseline`. Это **не** Demo v2 и **не** I9. Исторические DOC-PROD-019…022 и enrichment остаются baseline narrative A–H.

## 1. Goal

Сделать Demo v1 убедительным крупным проектом строительства / оснащения фармацевтического предприятия для директора:

- полный lifecycle snapshots **A–S** до **Production Start**;
- глубина Milestones / Equipment / Issues / Risks / Decisions;
- Workstream как **read-model entity**;
- People (`PER-*`);
- Cost Control **только в RUB**;
- Notifications;
- scalable Snapshot Selector;
- executive Dashboard с cost signal.

## 2. Frozen product decisions (human, 2026-11-02)

| Decision | Value |
|----------|-------|
| Snapshots | **A–S** (19); A–H historical core unchanged without proven blocker |
| Final | **S = Production Start achieved**; no post-start T |
| Baseline PS | `2027-09-15` |
| Final actual PS | `2027-09-22` (**+7** calendar days) |
| PS driver | Still sole **EQ-HVAC-01 / RISK-001** path (BR-004); no new driver |
| Workstream | Read-model entity; not Domain Aggregate |
| Person | Reference entity `PER-*`; not HRIS; SH→PER cutover |
| Money | Integer **RUB**; no EUR/USD director-facing |
| Contingency | **Project-level** reserve inside BAC (not 9th Workstream; unused ≠ automatic +VAC) |
| Demo BAC | **6_200_000_000 ₽** frozen (fictional; R2-D0-R1) |
| Equipment cost | Selective subset; **not** Σ EQ = WS budget |
| Nav | Top-level **Люди** + **Стоимость**; Workstream via drill-down (not required top-level) |
| Late RAG | P=Red, Q=Yellow, R=Yellow, S=Green (BR-007 preserved via fixtures) |
| Notification prefs | popup → **localStorage**; read/unread → **sessionStorage** |
| EVM | **Out** (no PV/EV/CPI/SPI without WBS/time-phased prerequisites) |

## 3. In scope

- Normative design (this pack) → later implementation stages R2-C1…R2-A1
- OpenSpec change `demo-v1-r2-lifecycle-controls`
- Routes (design): `/workstreams/:id`, `/people`, `/people/:id`, `/costs`
- Dashboard IA delta; A–S selector; AppBar notifications
- Integrity rules for lifecycle, BA-015 extensions, cost arithmetic

## 4. Out of scope

Demo v2; I9; PostgreSQL; auth; multi-project; Activity/WBS/CPM/dependency engine; Contractors; invoices/payments/GL; HRIS/payroll; fake GMP/CSV claims; full EVM; inventing compliance.

## 5. Relationship to enrichment (E1–E8)

| Artifact | Role after R2-D0 |
|----------|------------------|
| DOC-PROD-019…022, DOC-UX-021 | Historical enrichment SoT for A–H / pre-R2 scale |
| `openspec/changes/archive/2026-11-02-demo-v1-enrichment` | Archived enrichment change (synced to living specs) |
| Living `openspec/specs/*` | Baseline = enrichment contracts; R2 adds new change deltas |
| Tags `demo-v1.0.0`, `demo-v1-enrichment-baseline` | Git checkpoints only |

## 6. Acceptance boundaries (design)

R2-D0 is **accepted as design** when human review confirms:

1. Lifecycle A–S matrix and BR-004 late-stage clarification.
2. Cost model + **frozen** fictional BAC/CBS 6.2B (research limitations documented; BAC not re-opened).
3. Workstream / Person / Notification / Selector UX norms; nav People+Costs top-level.
4. OpenSpec R2 change package complete for later apply.
5. No apps/fixtures implemented in R2-D0.

## 7. Related

- Lifecycle: [demo-v1-r2-lifecycle-matrix.md](./demo-v1-r2-lifecycle-matrix.md) (DOC-PROD-024)
- Blueprint: [demo-v1-r2-data-blueprint.md](./demo-v1-r2-data-blueprint.md) (DOC-PROD-025)
- Cost: [demo-v1-r2-cost-control.md](./demo-v1-r2-cost-control.md) (DOC-PROD-026)
- BA: [demo-v1-r2-domain-and-controls.md](../02-business-analysis/demo-v1-r2-domain-and-controls.md) (DOC-BA-018)
- UX: [demo-v1-r2-ux-delta.md](../05-ux-ui/demo-v1-r2-ux-delta.md) (DOC-UX-022)
- Plan: `.cursor/plans/demo-v1-r2-lifecycle-controls.md`
