## Context

Accepted plan: `.cursor/plans/dashboard-management-cards-proposal.md` (Codex corrections 2026-11-09).

## Goals / Non-Goals

- Goals: three dashboard cards; minimal read-only execution observations; register dual Status dimensions; program progress parity.
- Non-Goals: CRUD execution UI; cancelled status; observations for all DEC; changing 01–19 forecast/RAG narrative; new SDD frameworks.

## Decisions

1. Execution statuses: `unknown | not_started | in_progress | completed`. Source `{ kind: 'demo', label }`.
2. DEC-001 arc: F `not_started` («Действия не начаты») → G `in_progress` («Действия начаты») → O `completed` («Действия закрыты»). I remains in_progress (I < O). Other DEC: unknown.
3. `recoveryExecuted: false` deprecated BR-006 legacy; not execution. Additive `forecastDeviation`: `within_baseline | deviation_persists`.
4. Panel state by `primaryDecision` (DEC-001) only.
5. Program progress via PortfolioService.programStatuses injection (one-way; no circular module).
6. Register columns stay 8; Status holds execution + due-state labels; Due = date only.

## Risks

- PanelState semantic change breaks tests expecting any-DEC → recorded.
- Illustrative observations must never be presented as GMP evidence.

## Card composition (2026-11-09 draft delta)

> **certainty:** assumption — dashboard-card-composition

1. Critical attention items: inset 1px border-box (not outer ring) + list gutters; preserve pair scroll contracts.
2. ChangeTile: tone bg + matching semantic 1px border tokens.
3. Decision panel: one control object «Запуск производства»; related DEC-001 group; footer CTA reachable at 768 via inner body scroll.
