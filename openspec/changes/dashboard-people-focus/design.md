## Context

Person ownership is authoritative only for Issues (`ownerPersonId`) and Equipment (`responsiblePersonId?`). Risks and milestones have **no** person owner in Demo v1 types — absence of a field is not “unassigned owner” product state.

## Decisions

1. **Card title:** «Участники: управленческий фокус».
2. **Critical incident:**  
   - Active issue (Open|Mitigating) whose `equipmentId` maps to equipment with `critical && status===Delayed`, **or**  
   - Critical Delayed equipment with a responsible person and no same-person active issue on that equipment.  
   Same person + same equipment + active issue → **one** incident, two entity links. Global unique count may be **less** than sum of per-person critical counts (cross-owner).
3. **Sort:** `criticalIncidentCount` ↓, `hasNewCritical` ↓, `otherActiveIssueCount` ↓, `incidentGrowth` ↓, `personId` ↑.
4. **Decisions:** not in eligibility/sort/quiet-state (due≠execution).
5. **Risks/MS:** not on this card; document model gap in limits.
6. **UI:** no “score/algorithm/fixture” wording; reasons via entity links only.
7. **New critical:** summary label «Новых критичных» = `newCriticalQuestionCount` only (not all new active issues). Comparison hint uses AppBar ordinal + as-of (`01 · date`), not raw letter alone.
8. **First snapshot:** `previousKnown=false` → `newCriticalQuestionCount`/`removedCriticalSignalCount` = null; reasons never «Новый…» / «+N…».
9. **Removed:** `removedCriticalSignalCount` = prev.globalCriticalKeys − cur (same predicate; not “issue Closed” / execution). UI line when >0.
10. **Other active:** «Прочие активные вопросы» — issues not tied to a critical Delayed EQ case (not “low severity”).
11. **Row metric:** «Критичные вопросы: N» (case count), not «Крит. поставки» (avoids implying EQ ownership for issue-only owners).

## Limits

- No capacity/workload.
- No owner filter on `/issues-risks` yet — person drill uses `/people/{id}` + entity detail hrefs.
- First snapshot 01: `previousSnapshotId=null`, no new/removed deltas; no fake history in reasons.
- «Снято критичных сигналов» ≠ «закрыто / исполнено».
