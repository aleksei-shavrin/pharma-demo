## Context

User accepts demo mock fill. Certainty: `assumption` for authored WBS codes and progress rolls.

## Decisions

1. **WBS source** — Nest fixtures + workstream→stage map for EQ/MS; FE never invents codes. № column removed.
2. **Progress** — Works keep authored per-snapshot overlays (preserve 03: 8.2.1=0, 8.2.2=40, WK-01=100). EQ/MS: authored fixture facts / demo phase overrides — **not** `forecastDate`/`forecastDelivery` ≤ asOf. Groups: equal-weight mean of descendant leaves with known %; null only when no known leaves.
3. **No actual-from-forecast** for works; fixture actuals remain explicit. UI: grass `#549733` fills, no progress end-tick, shared row hover, reset after type filter, fit chart `scroll_size=0` + timeline width fill (no ver gutter).
4. **siblingOrder** numeric at each parent (sort by number, not localeCompare of wbs strings for tree build — FE already uses siblingOrder).
5. **Chrome** — schedule-only toolbar layout props; comparison toggle size is the shared control size (do not enlarge to prior view size-8).
6. **Scale** — `gantt.getScale()` cells for sticky header; no scrollWidth stretch.
7. **Green** — progress fill uses brighter `--status-ok-border` / dedicated fill alias; do not change `--status-ok-fg` text contrast globally. Tick = 2px end marker on track (UI assumption) until user supplies exact ref.

## Risks

- Expanding groups/works to 01–19 increases payload; acceptable for demo.
- Preexisting api architecture/dashboard fixture failures remain out of scope.
