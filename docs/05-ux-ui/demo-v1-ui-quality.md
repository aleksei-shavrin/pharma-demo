---
id: DOC-UX-020
title: "Demo v1 UI Design — quality criteria"
type: product
status: draft
version: "0.1.0"
created: 2026-11-01
updated: 2026-11-01
owner: "docs-engineering"
related:
  - DOC-UX-014
  - DOC-UX-015
  - DOC-UX-016
  - DOC-UX-017
  - DOC-UX-018
  - DOC-UX-019
  - DOC-UX-009
  - DOC-HANDOFF-UID-001
---

# Demo v1 UI Design — quality criteria

> **certainty:** hypothesis
>
> Проверяемые критерии качества **UI Design Spec** Demo v1 (DOC-UX-014…019). Критерии пакета — **`approved UI Design decision`** (human APPROVE UI Design pack Demo v1). Frontmatter `status: draft` = lifecycle. **Не** означает WCAG audit pass или browser verification. Apps Implementation I1–I8 — **COMPLETED** (отдельный plan).

## 1. Purpose and scope

| In | Out |
|----|-----|
| Doc-level acceptance criteria for the UI Design pack | Product QA of running apps |
| Mapping criteria → source docs | Closing BA-OQ / D12 / HIP |
| Split: docs-checkable vs implementation-checkable | Claiming measured a11y compliance |

**Severity:** `blocker` (was required before pack APPROVE; still blocks impl start if regressed) · `major` (should fix before impl start) · `minor` (polish).

## 2. Criteria catalog

### 2.1 Visual consistency

| ID | Checks | How | Expected | Severity | Phase |
|----|--------|-----|----------|----------|-------|
| Q-VIS-01 | Shell regions consistent across screens | Diff DOC-UX-017 §3 vs P1–P5/Detail | Same Sidebar/TopBar/PageSurface pattern | blocker | docs |
| Q-VIS-02 | Spacing/type/radius/elevation cite DOC-UX-015 | Grep screens/components for conflicting scales | No alternate base-4 or radius stacks | major | docs |
| Q-VIS-03 | No conflicting pattern variants for same control | Audit StatusIndicator / DecisionPanel / tables | One locked geometry per status (DOC-UX-018) | blocker | docs |
| Q-VIS-04 | VD-A anti-patterns avoided in screen specs | Review Dashboard/registers wireframes | No KPI gallery hero; no Excel/SCADA tone | major | docs |
| Q-VIS-05 | Light/Dark token pairs complete | DOC-UX-015 §4–5 + contrast §8 | Dual theme tables; calculated PASS pairs | blocker | docs |
| Q-VIS-06 | Applied theme contrast in browser | Measure computed styles Light+Dark | Meet DOC-UX-015 targets | blocker | **impl** |

### 2.2 Semantic consistency

| ID | Checks | How | Expected | Severity | Phase |
|----|--------|-----|----------|----------|-------|
| Q-SEM-01 | Four status models distinct | DOC-UX-015/016/018 cross-read | Issue ≠ Risk RAG ≠ Milestone RAG ≠ Equipment delivery | blocker | docs |
| Q-SEM-02 | Marker geometry locked | Grep diamond/outline/half-filled/disc | Delayed=diamond; Open=outline; Mitigating=half-filled; RAG=disc (+ Red rail) | blocker | docs |
| Q-SEM-03 | Delivery Δ ≠ Milestone/PS Δ | DOC-UX-017 Schedule + Dashboard; DOC-UX-018 | Separate captions/fields; no shared ambiguous «Δ» alone | blocker | docs |
| Q-SEM-04 | Links ≠ Impact | DOC-UX-006/016/017/018 | Links = DOC-BA-015 only; Impact = derived; no EQ—MS | blocker | docs |
| Q-SEM-05 | Snapshot A/B/C semantics | DOC-UX-018 §3 + screen matrix | Fixture values; A calm; B problem; C decision without heal | blocker | docs |
| Q-SEM-06 | No invented Domain edges/statuses | Grep Amber/Closed Must / EQ—MS / Issue—Decision link | Absent from Must UI | blocker | docs |

### 2.3 Interaction consistency

| ID | Checks | How | Expected | Severity | Phase |
|----|--------|-----|----------|----------|-------|
| Q-IX-01 | Snapshot switch atomic | DOC-UX-019 §4 | Single coherent context; no mixed fields | blocker | docs |
| Q-IX-02 | Snapshot load error keeps previous | DOC-UX-019 §4 | Previous snapshot wholly; retry; no false success | blocker | docs |
| Q-IX-03 | Missing entity after switch | DOC-UX-019 §4 | Same detail route + EmptyState + register CTA; no auto-nav | blocker | docs |
| Q-IX-04 | DecisionPanel Must read-only | DOC-UX-016/017/019 | No write Dialog for PrioritizeRecovery in Must | blocker | docs |
| Q-IX-05 | Selection/pagination default off | DOC-UX-016/017 | Off unless confirmed scenario | major | docs |
| Q-IX-06 | Runtime Snapshot/theme/nav behavior | Manual/E2E | Matches DOC-UX-019 | blocker | **impl** |

### 2.4 Accessibility

| ID | Checks | How | Expected | Severity | Phase |
|----|--------|-----|----------|----------|-------|
| Q-A11Y-01 | Keyboard rules documented | DOC-UX-019 §12 | Skip→TopBar→Sidebar→main; links vs buttons | blocker | docs |
| Q-A11Y-02 | Focus-visible + status not color-only | DOC-UX-015/018 | Labels+markers; focus ring tokens | blocker | docs |
| Q-A11Y-03 | Contrast criteria calculated | DOC-UX-015 §7–8 | Required pairs PASS at design-time | blocker | docs |
| Q-A11Y-04 | Responsive constraints | DOC-UX-015/017 | Desktop-first; h-scroll over dropping critical cols | major | docs |
| Q-A11Y-05 | DOM order matches logical focus | Impl review | Matches §12.3 or documented deviation | major | **impl** |
| Q-A11Y-06 | Keyboard tour + live regions | Manual a11y pass | No WCAG claim without evidence | blocker | **impl** |

### 2.5 Data visualization

| ID | Checks | How | Expected | Severity | Phase |
|----|--------|-----|----------|----------|-------|
| Q-VIZ-01 | A/B/C discrete, not time series | DOC-UX-018 §6.1 | No connecting line/interpolation | blocker | docs |
| Q-VIZ-02 | Dates not magnitude bars | DOC-UX-018 §6.2 | Table or time-axis markers | blocker | docs |
| Q-VIZ-03 | Gantt read-only control points | DOC-UX-017/018 | MS+EQ only; no deps/drag; table primary | blocker | docs |
| Q-VIZ-04 | Marker mapping = DOC-UX-018 | Cross-doc | Locked shapes | blocker | docs |
| Q-VIZ-05 | Charts/Gantt in product | Visual QA | Match specs; D12 lib chosen separately | major | **impl** |

### 2.6 Content and data integrity

| ID | Checks | How | Expected | Severity | Phase |
|----|--------|-----|----------|----------|-------|
| Q-DAT-01 | A/B/C match DOC-PROD-012 | Compare dates/statuses | asOf and forecasts as fixtures | blocker | docs |
| Q-DAT-02 | BR-006 honesty on C | DOC-UX-017/018 Decision | Mitigating; Red unchanged; forecast unchanged; no recovery progress | blocker | docs |
| Q-DAT-03 | No false GMP/CSV claims | Grep pack | Absent | blocker | docs |
| Q-DAT-04 | Issues&Risks V1 shared columns | DOC-UX-017 §4.5 | No Owner column; Type/ID/Title/Status-RAG | blocker | docs |
| Q-DAT-05 | Mock/API data in apps | Integration tests | Same integrity matrix | blocker | **impl** |

## 3. Docs-checkable vs implementation-checkable

| Phase | Criterion IDs |
|-------|---------------|
| **Docs (now)** | Q-VIS-01…05; Q-SEM-01…06; Q-IX-01…05; Q-A11Y-01…04; Q-VIZ-01…04; Q-DAT-01…04 |
| **Implementation (later)** | Q-VIS-06; Q-IX-06; Q-A11Y-05…06; Q-VIZ-05; Q-DAT-05 |

## 4. Pack APPROVE gate (human)

**UI Design pack Demo v1 = APPROVED** (human, after cross-document review + R1–R3). Docs-phase **blocker** criteria were the pack gate. Implementation-phase criteria remain open until apps exist.

Pack APPROVE ≠ permission to start Implementation (`apps/`).

## 5. Related

- DOC-UX-014…019 · [demo-v1-ux-traceability.md](./demo-v1-ux-traceability.md) · handoff `docs/07-delivery/handoffs/2026-11-01-ui-design.md`
