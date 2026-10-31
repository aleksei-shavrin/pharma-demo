# Proposal

## Why

Demo v1 нужен согласованный, проверяемый контракт поведения для narrative **SCN-001 → SCN-007** (задержка critical equipment → угроза production start → управленческое решение директора), чтобы следующая фаза разработки опиралась на OpenSpec, а не только на BA/REQ-прозу. Scope freeze (**BA-OQ-001**, 2026-10-31) и Stage 0 readiness audit подтвердили готовность Must-пакета к формализации; living specs пока пусты.

## What Changes

- Введение **первых** OpenSpec capabilities для согласованного Must Demo v1 (C-01…C-05) и нормативных **ограничений** архитектуры Demo v1 (NFR).
- Формализация поведения Snapshots **A → B → C** (`PrioritizeRecovery`): даты, RAG fixture/integrity, Issue≠Risk, impact aggregate, Decision без recovery execution и без auto-reforecast.
- Явное **out of scope** для AcceptDateSlip post-state (BA-OQ-004/005), UI layout (BA-OQ-006), messaging/framing (BA-OQ-002 / HIP-003/004/007), CPM, GMP/CSV claims, PostgreSQL, apps scaffold.
- Синхронизация docs: traceability → OpenSpec, C-01 BR mapping, requirements index, handoff / Stage 1 report.

**BREAKING:** нет (living specs отсутствуют; изменение — добавление delta, не ломка существующих specs).

## Capabilities

### New Capabilities

- `project-status-overview`: данные одного Demo v1 Project (baseline/forecast production start) для обзора narrative.
- `milestone-readiness`: ключевая веха MS-PS (dates, rag, связь с Risk) без runtime RAG engine.
- `equipment-delivery-status`: critical equipment delivery status и согласованный Δ=+21 к production-start dates (BR-004); воспроизводимость Snapshot A/B/C.
- `risk-issue-impact`: отдельные Issue и Risk, linked к Equipment/Milestone; capability регистрации Issue vs fixture NC-001; Mitigating после PrioritizeRecovery.
- `management-exception-report`: director impact aggregate и запись Decision; основной workflow C-05 — **PrioritizeRecovery**.
- `demo-v1-architecture-constraints`: **не** пользовательская product capability; нормативные **ограничения** Demo v1 (FE только через HTTP API; mock persistence port; PostgreSQL вне Demo v1).

### Modified Capabilities

- (нет — living specs пусты)

## Impact

- `openspec/changes/define-demo-v1-project-control/` — proposal, design, tasks, delta specs.
- Docs sync: traceability, capabilities C-01 mapping, `docs/04-requirements/README.md`, delivery handoff/report.
- Код `apps/**`, API implementation, UI, Docker app images, новые ADR — **не** входят в этот change (спецификация только).
- Источники поведения: REQ-* , BR-001…007, DOC-PROD-011/012, DOC-BA-015, Stage 0 audit; demo assumptions ≠ enterprise-fact.
