---
id: DOC-UX-021
title: Demo v1 enrichment — UX/IA delta
type: ux
status: draft
version: 0.2.0
created: '2026-11-01'
updated: '2026-11-03'
owner: docs-engineering
related:
  - DOC-UX-001
  - DOC-UX-002
  - DOC-UX-010
  - DOC-UX-011
  - DOC-PROD-020
  - DOC-PROD-021
  - DOC-PROD-022
---
# Demo v1 enrichment — UX / IA delta

> **certainty:** hypothesis
>
> Delta к Design pack при масштабе ~23 EQ / 14 MS / 11 ISS / 12 RISK / 6 DEC / A–H. **R1 applied.** Не BI. Не MS Project. Read-only Demo.

## 1. Keep from current Demo

Atomic snapshot switch + stale protection · Combined Issues & Risks + Тип · Baseline vs Forecast · Detail Overview/Links/Impact · Decision ≠ recovery · Table/Split/Timeline · Russian UI · light/dark

## 2. Breaks at 20+

| Surface | Need |
|---------|------|
| Dashboard | Top exceptions + workstreams + hierarchy |
| Registers | Search/filter/counts; **no pagination** |
| Schedule | Group/filter/compact/fit (~37 control points) |
| Snapshot A/B/C radios | Compact disclosure for A–H — **not** 8 permanent radios |

## 3. Dashboard IA and hierarchy (E3)

### Above fold (first viewport)

1. **PROJECT STATUS** — overall `projectStatus` (Green/Yellow/Red); baseline vs forecast PS; Δ days; asOf + RU snapshot context  
2. **TOP EXCEPTIONS** — 3–5 cards; cause→impact one-liner + link  

### Secondary

3. **MANAGEMENT ATTENTION** — counts: Open/Mitigating issues; Red risks; Delayed critical EQ; MS at risk — deep links  

### Below

4. **WORKSTREAM READINESS** — 8 WS rollups  
5. **TREND** — better / worse / unchangedCritical (fixture-authored)  
6. **DECISIONS** — recent; honesty «не означает устранение»  

**Not:** KPI wall, sparklines, fake BI.

### Workstream rollup (backend-owned; FE display-only)

> **certainty:** assumption
>
> - **RED:** any Risk in WS with `rag=Red`  
> - **YELLOW:** no Red Risk AND (Delayed critical Equipment OR Issue status Open|Mitigating)  
> - **GREEN:** otherwise  
>
> Closed Issue does **not** create attention. **No** `Issue.critical` field.

### Overall project status (backend-owned)

> **certainty:** assumption
>
> - **RED:** MS-PS Red OR RISK-001 Red  
> - **YELLOW:** not Red AND (any WS ≠ Green OR any Open|Mitigating Issue OR any Delayed critical EQ)  
> - **GREEN:** otherwise  
>
> No scoring system.

### Top Exceptions representation

Dashboard / snapshot presentation read model, e.g.:

```text
TopException { id, title, causeImpact, links[], priority }
```

`priority` = curated Demo ordering on the **read model only** — **not** Domain attribute on Issue/Risk/Equipment/Milestone.

Ordering intent: PS impact → Red Risk→MS → other Red → Open/Mitigating+Delayed critical EQ → remaining.

### Trend representation

Backend owns fixture-authored:

- `better: string[]`
- `worse: string[]`
- `unchangedCritical: string[]`

FE presents only. No temporal analytics / generic history diff engine. Source table: DOC-PROD-022 §5.

## 4. Registers at scale

Search; filters (workstream, status incl. **Closed**, RAG, critical EQ, Тип); counts; sticky header; sort by severity then title. No pagination at Demo counts.

## 5. Schedule at scale

Control points = Equipment delivery + Milestone only. ~23+14 ≈ **37** rows.

Add: group by workstream; filters; compact density; timeline fit-to-data.  
**No** Activity / WBS / CPM / deps / drag.  
E5 visual checkpoint required.

## 6. Detail pages

Overview · Links · Impact — WHAT / STATE / WHY / LINKS / CHANGED / KNOW.  
Links = DOC-BA-015 only (incl. Issue→Milestone; Decision→Milestone when present; **no** Decision→EQ/ISS/RISK).  
Read-only.

## 7. Snapshot selector (A–H) — design requirements

**SHALL NOT** show eight permanently visible TopBar radios.

**Required:**

- Compact **trigger** showing current snapshot: letter · asOf/date · short RU context · selected state  
- Disclosure reveals A–H with full context  
- Full keyboard accessibility; visible selected state; focus management  
- Atomic snapshot switching; stale-request protection  

**ARIA pattern:** choose **one** valid pattern in **E7** after checking actual UI primitives — e.g. listbox **or** radio-based popover **or** another correct pattern.  

**SHALL NOT** prescribe or mix incompatible patterns (e.g. listbox + radiogroup inside the same control).

Machine ids A…H remain; UI primary = date + RU context (DOC-PROD-022).

## 8. Russian copy

No raw English fixture titles as sole UI. Map status/level/decision type/WS. Snapshot letters secondary to date/context.

## 9. Visual checkpoints

1. Dashboard A calm vs E busy vs G partial (hierarchy holds)  
2. Equipment Delayed filter  
3. Schedule grouped + Critical filter  
4. Detail EQ-HVAC-01 Links density  
5. Compact snapshot control A–H  
6. Live Presentation punch on C  
