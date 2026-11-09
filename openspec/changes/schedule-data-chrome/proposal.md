## Why

Demo schedule shows empty ИСР («—»), missing progress, top H-scrollbar, wide split gap, oversized search, and sticky month labels that do not match vendor scale cells. User changed expected demo behavior: fill WBS/progress/hierarchy/links for all snapshots 01–19 via Nest mock; remove №; chrome polish.

## What Changes

- Remove schedule column «№» (`visibleOrdinal` display).
- Require non-empty `wbs` for every schedule row (all kinds, all populated snapshots); stable identity across snapshots.
- Progress applicable to work, groups (equal-weight leaf rollup), equipment, milestones with explicit as-of rules; no missing→0 for unknown works without authorship.
- Table H-scrollbar only at bottom of visible pane; header X-sync without visible bar.
- 1px split divider with drag/keyboard resize.
- Compact schedule toolbar (narrow search + filters left; two equal-size toggles right).
- Sticky month scale from vendor `getScale` cell edges.
- Brighter semantic ok **fill** for progress (grass `#549733` from reference); **no** track end-marker/tick (user cancelled). Shared table+chart row hover; reset after type filter; fit chart reclaim ver-scroll gutter.

## Capabilities

### Modified Capabilities

- `schedule-workspace`: WBS/progress/chrome/scale contracts above.

## Impact

- `apps/api` schedule fixtures + `ScheduleService`
- `apps/web` schedule board/view/toolbar/scale/CSS tokens
- Living specs + UX/narrative docs (demo assumptions)
