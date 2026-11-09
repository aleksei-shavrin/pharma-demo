## Why

Director needs a lower-dashboard card that surfaces **people who currently own open critical delivery questions**, with snapshot-to-snapshot movement — without inventing HR scores, risk/milestone owners, or overdue “personal obligations” from decision due dates.

## What Changes

- Additive `peopleFocus` on Dashboard overview read-model (Nest from DemoDataSource).
- FE card «Участники: управленческий фокус» (5th lower-grid child, 50% @ lg).
- Critical predicate: active issue linked to critical+Delayed equipment **or** critical+Delayed equipment with responsiblePersonId; same-person issue↔eq via `issue.equipmentId` deduped to one incident.
- Decisions / risks / milestones **not** in eligibility or sort. Optional unassigned critical EQ only when `responsiblePersonId` is null.
- Neighbor snapshot = previous id in `SNAPSHOT_IDS`; 01 has no previous.

## Impact

- Specs: project-status-overview (dashboard panel)
- Code: `apps/api` dashboard + people-focus helper; `apps/web` dashboard card
- certainty: fact (owner fields, statuses); assumption (card title/copy)
