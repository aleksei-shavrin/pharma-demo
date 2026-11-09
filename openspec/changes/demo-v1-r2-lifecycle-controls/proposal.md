# Proposal

## Why

Enrichment E1–E8 сделал Demo v1 убедительным на отрезке 01–08, но narrative обрывается до Production Start, а директор не видит глубины направлений, людей, стоимости и уведомлений. R2 продолжает **тот же Demo v1** (не Demo v2 / не I9), чтобы lifecycle 01–19 и project controls сделали демо похожим на крупный капитальный проект.

## What Changes

- Расширение discrete snapshots до **01–19** (19); 01–08 historical core сохраняется; **19 = Production Start** `2027-09-22` (+7 vs baseline); без post-start T.
- Углубление catalogues: ~40 milestones, ~52 equipment, ~30 issues/risks, ~18 decisions, ~15 people.
- **Workstream** как read-model entity + `/workstreams/:id` (drill-down; не обязательный top-level nav); Dashboard matrix navigable.
- **Person** `PER-*` (reference entity) + top-level **Люди** `/people`; cutover SH-*.
- **Cost Control** integer **RUB**, frozen BAC **6_200_000_000**; Project + Workstream CBS + project contingency; top-level **Стоимость** `/costs`; Dashboard cost signal; Snapshot 01 EAC=BAC VAC=0.
- **Notifications** AppBar (prefs localStorage; read/unread sessionStorage); ≤3 toasts on successful snapshot switch.
- Snapshot selector: phase-grouped scrollable listbox 01–19.
- Dashboard IA: Status / PS / Cost → exceptions → attention → WS → executive MS → trend/decisions.
- BR-004 late-stage clarification (HVAC+PS Δ always aligned; O moves both to +7).
- Integrity for lifecycle, relationships, cost arithmetic.
- **Не** Activity/CPM/EVM/PG/auth/Contractors/HRIS/fake GMP.

## Capabilities

### New Capabilities

- `workstream-control`: Workstream read-model catalog, RAG, aggregates, detail route.
- `people-directory`: Person reference entities, list/detail, responsibility projections.
- `project-cost-control`: RUB cost measures, CBS/contingency invariants, costs overview.
- `director-notifications`: Notification read-model, AppBar tray, snapshot-switch toasts, storage prefs.

### Modified Capabilities

- `project-status-overview`: 01–19 lifecycle; overall status; cost signal; snapshot-aware executive milestones; Workstream links.
- `milestone-readiness`: Expanded milestone catalogue; executive subset fixture-authored per snapshot.
- `equipment-delivery-status`: Expanded equipment scale; selective cost fields; BR-004 driver alignment through 19.
- `risk-issue-impact`: Deeper issue/risk/decision catalogues; Person owners; optional cost impact/exposure; BR-006 money honesty.
- `management-exception-report`: Exceptions/trend across 01–19; notification-adjacent highlights without SoT role.
- `demo-v1-architecture-constraints`: 01–19 ids; no PG; mock Nest; FE via API; forbidden edges preserved; no EVM/Activity engine.

## Impact

- Docs: DOC-PROD-023…026, DOC-BA-018, DOC-UX-022, Cursor plan R2.
- Later apps (not in R2-D0): `apps/api` fixtures/DTOs/services; `apps/web` routes/shell/dashboard/selector.
- OpenSpec: historical enrichment archived `2026-11-02-demo-v1-enrichment`; this change applies after human design accept.
- Out of scope now: fixture/runtime implementation (R2-C1+).
