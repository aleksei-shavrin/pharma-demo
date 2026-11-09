## ADDED Requirements

### Requirement: Dashboard people-focus panel

Dashboard overview SHALL include a backend-derived `peopleFocus` panel listing people with open critical delivery questions for the active snapshot. The panel SHALL NOT invent risk/milestone owners, HR performance scores, or personal obligation urgency from decision due dates.

#### Scenario: Quiet first snapshot

- **WHEN** snapshot 01 has no active issues and no critical Delayed equipment
- **THEN** `peopleFocus.people` is empty, summary shows zero attention, and `previousSnapshotId` is null

#### Scenario: Critical issue linked to delayed critical equipment

- **WHEN** a person owns an Open|Mitigating issue whose equipment is critical and Delayed
- **THEN** that person appears with one critical incident referencing both issue and equipment ids

#### Scenario: Same-person issue and equipment dedup

- **WHEN** the same person owns the issue and is `responsiblePersonId` of that critical Delayed equipment
- **THEN** summary and rank count a single incident (not two)

#### Scenario: Closed clears signal

- **WHEN** an issue becomes Closed versus the previous snapshot
- **THEN** it no longer contributes to the person's current critical/other counts

#### Scenario: Decisions do not rank people

- **WHEN** a person has only recorded decisions with passed due dates and no active issue/critical Delayed EQ ownership
- **THEN** the person SHALL NOT appear in `peopleFocus.people`

#### Scenario: First snapshot with active cases has no new wording

- **WHEN** overview is built with `previous=null` and the snapshot still has active critical cases
- **THEN** `newCriticalQuestionCount` and `removedCriticalSignalCount` are null, and person reasons SHALL NOT contain «Новый» or «+N» growth copy

#### Scenario: Removed critical signals vs previous

- **WHEN** a critical incident key exists on the previous snapshot global set but not on the current
- **THEN** `removedCriticalSignalCount` increases by one (same critical predicate; not labeled as issue Closed/execution)

#### Scenario: Cross-owner unique critical count

- **WHEN** multiple people share distinct personal critical counts that map to fewer unique `eq:` keys
- **THEN** `criticalQuestionCount` equals the unique key set size and MAY be less than the sum of per-person `criticalIncidentCount`
