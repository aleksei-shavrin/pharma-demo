# Change: realistic master-schedule + ProgramDetail enrichment

## Why

Analyst import used `supplementaryDatesFor` offsets from 03 asOf → все работы 01 сжаты в Feb–Mar. Program detail потерял budget/registers после redirect WS→PRG. List tables показывали plain status text; responsibles на /programs — не clickable.

## What changes

- Master-schedule simulation by project **content** windows + FS/SS/FF/SF precedence; `sourceWeeks` = delay mark (⚠️Nн), **not** duration.
- Lifecycle per 19 asOf: baseline immutable; forecast narrative slips; actual≤asOf; raw `sourceStatus` preserved.
- ProgramDetail: cost aggregate via WS→PRG bridge + milestones/equipment/risks/issues/decisions (no 8WS UI).
- StatusPill `family="project"` + per-person `/people/PER*` links.

## Impact

- Specs: schedule-workspace, portfolio-program-project
- FE+BE mock only; auth/deploy untouched
