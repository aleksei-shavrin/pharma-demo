## ADDED Requirements

### Requirement: Split chrome and scroll

In split mode the table header H strip SHALL NOT show a visible horizontal scrollbar; body H scrollbar SHALL remain reachable in the visible owner viewport (sticky bottom). Shared Y owner remains `[data-schedule-scroll-owner]`. Split panes SHALL be separated by a 1px divider with drag and keyboard resize (no wide static gap).

#### Scenario: Header H bar hidden; divider resizes
- **WHEN** the user opens schedule in split mode
- **THEN** the table header H strip has no visible horizontal scrollbar
- **AND** pointer drag or ArrowLeft/ArrowRight on the split divider changes the table pane width
- **AND** vertical wheel over table or chart scrolls the shared Y owner

### Requirement: Sticky month scale matches vendor cells

External sticky month labels SHALL use vendor scale cell left/width from `getScale` (or equivalent native cell geometry), not a mid-month recomputation from config endpoints alone. Equality of totalWidth alone is insufficient.

#### Scenario: Adjacent month edges abut
- **WHEN** sticky month labels are rendered for the chart scale
- **THEN** each month cell exposes left/width from vendor geometry
- **AND** consecutive months abut (previous left+width ≈ next left) within 1.5px
- **AND** acceptance SHALL NOT rely on totalWidth equality alone

### Requirement: Schedule toolbar density

On schedule, search SHALL use a compact width (~200–280px). Attention, workstream, type filters, then «Сбросить фильтры» SHALL sit on the left in that order. Only comparison and view toggle groups SHALL sit on the right, sharing the smaller comparison control size.

#### Scenario: Compact search and two right toggles
- **WHEN** the schedule toolbar is shown at 1440–2560 CSS px width
- **THEN** search input width is at most 280px
- **AND** type/attention/workstream filters sit with search on the left
- **AND** «Сбросить фильтры» follows «Тип точки» on the left
- **AND** only comparison and view toggles sit on the right at the comparison control size

### Requirement: Progress fill and row hover

Chart work bars SHALL use thin (~8px) grass-green fill (`--schedule-fill-ok`, `#549733`) with white hollow remainder and green outline; zero progress SHALL be fully hollow. Table progress SHALL use a thin track with the same fill palette (warn/danger preserved). UI SHALL NOT render an end-marker/tick. Shared hover SHALL tint one logical row in table and chart together; hover clears on pointer leave.

#### Scenario: No progress end tick; shared hover
- **WHEN** the schedule split view shows rows with progress
- **THEN** no progress end-marker/tick is rendered
- **AND** hovering a table or chart row sets hover on both panes for that row key
- **AND** leaving the row clears hover attributes

### Requirement: Fit chart has no nested Y or right gutter

In split fit mode the vendor vertical scrollbar cell SHALL NOT reserve a visible white band; timeline/task width SHALL fill the chart pane content box. Nested `.gantt_task` Y scroll max SHALL be 0 when host height fits all rows; only `[data-schedule-scroll-owner]` owns vertical wheel/PageDown/Home/End. Native chart H scrollbar SHALL remain usable (track height > 0 when content overflows) and sticky to the bottom of the visible Y owner — without restoring the ~15px right Y gutter.

#### Scenario: Expanded tree scrolls only on owner; no right white band
- **WHEN** the user fully expands the schedule tree in split mode
- **THEN** chart pane right edge aligns with the task/timeline grid within ~4px
- **AND** wheel over table and over chart each changes the shared owner scrollTop
- **AND** nested gantt task pane scrollHeight − clientHeight is 0

#### Scenario: Narrow chart keeps horizontal track
- **WHEN** the table pane is widened so chart width is below the full month scale
- **THEN** `.gantt_hor_scroll` has scrollWidth − clientWidth > 0 and height > 0
- **AND** the H track sits at the bottom of the visible scroll owner
- **AND** the right ver gutter width remains ~0

### Requirement: Shared row hover covers sticky table rail and chart bars

Shared hover SHALL tint the sticky table lead rail (`data-schedule-row-left`) with the same `--schedule-row-hover` as the row, not leave it `surface-raised`. Chart hover SHALL resolve task id from bars/summary/milestone/`task_id` attributes and Y→row mapping for link overlays so hovering a bar does not clear hover.

#### Scenario: Table sticky rail and chart bar share hover
- **WHEN** the user hovers a table row or a chart task bar
- **THEN** the sticky left rail computed background uses the hover token
- **AND** the matching chart task row shows hover
- **AND** hovering the bar itself keeps the same row hover

### Requirement: Authored progress overlays differ by snapshot

Work progress SHALL use per-snapshot authored overlays with actuals coherent after asOf clamp. EQ/MS progress SHALL be binary from the control-facts catalogue dates vs `scenarioAsOfDate` (all catalogue ids required). Forbidden: live forecast≤asOf; sorted-id/letter rank. FS target@100 requires source@100.

#### Scenario: Snapshot 03 preserves key authored works
- **WHEN** schedule for snapshot 03 is loaded
- **THEN** work `8.2.1` has progressPct 0
- **AND** work `8.2.2` has progressPct 40
- **AND** work `WK-01` has progressPct 100
- **AND** work `WK-04` has progressPct 0
- **AND** milestone `MS-COM-GO` has progressPct 0

#### Scenario: Snapshot 01 differs from 03 on the same topology
- **WHEN** schedule for snapshot 01 is loaded
- **THEN** work `WK-01` progressPct is 0
- **AND** EQ-HVAC-01 progressPct is 0
