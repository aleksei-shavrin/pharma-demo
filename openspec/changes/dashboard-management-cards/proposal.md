## Why

Dashboard management cards need honest progress mid-row, PS-scoped decision signal (not a register dump), evidence-based critical exceptions, and a minimal illustrative execution read-model separate from due calendar and forecast heal (BR-006).

## What Changes

- Dashboard `programs[]` additive progress fields (parity with `/programs` list aggregate).
- `decisionPanelState` keyed by DEC-001 only; card «Прогноз и решение».
- Read-only demo `DecisionExecutionObservation` (kind=demo) for DEC-001 arc; other DEC → `unknown`.
- Register Status cell: dual signed dimensions (исполнение + состояние срока); Due = date only.
- Top exceptions critical from linked entity facts only.
- `decisionHonesty.recoveryExecuted` remains deprecated backcompat always-false; UI uses forecast deviation + execution separately.

## Impact

- Affected specs: management-exception-report, project-status-overview
- Affected code: Nest dashboard/registers/fixtures; web dashboard + decisions register
- certainty: assumption (illustrative demo observations, not GMP facts)
