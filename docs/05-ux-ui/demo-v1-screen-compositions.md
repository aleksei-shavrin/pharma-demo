---
id: DOC-UX-012
title: "Demo v1 screen compositions (Visual Direction)"
type: product
status: draft
version: "0.2.0"
created: 2026-10-31
updated: 2026-10-31
owner: "docs-engineering"
related:
  - DOC-UX-010
  - DOC-UX-004
  - DOC-UX-005
  - DOC-UX-006
  - DOC-UX-003
---

# Demo v1 screen compositions (Visual Direction)

> **certainty:** hypothesis
>
> Визуальная композиция ключевых экранов под **VD-A** (`approved Visual Direction baseline`). IA/blocks — из approved UX docs; иерархия/зоны/плотность утверждены в рамках VD-A. Не дублировать REQ поля. BA-OQ-006 **closed** (DOC-BA-010); D12 **resolved** (ADR-0004). HEX/pixel polish — UI Design.

## 0. Shared shell

```text
┌ Sidebar │ App Bar: Breadcrumbs · Snapshot A/B/C · Theme · PRJ ─┐
│ nav×5   ├ Page Surface (elevated) ────────────────────────────┤
│         │  page header                                         │
│         │  main content                                        │
└─────────┴──────────────────────────────────────────────────────┘
```

| Zone | Visual weight | Notes |
|------|---------------|-------|
| Sidebar | Medium, quiet | Active item: accent rail + label weight |
| App Bar | High for Snapshot | Snapshot control scannable; theme secondary |
| Page Surface | Primary work area | Separated from canvas (§ tokens depth) |
| Content | Hierarchy per screen | |

**Responsive (VD-A baseline, desktop-first):** ≥1280px full shell; 1024–1279 collapse sidebar to icons/drawer; tables keep horizontal scroll rather than crushing columns; Snapshot stays reachable. Mobile — best-effort; не жертвовать table readability.

---

## 1. Dashboard (Director-first) — narrative

Источник блоков: [demo-v1-dashboard.md](./demo-v1-dashboard.md). Visual priority (VD-A baseline):

```text
┌ Page Surface ─────────────────────────────────────────────┐
│ Header: Project · asOf · Snapshot echo                      │
│ ┌ Story column (primary) ──────────┐ ┌ Rail (secondary) ──┐ │
│ │ Δ strip (delivery → PS)          │ │ Decision panel     │ │
│ │ Causal viz (Domain edges only)   │ │ honesty: no RAG↑   │ │
│ │ Exceptions preview (typed)       │ │ Compact schedule   │ │
│ └──────────────────────────────────┘ └────────────────────┘ │
│ KPI group (≥4 justified) OR omit                            │
│ Optional A/B/C forecast chart (Recharts) — subordinate      │
└─────────────────────────────────────────────────────────────┘
```

| Priority | Zone | Why |
|----------|------|-----|
| 1 | Δ strip + PS state | D5; Director question |
| 2 | Causal viz | Domain links only; no EQ—MS edge; narrative ≠ edges |
| 3 | Decision panel | D6; PrioritizeRecovery record; BR-006 honesty callout |
| 4 | Exceptions preview | Bridge to P4 |
| 5 | KPI group | Only if ≥4 real metrics |
| 6 | Chart / schedule widget | Support, not decoration |

**States:**

- **Snapshot A:** calm PS/EQ OnTrack; MS/Risk rag Green (fixtures). Causal viz **не** пустая: показывать прямые Domain links RISK-001—EQ-HVAC-01 и RISK-001—MS-PS, если они есть в snapshot. **Нет** Issue-driven delay chain (нет Open delay Issue / нет Delayed EQ narrative). Не рисовать EQ—MS; не выдавать storytelling sequence за набор прямых рёбер.
- **Snapshot B:** elevated Delayed/Red; Issue Open links participate in causal (Domain edges only).
- **Snapshot C:** Decision visible + Mitigating + **unchanged** Red/forecast (no green wash) — BR-006.

**Anti:** KPI card grid as hero; decorative gauges; fake recovery progress.

---

## 2. Schedule — table-first

Источник: [demo-v1-schedule-workspace.md](./demo-v1-schedule-workspace.md).

```text
┌ Toolbar: view Table | Split | Gantt · filters · density ──┐
│ TanStack Table (primary — default)                        │
│  Type · ID · Name · Baseline · Forecast · Δ · Status · … │
│ Split: table + secondary read-only timeline (markers)     │
│ Gantt: full-pane read-only control-date viz (secondary)   │
└───────────────────────────────────────────────────────────┘
```

- **Table** — основной формат (`approved UX decision` D10); dense; variance tabular; status multi-channel.
- **Split** — дополнительное представление: таблица + мини read-only timeline.
- **Gantt** — дополнительный **read-only** режим визуализации контрольных дат (MS forecastDate / EQ forecastDelivery; ghost baseline). **Не** равноправный планировщик: нет Activity/WBS/CPM, нет dependency arrows FS/SS, нет scheduling engine, нет drag-reschedule.
- D12: **RESOLVED** (ADR-0004); look + Community adapter.
- Row click → Entity Detail; breadcrumbs `Schedule / id`.

**Large data:** pagination 25–50; sticky header; filters for Delayed/Red/variance≠0.

---

## 3. Equipment Register

Toolbar + TanStack: id, name, status, critical, baseline/forecast delivery, Δ. Status badges multi-channel. Critical marker only from `isCritical`. Row → D-EQ.

---

## 4. Issues & Risks Register

> **certainty:** open_question
>
> **BA-OQ-006** — **closed**: выбран единый register + колонка `Тип` (DOC-BA-010). Ниже — исторические VD-варианты (не альтернативы решения).

| Historical VD option (superseded) | Idea |
|------------------------------|------|
| V1 | Single table + Type column (Issue or Risk) |
| V2 | Segmented control / tabs: Issue, Risk, All |
| V3 | Two stacked tables on one Page Surface |

Dashboard exceptions preview may use typed labels without closing OQ. Columns only Domain/REQ fields; status allowlist only.

---

## 5. Milestones Register

Table: id, name, baseline/forecast, Δ, rag (Green/Red). MS-PS presentation emphasis **without** inventing Critical domain field. Row → D-MS.

---

## 6. Entity Detail

Источник: [demo-v1-entity-detail.md](./demo-v1-entity-detail.md).

```text
Breadcrumb · Header (id, title) · Status row (multi-channel)
Metrics group (≥4) OR omit
Tabs: Overview | Links | Impact
```

- **Links:** quieter chips; only DOC-BA-015 direct edges.
- **Impact:** stronger callouts for BR-004 Δ / BR-006 honesty; derived labeled.
- Decision appearance on Issue Impact after PrioritizeRecovery — not a fake Link.

---

## 7. Record PrioritizeRecovery (M-DEC)

Modal/dialog (VD-A baseline visual intent):

- Title: record management Decision (not «start recovery»).
- Fields: type PrioritizeRecovery; optional owner/due/note per REQ.
- Explicit honesty footer: forecast PS/MS and Risk/MS rag **unchanged**; Issue → Mitigating as decision record, not execution proof.
- No progress bar / green check implying recovery done.
- AcceptDateSlip not Must journey (BA-OQ-004/005).

---

## 8. Cross-cutting states (VD-A baseline)

| State | Treatment |
|-------|-----------|
| Loading | Skeleton on Page Surface; preserve shell |
| Empty | Honest empty + link to related register |
| Error | Inline alert; no fake data |
| Snapshot switch | Brief content fade; no layout jump |

## 9. Related

[visual-direction](./demo-v1-visual-direction.md) · [design-tokens](./demo-v1-design-tokens.md) · [screens-and-flows](./demo-v1-screens-and-flows.md)
