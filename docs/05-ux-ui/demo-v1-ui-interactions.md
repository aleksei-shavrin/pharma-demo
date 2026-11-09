---
id: DOC-UX-019
title: Demo v1 UI Design — взаимодействия
type: product
status: draft
version: 0.1.2
created: '2026-11-01'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-014
  - DOC-UX-015
  - DOC-UX-016
  - DOC-UX-018
  - DOC-UX-002
  - DOC-UX-003
  - DOC-UX-006
  - DOC-UX-005
---
# Demo v1 UI Design — interactions

> **certainty:** hypothesis
>
> Поведение UI Demo v1 (навигация, Snapshot, theme, tables, detail, keyboard). UI Design решения пакета — **`approved UI Design decision`** (human APPROVE UI Design pack Demo v1). Frontmatter `status: draft` = lifecycle. **Не** apps. Не закрывает BA-OQ / HIP / D12. Не меняет Domain / BR / REQ / OpenSpec / mock. Согласовано с DOC-UX-016 (DecisionPanel Must = read-only; selection/pagination off by default).

## 1. Purpose and scope

| In scope | Out of scope |
|----------|--------------|
| Interaction + feedback + keyboard for Demo surfaces | Screen layout grids (DOC-UX-017) |
| Global vs local UI state rules | Persistence backend design |
| Accessibility **requirements** for impl | WCAG audit / pass claim |
| Align with DOC-UX-018 viz story | Changing fixture values |

**Note vs DOC-UX-003 M-DEC:** UX journey mentions recording PrioritizeRecovery. **UI Design Must path (DOC-UX-016 review):** DecisionPanel is **read-only**; Snapshot 03 shows fixture DEC-001. Interactive write via Dialog is **not** Must Demo v1. Do not imply the user can execute a management action in Must UI.

## 2. Global vs local state (`approved UI Design decision`)

| Kind | Examples | Behavior |
|------|----------|----------|
| **Global** | Snapshot 01/02/03; theme Light\|Dark; current route | Shared across shell; Snapshot change refreshes all data-bound widgets |
| **Local page** | Table sort/filter/search; detail tab; Schedule Table\|Gantt\|Split view | Scoped to page; **MVP assumption:** not restored on breadcrumb return (DOC-UX-002/006) |
| **Session-scoped (Snapshot)** | Last successfully committed Snapshot 01/02/03 | Restored within the same browser tab/session after F5/reload (see §4); not URL; not cross-session |
| **Not specified** | Cross-session persistence of filters/theme | Do not invent; theme remains ephemeral unless later decided |

When Snapshot changes: reload data for current route; **reset or revalidate** local filters that reference statuses absent in new snapshot (`approved UI Design decision`: clear incompatible filters; keep sort key if column still exists).

## 3. Primary navigation and Sidebar (`approved UI Design decision`)

| Action | Behavior |
|--------|----------|
| Activate SidebarNavItem | Navigate via link (`a`); Tab focus; **Enter** activates; **not** Space (DOC-UX-016) |
| Active route | `aria-current="page"`; accent rail |
| Collapse (≥1280 expanded; 1024–1279 icon rail) | Labels → tooltip; accessible name retained |
| Focus order | See §12 (Skip link + shell order) |

## 4. SnapshotSelector 01/02/03 (`approved UI Design decision`)

| Step | Behavior |
|------|----------|
| Choose 01/02/03 | Segmented/radiogroup in App Bar; keyboard arrows within group |
| Feedback | Selected segment visually + accessible name; optional brief busy indicator while data loads |
| Consistency | **Single** snapshot context for Dashboard, registers, detail, charts, Gantt — no mixed fields |
| Loading | Page/widgets show LoadingState/skeleton; block partial stale paint from previous snapshot |
| Error | Keep the **previous successfully loaded snapshot entirely**; do **not** apply the new snapshot partially. Show a clear switch-error message + **Retry**. Current page remains usable on the previous snapshot. Error must **not** look like the new snapshot succeeded. |
| Current page | Stay on same route; refresh entity if still present. If entity **missing** in the newly selected snapshot: remain on the Entity Detail route; show EmptyState explaining absence in that snapshot; provide an **explicit** control to open the related register; **no automatic** navigation. |
| Local UI | Reconcile filters as §2; do not invent cross-snapshot cache merge |
| Reload / same tab | Last **successfully committed** snapshot is restored from **session-scoped** browser storage (same tab/session). Fresh/independent session defaults to **01**. URL query persistence is **not** used. Cross-session / cross-device persistence is **out of scope**. |
| First paint after reload | Until the first successful dashboard commit, UI must **not** present a default **01** as the settled selected snapshot when restore target is 02/03 (short initializing/loading is allowed). |

Announce change politely (live region) at implementation — requirement, not tested claim.

> **certainty:** fact
>
> Session-scoped Snapshot restore (same browser tab/session; write only after successful atomic commit; invalid stored value → 01) is the Demo presentation-hardening contract. It does **not** add shareable deep links or cross-session preferences.

## 5. ThemeToggle (`approved UI Design decision`)

| Action | Behavior |
|--------|----------|
| Toggle Light/Dark | Applies to shell + Page Surface + tables/charts (DOC-UX-002) |
| Control | Button/switch; Enter/Space OK (button, not link) |
| Charts/status | Must remain readable (DOC-UX-015/018); no glow-only Dark affordances |

## 6. DataTable interactions (`approved UI Design decision`)

Aligned with DOC-UX-016 §5.3:

| Feature | Demo v1 default |
|---------|-----------------|
| Sort | Allowed on confirmed columns; announce sort state |
| Filter / search | Allowlisted facets only; clear action |
| Row navigation | Open detail via row link/action (keyboard reachable) |
| Inline edit | **Forbidden** for Domain fields in Must path |
| Selection / checkboxes / bulk | **Off by default**; add only with confirmed scenario |
| Pagination | **Off by default**; add only with confirmed scenario |
| Empty / loading / error | EmptyState / LoadingState / ErrorState (DOC-UX-016) |
| Horizontal scroll | Preferred over hiding critical date/status/Δ columns |

BA-OQ-006 **closed**: Issues&Risks single table + Type (DOC-BA-010).

## 7. Schedule Table / Gantt (`approved UI Design decision`)

| Action | Behavior |
|--------|----------|
| View toggle | Table \| Split \| Gantt (DOC-UX-005); Table remains primary |
| Sync | If both visible, optional shared focused/hovered row cue — **without** requiring selection mode |
| Open detail | From table row (preferred) or equivalent control on Gantt row |
| Gantt | Read-only; no drag-reschedule; no dependency editing (DOC-UX-018) |
| A11y | Keyboard users complete tasks via **table**; Gantt is supplementary |

D12 library choice: **resolved** — [ADR-0004](../06-architecture/decisions/0004-d12-dhtmlx-gantt-community.md) (`dhtmlx-gantt` Community MIT).

## 8. Entity Detail tabs (`approved UI Design decision`)

| Tab | Interaction |
|-----|-------------|
| Overview | Attributes only |
| Links | RelationshipList of direct edges; EntityLink navigation |
| Impact | ImpactCallout / derived; not RelationshipList |
| Keyboard | Standard tabs: Tab to tablist, arrows between tabs, Tab into panel |
| Empty Links | Valid EmptyState when snapshot has no edge |

EntityDetailHeader + StatusIndicator family-correct (DOC-UX-016).

## 9. EntityLink and cross-detail (`approved UI Design decision`)

| Action | Behavior |
|--------|----------|
| Activate link | Navigate to target detail; breadcrumbs update (Section / id) |
| Derived targets | Must be labeled derived/indirect — not plain Links chips |
| Back | Breadcrumb or browser back to section; **MVP:** filters not restored (`assumption`) |

## 10. Dashboard interactions (`approved UI Design decision`)

| Element | Behavior |
|---------|----------|
| Exceptions preview / summaries | Navigate to P4 or entity detail |
| Causal node | Navigate only along **direct** edges or labeled derived paths |
| Δ strip / KPI | Optional drill to Schedule / Milestones / Equipment if justified; else static |
| DecisionPanel | **Read-only** Must; Snapshot 01 empty, B context, C DEC-001 (DOC-UX-016/018) |
| Chart | Tooltip/legend; not sole critical info |

## 11. Dialog (`approved UI Design decision`)

| Rule | Detail |
|------|--------|
| Role | Generic confirm primitive for **future** justified scenarios |
| Must path | **Not** used to record PrioritizeRecovery |
| Decision | Shown via DecisionPanel from fixtures on 03 |
| If used later | Honesty copy required; no false success / RAG upgrade chrome |

## 12. Keyboard, focus, accessibility requirements (`approved UI Design decision`)

Practical requirements for implementation (not an audit result):

1. All interactive controls keyboard reachable; visible `:focus-visible` (DOC-UX-015).
2. **Skip link** is the first focusable control; activating it moves focus to `main` (Page Surface content), bypassing chrome.
3. **Logical shell focus order (`approved UI Design decision`):** Skip link → **Top Application Bar** (breadcrumbs, SnapshotSelector, ThemeToggle, project context) → **Sidebar** nav → **Page Surface** (`main`). Rationale: global Snapshot/Theme stay reachable without tabbing through all five nav items first (DOC-UX-002 regions).
4. Tab order must follow **DOM order**. Do not invent a visual-only order that fights the DOM (no `tabindex` gymnastics / `aria-flowto` as primary fix).
5. On Snapshot switch / tab change / route change: move focus to a sensible target (e.g. `h1` or `main`); avoid focus loss to `body` without recovery. After Snapshot switch with missing entity EmptyState, focus the EmptyState heading or primary “back to register” control.
6. Links (`a`) vs buttons: navigation = links; actions = buttons (ThemeToggle = button).
7. Accessible names on icon-only controls (Theme, collapsed nav).
8. Status never color-only; StatusIndicator text/marker required.
9. Loading/error: polite announcements; errors not only red color; Snapshot switch errors must not imply success.
10. Tooltip / chart hover not the only source of critical values — table or visible text available.
11. Gantt not the only Schedule access path.
12. Do **not** claim WCAG compliance from this document alone.

> **certainty:** open_question
>
> Exact HTML/DOM source order of Sidebar vs TopAppBar is **not** mandated in DOC-UX-002. Implementation must pick one DOM order that matches the logical order in §12.3 (or document a justified deviation). This is an implementation constraint, not a Domain change.

## 13. Constraints and open questions

| Item | Handling |
|------|----------|
| Filter persistence on breadcrumb / local return | MVP non-restore = `assumption` (§2, §9) |
| Cross-session filter persistence | unspecified (`open_question`) — distinct from MVP non-restore |
| Theme persistence across sessions | unspecified (`open_question`) |
| Snapshot persistence across reload (same tab/session) | **session-scoped restore** of last successfully committed 01/02/03 (§2, §4) — not URL; fresh session → 01 |
| Snapshot persistence across sessions / devices | unspecified (`open_question`) — out of Demo presentation-hardening scope |
| Interactive Decision write / M-DEC outside Must | `open_question` (Must path = read-only DecisionPanel; Snapshot 03 = fixture DEC-001; not a Must write flow) |
| Selection/pagination | Off unless scenario confirmed |
| Shell DOM order Sidebar vs TopBar | open_question / impl constraint (§12) |
| BA-OQ-006 | **closed** — single register + Type (DOC-BA-010) |
| D12 | **RESOLVED** (ADR-0004, I7) |
| AcceptDateSlip journey | not Must |

## 14. Related documents

- [demo-v1-ui-data-viz.md](./demo-v1-ui-data-viz.md) (DOC-UX-018)
- [demo-v1-component-specification.md](./demo-v1-component-specification.md) (DOC-UX-016)
- [demo-v1-ui-foundations.md](./demo-v1-ui-foundations.md) · [demo-v1-shell-navigation.md](./demo-v1-shell-navigation.md) · [demo-v1-entity-detail.md](./demo-v1-entity-detail.md) · [demo-v1-schedule-workspace.md](./demo-v1-schedule-workspace.md)
- Plan: `.cursor/plans/ui-design-spec-demo-v1.md`
