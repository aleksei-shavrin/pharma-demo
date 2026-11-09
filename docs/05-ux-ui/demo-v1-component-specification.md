---
id: DOC-UX-016
title: Demo v1 UI Design — спецификация компонентов
type: product
status: draft
version: 0.1.2
created: '2026-11-01'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-014
  - DOC-UX-015
  - DOC-UX-007
  - DOC-UX-002
  - DOC-UX-006
  - DOC-UX-004
  - DOC-UX-005
  - DOC-UX-010
  - DOC-UX-018
  - DOC-BA-015
---
# Demo v1 UI Design — component specification

> **certainty:** hypothesis
>
> Компонентная спецификация Demo v1 поверх **VD-A** и Foundations (DOC-UX-015). UI Design решения пакета — **`approved UI Design decision`** (human APPROVE UI Design pack Demo v1). Frontmatter `status: draft` = lifecycle. **Не** apps / CSS / Storybook / npm. Не переоткрывает VD-A / D1–D11. Не закрывает BA-OQ / HIP / D12. Не меняет Domain / BR / REQ / OpenSpec.

## 1. Purpose and status

| Item | Status |
|------|--------|
| Scope | Screen-driven component inventory for Demo v1 shell, registers, detail, Dashboard patterns |
| New decisions | **`approved UI Design decision`** |
| Stack intent | shadcn/ui + TanStack Table + Recharts (`approved UX decision`); Gantt lib = **RESOLVED** (ADR-0004, I7) |
| Foundations | Tokens / contrast / density from DOC-UX-015 (`approved UI Design decision`) |
| Detailed viz | Chart series / Gantt look → DOC-UX-018 (boundaries only here) |
| Interactions depth | Flows → DOC-UX-019; screens → DOC-UX-017 |

**Not a universal design system.** Only components justified by Demo v1 surfaces.

## 2. Inventory → screens

| Component | Primary screens | Notes |
|-----------|-----------------|-------|
| AppShell / SidebarNavItem / TopAppBar / Breadcrumbs / PageSurface | All | D2/D7/D9 |
| SnapshotSelector / ThemeToggle / PageHeader | All | App Bar |
| StatusIndicator / StatusBadge | Registers, Detail, Dashboard | Four semantic models |
| MetricTile / KpiGroup | Dashboard, Detail (conditional) | ≥4 or omit |
| DataTable + TableToolbar + FilterControl | Schedule, Equipment, Issues&Risks, Milestones | TanStack |
| EmptyState / LoadingState / ErrorState | All data surfaces | |
| AsOfMeta / SnapshotEcho | Dashboard, headers | |
| VarianceDelta | Dashboard Δ strip, tables, KPI | delivery ≠ PS labels |
| EntityLink | Links tab, exceptions, tables | Direct Domain only when “link” |
| ProjectSummary / EquipmentDeliverySummary / IssueSummary / RiskSummary / MilestoneSummary / DecisionSummary | Dashboard, Detail, previews | Composed cards/rows |
| EntityDetailHeader / DetailTabs | Entity Detail | Overview \| Links \| Impact |
| RelationshipList | Links tab | Direct edges only |
| ImpactCallout | Impact tab, Decision honesty | Derived |
| DecisionPanel | Dashboard, Detail Impact | BR-006 |
| GanttSurface / ChartContainer / ChartLegend / ChartTooltip | Schedule, Dashboard | Boundaries; detail → DOC-UX-018 |
| Button / IconButton / Input / Select / Segmented / Dialog / Tabs / Panel | Cross-cutting | shadcn primitives; thin notes |

---

## 3. Cross-cutting rules (`approved UI Design decision`)

1. **Status multi-channel** — label + color + marker/context; never color alone (DOC-UX-015 §3.3/§6).
2. **Four semantic models** — Equipment delivery · Issue status · Risk RAG · Milestone RAG; shared low-level tokens OK; aliases + context required.
3. **Equipment Delayed ≠ Risk/Milestone Red** — different marker geometry (**diamond** vs filled disc + optional rail; DOC-UX-018).
4. **Risk vs Milestone RAG** — same Green/Red geometry; distinguish via entity context + label + placement.
5. **Mitigating ≠ recovery done** — BR-006; no green wash / RAG upgrade after PrioritizeRecovery.
6. **No Amber / Closed Must chrome** — Closed UI unspecified until decided.
7. **Links ≠ Impact** — Links = DOC-BA-015 direct edges only; Impact = derived (BR-004/006, aggregates). No EQ—MS edge; no Issue—Decision / Risk—Decision / Equipment—Decision edges.
8. **KPI group** — show ≥4 justified metrics or omit group (`approved UX decision`).
9. **BA-OQ-006** — **closed**; Issues & Risks **single table + Type** = Demo v1 decision (DOC-BA-010).
10. **No inline edit** of Domain fields in Demo v1 registers unless a Must journey requires it (none for Must path here).
11. **Accessibility** — visible focus, keyboard, accessible names, contrast from DOC-UX-015; **no WCAG audit claim**.

---

## 4. Group A — Application shell

### 4.1 AppShell

| Field | Spec |
|-------|------|
| Purpose | Frame for Sidebar + Top App Bar + Page Surface; one shell Director+PM (D7). |
| Anatomy | `sidebar` · `topBar` · `pageSurface` on `canvas`. |
| Variants | Expanded sidebar (≥1280); collapsed icon rail (1024–1279). |
| Sizes | Sidebar 240 / 64; TopBar 52; gutters per DOC-UX-015. |
| States | default; sidebar collapsed. |
| Content rules | Brand quiet; no role skins. |
| Interaction / keyboard | Skip-to-content target = Page Surface; sidebar items Tab/Enter. |
| Responsive | Desktop-first; drawer nav &lt;1024 best-effort. |
| Accessibility | Landmark regions (`nav`, `banner`, `main`). |
| Data / semantic | N/A beyond route + Snapshot scope. |
| Sources | DOC-UX-002, DOC-UX-012, D2/D7/D9. |

### 4.2 SidebarNavItem

| Field | Spec |
|-------|------|
| Purpose | Five primary IA entries (Dashboard, Schedule, Equipment, Issues & Risks, Milestones). |
| Anatomy | Optional icon · label · active rail (`primary`). |
| Variants | default · active · collapsed (icon + tooltip). |
| Sizes | Height ≈ `control-h-md`–`lg`; rail 3px. |
| States | default · hover · active · focus-visible. |
| Content rules | Labels fixed EN UI as in DOC-UX-002; order fixed. |
| Interaction / keyboard | Semantic element = link (`a`). Tab focuses; **Enter** activates navigation. Do **not** use Space as link activation. |
| Responsive | Icon-only when collapsed. |
| Accessibility | Accessible name = label (tooltip when collapsed). Active route: `aria-current="page"`. |
| Data / semantic | Route only; no status chrome on nav items. |
| Sources | DOC-UX-002 D9. |

### 4.3 TopAppBar

| Field | Spec |
|-------|------|
| Purpose | Global chrome: breadcrumbs, Snapshot 01/02/03, theme, project context. |
| Anatomy | `breadcrumbs` · `spacer` · `snapshotSelector` · `themeToggle` · `projectChip` (PRJ id/name). |
| Variants | With/without deep breadcrumb trail. |
| Sizes | Height 52px. |
| States | default; busy when snapshot switching (optional). |
| Content rules | Snapshot control visually primary vs theme. |
| Interaction / keyboard | Tab order left→right; no modal by default. |
| Responsive | Snapshot remains reachable; may wrap meta. |
| Accessibility | Group labels for Snapshot and Theme. |
| Data / semantic | Current snapshot id 01/02/03; theme light\|dark. |
| Sources | DOC-UX-002. |

### 4.4 Breadcrumbs

| Field | Spec |
|-------|------|
| Purpose | Orientation + return path (Section / EntityId). |
| Anatomy | Crumb links · separators · current page (non-link). |
| Variants | Section only; Section + Entity. |
| Sizes | `meta` / `label` type. |
| States | default; focus on links. |
| Content rules | MVP return **without** restoring filters (`assumption`). |
| Interaction / keyboard | Links activatable; current not focusable as link. |
| Responsive | Truncate middle crumbs with overflow menu if needed. |
| Accessibility | `nav` with aria-label “Breadcrumb”. |
| Data / semantic | Section maps to sidebar item; entity id from Domain. |
| Sources | DOC-UX-002, DOC-UX-006. |

### 4.5 PageSurface

| Field | Spec |
|-------|------|
| Purpose | Elevated work plate (depth 1) hosting page header + main content. |
| Anatomy | Padding · optional header slot · main slot. |
| Variants | Full-bleed content; split (Dashboard story + rail). |
| Sizes | radius-lg; padding page-gutter. |
| States | default. |
| Content rules | One primary hierarchy; avoid boxing every widget equally. |
| Interaction / keyboard | N/A (container). |
| Responsive | Gutters 24→16. |
| Accessibility | `main` landmark. |
| Data / semantic | N/A. |
| Sources | DOC-UX-002, DOC-UX-015 depth. |

### 4.6 SnapshotSelector

| Field | Spec |
|-------|------|
| Purpose | Global switch Snapshot 01 / 02 / 03; updates all widgets consistently. |
| Anatomy | Segmented control or toggle group: A · B · C (+ optional short hint). |
| Variants | Compact (App Bar); echo read-only on Dashboard header. |
| Sizes | `control-h-md`. |
| States | selected · hover · focus-visible · disabled (if loading). |
| Content rules | Labels 01/02/03; do not invent snapshot names. Visible loading line under the trigger is **not** shown (avoids TopAppBar shift); status may be `sr-only` + `aria-live` / `aria-busy` on the trigger. Error + retry stay visible. |
| Interaction / keyboard | Arrow keys within group; selection updates data scope. |
| Responsive | Always visible in App Bar on target desktop. |
| Accessibility | Trigger `aria-busy` while loading; polite live status may be screen-reader-only; announce selected. |
| Data / semantic | Must load coherent fixture set; no partial mixed snapshots. |
| Sources | DOC-UX-002; DOC-PROD-012 (read-only). |

### 4.7 ThemeToggle

| Field | Spec |
|-------|------|
| Purpose | Light / Dark for entire shell + charts/tables. |
| Anatomy | IconButton or switch with clear mode label. |
| Variants | Icon-only + accessible name. |
| Sizes | `control-h-md`. |
| States | light · dark · focus-visible. |
| Content rules | Secondary to Snapshot visually. |
| Interaction / keyboard | Toggle on Enter/Space. |
| Responsive | Remains in App Bar. |
| Accessibility | Name reflects next or current mode (“Switch to dark”). |
| Data / semantic | Theme preference only. |
| Sources | DOC-UX-002, DOC-UX-015. |

### 4.8 PageHeader

| Field | Spec |
|-------|------|
| Purpose | Page title + optional AsOf / Snapshot echo + actions. |
| Anatomy | `title` · `meta` · optional `actions`. |
| Variants | Register; Dashboard (project name); Detail (delegates to EntityDetailHeader). |
| Sizes | `title` / `display` on Dashboard only. |
| States | default. |
| Content rules | No decorative subtitles without data. |
| Interaction / keyboard | Actions are buttons. |
| Responsive | Stack meta under title if narrow. |
| Accessibility | One `h1` per page. |
| Data / semantic | Title from IA section or entity. |
| Sources | DOC-UX-012 compositions. |

---

## 5. Group B — Data display

### 5.1 StatusIndicator / StatusBadge

| Field | Spec |
|-------|------|
| Purpose | Encode allowlisted status/RAG with multi-channel cues. Shared **shell**; **distinct semantic models** via `family` prop/alias. |
| Anatomy | `marker` · `label` · optional soft `background` (badge). |
| Variants by `family` | `equipment` · `issue` · `risk` · `milestone` (required). |
| Value maps | Equipment: OnTrack / Delayed. Issue: Open / Mitigating. Risk/MS: Green / Red. |
| Marker geometry | Locked to DOC-UX-018: OnTrack filled disc; Delayed **diamond**; Open **outline badge**; Mitigating **half-filled badge**; Risk/MS Green filled disc; Risk/MS Red filled disc + optional row rail. |
| Sizes | `sm` (table) · `md` (header). |
| States | default; N/A hover (non-interactive unless wraps filter chip). |
| Content rules | Always visible text label; never color-only. No Amber/Closed Must. Mitigating ≠ fixed. |
| Interaction / keyboard | Usually static; if filter chip, keyboard as button. |
| Responsive | Label may abbreviate only with full name in title/aria. |
| Accessibility | Accessible text includes family sense when ambiguous in context (“Risk Red”, “Equipment Delayed”). |
| Data / semantic | Values only from Domain allowlist; tokens DOC-UX-015 aliases. |
| Sources | DOC-UX-015 §3.3/§6; Domain; BR-002/006. |

### 5.2 MetricTile / KpiGroup

| Field | Spec |
|-------|------|
| Purpose | Dense numeric/status summary answering one Director question. |
| Anatomy | Tile: `caption` · `value` (tabular) · optional `delta` · optional status. Group: 4+ tiles. |
| Variants | Numeric; status-bearing; delta-bearing. |
| Sizes | min-height 88px; `tabular` 20/600 for value. |
| States | default; loading skeleton. |
| Content rules | **KpiGroup: ≥4 justified or omit entire group.** No invented metrics. |
| Interaction / keyboard | Optional click-through to register; if so, button/link semantics. |
| Responsive | Wrap grid; do not drop below 4 by hiding — omit group instead. |
| Accessibility | Caption associated with value. |
| Data / semantic | Fields/Δ from Domain/REQ/mock; Δ derived math not Domain edge. |
| Sources | DOC-UX-004 KPI rule; D8. |

### 5.3 DataTable

| Field | Spec |
|-------|------|
| Purpose | Primary dense register + Schedule control-point table (TanStack). |
| Anatomy | Header row · body rows; sits on `surface-sunken`. Selection column and pagination footer are **not** default Demo v1 anatomy. |
| Variants | Schedule (MS+EQ rows); Equipment; Issues&Risks (V1 assumption); Milestones; compact widgets. |
| Sizes | row 40 (36 compact); cell padding 12×8. |
| States | default · hover row · sorting · empty · loading · error. Selected-row state only if selection is later justified. |
| Content rules | Columns from Domain/REQ/mock only. Critical dates/status/Δ visible — prefer horizontal scroll over dropping them. Not an Excel clone (no grid edit, no spreadsheet chrome). **No** checkbox/bulk-action columns without a separate requirement. |
| Interaction / keyboard | Sort headers activatable; row open/navigate via link or row action; no inline Domain edit in Must registers. |
| Responsive | Horizontal scroll; desktop-first. |
| Accessibility | Column headers; sort state announced; status cells use StatusIndicator text. |
| Data / semantic | Issues&Risks: shared columns + Type; BA-OQ-006 **closed**. Schedule = Milestone + Equipment delivery only. **Selection and pagination are optional**, off by default; add only with a confirmed Demo v1 scenario. |
| Sources | DOC-UX-007, DOC-UX-005, BA-OQ-006. |

### 5.4 TableToolbar

| Field | Spec |
|-------|------|
| Purpose | Search/filter/sort affordances above table without changing business meaning. |
| Anatomy | `filters` · optional `search` · `view toggles` (e.g. Schedule table/Gantt) · density optional. |
| Variants | Per register. |
| Sizes | Toolbar height ~40–48. |
| States | default; filters applied (chip count). |
| Content rules | Filter values = allowlisted statuses only. |
| Interaction / keyboard | Focusable controls; clear filters action. |
| Responsive | Collapse secondary filters into menu. |
| Accessibility | Labeled controls; live region optional for result count. |
| Data / semantic | Must not invent status values or cross-entity false joins. |
| Sources | DOC-UX-007. |

### 5.5 FilterControl

| Field | Spec |
|-------|------|
| Purpose | Single filter (Select / multi / segmented) for allowlisted facets. |
| Anatomy | Label · control · optional clear. |
| Variants | Status; Type (Issue\|Risk); Critical flag; etc. as data allows. |
| Sizes | `control-h-md`. |
| States | default · open · selected · focus-visible. |
| Content rules | Options from Domain allowlist only. |
| Interaction / keyboard | Standard listbox/select. |
| Responsive | Full width in drawer filters. |
| Accessibility | Visible label; not placeholder-only. |
| Data / semantic | MVP may not persist filters on return (`assumption`). |
| Sources | DOC-UX-006 breadcrumb assumption. |

### 5.6 EmptyState / LoadingState / ErrorState

| Field | Spec |
|-------|------|
| Purpose | Non-status data states for tables/panels/tabs. |
| Anatomy | Icon (optional) · message · optional action. Loading: skeleton/spinner. Error: message + retry if applicable. |
| Variants | No rows; no Links in snapshot; panel empty. |
| Sizes | Compact in panels; larger in full table. |
| States | N/A (they are states). |
| Content rules | Do not reuse status-danger styling to imply Risk Red. Honest copy; no invented business outcomes. |
| Interaction / keyboard | Retry/action focusable. |
| Responsive | Stack. |
| Accessibility | Announce via polite live region when appearing. |
| Data / semantic | Empty Links when no direct edge in snapshot is valid. |
| Sources | DOC-UX-006 empty notes. |

### 5.7 AsOfMeta / SnapshotEcho

| Field | Spec |
|-------|------|
| Purpose | Show scenario as-of date and/or current Snapshot for orientation. |
| Anatomy | `meta` text; optional Snapshot letter chip (read-only). |
| Variants | Header meta; Dashboard echo. |
| Sizes | `meta` 12px. |
| States | default. |
| Content rules | Read-only; values from mock/API. |
| Interaction / keyboard | N/A (or link to SnapshotSelector focus). |
| Responsive | Inline wrap. |
| Accessibility | Text sufficient. |
| Data / semantic | scenarioAsOfDate; snapshot id. |
| Sources | DOC-UX-004. |

### 5.8 VarianceDelta

| Field | Spec |
|-------|------|
| Purpose | Show derived Δ (forecast − baseline) with clear **what** is delayed. |
| Anatomy | Sign · magnitude · unit/date · optional caption (“Delivery” vs “Production start”). |
| Variants | Delivery delay; PS slip; neutral zero. |
| Sizes | `tabular` in tables; larger in Δ strip. |
| States | default. |
| Content rules | **Never** label Equipment delivery Δ as Production Start Δ. Color + sign + caption; not color alone. |
| Interaction / keyboard | Usually static. |
| Responsive | Keep caption visible. |
| Accessibility | Text includes subject of variance. |
| Data / semantic | Derived math (BR-004); not a Domain edge. |
| Sources | DOC-UX-004 D5; REQ-EQPT / REQ-IMPCT. |

### 5.9 EntityLink

| Field | Spec |
|-------|------|
| Purpose | Navigate to related entity detail. |
| Anatomy | Id/name text link · optional type prefix. |
| Variants | In-table; chip in RelationshipList; exceptions preview. |
| Sizes | `body` / `label`. |
| States | default · hover · focus-visible. |
| Content rules | For **Links** contexts: only if DOC-BA-015 direct edge exists. Derived/indirect targets must be labeled as such (not plain “link”). |
| Interaction / keyboard | Standard link. |
| Responsive | Truncate with title tooltip. |
| Accessibility | Accessible name includes entity type when needed. |
| Data / semantic | No fabricated FK. |
| Sources | DOC-UX-006 DOC-BA-015. |

---

## 6. Group C — Business entity summaries

Shared pattern for summary blocks/rows: identity · StatusIndicator(family) · key dates/fields · optional VarianceDelta · EntityLink.

### 6.1 ProjectSummary

| Field | Spec |
|-------|------|
| Purpose | PRJ identity + PS baseline/forecast orientation. |
| Anatomy | Name/id · asOf · optional PS dates / Δ. |
| Variants | Dashboard header; compact chip in App Bar. |
| Content rules | Single demo project context (PRT-01). |
| Data / semantic | Project fields; PS alignment BR-004. |
| Sources | DOC-UX-004. |

### 6.2 EquipmentDeliverySummary

| Field | Spec |
|-------|------|
| Purpose | Critical equipment delivery posture. |
| Anatomy | Name/id · `StatusIndicator(family=equipment)` · baseline/forecast delivery · optional delivery Δ · isCritical cue. |
| Variants | Table row; detail header strip; Dashboard exception/causal node. |
| Content rules | Status OnTrack/Delayed only. **No Milestone chip in Links.** |
| Data / semantic | Equipment.*; Delayed marker ≠ RAG Red geometry. |
| Sources | Domain Equipment; DOC-UX-006. |

### 6.3 IssueSummary

| Field | Spec |
|-------|------|
| Purpose | Issue exception posture. |
| Anatomy | Id/title · `StatusIndicator(family=issue)` · ownerRole · optional Type column in V1 table. |
| Variants | Table row; preview card; detail header. |
| Content rules | Open / Mitigating only in Must UI. Mitigating ≠ recovery executed. No Closed chrome. |
| Data / semantic | Issue.status allowlist; Decision relation → Impact not Links. |
| Sources | Domain Issue; BR-006. |

### 6.4 RiskSummary

| Field | Spec |
|-------|------|
| Purpose | Risk RAG posture. |
| Anatomy | Id/title · `StatusIndicator(family=risk)` · rag Green/Red. |
| Variants | Table row; preview; detail. |
| Content rules | No Amber. On 02/03 with Open/Mitigating Issue expect Red (BR-002 integrity). |
| Data / semantic | Risk.rag; Decision does not change rag (BR-006) — honesty in Impact. |
| Sources | Domain Risk; BR-002/006. |

### 6.5 MilestoneSummary

| Field | Spec |
|-------|------|
| Purpose | Milestone readiness / RAG (MS-PS critical presentation-level only). |
| Anatomy | Id/name · `StatusIndicator(family=milestone)` · baseline/forecast dates · optional PS alignment cue. |
| Variants | Table/Schedule row; detail; Dashboard. |
| Content rules | RAG Green/Red; “critical” for MS-PS is presentation, not Domain field. |
| Data / semantic | Milestone.*; no direct EQ link in Links. |
| Sources | Domain Milestone; DOC-UX-006. |

### 6.6 DecisionSummary

| Field | Spec |
|-------|------|
| Purpose | Recorded management Decision (PrioritizeRecovery primary Must path). |
| Anatomy | Type · optional owner/due · linked milestone id (if any) · honesty note slot. |
| Variants | DecisionPanel content; Impact callout; read-only summary. |
| Content rules | PrioritizeRecovery = recorded intent, **not** recovery execution. AcceptDateSlip not Must journey UI. Demo Must shows recorded Decision from fixtures — not an interactive write flow. |
| Data / semantic | Decision.*; milestoneId may appear in Links; forecast/RAG effects → Impact with BR-006 honesty. No “Pending” Decision status. |
| Sources | BR-006; DOC-UX-004 Decision panel. |

**Sizes / states / a11y for §6:** use table row or `surface-raised` panel densities from DOC-UX-015; focus only if interactive; StatusIndicator a11y applies.

---

## 7. Group D — Detail and navigation patterns

### 7.1 EntityDetailHeader

| Field | Spec |
|-------|------|
| Purpose | Identity + status row above detail tabs. |
| Anatomy | Title/id · StatusIndicator(family) · optional metrics (KpiGroup rules) · breadcrumb above. |
| Variants | Per entity type. |
| Content rules | Fields from Domain/REQ/mock only; no fake history/finance tabs. |
| Interaction / keyboard | N/A beyond links. |
| Accessibility | `h1` = entity title. |
| Data / semantic | Family-correct status model. |
| Sources | DOC-UX-006. |

### 7.2 DetailTabs (Overview | Links | Impact)

| Field | Spec |
|-------|------|
| Purpose | Separate semantic presentations (D4). |
| Anatomy | Tab list · tab panels. |
| Variants | Same three tabs all Must entities. |
| States | selected · focus · disabled N/A. |
| Content rules | **Overview** attributes; **Links** direct only; **Impact** derived only. Never merge Links+Impact into one list without labels. |
| Interaction / keyboard | Arrow keys per tabs pattern; panels labelled. |
| Responsive | Scroll tab list if needed. |
| Accessibility | `role="tablist"` etc. |
| Data / semantic | Per DOC-UX-006 tables. |
| Sources | DOC-UX-006 D4. |

### 7.3 RelationshipList

| Field | Spec |
|-------|------|
| Purpose | List direct Domain relationships as EntityLinks. |
| Anatomy | Heading · list of EntityLink (+ empty state). |
| Variants | By edge type groups optional. |
| Content rules | Only DOC-BA-015 edges applicable to entity; **exclude** EQ—MS, Issue—Decision, etc. |
| Interaction / keyboard | Links. |
| Accessibility | List structure. |
| Data / semantic | Snapshot may yield empty — show EmptyState. |
| Sources | DOC-UX-006; DOC-BA-015. |

### 7.4 ImpactCallout

| Field | Spec |
|-------|------|
| Purpose | Present derived consequences (PS Δ contribution, BR-002 integrity, BR-006 honesty). |
| Anatomy | Title · body · optional VarianceDelta · optional DecisionSummary reference · tone (info/warning) **without** inventing RAG. |
| Variants | Honesty strip (“forecast/RAG unchanged”); indirect EQ→PS path explanation. |
| Content rules | Must label derived/indirect; must not look like RelationshipList chips. No false recovery progress. |
| Interaction / keyboard | Optional links to related entities (still not claiming false direct edges). |
| Accessibility | Text explains derivation. |
| Data / semantic | BR-004/006; narrative ≠ edges. |
| Sources | DOC-UX-004, DOC-UX-006, BR-006. |

### 7.5 DecisionPanel

| Field | Spec |
|-------|------|
| Purpose | Dashboard/Detail surface for Decision context / recorded Decision + honesty. |
| Anatomy | Panel (`surface-raised`) · DecisionSummary (when present) · ImpactCallout honesty · optional owner/due. |
| Variants by Snapshot | **01:** no Decision recorded — neutral empty state (decision absent). **02:** Decision not yet recorded — show problem context and that a management decision is needed (**not** a Domain Decision status “Pending”). **03:** `PrioritizeRecovery` recorded (fixture/read-only). |
| Content rules | BR-006: recorded PrioritizeRecovery ≠ recovery execution; Issue → Mitigating; Risk and Milestone remain Red; forecast unchanged — no green wash / RAG upgrade. Mitigating ≠ “resolved”. |
| Interaction / keyboard | **Must path = read-only.** User cannot perform/record a management action in Demo v1 Must UI. |
| Responsive | Rail column on Dashboard xl. |
| Accessibility | Heading “Decision”; honesty / empty / needed-context text not color-only. |
| Data / semantic | No new Decision business status. Snapshot 03: type=PrioritizeRecovery + Issue Mitigating + Red RAG + unchanged forecast. |
| Sources | DOC-UX-004 D6; BR-006. |

---

## 8. Group E — Data visualization boundaries

Detailed series/Gantt polish → **DOC-UX-018**. Here: component boundaries only.

### 8.1 GanttSurface (read-only)

| Field | Spec |
|-------|------|
| Purpose | Secondary Schedule timeline for MS + EQ control points (D10/D11). |
| Anatomy | Time axis · rows · baseline ghost marker · forecast marker · optional status marker; **no dependency arrows**. |
| Variants | Full Schedule secondary pane; compact Dashboard widget optional. |
| States | loading · empty · error; read-only always. |
| Content rules | Not a scheduling engine; no drag-reschedule; no Activity/WBS/CPM. |
| Interaction / keyboard | Pan/zoom if provided; optional shared focused/hovered row cue with table when synced — **does not** require selection mode (DOC-UX-019 §7). Selection off by default. |
| Responsive | May hide before table on narrow widths. |
| Accessibility | Table remains primary accessible data source; Gantt supplementary. |
| Data / semantic | Same rows as Schedule table; D12 **RESOLVED** (ADR-0004). |
| Sources | DOC-UX-005, DOC-UX-007, ADR-0004 (D12). |

### 8.2 ChartContainer

| Field | Spec |
|-------|------|
| Purpose | Host Recharts figure with title and optional legend/tooltip slots. |
| Anatomy | Title · chart · legend · footnote/source. |
| Content rules | Only charts with real data source (DOC-UX-007 allow list). Subordinate to narrative on Dashboard. |
| Accessibility | Text alternative / data table link when feasible (impl). |
| Sources | DOC-UX-007. |

### 8.3 ChartLegend / ChartTooltip / series markers

| Field | Spec |
|-------|------|
| Purpose | Explain series; tooltip values; align markers to status/neutral tokens. |
| Content rules | Legend text required; colors follow DOC-UX-015 / chart-* (detail DOC-UX-018). Status series use allowlisted meanings only. |
| Accessibility | Tooltip not hover-only at impl (keyboard focus). |
| Sources | DOC-UX-015; DOC-UX-018 (pending). |

---

## 9. Shared shadcn primitives (thin)

| Primitive | Demo v1 use | Notes |
|-----------|-------------|-------|
| Button / IconButton | Actions, toolbar, theme | Primary = accent; destructive rare |
| Input / Select / Segmented | Filters, Snapshot | Snapshot = segmented preferred |
| Tabs | DetailTabs | |
| Dialog | Generic confirm primitive for **future** justified scenarios only | **Not** Must path for recording PrioritizeRecovery; DecisionPanel remains read-only in Demo v1 |
| Panel / Separator | DecisionPanel, Dashboard zones | Elevation 0–2 only |
| Skeleton | LoadingState | |

Do not add orphan primitives unused by screens above.

---

## 10. Open questions and dependencies

| Item | Handling |
|------|----------|
| BA-OQ-006 | **Closed**; single table+Type = Demo v1 decision (DOC-BA-010) |
| D12 Gantt lib | **RESOLVED** (ADR-0004, I7); adapter-owned GanttSurface |
| Issue Closed / Amber | Not Must components |
| AcceptDateSlip UI | Not Must journey |
| Filter persistence | MVP assumption: not restored |
| Chart series HEX detail | DOC-UX-018 |
| Full keyboard matrices | DOC-UX-019 |
| Screen grids | DOC-UX-017 |

**No Domain/BR contradictions found** requiring model change. Narrative spine ≠ Links edges already enforced in specs cited.

## 11. Related documents

- [demo-v1-ui-design-overview.md](./demo-v1-ui-design-overview.md) (DOC-UX-014)
- [demo-v1-ui-foundations.md](./demo-v1-ui-foundations.md) (DOC-UX-015)
- [demo-v1-data-viz-and-components.md](./demo-v1-data-viz-and-components.md) (DOC-UX-007) — stack intent
- [demo-v1-shell-navigation.md](./demo-v1-shell-navigation.md) · [demo-v1-entity-detail.md](./demo-v1-entity-detail.md) · [demo-v1-dashboard.md](./demo-v1-dashboard.md)
- [demo-v1-visual-direction.md](./demo-v1-visual-direction.md) · [demo-v1-ux-traceability.md](./demo-v1-ux-traceability.md)
- Domain: `docs/02-business-analysis/domain-model-demo-v1.md` · BR: `business-rules-demo-v1.md`
- Plan: `.cursor/plans/ui-design-spec-demo-v1.md`
