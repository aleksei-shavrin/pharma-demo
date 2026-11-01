---
name: UI Design Spec Demo v1
overview: "UI Design Spec plan COMPLETED (Iterations 0–5); UI Design pack APPROVED; Implementation NOT STARTED; BA-OQ-006 open; D12 deferred; no apps."
todos:
  - id: await-uid-approve
    content: APPROVE плана UI Design + BA-OQ-006 V1 assumption — confirmed
    status: completed
  - id: uid-iter0-overview
    content: "Iteration 0: overview DOC-UX-014 + README + plan sync"
    status: completed
  - id: uid-iter1-foundations
    content: "Iteration 1: DOC-UX-015 foundations Light/Dark tokens + contrast calc + shadcn map"
    status: completed
  - id: uid-iter2-components
    content: "Iteration 2: DOC-UX-016 screen-driven components (StatusIndicator family)"
    status: completed
  - id: uid-iter3-viz-ix
    content: "Iteration 3: DOC-UX-018 data-viz + DOC-UX-019 interactions"
    status: completed
  - id: uid-iter4-screens
    content: "Iteration 4: DOC-UX-017 eight surfaces (V1 shared columns only)"
    status: completed
  - id: uid-iter5-quality-handoff
    content: "Iteration 5: DOC-UX-020 + indexes + handoff + gates; stop без commit"
    status: completed
isProject: false
---

# UI Design / Design Specification — Demo v1

## Статус плана

| Item | Status |
|------|--------|
| **UI Design Spec plan** | **COMPLETED** (Iterations 0–5) |
| **UI Design pack** | **APPROVED** (human; decisions = `approved UI Design decision`) |
| **Implementation** | **NOT STARTED** |
| BA-OQ-006 | **open** (V1 table+Type = `assumption`) |
| D12 | **deferred** |
| VD-A / D1–D11 | not reopened |

Plan COMPLETED ≠ pack APPROVED ≠ permission to implement. Pack APPROVE ≠ Implementation start.

**Delivered:** DOC-UX-014…020 + handoff `2026-11-01-ui-design.md`; marker geometry locked to DOC-UX-018 across 011/015/016; corrective R1–R3; human pack APPROVE recorded.

---

## 1. Результат исследования

**Готовность к UI Design:** Visual Direction завершён; **VD-A** = `approved Visual Direction baseline`; D1–D11 = `approved UX decision`; shell/stack зафиксированы. UI Design Spec docs-волна **завершена** (Iter 0–5); pack **APPROVED**.

**Фактические пути:** product [`docs/03-product/`](docs/03-product/); UX/VD/UI [`docs/05-ux-ui/`](docs/05-ux-ui/); OpenSpec [`openspec/specs/`](openspec/specs/). Apps **нет**.

**Уже решено — не переоткрывать:** VD-A; D1–D11; Links = DOC-BA-015 only; Schedule = MS + EQ delivery; BR-006 honesty; KPI ≥4 or omit; Light/Dark + Snapshot A/B/C; UI Design pack DOC-UX-014…020.

**Открытое (не закрыто этой волной):** D12; BA-OQ-006/004/005/002 + HIP-*; Closed/Amber; interactive PrioritizeRecovery recording outside Must (Must DecisionPanel = read-only); shell DOM order; mock volume `hypothesis`.

---

## 2. Источники

| Область | Пути |
|---------|------|
| VD / UX | DOC-UX-001…013 |
| UI Design | DOC-UX-014…020 |
| Domain / BR | `docs/02-business-analysis/` |
| Product / mock | `docs/03-product/` |
| REQ | `docs/04-requirements/` |
| Handoff | `docs/07-delivery/handoffs/2026-11-01-ui-design.md` |

---

## 3. Ограничения

**Standing constraint (ongoing):** no apps / npm / Gantt spike / ADR / OpenSpec / Domain / mock / commit without an explicit human command. This is a continuous process rule, not a completed todo. Pack APPROVE does **not** lift this constraint for Implementation.

Hard constraints соблюдены: Domain/BR/REQ/OpenSpec/DOC-PROD-012 не менялись; apps/npm/Gantt spike/ADR не делались; BA-OQ/HIP/D12 не закрывались.

Decision vocabulary: pack UI Design = `approved UI Design decision`; residual unapproved ideas = `proposal`; V1 Issues&Risks = `assumption`; D12 = `deferred decision`.

---

## 4. Структура пакета

| Файл | ID |
|------|-----|
| `demo-v1-ui-design-overview.md` | DOC-UX-014 |
| `demo-v1-ui-foundations.md` | DOC-UX-015 |
| `demo-v1-component-specification.md` | DOC-UX-016 |
| `demo-v1-ui-screens.md` | DOC-UX-017 |
| `demo-v1-ui-data-viz.md` | DOC-UX-018 |
| `demo-v1-ui-interactions.md` | DOC-UX-019 |
| `demo-v1-ui-quality.md` | DOC-UX-020 |
| `docs/07-delivery/handoffs/2026-11-01-ui-design.md` | DOC-HANDOFF-UID-001 |

---

## 5. Итерации — все COMPLETED

0 Overview · 1 Foundations · 2 Components · 3 Viz+Interactions · 4 Screens · 5 Quality+handoff+gates · status-sync pack APPROVE.

---

## 6. Acceptance / gates

Docs gates: `npm run test:docs`; `openspec validate --specs --strict`; `git diff --check`. Apps start = separate human decision after pack APPROVE.

---

## 7. Open questions

BA-OQ-006 · D12 · interactive PrioritizeRecovery recording outside Must (Must = read-only) · shell DOM · theme/snapshot/cross-session filter persistence (MVP filter non-restore = `assumption`) · AcceptDateSlip/Closed/Amber · HIP-* · mock volume hypothesis.

---

## 8. Граница vs Implementation

UI Design markdown ≠ apps. Pack APPROVED does **not** authorize implementation without a separate explicit start.

---

## 9. Решения — confirmed

1. UI Design **plan** — COMPLETED.
2. UI Design **pack** — **APPROVED** (`approved UI Design decision`).
3. Implementation — **NOT STARTED**.
4. Next = separate human Implementation start (optional); standing constraint remains.

Commit — по отдельной просьбе.
