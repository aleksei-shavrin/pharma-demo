# Design

## Context

См. `proposal.md` — Why. Living specs пусты; поведение берётся из согласованных docs (BA-OQ-001 freeze, REQ-*, BR-001…007, DOC-PROD-012 snapshots, DOC-BA-015 domain, DOC-PROD-003/004). Этот change — **спецификация**, не реализация apps.

### Mock snapshot identity (DOC-PROD-012)

| Snapshot | scenarioAsOfDate | Роль |
|----------|------------------|------|
| A | 2027-02-15 | метаданные / temporal identity mock snapshot; integrity chronology A asOf before B, B before or equal C |
| B | 2027-03-01 | то же |
| C | 2027-03-02 | то же; dueDate Decision сверяется относительно asOf C в REQ-IMPCT-002 |

Эти даты — **утверждённые mock metadata** из DOC-PROD-012, не поля доменных сущностей Project/Milestone/Equipment. Не оформляются как отдельные capability Requirements «expose scenarioAsOfDate»; значения не менять.

## Goals / Non-Goals

**Goals:**

- Зафиксировать нормативное поведение Must Demo v1 (C-01…C-05) и архитектурные **ограничения** Demo v1 как OpenSpec deltas.
- Обеспечить трассируемость REQ → OpenSpec capability → scenarios Snapshots A/B/C (PrioritizeRecovery).
- Явно отложить implementation details, не влияющие на утверждённые AC.

**Non-Goals:**

- Scaffold / код `apps/web`, `apps/api`.
- Выбор ORM, auth, monorepo layout, конкретной БД (требуют ADR).
- AcceptDateSlip state machine; UI layout Issue/Risk; GMP/CSV claims.
- Выбор механизма переключения Snapshot A/B/C.
- Условия и переходы Issue.status → **Closed** (не согласованы в источниках; Closed certainty = open_question в BR status table). Must path использует Open и Mitigating.

## Decisions

### D1 — Один change, шесть delta capabilities

**Выбор:** один change `define-demo-v1-project-control` с capability dirs, соответствующими C-01…C-05 плюс `demo-v1-architecture-constraints`.

**Почему:** совпадает с Stage 0 recommendation и DOC-PROD-010 кандидатами; NFR вынесены отдельно, чтобы не смешивать product behavior и Demo v1 constraints.

**Альтернативы:** один monolithic spec — хуже границы ownership; несколько changes — избыточно до living baseline.

### D2 — Architecture constraints ≠ product feature

**Выбор:** `demo-v1-architecture-constraints` описывает **ограничения** Demo v1 (FE→HTTP, mock port, no PG), а не пользовательскую функцию продукта.

**Почему:** явная директива Stage 1 review; REQ-NFR-001/002 — architecture/maintainability.

### D3 — Primary C-05 workflow = PrioritizeRecovery

**Выбор:** Must scenarios и demo path A→B→C только для PrioritizeRecovery. AcceptDateSlip — известный тип Decision + boundary (forecast unchanged; post-state out).

**Почему:** BA-OQ-004/005 open; Stage 0 / plan.

### D4 — EQ / snapshot transition mechanism deferred

**Выбор:** нормативно требуется **воспроизводимость** утверждённых Snapshot A/B/C. Механизм (UI switch, seed load, write API и т.п.) **не выбирается** в OpenSpec.

**Почему:** plan clarification #1; не превращать два варианта в обязательную реализацию.

**Open (deferred impl):** конкретный механизм будет определён в implementation phase без изменения snapshot values.

### D5 — Aggregate contract name (design-only)

**Выбор:** логическое имя контракта `DirectorImpactAggregate` для полей REQ-IMPCT-001; HTTP path/OpenAPI shapes — later implementation.

**Почему:** Stage 0 gap; не меняет смысл AC.

### D6 — Fixture RAG + integrity, не runtime engine

**Выбор:** Risk/Milestone rag в mock — fixture; integrity vs BR-002/003 на уровне спецификации. BR-002 expectation Red при Issue.status ∈ {Open, **Mitigating**} (DOC-BA-014) — Snapshot C Red при Mitigating согласован с источником.

**Почему:** BR и REQ явно запрещают универсальный risk/RAG engine в Must.

### D8 — Issue Closed вне Must ADDED Requirements

**Выбор:** не держать отдельный ADDED Requirement «Closed transitions not specified»; граница — Non-Goals / Purpose `risk-issue-impact`.

**Почему:** отсутствие правила не должно оформляться как отдельное функциональное SHALL NOT; условия Closed не согласованы (не выдумывать).

### D7 — Logical runtime shape (reference only)

```text
Next.js FE --REST/OpenAPI--> NestJS API --> persistence port --> mock adapter (Demo v1)
```

Не выбираем PostgreSQL adapter, auth, Docker app images в этом change.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Spec drift vs mock dates | Scenarios цитируют DOC-PROD-012; не изобретать значения |
| AcceptDateSlip accidental SM | Explicit out requirements; BA-OQ-004/005 remain open |
| NFR mistaken for feature | Purpose + proposal wording: constraints only |
| EQ write-path ambiguity treated as product fork | Deferred in design; stop if Must behavior becomes ambiguous |
| Premature apps work | tasks.md — только formalization/docs/QA |

## Migration Plan

Не применимо к runtime deploy. После human review: `openspec apply` / archive → living `openspec/specs/` (отдельная волна). Rollback = не apply / не archive.

## Open Questions

- **BA-OQ-004 / BA-OQ-005** — post-state после AcceptDateSlip (open; не закрывать).
- **BA-OQ-006** — UI Issue/Risk (open; вне specs).
- **BA-OQ-002 / HIP-003/004/007** — messaging/horizon/framing (open).
- **HIP-005** — enterprise applicability (open).
- **Deferred impl:** механизм воспроизведения/переключения Snapshot A/B/C (не блокирует specs при сохранении утверждённых состояний).
