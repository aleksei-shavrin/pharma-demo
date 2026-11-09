---
id: DOC-UX-022
title: 'Demo v1 R2 — UX delta (lifecycle, cost, people, notifications)'
type: product
status: draft
version: 0.2.0
created: '2026-11-02'
updated: '2026-11-08'
owner: docs-engineering
related:
  - DOC-UX-021
  - DOC-UX-002
  - DOC-UX-004
  - DOC-PROD-023
  - DOC-PROD-024
  - DOC-PROD-025
  - DOC-PROD-026
  - DOC-BA-018
---
# Demo v1 R2 — UX delta

> **certainty:** hypothesis
>
> IA/UX norms for R2. Does not rewrite DOC-UX-021 history. No runtime UI in R2-D0.

## 1. Navigation IA

> **certainty:** assumption
>
> Human R2-D0-R1: **Люди** and **Стоимость** are top-level. Workstreams are **not** a required top-level nav item.

**Primary navigation (7):**

1. Дашборд (home `/`; не путать с вкладкой «Обзор» на entity-detail)
2. Календарный план
3. Оборудование
4. Проблемы и риски
5. Вехи
6. Люди → `/people`, `/people/:id`
7. Стоимость → `/costs`

AppBar: Notification bell (not a nav section).

**Workstream access:** `/workstreams/:id` via Dashboard Workstream readiness and related entity/person/control links. Optional later Workstream register must **not** automatically add an 8th top-level section.

## 2. Dashboard (executive)

> **certainty:** fact
>
> **R2-U1 APPROVED / CLOSED** (human visual **2026-11-02**): executive IA; 50/50 lower rows; workstream readiness; **тогда** stable curated **12** milestones + selector; late collision policy; consolidated PS cluster (`○───●` + leader + single annotation); light/dark parity. Domain/API/BR-004 unchanged. Это **human acceptance того presentation**, не запрет последующих UX-уточнений.
>
> **Superseded presentation (current, 2026-11):** карточка вех — **единственный Apache ECharts**; default universe **~189** + фильтр «обзор ключевых (12)»; без toggle 1/2/3 / vis / custom strip. Актуальная спецификация композиции — [demo-v1-dashboard.md](./demo-v1-dashboard.md). Domain/BR не менялись этим supersede.

Hierarchy (desktop):

1. **Executive overview row** (~55/45):
   - LEFT: Project Status + Production Start + Cost — inner zones **stretch to full card height** (dividers full height)
   - RIGHT: Workstream readiness — dense clickable rows; **Yellow/Red** persistent semantic tint; **Green** = neutral/transparent row + green status indicator (no persistent ok fill); separate hover/focus; Red → Yellow → Green + catalog `sortOrder`; optional internal scroll → `/workstreams/:id`
2. **Вехи портфеля (ECharts)** — runtime default показывает **полный universe (~189)**; фильтр объёма «обзор ключевых (12)» сужает к curated executive set (те же 12 ID на 01–19). Snapshot switching меняет state/RAG/chrome, не членство curated-набора. Always includes MS-PS. **RU-first** short labels + enterable tooltip (полный title, status pill, outline «Перейти» → schedule focus). Red pulse с уважением `prefers-reduced-motion`. Horizon и PS endpoints/captions — см. актуальный [demo-v1-dashboard.md](./demo-v1-dashboard.md). Исторический абзац R2-U1 про vis/`○───●` cluster ниже/в approval note — **не** единственный current renderer.
3. **Key Exceptions | Management Decisions** — direct siblings in one grid; mobile `grid-cols-1`; desktop `lg:grid-cols-2` (equal 50/50); equal outer height; both lists bounded (~3 items) with internal scroll; headers fixed. Tailwind class literals MUST live in scanned component source (not only `src/lib` constants).
4. **Management Attention | Snapshot 03hanges** — same two-column grid contract. Attention = compact **2×2 signal matrix** (quiet → single empty message). Changes = semantic tiles. Narrow viewports stack. Director-facing narrative RU-only (tech terms HVAC/WFI/IQ/OQ/PQ/BMS/EMS/QC/EAC/VAC/BAC allowed)

**Stable executive set (normative, 2026-11-06):** MS-BLD-EXC, MS-CLN-PANEL, MS-UTL-PWR, MS-BLD-ENCL, MS-CLN-RDY, MS-HVAC-IQ, MS-UTL-WFI, MS-PRD-INST, MS-PKG-SAT, MS-COM-OQ, MS-COM-GO, MS-PS.

> **certainty:** assumption
>
> Состав обзора заменён для показа панелей чистых помещений и энергоснабжения. `MS-BLD-FND` и `MS-BLD-STR` сняты со шкалы и остаются в реестре вех. `MS-PS`, сюжет HVAC (`MS-HVAC-IQ`) и прежний гейт готовности чистых помещений (`MS-CLN-RDY`) сохранены. Абзац приёмки R2-U1 выше описывает прежний набор из 12. Правило членства то же: один набор на все снимки 01–19, меняются RAG и даты прогноза.

**Not** a KPI wall or finance dashboard. Notifications do not duplicate Dashboard content. Selector phase groups remain navigation-only (not a second Dashboard timeline).

### Snapshot personality (design checks)

| Snap | Expectation |
|------|-------------|
| 01 | Calm Green; EAC=BAC VAC=0; empty exceptions |
| 03 | Red HVAC/PS +21; cost shock visible |
| 08 | Residual +14; AUT rising; cost residual |
| 13/14 | Commissioning drama; decisions; PS still +14 until 15 |
| 16 | Red; final readiness / RISK-001 still Red |
| 17 | Yellow; baseline date honesty without start |
| 18 | Yellow; Go/No-Go |
| 19 | Production Start achieved; Green; final cost |

## 3. Workstream page `/workstreams/:id`

Control drill-down (not full Dashboard clone):

- Title RU + RAG + lead Person
- Schedule health (key MS + delayed critical EQ counts)
- Cost summary (WS BAC/EAC/VAC/Actual/Committed/ETC)
- Next executive milestone (if any for WS)
- Lists: Equipment, active Issues, Risks, Decisions
- Related People projections

## 4. People `/people` and `/people/:id`

- List: name, role, primary WS, active
- Detail: responsibilities; linked Issues/Decisions/EQ; WS leadships — **control view**, not HR profile
- No payroll/org-chart/permissions UI

## 5. Costs `/costs`

Project Controls view:

- BAC / EAC / VAC
- Actual / Committed / ETC
- Contingency (project reserve row/section)
- Workstream forecast table
- Top variances
- Risk cost exposure summary
- Optional 01–19 spark/table of EAC evolution (fixture-authored series)

No GL, invoices, or contractor ledgers.

**Detail cost fields:** only where BA says applicable (EQ selective; Risk exposure; Issue impact; Decision approved impact).

## 6. Notifications (AppBar)

- Bell + unread badge + popover list
- Read/unread (sessionStorage key `ppc.demo.notificationRead`; per notification id)
- Switch: «Показывать уведомления при смене снимка» (localStorage key `ppc.demo.notificationPopup`; **default on**)
- On **successful** atomic snapshot commit: **at most 1** compact, short-lived toast (highest priority item); **remainder only in the bell tray/popover** (not a multi-toast wall over Dashboard controls)
  - **certainty:** assumption — r10 UX refinement vs earlier «≤3 toasts» wording: three large persistent danger cards blocked status/timeline chrome after snapshot change; information must remain reachable via bell, not deleted
- Toast placement: **top-right**, below AppBar (`--topbar-height` offset); single card; does not cover selector/AppBar; must not persistently obscure program status / timeline toolbar
- Safe announce: toast host `aria-live="polite"`; unread/history via sessionStorage unchanged; do **not** re-fire the same toast on rerender of an already-committed snapshot
- Semantic toast surfaces from authoritative severity (+ recovery/readiness taxonomy for positive info): critical→danger, attention→warn, info+recovery/readiness→ok, other info→neutral; subtle tinted surface + accent (not consumer-bright alerts); light/dark parity
- Failed/stale/bootstrap switch: **no** toast; toast appearance does **not** auto-mark read
- Fixtures authored per snapshot (not generic diff); Notification not SoT; entityRefs soft only
- Decision refs: no Decision detail route in N1 → no broken link
- Director-facing `titleRu` / `bodyRu` / taxonomy labels — RU-only (N1-R1); taxonomy `issue` → «Проблема»; allowed tech terms/IDs (HVAC, WFI, IQ/OQ/PQ, BMS/EMS, QC, HPLC, ETC/EAC/VAC, entity IDs, Production Start)
- Taxonomy: critical_risk, issue, milestone, cost, decision, recovery, readiness
- Payload: id, snapshotId, severity, taxonomy, titleRu, bodyRu?, href?, entityRefs?

## 7. Snapshot selector 01–19

**Implemented in R2-U1** — phase-grouped scrollable listbox (portal preserved):

- Phases (RU): Ранний этап · Срыв и давление · Управленческие меры · Монтаж · Пусконаладка · Готовность и старт
- Sticky phase headers; max-height ~60vh; keyboard (arrows, Home/End, Enter/Space, Escape, Tab)
- Trigger: id + asOf + phase hint
- Atomic switch + stale protection; sessionStorage `ppc.demo.snapshot` persists 01–19
- Timeline horizon: 01.02.2027–30.09.2027
- **No** second Gantt/timeline inside AppBar

## 8. Light / Dark / a11y

Preserve enrichment expectations: contrast for RAG, focus rings, no theme-specific layout break, selector keyboard, toast not trapping focus permanently.

## 9. Russian presentation

Director-facing RU prose; retain technical acronyms (HVAC, WFI, BMS/EMS, IQ/OQ/PQ as демо-гейты). IQ/OQ/PQ: no real GMP/CSV claims.

## 10. Decisions register + Dashboard pair (2026-11-08)

> **certainty:** assumption

- Nav / breadcrumb / page / Dashboard block title: **«Решения»** (route `/decisions` unchanged).
- Record honesty: summary «Записано»; copy «Данные об исполнении не указаны…» (не Demo/v1). Due calendar separate via StatusPill-style badge in column «Срок»: «Срок прошёл» / «Срок впереди» / «Сегодня» (`dueDate == asOf`) / «Срок не задан». Passed ≠ failed/неисполнение. Color is secondary to text.
- Milestone cell: human `milestoneName` from register DTO (snapshot milestones); technical id muted under title. AN context may show catalog name when API provides it.
- Portfolio column for `PRT-01` → dashboard `/`; program/AN only via milestone membership (no MS-PS fake project).
- `RegisterToolbar` search compact (~240px); placeholder «Поиск решений». ID column `whitespace-nowrap` + min-width.
- Lower Dashboard pair: shared `max-h-[28rem]` + list flex-1 / min-h-0; scroll when overflowing; no empty 14.25rem pocket.
- Decision panel: portfolio forecast honesty once in header; no gray bottom callout; no ×N «РЕШЕНИЕ ЗАПИСАНО» spam.
